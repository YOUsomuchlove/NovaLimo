import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import type { CargoTabStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<CargoTabStackParamList, 'CargoTransfer'>;

/** mbDrvCargoTransfer */
export function CargoTransferScreen({ route, navigation }: Props) {
  const id = route.params.cargoId ?? '—';
  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <Text style={styles.title}>Chuyển / bàn giao hàng</Text>
      <View style={styles.card}>
        <Text style={styles.p}>Kiện: {id === '—' ? '—' : `${id.slice(0, 12)}…`}</Text>
        <Text style={styles.p}>Xác nhận bàn giao cho điểm trung chuyển / kho.</Text>
      </View>
      <Pressable style={styles.primary} onPress={() => navigation.goBack()}>
        <Text style={styles.primaryTxt}>Xác nhận bàn giao</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, gap: 12 },
  title: { fontFamily: FONT.bold, fontSize: 18, color: C.text },
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.stroke,
    padding: 16,
    gap: 8,
  },
  p: { fontFamily: FONT.regular, color: C.text, fontSize: 15 },
  primary: {
    backgroundColor: C.ctaBlue,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryTxt: { fontFamily: FONT.semibold, color: '#fff', fontSize: 16 },
});
