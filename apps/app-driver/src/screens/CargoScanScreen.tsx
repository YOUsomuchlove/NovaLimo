import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import type { CargoTabStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<CargoTabStackParamList, 'CargoScan'>;

/** mbDrvCargoScan */
export function CargoScanScreen({ navigation }: Props) {
  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <Text style={styles.title}>Quét QR / chứng từ</Text>
      <View style={styles.cam}>
        <Text style={styles.camHint}>Khung camera (expo-camera)</Text>
      </View>
      <Pressable style={styles.torch} onPress={() => navigation.goBack()}>
        <Text style={styles.torchTxt}>Bật đèn · Xong</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, gap: 12 },
  title: { fontFamily: FONT.bold, fontSize: 18, color: C.text },
  cam: {
    height: 420,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.stroke,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camHint: { color: C.muted, fontFamily: FONT.regular },
  torch: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.stroke,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: C.cardElevated,
  },
  torchTxt: { fontFamily: FONT.semibold, color: C.text },
});
