import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { CargoDto } from '@limousine-workspace/shared-types';
import { fetchMyCargos } from '../api/client';
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import type { CargoTabStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<CargoTabStackParamList, 'CargoPick'>;

/** mbDrvCargoMng + FAB quét mã & quản lý COD */
export function CargoPickScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [rows, setRows] = useState<CargoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchMyCargos(token);
      setRows(data);
    } catch (e) {
      setErr(
        e instanceof Error ? e.message : 'Không tải được danh sách hàng hóa',
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Hàng ký gửi ({rows.length})</Text>
        <Pressable
          style={styles.codBtn}
          onPress={() => navigation.navigate('CargoCod')}
        >
          <Text style={styles.codBtnTxt}>Đối soát COD</Text>
        </Pressable>
      </View>

      {loading ? <ActivityIndicator color={C.gold} /> : null}
      {err ? <Text style={styles.err}>{err}</Text> : null}

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={() => void load()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.muted}>
              Không có kiện hàng trong ca hiện tại.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('Cargo', {
                runId: item.trip_run_id ?? undefined,
                cargoId: item.id,
              })
            }
          >
            <ListCard
              title={`${item.waybill_code} · ${item.description}`}
              subtitle={`${item.sender.name} (${item.sender.phone}) → ${item.receiver.name} (${item.receiver.phone})`}
            >
              <Text style={styles.muted}>
                Trạng thái: {item.status} · Cỡ: {item.size} ({item.weight_kg}{' '}
                kg)
              </Text>
              {item.cod_amount_vnd > 0 ? (
                <Text style={styles.codTag}>
                  COD: {item.cod_amount_vnd.toLocaleString('vi-VN')}đ{' '}
                  {item.cod_collected_at ? '(Đã thu)' : '(Chưa thu)'}
                </Text>
              ) : null}
            </ListCard>
          </Pressable>
        )}
      />
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('CargoScan')}
      >
        <Text style={styles.fabIc}>QR</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontFamily: FONT.bold, fontSize: 18, color: C.text },
  codBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.stroke,
    backgroundColor: C.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  codBtnTxt: { fontFamily: FONT.semibold, fontSize: 12, color: C.gold },
  list: { paddingBottom: 88 },
  err: { color: C.error, fontFamily: FONT.regular, marginBottom: 8 },
  muted: { color: C.muted, fontFamily: FONT.regular, fontSize: 13 },
  codTag: {
    color: C.gold,
    fontFamily: FONT.semibold,
    fontSize: 12,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.fabBlue,
    borderWidth: 2,
    borderColor: C.fabBlueStroke,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIc: { fontFamily: FONT.bold, fontSize: 16, color: C.white },
});
