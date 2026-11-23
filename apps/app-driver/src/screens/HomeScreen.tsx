import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { TripRunDto } from '@limousine-workspace/shared-types';
import {
  type DriverRunScope,
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

const TABS: { key: DriverRunScope; label: string }[] = [
  { key: 'upcoming', label: 'Chờ xuất bến' },
  { key: 'active', label: 'Đang chạy' },
  { key: 'done', label: 'Lịch sử' },
];

export function HomeScreen({ navigation }: Props) {
  const { token, driver, refreshProfile, logout: clearToken } = useAuth();
  const [tab, setTab] = useState<DriverRunScope>('upcoming');
  const [runs, setRuns] = useState<TripRunDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shiftStarted, setShiftStarted] = useState(false);

  const logout = useCallback(() => {
    clearToken();
    rootNavigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
  }, [clearToken]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerBtns}>
          <Button title="Đăng xuất" onPress={logout} color={C.gold} />
        </View>
      ),
    });
  }, [navigation, logout]);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const s = await fetchCurrentShift(token);
        setShiftStarted(!!s);
      } catch {
        /* ignore */
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!shiftStarted || !token) return;
    let sub: Location.LocationSubscription | undefined;
    void (async () => {
      try {
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
              const speedKmh =
                loc.coords.speed != null && loc.coords.speed >= 0
                  ? Math.round(loc.coords.speed * 3.6)
                  : undefined;
              const heading =
                loc.coords.heading != null && loc.coords.heading >= 0
                  ? Math.round(loc.coords.heading)
                  : undefined;
              await postDriverLocation(
                token,
                loc.coords.latitude,
                loc.coords.longitude,
                {
                  speed_kmh: speedKmh,
                  heading,
                  accuracy_m: loc.coords.accuracy ?? undefined,
                },
              );
            } catch {
              /* ignore transient telemetry failures */
            }
          },
        );
      } catch {
        /* ignore */
      }
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
    setError(null);
    try {
      let coords: { lat: number; lng: number } | undefined;
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status === 'granted') {
          const cur = await Location.getCurrentPositionAsync({});
          coords = { lat: cur.coords.latitude, lng: cur.coords.longitude };
        }
      } catch {
        /* ignore */
      }
      await startShift(token, coords);
      setShiftStarted(true);
      await refreshProfile();
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
          <Text style={styles.screenTitle}>
            {driver?.full_name
              ? `Xin chào, ${driver.full_name}`
              : 'Chuyến của bạn'}
          </Text>
          <Text style={styles.screenSub}>
            {driver?.vehicle?.license_plate
              ? `Xe phân công: ${driver.vehicle.license_plate} · ${shiftStarted ? 'Đang trong ca' : 'Chưa vào ca'}`
              : 'NovaLimo Driver'}
          </Text>
        </View>
      </View>

      {!shiftStarted ? (
        <View style={styles.box}>
          <Text style={styles.hint}>
            Bấm bắt đầu ca để gửi tín hiệu định vị GPS và nhận lệnh điều hành.
          </Text>
          <Button
            title="Bắt đầu ca làm việc"
            onPress={() => void onStartShift()}
            color={C.gold}
          />
        </View>
      ) : null}

      <SegmentedTripTabs tabs={TABS} active={tab} onChange={setTab} />

      {loading ? (
        <ActivityIndicator color={C.gold} style={{ marginTop: 8 }} />
      ) : null}
      {error ? <Text style={styles.err}>{error}</Text> : null}

      <FlatList
        data={runs}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={() => void load()}
        style={{ marginTop: 12 }}
        ListFooterComponent={
          <View style={styles.backlog}>
            <Text style={styles.backlogTitle}>Lối tắt</Text>
            <View style={styles.backlogRow}>
              <Pressable
                style={styles.backlogBtn}
                onPress={() => navigation.navigate('Sos')}
              >
                <Text style={styles.backlogBtnText}>SOS / Sự cố</Text>
              </Pressable>
              <Pressable
                style={styles.backlogBtn}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Text style={styles.backlogBtnText}>Thông báo</Text>
              </Pressable>
              <Pressable
                style={styles.backlogBtn}
                onPress={() => navigation.navigate('Income')}
              >
                <Text style={styles.backlogBtnText}>Thu nhập</Text>
              </Pressable>
              <Pressable
                style={styles.backlogBtn}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={styles.backlogBtnText}>Hồ sơ</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.muted}>Không có chuyến trong mục này.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('TripDetail', { runId: item.id, run: item })
            }
          >
            <ListCard
              title={`Lệnh ${item.code}`}
              subtitle={`${item.vehicle.license_plate} (${item.vehicle.capacity} chỗ) · ${item.status}`}
            >
              <Text style={styles.muted}>
                Xuất lệnh:{' '}
                {item.dispatched_at
                  ? new Date(item.dispatched_at).toLocaleString('vi-VN')
                  : '—'}
              </Text>
              <Text style={styles.muted}>
                Khách: {item.passenger_count} · Kiện hàng: {item.cargo_count}
                {item.planned_distance_km != null
                  ? ` · Lộ trình: ${item.planned_distance_km} km`
                  : ''}
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
  screenSub: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
  box: { marginBottom: 12 },
  hint: { marginBottom: 8, color: C.muted, fontFamily: FONT.regular },
  err: {
    color: C.error,
    marginTop: 6,
    marginBottom: 8,
    fontFamily: FONT.regular,
  },
  headerBtns: { flexDirection: 'row', gap: 4 },
  backlog: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.stroke,
  },
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
  muted: {
    color: C.muted,
    marginTop: 2,
    fontFamily: FONT.regular,
    fontSize: 13,
  },
});
