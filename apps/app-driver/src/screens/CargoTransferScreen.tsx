import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { pickupCargo, returnCargo } from '../api/client';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import type { CargoTabStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<CargoTabStackParamList, 'CargoTransfer'>;

/** mbDrvCargoTransfer — bàn giao nhận từ kho hoặc hoàn kho */
export function CargoTransferScreen({ route, navigation }: Props) {
  const { token } = useAuth();
  const cargoId = route.params?.cargoId;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleAction = async (mode: 'pickup' | 'return') => {
    if (!token || !cargoId) {
      navigation.goBack();
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      if (mode === 'pickup') {
        await pickupCargo(token, cargoId);
      } else {
        await returnCargo(token, cargoId);
      }
      navigation.goBack();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không thực hiện được bàn giao');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <Text style={styles.title}>Chuyển / bàn giao hàng</Text>
      <View style={styles.card}>
        <Text style={styles.p}>
          Mã định danh kiện: {cargoId ? `${cargoId.slice(0, 12)}…` : '—'}
        </Text>
        <Text style={styles.p}>
          Chọn thao tác nhận bàn giao kiện hàng lên xe hoặc hoàn trả lại kho
          trung chuyển.
        </Text>
      </View>

      {err ? <Text style={styles.err}>{err}</Text> : null}
      {busy ? <ActivityIndicator color={C.gold} /> : null}

      <Pressable
        style={styles.primary}
        disabled={busy}
        onPress={() => void handleAction('pickup')}
      >
        <Text style={styles.primaryTxt}>Xác nhận nhận bàn giao lên xe</Text>
      </Pressable>

      <Pressable
        style={styles.secondary}
        disabled={busy}
        onPress={() => void handleAction('return')}
      >
        <Text style={styles.secondaryTxt}>Bàn giao hoàn trả về kho</Text>
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
  p: { fontFamily: FONT.regular, color: C.text, fontSize: 15, lineHeight: 21 },
  err: { fontFamily: FONT.regular, color: C.error, fontSize: 13 },
  primary: {
    backgroundColor: C.ctaBlue,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryTxt: { fontFamily: FONT.semibold, color: C.white, fontSize: 15 },
  secondary: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.stroke,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryTxt: { fontFamily: FONT.semibold, color: C.gold, fontSize: 15 },
});
