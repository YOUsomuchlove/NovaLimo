import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { TripRunStatus } from '@limousine-workspace/shared-types';
import {
  fetchCurrentShift,
  fetchMyRuns,
  postDriverLocation,
  startShift,
} from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const TABS: { key: TripRunStatus; label: string }[] = [
  { key: 'PENDING', label: 'Chờ xuất bến' },
  { key: 'IN_PROGRESS', label: 'Đang chạy' },
  { key: 'FINISHED', label: 'Lịch sử' },
];

export function HomeScreen({ navigation }: Props) {
  const { token, logout: clearToken } = useAuth();
  const [tab, setTab] = useState<TripRunStatus>('PENDING');
  const [runs, setRuns] = useState<Awaited<ReturnType<typeof fetchMyRuns>>>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shiftStarted, setShiftStarted] = useState(false);

  const logout = () => {
    clearToken();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerBtns}>
          <Button title="Chat" onPress={() => navigation.navigate('Chat')} />
          <Button title="Ca" onPress={() => navigation.navigate('EndShift')} />
        </View>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      const s = await fetchCurrentShift(token);
      setShiftStarted(!!s);
    })();
  }, [token]);

  useEffect(() => {
    if (!shiftStarted || !token) return;
    let sub: Location.LocationSubscription | undefined;
    void (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;
      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 80,
          timeInterval: 25000,
        },
        async (loc) => {
          try {
            await postDriverLocation(
              token,
              loc.coords.latitude,
              loc.coords.longitude,
            );
          } catch {
            /* ignore */
          }
        },
      );
    })();
    return () => {
      sub?.remove();
    };
  }, [shiftStarted, token]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyRuns(token, tab);
      setRuns(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải chuyến');
    } finally {
      setLoading(false);
    }
  }, [token, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const onStartShift = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await startShift(token);
      setShiftStarted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không bắt đầu được ca');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Chuyến của tôi</Text>
        <Button title="Đăng xuất" onPress={logout} />
      </View>

      {!shiftStarted ? (
        <View style={styles.box}>
          <Text style={styles.hint}>
            Bấm bắt đầu ca để gửi tín hiệu định vị (sau khi đã cấp quyền).
          </Text>
          <Button
            title="Bắt đầu ca làm việc"
            onPress={() => void onStartShift()}
          />
        </View>
      ) : null}

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[styles.tab, tab === t.key && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, tab === t.key && styles.tabTextActive]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.err}>{error}</Text> : null}

      <FlatList
        data={runs}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={() => void load()}
        ListEmptyComponent={
          <Text style={styles.muted}>Không có chuyến trong mục này.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('TripDetail', { run: item })}
          >
            <Text style={styles.route}>{item.route_name || '—'}</Text>
            <Text style={styles.muted}>Biển số: {item.license_plate}</Text>
            <Text style={styles.muted}>
              Giờ xuất bến:{' '}
              {item.departure_time
                ? new Date(item.departure_time).toLocaleString()
                : '—'}
            </Text>
            <Text style={styles.muted}>
              Khách: {item.passenger_count} · Hàng: {item.cargo_count}
            </Text>
            <Text style={styles.muted}>Trạng thái: {item.status}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 12, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: '600' },
  box: { marginBottom: 12 },
  hint: { marginBottom: 8, color: '#555' },
  tabs: { flexDirection: 'row', marginBottom: 8, gap: 4 },
  tab: {
    flex: 1,
    padding: 8,
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#1677ff' },
  tabText: { fontSize: 11, color: '#333' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  route: { fontWeight: '600', marginBottom: 4 },
  muted: { color: '#666', marginTop: 2 },
  err: { color: '#cf1322', marginBottom: 8 },
  headerBtns: { flexDirection: 'row', gap: 4 },
});
