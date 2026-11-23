import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { DriverRunDetailDto } from '@limousine-workspace/shared-types';
import {
  dropoffBooking,
  fetchRunDetail,
  markNoShowBooking,
  pickupBooking,
} from '../api/client';
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import type { TripsStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<TripsStackParamList, 'Passengers'>;

/** mbDrvPaxList — danh sách hành khách thực tế & thao tác đón/trả/no-show */
export function PassengersScreen({ route }: Props) {
  const { token } = useAuth();
  const { runId } = route.params;
  const [detail, setDetail] = useState<DriverRunDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
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
        e instanceof Error ? e.message : 'Không tải được danh sách hành khách',
      );
    } finally {
      setLoading(false);
    }
  }, [token, runId]);

  useEffect(() => {
    void load();
  }, [load]);

  const passengerBookings = useMemo(() => {
    if (!detail) return [];
    const byBooking = new Map<
      string,
      {
        bookingId: string;
        name: string;
        phone: string;
        seats: string[];
        status: string;
        pickupAddress: string;
        dropoffAddress: string;
        note: string | null;
      }
    >();
    for (const s of detail.stops) {
      if (s.ref_type !== 'BOOKING') continue;
      const existing = byBooking.get(s.ref_id) ?? {
        bookingId: s.ref_id,
        name: s.name,
        phone: s.phone,
        seats: s.seats,
        status: s.status,
        pickupAddress: '',
        dropoffAddress: '',
        note: s.note,
      };
      if (s.kind === 'PICKUP') existing.pickupAddress = s.address;
      if (s.kind === 'DROPOFF') existing.dropoffAddress = s.address;
      existing.status = s.status;
      byBooking.set(s.ref_id, existing);
    }
    return Array.from(byBooking.values());
  }, [detail]);

  const runAction = async (
    bookingId: string,
    action: 'pickup' | 'dropoff' | 'no-show',
  ) => {
    if (!token) return;
    setActingId(bookingId);
    setErr(null);
    try {
      if (action === 'pickup') await pickupBooking(token, bookingId);
      else if (action === 'dropoff') await dropoffBooking(token, bookingId);
      else
        await markNoShowBooking(
          token,
          bookingId,
          'Khách không có mặt tại điểm đón',
        );
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Thao tác thất bại');
    } finally {
      setActingId(null);
    }
  };

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <Text style={styles.caption}>
        Lệnh {detail?.code ?? runId.slice(0, 8)} · Tổng{' '}
        {passengerBookings.length} nhóm khách ({detail?.passenger_count ?? 0}{' '}
        ghế)
      </Text>
      {loading ? <ActivityIndicator color={C.gold} /> : null}
      {err ? <Text style={styles.err}>{err}</Text> : null}

      <ScrollView>
        {passengerBookings.map((p) => {
          const busy = actingId === p.bookingId;
          return (
            <ListCard
              key={p.bookingId}
              title={`${p.name} · Ghế ${p.seats.join(', ')}`}
              subtitle={`Trạng thái: ${p.status} · SĐT: ${p.phone}`}
            >
              <Text style={styles.addr}>Đón: {p.pickupAddress || '—'}</Text>
              <Text style={styles.addr}>Trả: {p.dropoffAddress || '—'}</Text>
              {p.note ? (
                <Text style={styles.addr}>Ghi chú: {p.note}</Text>
              ) : null}

              <View style={styles.actions}>
                <Pressable
                  style={styles.btnGhost}
                  onPress={() => void Linking.openURL(`tel:${p.phone}`)}
                >
                  <Text style={styles.btnGhostTxt}>Gọi</Text>
                </Pressable>
                {p.status === 'CONFIRMED' ? (
                  <>
                    <Pressable
                      style={styles.btnPrimary}
                      disabled={busy}
                      onPress={() => void runAction(p.bookingId, 'pickup')}
                    >
                      <Text style={styles.btnPrimaryTxt}>Đã đón</Text>
                    </Pressable>
                    <Pressable
                      style={styles.btnDanger}
                      disabled={busy}
                      onPress={() => void runAction(p.bookingId, 'no-show')}
                    >
                      <Text style={styles.btnDangerTxt}>No-show</Text>
                    </Pressable>
                  </>
                ) : null}
                {p.status === 'PICKED_UP' ? (
                  <Pressable
                    style={styles.btnSuccess}
                    disabled={busy}
                    onPress={() => void runAction(p.bookingId, 'dropoff')}
                  >
                    <Text style={styles.btnPrimaryTxt}>Đã trả khách</Text>
                  </Pressable>
                ) : null}
              </View>
            </ListCard>
          );
        })}
        {!loading && passengerBookings.length === 0 ? (
          <Text style={styles.caption}>
            Chưa có hành khách trên chuyến này.
          </Text>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  caption: { fontFamily: FONT.regular, color: C.muted, marginBottom: 12 },
  err: { fontFamily: FONT.regular, color: C.error, marginBottom: 10 },
  addr: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  btnGhost: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.stroke,
    backgroundColor: C.cardElevated,
  },
  btnGhostTxt: { fontFamily: FONT.semibold, fontSize: 12, color: C.gold },
  btnPrimary: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.ctaBlue,
  },
  btnSuccess: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.success,
  },
  btnPrimaryTxt: { fontFamily: FONT.semibold, fontSize: 12, color: C.white },
  btnDanger: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.noContactBg,
    borderWidth: 1,
    borderColor: C.noContactStroke,
  },
  btnDangerTxt: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    color: C.noContactText,
  },
});
