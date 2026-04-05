import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import type { TripsStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<TripsStackParamList, 'Passengers'>;

/** mbDrvPaxList */
export function PassengersScreen({ route }: Props) {
  const { runId } = route.params;

  const mock = [
    { id: '1', name: 'Nguyễn Văn A', seat: 'A1', st: 'WAITING' },
    { id: '2', name: 'Trần Thị B', seat: 'B2', st: 'PICKED_UP' },
  ];

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <Text style={styles.caption}>Chuyến · {runId.slice(0, 8)}…</Text>
      <ScrollView>
        {mock.map((p) => (
          <ListCard key={p.id} title={p.name} subtitle={`Ghế ${p.seat} · ${p.st}`} />
        ))}
      </ScrollView>
      <Pressable style={styles.scan}>
        <Text style={styles.scanTxt}>Quét vé / QR check-in</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  caption: { fontFamily: FONT.regular, color: C.muted, marginBottom: 12 },
  scan: {
    marginTop: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.stroke,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: C.cardElevated,
  },
  scanTxt: { fontFamily: FONT.semibold, color: C.text, fontSize: 15 },
});
