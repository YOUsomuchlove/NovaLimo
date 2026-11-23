import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { DriverIncomeDto } from '@limousine-workspace/shared-types';
import { fetchDriverIncome } from '../api/client';
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import { C, FONT } from '../theme/tokens';

/** mbDrvEarn — thống kê thu nhập & sản lượng chuyến theo tháng */
export function IncomeScreen() {
  const { token } = useAuth();
  const [income, setIncome] = useState<DriverIncomeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchDriverIncome(token);
      setIncome(data);
    } catch (e) {
      setErr(
        e instanceof Error ? e.message : 'Không tải được dữ liệu thu nhập',
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <Text style={styles.title}>
        Thu nhập & sản lượng ({income?.month ?? 'Tháng hiện tại'})
      </Text>

      {loading ? <ActivityIndicator color={C.gold} /> : null}
      {err ? <Text style={styles.err}>{err}</Text> : null}

      <ScrollView>
        <ListCard
          title="Thu nhập ước tính trong tháng"
          subtitle={`Tổng ${income?.runs ?? 0} chuyến hoàn thành`}
        >
          <Text style={styles.amt}>
            {(income?.estimated_income_vnd ?? 0).toLocaleString('vi-VN')}đ
          </Text>
          <Text style={styles.sub}>
            Hành khách đã phục vụ: {income?.passengers ?? 0} lượt · Kiện hàng đã
            giao: {income?.cargos ?? 0} kiện
          </Text>
        </ListCard>

        <Text style={styles.secTitle}>Chi tiết theo ngày</Text>
        {income?.days?.length ? (
          income.days.map((d) => (
            <View key={d.date} style={styles.dayRow}>
              <Text style={styles.dayDate}>{d.date}</Text>
              <Text style={styles.dayVal}>
                {d.runs} chuyến · {d.passengers} khách
              </Text>
            </View>
          ))
        ) : !loading ? (
          <Text style={styles.sub}>
            Chưa có chuyến hoàn thành trong tháng này.
          </Text>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  title: {
    fontFamily: FONT.bold,
    fontSize: 20,
    color: C.text,
    marginBottom: 12,
  },
  err: { fontFamily: FONT.regular, color: C.error, marginBottom: 10 },
  amt: { fontFamily: FONT.bold, fontSize: 22, color: C.gold, marginTop: 4 },
  sub: { fontFamily: FONT.regular, fontSize: 13, color: C.muted, marginTop: 4 },
  secTitle: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    color: C.gold,
    marginTop: 8,
    marginBottom: 8,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.stroke,
    backgroundColor: C.card,
    marginBottom: 8,
  },
  dayDate: { fontFamily: FONT.semibold, fontSize: 14, color: C.text },
  dayVal: { fontFamily: FONT.regular, fontSize: 13, color: C.muted },
});
