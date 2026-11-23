import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ShiftSummaryDto } from '@limousine-workspace/shared-types';
import { endShift, fetchShiftSummary, startShift } from '../api/client';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import { C, FONT, RADIUS } from '../theme/tokens';

/** mbDrvShiftEnd — tổng kết ca thực tế + checklist 3 mục bắt buộc */
export function EndShiftScreen() {
  const { token, refreshProfile } = useAuth();
  const [summary, setSummary] = useState<ShiftSummaryDto | null>(null);
  const [vehicleClean, setVehicleClean] = useState(true);
  const [fuelChecked, setFuelChecked] = useState(true);
  const [cashHandedOver, setCashHandedOver] = useState(true);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchShiftSummary(token);
      setSummary(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không tải được thông tin ca');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const onStartNewShift = async () => {
    if (!token) return;
    setSubmitting(true);
    setErr(null);
    setDoneMsg(null);
    try {
      await startShift(token);
      await refreshProfile();
      await load();
      setDoneMsg('Đã bắt đầu ca làm việc mới.');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không bắt đầu được ca');
    } finally {
      setSubmitting(false);
    }
  };

  const onEnd = async () => {
    if (!token) return;
    if (!vehicleClean || !fuelChecked || !cashHandedOver) {
      setErr('Vui lòng hoàn thành đủ 3 mục checklist trước khi kết thúc ca');
      return;
    }
    setSubmitting(true);
    setErr(null);
    setDoneMsg(null);
    try {
      let location: { lat: number; lng: number } | undefined;
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        }
      } catch {
        /* ignore */
      }
      await endShift(token, {
        checklist: {
          vehicle_clean: vehicleClean,
          fuel_checked: fuelChecked,
          cash_handed_over: cashHandedOver,
        },
        note: note.trim() || undefined,
        location,
      });
      await refreshProfile();
      await load();
      setDoneMsg('Đã kết thúc ca làm việc và gửi báo cáo bàn giao.');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không kết thúc được ca');
    } finally {
      setSubmitting(false);
    }
  };

  const activeShift =
    summary?.shift && !summary.shift.ended_at ? summary.shift : null;

  return (
    <ScreenShell style={styles.shell}>
      <ScrollView
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Quản lý ca làm việc</Text>

        {loading ? <ActivityIndicator color={C.gold} /> : null}
        {err ? <Text style={styles.err}>{err}</Text> : null}
        {doneMsg ? <Text style={styles.ok}>{doneMsg}</Text> : null}

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            {activeShift
              ? `Đang trong ca · Bắt đầu ${new Date(activeShift.started_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
              : 'Hiện chưa có ca đang mở'}
          </Text>
          <Text style={styles.heroSub}>
            Hoàn thành: {summary?.runs_finished ?? 0} chuyến ·{' '}
            {summary?.distance_km ?? 0} km
          </Text>
          <Text style={styles.heroSub}>
            Khách đã trả: {summary?.passengers_dropped ?? 0} · Kiện đã giao:{' '}
            {summary?.cargos_delivered ?? 0}
          </Text>
          <Text style={styles.codLine}>
            COD đã thu trong ca:{' '}
            {(summary?.cod_collected_vnd ?? 0).toLocaleString('vi-VN')}đ
          </Text>
        </View>

        {activeShift ? (
          <>
            <Text style={styles.checkTitle}>
              Checklist bắt buộc trước khi kết ca
            </Text>
            <View style={styles.check}>
              <View style={styles.row}>
                <Text style={styles.rowTxt}>
                  1. Đã vệ sinh khoang xe sạch sẽ
                </Text>
                <Switch
                  value={vehicleClean}
                  onValueChange={setVehicleClean}
                  trackColor={{ true: C.goldDim }}
                />
              </View>
              <View style={styles.row}>
                <Text style={styles.rowTxt}>
                  2. Đã kiểm tra nhiên liệu & kỹ thuật xe
                </Text>
                <Switch
                  value={fuelChecked}
                  onValueChange={setFuelChecked}
                  trackColor={{ true: C.goldDim }}
                />
              </View>
              <View style={styles.row}>
                <Text style={styles.rowTxt}>
                  3. Đã đối chiếu tiền mặt / COD bàn giao
                </Text>
                <Switch
                  value={cashHandedOver}
                  onValueChange={setCashHandedOver}
                  trackColor={{ true: C.goldDim }}
                />
              </View>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Ghi chú bàn giao cuối ca (tùy chọn)…"
                placeholderTextColor={C.muted}
                style={styles.input}
              />
            </View>

            <Pressable
              style={[styles.endBtn, submitting && { opacity: 0.7 }]}
              disabled={submitting}
              onPress={() => void onEnd()}
            >
              <Text style={styles.endTxt}>
                {submitting ? 'Đang gửi báo cáo…' : 'Kết thúc ca & báo cáo'}
              </Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={[styles.startBtn, submitting && { opacity: 0.7 }]}
            disabled={submitting}
            onPress={() => void onStartNewShift()}
          >
            <Text style={styles.startTxt}>
              {submitting ? 'Đang mở ca…' : 'Bắt đầu ca làm việc mới'}
            </Text>
          </Pressable>
        )}

        <Text style={styles.note}>
          Sau khi kết thúc ca, bạn sẽ ngừng phát tín hiệu định vị GPS trực
          tuyến. Nếu có phát sinh cần điều chỉnh, vui lòng liên hệ tổng đài điều
          hành.
        </Text>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  title: { fontFamily: FONT.bold, fontSize: 18, color: C.text },
  err: { fontFamily: FONT.regular, fontSize: 13, color: C.error },
  ok: { fontFamily: FONT.semibold, fontSize: 13, color: C.success },
  hero: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.stroke,
    padding: 16,
    gap: 6,
  },
  heroTitle: { fontFamily: FONT.semibold, color: C.text, fontSize: 16 },
  heroSub: { fontFamily: FONT.regular, color: C.muted, fontSize: 14 },
  codLine: { fontFamily: FONT.bold, color: C.gold, fontSize: 14, marginTop: 2 },
  checkTitle: {
    fontFamily: FONT.semibold,
    color: C.slate200,
    fontSize: 13,
    marginTop: 4,
  },
  check: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.stroke,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowTxt: { fontFamily: FONT.regular, color: C.text, flex: 1, marginRight: 12 },
  input: {
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: RADIUS.input,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.text,
    fontFamily: FONT.regular,
    backgroundColor: C.bg,
  },
  endBtn: {
    marginTop: 8,
    backgroundColor: C.shiftOrange,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: C.shiftOrangeStroke,
    paddingVertical: 16,
    alignItems: 'center',
  },
  endTxt: { fontFamily: FONT.bold, color: C.white, fontSize: 16 },
  startBtn: {
    marginTop: 8,
    backgroundColor: C.gold,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startTxt: { fontFamily: FONT.bold, color: C.bg, fontSize: 16 },
  note: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: C.muted,
    lineHeight: 16,
  },
});
