import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { scanCargoByCode } from '../api/client';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import type { CargoTabStackParamList } from '../navigation/types';
import { C, FONT, RADIUS } from '../theme/tokens';

type Props = NativeStackScreenProps<CargoTabStackParamList, 'CargoScan'>;

/** mbDrvCargoScan — quét QR bằng expo-camera hoặc nhập mã vận đơn thủ công */
export function CargoScanScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleLookup = async (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean || !token || scanning) return;
    setScanning(true);
    setErr(null);
    try {
      const cargo = await scanCargoByCode(token, clean);
      navigation.replace('Cargo', {
        runId: cargo.trip_run_id ?? undefined,
        cargoId: cargo.id,
      });
    } catch (e) {
      setErr(
        e instanceof Error ? e.message : `Không tìm thấy vận đơn ${clean}`,
      );
      setScanning(false);
    }
  };

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <Text style={styles.title}>Quét QR vận đơn</Text>

      <View style={styles.cam}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            enableTorch={torch}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'code128', 'code39'],
            }}
            onBarcodeScanned={(res) => {
              if (res.data) {
                void handleLookup(res.data);
              }
            }}
          />
        ) : (
          <View style={styles.permCenter}>
            <Text style={styles.camHint}>
              Cần cấp quyền Camera để quét mã QR vận đơn trực tiếp.
            </Text>
            <Pressable
              style={styles.permBtn}
              onPress={() => void requestPermission()}
            >
              <Text style={styles.permBtnTxt}>Cấp quyền Camera</Text>
            </Pressable>
          </View>
        )}
      </View>

      {err ? <Text style={styles.err}>{err}</Text> : null}
      {scanning ? <ActivityIndicator color={C.gold} /> : null}

      <View style={styles.manualRow}>
        <TextInput
          value={manualCode}
          onChangeText={setManualCode}
          placeholder="Nhập mã vận đơn (VD: CG-4HX82N)"
          placeholderTextColor={C.muted}
          autoCapitalize="characters"
          style={styles.input}
        />
        <Pressable
          style={styles.lookupBtn}
          disabled={scanning}
          onPress={() => void handleLookup(manualCode)}
        >
          <Text style={styles.lookupTxt}>Tra cứu</Text>
        </Pressable>
      </View>

      <Pressable style={styles.torch} onPress={() => setTorch((v) => !v)}>
        <Text style={styles.torchTxt}>
          {torch ? 'Tắt đèn flash' : 'Bật đèn flash'}
        </Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, gap: 12 },
  title: { fontFamily: FONT.bold, fontSize: 18, color: C.text },
  cam: {
    height: 320,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.stroke,
    backgroundColor: C.card,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permCenter: { padding: 20, alignItems: 'center', gap: 12 },
  camHint: { color: C.muted, fontFamily: FONT.regular, textAlign: 'center' },
  permBtn: {
    backgroundColor: C.gold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.input,
  },
  permBtnTxt: { fontFamily: FONT.semibold, color: C.bg, fontSize: 14 },
  err: { fontFamily: FONT.regular, color: C.error, fontSize: 13 },
  manualRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: C.text,
    fontFamily: FONT.regular,
    backgroundColor: C.card,
  },
  lookupBtn: {
    backgroundColor: C.gold,
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lookupTxt: { fontFamily: FONT.semibold, color: C.bg, fontSize: 14 },
  torch: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.stroke,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: C.cardElevated,
  },
  torchTxt: { fontFamily: FONT.semibold, color: C.text },
});
