import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { io } from 'socket.io-client';
import {
  fetchTripRunDetail,
  getSocketBaseUrl,
  patchBookingStatus,
} from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { getNextStop } from '../utils/nextStop';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveNav'>;

export function ActiveNavigationScreen({ route }: Props) {
  const { runId } = route.params;
  const { token } = useAuth();
  const [bookings, setBookings] = useState(
    [] as Awaited<ReturnType<typeof fetchTripRunDetail>>['bookings'],
  );
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const d = await fetchTripRunDetail(token, runId);
      setBookings(d.bookings);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Lỗi tải');
    }
  }, [token, runId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!token) return;
    const socket = io(`${getSocketBaseUrl()}/realtime`, {
      transports: ['websocket'],
    });
    const onUp = () => void load();
    socket.on('booking_status_changed', onUp);
    socket.on('trip_run_updated', onUp);
    return () => {
      socket.off('booking_status_changed', onUp);
      socket.off('trip_run_updated', onUp);
      socket.disconnect();
    };
  }, [token, load]);

  const next = useMemo(() => getNextStop(bookings), [bookings]);

  const openDirections = () => {
    if (!next) return;
    const loc =
      next.kind === 'pickup'
        ? next.booking.pickup_location
        : next.booking.dropoff_location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`;
    void Linking.openURL(url);
  };

  const onCheckIn = async () => {
    if (!token || !next || next.kind !== 'pickup') return;
    try {
      await patchBookingStatus(token, next.booking.id, 'PICKED_UP');
      await load();
    } catch (e) {
      Alert.alert('Lỗi', e instanceof Error ? e.message : 'Không cập nhật được');
    }
  };

  const onDropOff = async () => {
    if (!token || !next || next.kind !== 'dropoff') return;
    try {
      await patchBookingStatus(token, next.booking.id, 'DROPPED_OFF');
      await load();
    } catch (e) {
      Alert.alert('Lỗi', e instanceof Error ? e.message : 'Không cập nhật được');
    }
  };

  const region = useMemo(() => {
    if (!next) {
      return {
        latitude: 21.0285,
        longitude: 105.8542,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      };
    }
    const loc =
      next.kind === 'pickup'
        ? next.booking.pickup_location
        : next.booking.dropoff_location;
    return {
      latitude: loc.lat,
      longitude: loc.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [next]);

  return (
    <View style={styles.root}>
      <MapView style={styles.map} initialRegion={region} region={region}>
        {next ? (
          <Marker
            coordinate={{
              latitude:
                next.kind === 'pickup'
                  ? next.booking.pickup_location.lat
                  : next.booking.dropoff_location.lat,
              longitude:
                next.kind === 'pickup'
                  ? next.booking.pickup_location.lng
                  : next.booking.dropoff_location.lng,
            }}
            title={next.booking.passenger_name}
            description={next.kind === 'pickup' ? 'Đón' : 'Trả'}
          />
        ) : null}
      </MapView>

      <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
        <Text style={styles.title}>Khách tiếp theo</Text>
        {err ? <Text style={styles.err}>{err}</Text> : null}
        {!next ? (
          <Text style={styles.muted}>Không còn điểm đón/trả trong danh sách.</Text>
        ) : (
          <>
            <Text style={styles.kind}>
              {next.kind === 'pickup' ? 'Đón' : 'Trả'}
            </Text>
            <Text style={styles.name}>{next.booking.passenger_name}</Text>
            <Text style={styles.muted}>
              {next.kind === 'pickup'
                ? next.booking.pickup_address
                : next.booking.dropoff_address}
            </Text>
            {next.booking.note ? (
              <Text style={styles.note}>Ghi chú: {next.booking.note}</Text>
            ) : null}
            <View style={styles.row}>
              <Button title="Chỉ đường" onPress={openDirections} />
            </View>
            {next.kind === 'pickup' ? (
              <Button title="Đã lên xe (Check-in)" onPress={() => void onCheckIn()} />
            ) : (
              <Button title="Đã trả khách" onPress={() => void onDropOff()} />
            )}
            <Button
              title="Không liên lạc được (ghi nhận)"
              onPress={() =>
                Alert.alert(
                  'Thông báo',
                  'Điều hành có thể cập nhật trên Web Admin.',
                )
              }
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  map: { flex: 0.42, minHeight: 180 },
  panel: { flex: 0.58, backgroundColor: '#fff' },
  panelContent: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  kind: { color: '#1677ff', fontWeight: '600' },
  name: { fontSize: 18, fontWeight: '600', marginTop: 4 },
  muted: { color: '#666', marginTop: 4 },
  note: { color: '#ad6800', marginTop: 8 },
  row: { marginVertical: 8 },
  err: { color: '#cf1322', marginBottom: 8 },
});
