import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import type { CargoDto } from '@limousine-workspace/shared-types';
import {
  deliverCargo,
  fetchMyCargos,
  pickupCargo,
  returnCargo,
} from '../api/client';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import type { CargoTabStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<CargoTabStackParamList, 'Cargo'>;

/** mbDrvCargoItem — chi tiết vận đơn + xác nhận lấy hàng / giao hàng / thu COD */
export function CargoScreen({ navigation, route }: Props) {
  const { token } = useAuth();
  const { cargoId } = route.params;
  const [cargo, setCargo] = useState<CargoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [codCollected, setCodCollected] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const list = await fetchMyCargos(token);
      const found = list.find((c) => c.id === cargoId) ?? null;
      setCargo(found);
    } catch (e) {
      setErr(
        e instanceof Error ? e.message : 'Không tải được chi tiết kiện hàng',
      );
    } finally {
      setLoading(false);
    }
  }, [token, cargoId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onPickup = async () => {
    if (!token || !cargo) return;
    setActing(true);
    setErr(null);
    try {
      const updated = await pickupCargo(token, cargo.id);
      setCargo(updated);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không xác nhận lấy hàng được');
    } finally {
      setActing(false);
    }
  };

  const onDeliver = async () => {
    if (!token || !cargo) return;
    setActing(true);
    setErr(null);
    try {
      const updated = await deliverCargo(token, cargo.id, {
        cod_collected: cargo.cod_amount_vnd > 0 ? codCollected : undefined,
      });
      setCargo(updated);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không xác nhận giao hàng được');
    } finally {
      setActing(false);
    }
  };

  const onReturn = async () => {
    if (!token || !cargo) return;
    setActing(true);
    setErr(null);
    try {
      const updated = await returnCargo(token, cargo.id);
      setCargo(updated);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không hoàn hàng được');
    } finally {
      setActing(false);
    }
  };

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <ScrollView>
        <Text style={styles.h1}>
          {cargo ? `Vận đơn ${cargo.waybill_code}` : 'Chi tiết kiện hàng'}
        </Text>
        <Text style={styles.meta}>
          Trạng thái: {cargo?.status ?? '—'} · Tuyến:{' '}
          {cargo?.route?.name ?? '—'}
        </Text>

        {loading ? <ActivityIndicator color={C.gold} /> : null}
        {err ? <Text style={styles.err}>{err}</Text> : null}

        {cargo ? (
          <View style={styles.card}>
            <Text style={styles.row}>Mô tả: {cargo.description}</Text>
            <Text style={styles.row}>
              Kích thước: {cargo.size} · {cargo.weight_kg} kg
              {cargo.is_fragile ? ' · HÀNG DỄ VỠ' : ''}
            </Text>
            <Text style={styles.row}>
              Người gửi: {cargo.sender.name} ({cargo.sender.phone}) —{' '}
              {cargo.sender.address}
            </Text>
            <Text style={styles.row}>
              Người nhận: {cargo.receiver.name} ({cargo.receiver.phone}) —{' '}
              {cargo.receiver.address}
            </Text>
            <Text style={styles.row}>
              Cước vận chuyển: {cargo.fee_vnd.toLocaleString('vi-VN')}đ (
              {cargo.fee_payer === 'SENDER'
                ? 'Người gửi trả'
                : 'Người nhận trả'}
              )
            </Text>
            <Text style={styles.codRow}>
              Tiền thu hộ COD: {cargo.cod_amount_vnd.toLocaleString('vi-VN')}đ{' '}
              {cargo.cod_collected_at ? '✓ Đã thu' : ''}
            </Text>

            {cargo.status === 'IN_TRANSIT' && cargo.cod_amount_vnd > 0 ? (
              <View style={styles.switchRow}>
                <Text style={styles.row}>Đã thu đủ tiền COD khi giao</Text>
                <Switch
                  value={codCollected}
                  onValueChange={setCodCollected}
                  trackColor={{ true: C.goldDim }}
                />
              </View>
            ) : null}

            <View style={styles.callRow}>
              <Pressable
                style={styles.smallBtn}
                onPress={() =>
                  void Linking.openURL(`tel:${cargo.sender.phone}`)
                }
              >
                <Text style={styles.smallBtnTxt}>Gọi người gửi</Text>
              </Pressable>
              <Pressable
                style={styles.smallBtn}
                onPress={() =>
                  void Linking.openURL(`tel:${cargo.receiver.phone}`)
                }
              >
                <Text style={styles.smallBtnTxt}>Gọi người nhận</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.actions}>
        {cargo?.status === 'CREATED' ? (
          <Pressable
            style={styles.btnPrimary}
            disabled={acting}
            onPress={() => void onPickup()}
          >
            <Text style={styles.btnPrimaryTxt}>
              Xác nhận đã nhận kiện lên xe
            </Text>
          </Pressable>
        ) : null}

        {cargo?.status === 'PICKED_UP' || cargo?.status === 'IN_TRANSIT' ? (
          <View style={styles.callRow}>
            <Pressable
              style={[styles.btnSuccess, { flex: 1 }]}
              disabled={acting}
              onPress={() => void onDeliver()}
            >
              <Text style={styles.btnPrimaryTxt}>Xác nhận giao thành công</Text>
            </Pressable>
            <Pressable
              style={styles.btnDanger}
              disabled={acting}
              onPress={() => void onReturn()}
            >
              <Text style={styles.btnDangerTxt}>Hoàn hàng</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.callRow}>
          <Pressable
            style={[styles.btn, { flex: 1 }]}
            onPress={() => navigation.navigate('CargoCod', { cargoId })}
          >
            <Text style={styles.btnTxt}>COD / thu hộ</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, { flex: 1 }]}
            onPress={() => navigation.navigate('CargoTransfer', { cargoId })}
          >
            <Text style={styles.btnTxt}>Bàn giao kho</Text>
          </Pressable>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  h1: { fontFamily: FONT.bold, fontSize: 20, color: C.text },
  meta: { fontFamily: FONT.regular, color: C.muted, marginBottom: 14 },
  err: { fontFamily: FONT.regular, color: C.error, marginBottom: 10 },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.stroke,
    padding: 16,
    gap: 8,
  },
  row: {
    fontFamily: FONT.regular,
    color: C.text,
    fontSize: 14,
    lineHeight: 20,
  },
  codRow: { fontFamily: FONT.bold, color: C.gold, fontSize: 15 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  callRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  smallBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.stroke,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: C.cardElevated,
  },
  smallBtnTxt: { fontFamily: FONT.semibold, fontSize: 12, color: C.gold },
  actions: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.stroke,
  },
  btnPrimary: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: C.ctaBlue,
  },
  btnSuccess: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: C.success,
  },
  btnPrimaryTxt: { fontFamily: FONT.semibold, color: C.white, fontSize: 14 },
  btnDanger: {
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: C.noContactBg,
    borderWidth: 1,
    borderColor: C.noContactStroke,
  },
  btnDangerTxt: {
    fontFamily: FONT.semibold,
    color: C.noContactText,
    fontSize: 13,
  },
  btn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.stroke,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: C.card,
  },
  btnTxt: { color: C.gold, fontFamily: FONT.semibold, fontSize: 13 },
});
