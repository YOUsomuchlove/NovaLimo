import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { patchTripRunStatus } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TripDetail'>;

export function TripDetailScreen({ navigation, route }: Props) {
  const { run } = route.params;
  const { token } = useAuth();

  const pickups = useMemo(
    () =>
      [...run.bookings].sort(
        (a, b) => (a.pickup_order ?? 0) - (b.pickup_order ?? 0),
      ),
    [run.bookings],
  );

  const dropoffs = useMemo(
    () =>
      [...run.bookings].sort(
        (a, b) => (a.dropoff_order ?? 0) - (b.dropoff_order ?? 0),
      ),
    [run.bookings],
  );

  const startJourney = async () => {
    if (!token) return;
    await patchTripRunStatus(token, run.id, 'IN_PROGRESS');
    navigation.navigate('ActiveNav', { runId: run.id });
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Phơi lệnh điện tử</Text>
      <Text style={styles.sub}>{run.route_name}</Text>
      <Text style={styles.muted}>Chuyến: {run.id.slice(0, 8)}…</Text>

      <Text style={styles.section}>Thứ tự đón</Text>
      {pickups.map((b) => (
        <View key={b.id} style={styles.row}>
          <Text style={styles.name}>
            #{b.pickup_order ?? '—'} {b.passenger_name}
          </Text>
          <Text style={styles.muted}>{b.pickup_address}</Text>
          {b.note ? <Text style={styles.note}>Ghi chú: {b.note}</Text> : null}
          <Text style={styles.muted}>Trạng thái: {b.status}</Text>
        </View>
      ))}

      <Text style={styles.section}>Thứ tự trả</Text>
      {dropoffs.map((b) => (
        <View key={`d-${b.id}`} style={styles.row}>
          <Text style={styles.name}>
            #{b.dropoff_order ?? '—'} {b.passenger_name}
          </Text>
          <Text style={styles.muted}>{b.dropoff_address}</Text>
        </View>
      ))}

      <View style={styles.actions}>
        <View style={styles.btnWrap}>
          <Button
            title="Hàng hóa ký gửi"
            onPress={() => navigation.navigate('Cargo', { runId: run.id })}
          />
        </View>
        <View style={styles.btnWrap}>
          <Button
            title="Điều hướng & đón/trả"
            onPress={() => navigation.navigate('ActiveNav', { runId: run.id })}
          />
        </View>
        {run.status === 'PENDING' ? (
          <View style={styles.btnWrap}>
            <Button
              title="Bắt đầu hành trình"
              onPress={() => void startJourney()}
            />
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 18, fontWeight: '600' },
  sub: { fontSize: 20, marginTop: 4 },
  muted: { color: '#666', marginTop: 2 },
  section: { marginTop: 16, fontWeight: '600', fontSize: 16 },
  row: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  name: { fontWeight: '500' },
  note: { color: '#ad6800', marginTop: 4 },
  actions: { marginTop: 20 },
  btnWrap: { marginBottom: 10 },
});
