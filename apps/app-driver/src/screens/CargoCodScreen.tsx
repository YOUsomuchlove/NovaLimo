import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { CargoDto } from '@limousine-workspace/shared-types';
import { fetchMyCargos } from '../api/client';
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import { C, FONT } from '../theme/tokens';

/** mbDrvCargoCod — tổng hợp các kiện có thu hộ COD của tài xế */
export function CargoCodScreen() {
  const { token } = useAuth();
  const [cargos, setCargos] = useState<CargoDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await fetchMyCargos(token);
      setCargos(list.filter((c) => c.cod_amount_vnd > 0));
    } catch {
      setCargos([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => {
    let collected = 0;
    let pending = 0;
    for (const c of cargos) {
      if (c.cod_collected_at && !c.cod_settlement_id) {
        collected += c.cod_amount_vnd;
      } else if (!c.cod_collected_at) {
        pending += c.cod_amount_vnd;
      }
    }
    return { collected, pending };
  }, [cargos]);

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <Text style={styles.title}>COD & bàn giao tiền thu hộ</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLbl}>Đã thu (chờ nộp quỹ)</Text>
          <Text style={styles.summaryVal}>
            {totals.collected.toLocaleString('vi-VN')}đ
          </Text>
        </View>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLbl}>Cần thu khi giao</Text>
          <Text style={styles.summaryValMuted}>
            {totals.pending.toLocaleString('vi-VN')}đ
          </Text>
        </View>
      </View>

      {loading ? <ActivityIndicator color={C.gold} /> : null}

      <ScrollView>
        {cargos.map((item) => (
          <ListCard
            key={item.id}
            title={`${item.waybill_code} · ${item.cod_amount_vnd.toLocaleString('vi-VN')}đ`}
            subtitle={`Người nhận: ${item.receiver.name} (${item.receiver.phone})`}
          >
            <Text style={styles.small}>
              Trạng thái kiện: {item.status} ·{' '}
              {item.cod_settlement_id
                ? 'Đã đối soát nộp quỹ'
                : item.cod_collected_at
                  ? 'Đã thu tiền mặt — chờ bàn giao kế toán'
                  : 'Chưa thu COD'}
            </Text>
          </ListCard>
        ))}
        {!loading && cargos.length === 0 ? (
          <Text style={styles.small}>Không có đơn COD nào trong ca này.</Text>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  title: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: C.text,
    marginBottom: 12,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.stroke,
    padding: 14,
    marginBottom: 14,
    gap: 12,
  },
  summaryCol: { flex: 1 },
  summaryLbl: { fontFamily: FONT.regular, fontSize: 12, color: C.muted },
  summaryVal: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: C.gold,
    marginTop: 4,
  },
  summaryValMuted: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: C.text,
    marginTop: 4,
  },
  small: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
});
