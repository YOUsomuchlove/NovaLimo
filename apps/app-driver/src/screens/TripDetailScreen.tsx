import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { DriverRunDetailDto } from '@limousine-workspace/shared-types';
import { fetchRunDetail, startRun } from '../api/client';
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import type { TripsStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<TripsStackParamList, 'TripDetail'>;

/** mbDrvTripDetail — phơi lệnh chi tiết + bắt đầu hành trình + CTA đáy */
export function TripDetailScreen({ navigation, route }: Props) {
  const { token } = useAuth();
  const { runId, run: initialRun } = route.params;
  const [detail, setDetail] = useState<DriverRunDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchRunDetail(token, runId);
      setDetail(data);
    } catch (e) {
      setErr(
        e instanceof Error ? e.message : 'Không tải được chi tiết phơi lệnh',
      );
    } finally {
      setLoading(false);
    }
  }, [token, runId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onStartOrNavigate = async () => {
    if (!token) return;
    const status = detail?.status ?? initialRun?.status;
    if (status === 'DISPATCHED') {
      setStarting(true);
      setErr(null);
      try {
        await startRun(token, runId);
        await load();
        navigation.navigate('ActiveNav', { runId });
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Không bắt đầu được chuyến');
      } finally {
        setStarting(false);
      }
    } else {
      navigation.navigate('ActiveNav', { runId });
    }
  };

  const status = detail?.status ?? initialRun?.status ?? 'DISPATCHED';
  const routeName =
    detail?.trip?.route?.name ??
    (initialRun ? `Lệnh ${initialRun.code}` : 'Phơi lệnh');
  const plate =
    detail?.vehicle?.license_plate ?? initialRun?.vehicle?.license_plate ?? '—';

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.route}>{routeName}</Text>
        <Text style={styles.meta}>
          {plate} · Lệnh {detail?.code ?? initialRun?.code ?? '—'} · {status}
        </Text>
        {detail?.trip?.departure_at ? (
          <Text style={styles.subMeta}>
            Giờ xuất bến:{' '}
            {new Date(detail.trip.departure_at).toLocaleString('vi-VN')} ·
            Khách: {detail.passenger_count} · Hàng: {detail.cargo_count}
          </Text>
        ) : null}

        {loading ? (
          <ActivityIndicator color={C.gold} style={{ marginVertical: 16 }} />
        ) : null}
        {err ? <Text style={styles.err}>{err}</Text> : null}

        <Text style={styles.sectionTitle}>
          Lộ trình dừng đón / trả ({detail?.stops?.length ?? 0} điểm)
        </Text>

        {detail?.stops?.length ? (
          detail.stops.map((s, idx) => (
            <ListCard
              key={`${s.ref_type}-${s.ref_id}-${s.kind}-${idx}`}
              title={`${idx + 1}. [${s.kind === 'PICKUP' ? 'ĐÓN' : 'TRẢ'} ${s.ref_type === 'CARGO' ? 'HÀNG' : 'KHÁCH'}] ${s.name}`}
              subtitle={s.address}
            >
              <Text style={styles.small}>
                SĐT: {s.phone}
                {s.seats.length ? ` · Ghế: ${s.seats.join(', ')}` : ''} · Trạng
                thái: {s.status}
              </Text>
              {s.cod_amount_vnd ? (
                <Text style={styles.cod}>
                  Thu hộ COD: {s.cod_amount_vnd.toLocaleString('vi-VN')}đ
                </Text>
              ) : null}
              {s.note ? (
                <Text style={styles.small}>Ghi chú: {s.note}</Text>
              ) : null}
            </ListCard>
          ))
        ) : !loading ? (
          <Text style={styles.small}>
            Chưa có điểm đón/trả trên phơi lệnh này.
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.cta}>
        <Pressable
          style={[styles.btnPrimary, starting && { opacity: 0.7 }]}
          onPress={() => void onStartOrNavigate()}
          disabled={starting}
        >
          <Text style={styles.btnPrimaryTxt}>
            {starting
              ? 'Đang mở chuyến…'
              : status === 'DISPATCHED'
                ? 'Bắt đầu hành trình & Điều hướng'
                : 'Điều hướng & đón trả khách'}
          </Text>
        </Pressable>
        <View style={styles.row}>
          <Pressable
            style={styles.btnGhost}
            onPress={() => navigation.navigate('Passengers', { runId })}
          >
            <Text style={styles.btnGhostTxt}>Khách / check-in</Text>
          </Pressable>
          <Pressable
            style={styles.btnGhost}
            onPress={() =>
              navigation.getParent()?.navigate('Cargo', {
                screen: 'CargoPick',
              })
            }
          >
            <Text style={styles.btnGhostTxt}>Hàng hóa</Text>
          </Pressable>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  scroll: { paddingBottom: 16 },
  route: {
    fontFamily: FONT.bold,
    fontSize: 20,
    color: C.text,
    marginBottom: 4,
  },
  meta: { fontFamily: FONT.regular, color: C.muted, marginBottom: 4 },
  subMeta: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.muted,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    color: C.gold,
    marginBottom: 10,
  },
  err: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.error,
    marginBottom: 10,
  },
  small: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  cod: { fontFamily: FONT.semibold, fontSize: 12, color: C.gold, marginTop: 2 },
  cta: { paddingTop: 8, gap: 10, borderTopWidth: 1, borderTopColor: C.stroke },
  btnPrimary: {
    backgroundColor: C.ctaBlue,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimaryTxt: { fontFamily: FONT.semibold, color: C.white, fontSize: 16 },
  row: { flexDirection: 'row', gap: 10 },
  btnGhost: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: C.card,
  },
  btnGhostTxt: { color: C.gold, fontFamily: FONT.semibold, fontSize: 13 },
});
