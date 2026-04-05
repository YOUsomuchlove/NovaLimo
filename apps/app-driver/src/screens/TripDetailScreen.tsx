import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import type { TripsStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<TripsStackParamList, 'TripDetail'>;

/** mbDrvTripDetail — phơi lệnh + CTA đáy */
export function TripDetailScreen({ navigation, route }: Props) {
  const { run } = route.params;

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.route}>{run.route_name || 'Chuyến'}</Text>
        <Text style={styles.meta}>
          {run.license_plate} · {run.status}
        </Text>

        {run.bookings?.map((b) => (
          <ListCard
            key={b.id}
            title={b.passenger_name}
            subtitle={`${b.pickup_address} → ${b.dropoff_address}`}
          >
            <Text style={styles.small}>Ghế: {b.seat_label || '—'} · {b.status}</Text>
          </ListCard>
        ))}
      </ScrollView>

      <View style={styles.cta}>
        <Pressable
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('ActiveNav', { runId: run.id })}
        >
          <Text style={styles.btnPrimaryTxt}>Điều hướng & đón</Text>
        </Pressable>
        <View style={styles.row}>
          <Pressable
            style={styles.btnGhost}
            onPress={() => navigation.navigate('Passengers', { runId: run.id })}
          >
            <Text style={styles.btnGhostTxt}>Khách / check-in</Text>
          </Pressable>
          <Pressable
            style={styles.btnGhost}
            onPress={() =>
              navigation.getParent()?.getParent()?.navigate('Cargo', {
                screen: 'Cargo',
                params: { runId: run.id },
              })
            }
          >
            <Text style={styles.btnGhostTxt}>Hàng hóa</Text>
          </Pressable>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  scroll: { paddingBottom: 16 },
  route: { fontFamily: FONT.bold, fontSize: 20, color: C.text, marginBottom: 4 },
  meta: { fontFamily: FONT.regular, color: C.muted, marginBottom: 16 },
  small: { fontFamily: FONT.regular, fontSize: 12, color: C.muted },
  cta: { paddingTop: 8, gap: 10, borderTopWidth: 1, borderTopColor: C.stroke },
  btnPrimary: {
    backgroundColor: C.ctaBlue,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimaryTxt: { fontFamily: FONT.semibold, color: '#fff', fontSize: 16 },
  row: { flexDirection: 'row', gap: 10 },
  btnGhost: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: C.card,
  },
  btnGhostTxt: { color: C.gold, fontFamily: FONT.semibold, fontSize: 13 },
});
