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
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import { SegmentedTripTabs } from '../components/SegmentedTripTabs';
import { useAuth } from '../context/AuthContext';
import { rootNavigationRef } from '../navigation/rootNavigation';
import type { TripsStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<TripsStackParamList, 'Home'>;

const TABS: { key: TripRunStatus; label: string }[] = [
  { key: 'PENDING', label: 'Chờ xuất bến' },
  { key: 'IN_PROGRESS', label: 'Đang chạy' },
  { key: 'FINISHED', label: 'Lịch sử' },
];

export function HomeScreen({ navigation }: Props) {
  const { token, logout: clearToken } = useAuth();
  const [tab, setTab] = useState<TripRunStatus>('PENDING');
  const [runs, setRuns] = useState<Awaited<ReturnType<typeof fetchMyRuns>>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shiftStarted, setShiftStarted] = useState(false);

  const logout = () => {
    clearToken();
    rootNavigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerBtns}>
          <Button title="Đăng xuất" onPress={logout} color={C.gold} />
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
            await postDriverLocation(token, loc.coords.latitude, loc.coords.longitude);
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
    <ScreenShell underStackHeader style={styles.shell}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.screenTitle}>Chuyến của bạn</Text>
          <Text style={styles.screenSub}>NovaLimo Driver</Text>
        </View>
      </View>

      {!shiftStarted ? (
        <View style={styles.box}>
          <Text style={styles.hint}>
            Bấm bắt đầu ca để gửi tín hiệu định vị (sau khi đã cấp quyền).
          </Text>
          <Button title="Bắt đầu ca làm việc" onPress={() => void onStartShift()} color={C.gold} />
        </View>
      ) : null}

      <SegmentedTripTabs tabs={TABS} active={tab} onChange={setTab} />

      {loading ? <ActivityIndicator color={C.gold} /> : null}
      {error ? <Text style={styles.err}>{error}</Text> : null}

      <FlatList
        data={runs}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={() => void load()}
        ListFooterComponent={
          <View style={styles.backlog}>
            <Text style={styles.backlogTitle}>Lối tắt</Text>
            <View style={styles.backlogRow}>
              <Pressable style={styles.backlogBtn} onPress={() => navigation.navigate('Sos')}>
                <Text style={styles.backlogBtnText}>SOS</Text>
              </Pressable>
              <Pressable
                style={styles.backlogBtn}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Text style={styles.backlogBtnText}>Thông báo</Text>
              </Pressable>
              <Pressable style={styles.backlogBtn} onPress={() => navigation.navigate('Income')}>
                <Text style={styles.backlogBtnText}>Thu nhập</Text>
              </Pressable>
              <Pressable style={styles.backlogBtn} onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.backlogBtnText}>Hồ sơ</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.muted}>Không có chuyến trong mục này.</Text>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('TripDetail', { run: item })}>
            <ListCard title={item.route_name || '—'} subtitle={`${item.license_plate} · ${item.status}`}>
              <Text style={styles.muted}>
                Xuất bến:{' '}
                {item.departure_time ? new Date(item.departure_time).toLocaleString() : '—'}
              </Text>
              <Text style={styles.muted}>
                Khách: {item.passenger_count} · Hàng: {item.cargo_count}
              </Text>
            </ListCard>
          </Pressable>
        )}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  screenTitle: { fontFamily: FONT.bold, fontSize: 20, color: C.text },
  screenSub: { fontFamily: FONT.regular, fontSize: 13, color: C.muted, marginTop: 2 },
  box: { marginBottom: 12 },
  hint: { marginBottom: 8, color: C.muted, fontFamily: FONT.regular },
  err: { color: C.error, marginBottom: 8, fontFamily: FONT.regular },
  headerBtns: { flexDirection: 'row', gap: 4 },
  backlog: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.stroke },
  backlogTitle: {
    fontSize: 12,
    color: C.muted,
    fontFamily: FONT.semibold,
    marginBottom: 8,
  },
  backlogRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  backlogBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.stroke,
    backgroundColor: C.card,
  },
  backlogBtnText: { color: C.gold, fontFamily: FONT.semibold, fontSize: 12 },
  muted: { color: C.muted, marginTop: 2, fontFamily: FONT.regular, fontSize: 13 },
});
