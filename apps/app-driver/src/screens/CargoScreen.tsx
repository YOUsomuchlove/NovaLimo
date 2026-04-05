import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import type { CargoTabStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<CargoTabStackParamList, 'Cargo'>;

/** mbDrvCargoItem */
export function CargoScreen({ navigation, route }: Props) {
  const { runId, cargoId } = route.params;

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <ScrollView>
        <Text style={styles.h1}>Chi tiết kiện</Text>
        <Text style={styles.meta}>Run {runId.slice(0, 8)}… · {cargoId?.slice(0, 8) ?? '—'}</Text>
        <View style={styles.card}>
          <Text style={styles.row}>Mã vận đơn: NL-CARGO-DEMO</Text>
          <Text style={styles.row}>Người gửi: Demo · 090x</Text>
          <Text style={styles.row}>Người nhận: Demo · 090x</Text>
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <Pressable style={styles.btn} onPress={() => navigation.navigate('CargoCod')}>
          <Text style={styles.btnTxt}>COD / thu hộ</Text>
        </Pressable>
        <Pressable
          style={styles.btn}
          onPress={() => navigation.navigate('CargoTransfer', { cargoId: cargoId ?? 'x' })}
        >
          <Text style={styles.btnTxt}>Bàn giao / chuyển</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  h1: { fontFamily: FONT.bold, fontSize: 20, color: C.text },
  meta: { fontFamily: FONT.regular, color: C.muted, marginBottom: 16 },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.stroke,
    padding: 16,
    gap: 8,
  },
  row: { fontFamily: FONT.regular, color: C.text, fontSize: 15 },
  actions: { gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.stroke },
  btn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.stroke,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: C.card,
  },
  btnTxt: { color: C.gold, fontFamily: FONT.semibold },
});
