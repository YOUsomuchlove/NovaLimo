import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SwipeToConfirm } from '@limousine-workspace/shared-mobile-ui';
import type {
  DriverRunDetailDto,
  DriverStopDto,
  LatLng,
} from '@limousine-workspace/shared-types';
import {
  estimateEtaMinutes,
  googleMapsDirectionsUrl,
  googleMapsPlaceUrl,
  roadDistanceKm,
} from '@limousine-workspace/utils-map';
import {
  deliverCargo,
  dropoffBooking,
  fetchRunDetail,
  finishRun,
  markNoShowBooking,
  pickupBooking,
  pickupCargo,
} from '../api/client';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import type { TripsStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<TripsStackParamList, 'ActiveNav'>;

const MAP = require('../../assets/images/osm-tile-nav.png');

function isStopActionable(stop: DriverStopDto): boolean {
  if (stop.ref_type === 'BOOKING') {
    if (stop.kind === 'PICKUP') return stop.status === 'CONFIRMED';
    if (stop.kind === 'DROPOFF') return stop.status === 'PICKED_UP';
  }
  if (stop.ref_type === 'CARGO') {
    if (stop.kind === 'PICKUP') return stop.status === 'CREATED';
    if (stop.kind === 'DROPOFF')
      return stop.status === 'PICKED_UP' || stop.status === 'IN_TRANSIT';
  }
  return false;
}

/** mbDrvNavPickup — map + sheet đón/trả khách thực tế */
export function ActiveNavigationScreen({ navigation, route }: Props) {
  const { token } = useAuth();
  const { runId } = route.params;
  const [detail, setDetail] = useState<DriverRunDetailDto | null>(null);
  const [driverLoc, setDriverLoc] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchRunDetail(token, runId);
      setDetail(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Lỗi tải lộ trình');
    } finally {
      setLoading(false);
    }
  }, [token, runId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void (async () => {
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          setDriverLoc({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const nextStop = useMemo(() => {
    return detail?.stops.find(isStopActionable) ?? null;
  }, [detail]);

  const etaInfo = useMemo(() => {
    if (!nextStop) return null;
    const origin = driverLoc ?? detail?.stops[0]?.location;
    if (!origin) return null;
    const dist = roadDistanceKm(origin, nextStop.location);
    const min = estimateEtaMinutes(dist, 32);
    return { distKm: dist.toFixed(1), min };
  }, [nextStop, driverLoc, detail]);

  const onOpenDirections = () => {
    if (!nextStop) return;
    const url = driverLoc
      ? googleMapsDirectionsUrl(driverLoc, nextStop.location)
      : googleMapsPlaceUrl(nextStop.location);
    void Linking.openURL(url);
  };

  const onCallStop = () => {
    if (!nextStop?.phone) return;
    void Linking.openURL(`tel:${nextStop.phone}`);
  };

  const onConfirmStop = async () => {
    if (!token || !nextStop) return;
    setActing(true);
    setErr(null);
    try {
      if (nextStop.ref_type === 'BOOKING') {
        if (nextStop.kind === 'PICKUP') {
          await pickupBooking(token, nextStop.ref_id);
        } else {
          await dropoffBooking(token, nextStop.ref_id);
        }
      } else {
        if (nextStop.kind === 'PICKUP') {
          await pickupCargo(token, nextStop.ref_id);
        } else {
          await deliverCargo(token, nextStop.ref_id, {
            cod_collected: (nextStop.cod_amount_vnd ?? 0) > 0,
          });
        }
      }
      await load();
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : 'Không cập nhật được trạng thái điểm dừng',
      );
    } finally {
      setActing(false);
    }
  };

  const onNoShow = async () => {
    if (!token || !nextStop || nextStop.ref_type !== 'BOOKING') return;
    setActing(true);
    setErr(null);
    try {
      await markNoShowBooking(
        token,
        nextStop.ref_id,
        'Không liên hệ được khách tại điểm đón',
      );
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không đánh dấu được vắng mặt');
    } finally {
      setActing(false);
    }
  };

  const onFinishRun = async () => {
    if (!token) return;
    setActing(true);
    setErr(null);
    try {
      await finishRun(token, runId);
      navigation.goBack();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không kết thúc được chuyến');
    } finally {
      setActing(false);
    }
  };

  return (
    <ScreenShell edges={['left', 'right']} noInnerPadding style={styles.shell}>
      <View style={styles.mapBlock}>
        <ImageBackground source={MAP} style={styles.mapImg} resizeMode="cover">
          <View style={styles.tint} />
          <View style={styles.topBar}>
            <View>
              <Text style={styles.topTitle}>
                {detail?.trip?.route?.name ?? 'Đang dẫn đường'}
              </Text>
              <Text style={styles.topSub}>
                {etaInfo
                  ? `ETA ~ ${etaInfo.min} phút (${etaInfo.distKm} km)`
                  : detail?.status === 'FINISHED'
                    ? 'Chuyến đã hoàn thành'
                    : 'Đang định vị GPS…'}
              </Text>
            </View>
            <Pressable
              style={styles.sosChip}
              onPress={() => navigation.navigate('Sos', { runId })}
            >
              <Text style={styles.sosChipTxt}>SOS</Text>
            </Pressable>
          </View>
          <Svg width="100%" height={200} style={styles.svg}>
            <Path
              d="M 40 180 Q 120 40 280 100 T 340 20"
              stroke={C.ctaBlue}
              strokeWidth={10}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <View style={styles.carDot} />
        </ImageBackground>
      </View>

      <View style={styles.sheet}>
        <View style={styles.grab} />
        {loading ? <ActivityIndicator color={C.gold} /> : null}
        {err ? <Text style={styles.err}>{err}</Text> : null}

        {nextStop ? (
          <>
            <Text style={styles.lbl}>
              {nextStop.kind === 'PICKUP'
                ? 'ĐIỂM ĐÓN TIẾP THEO'
                : 'ĐIỂM TRẢ TIẾP THEO'}{' '}
              ·{' '}
              {nextStop.ref_type === 'CARGO'
                ? 'KIỆN HÀNG'
                : `GHẾ ${nextStop.seats.join(', ')}`}
            </Text>
            <Text style={styles.name}>{nextStop.name}</Text>
            <Text style={styles.addr}>{nextStop.address}</Text>

            <View style={styles.actionRow}>
              <Pressable
                style={[styles.dirBtn, { flex: 1 }]}
                onPress={onOpenDirections}
              >
                <Text style={styles.dirTxt}>Mở chỉ đường</Text>
              </Pressable>
              <Pressable style={styles.callBtn} onPress={onCallStop}>
                <Text style={styles.callTxt}>Gọi {nextStop.phone}</Text>
              </Pressable>
            </View>

            <SwipeToConfirm
              label={
                nextStop.kind === 'PICKUP'
                  ? 'Vuốt để xác nhận ĐÃ ĐÓN'
                  : 'Vuốt để xác nhận ĐÃ TRẢ'
              }
              onConfirm={() => void onConfirmStop()}
              disabled={acting}
            />

            {nextStop.ref_type === 'BOOKING' && nextStop.kind === 'PICKUP' ? (
              <Pressable
                style={styles.noContact}
                onPress={() => void onNoShow()}
                disabled={acting}
              >
                <Text style={styles.noContactTxt}>
                  Không liên hệ được khách (Đánh dấu No-show)
                </Text>
              </Pressable>
            ) : null}
          </>
        ) : !loading ? (
          <View style={{ gap: 12, paddingVertical: 12 }}>
            <Text style={styles.name}>Đã hoàn thành tất cả điểm dừng</Text>
            <Text style={styles.addr}>
              Mọi hành khách và kiện hàng trên chuyến đã được xử lý xong.
            </Text>
            {detail?.status !== 'FINISHED' ? (
              <Pressable
                style={styles.dirBtn}
                onPress={() => void onFinishRun()}
                disabled={acting}
              >
                <Text style={styles.dirTxt}>
                  {acting ? 'Đang kết thúc…' : 'Hoàn tất chuyến xe'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, paddingHorizontal: 0 },
  mapBlock: { height: 290 },
  mapImg: { flex: 1, width: '100%' },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.mapTint,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: C.mapTopBar,
  },
  topTitle: { fontFamily: FONT.semibold, color: C.text, fontSize: 15 },
  topSub: { fontFamily: FONT.regular, color: C.muted, fontSize: 12 },
  sosChip: {
    backgroundColor: C.sosRed,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.sosStroke,
  },
  sosChipTxt: { fontFamily: FONT.bold, color: C.white, fontSize: 12 },
  svg: { position: 'absolute', left: 0, right: 0, bottom: 40 },
  carDot: {
    position: 'absolute',
    bottom: 44,
    left: 32,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.white,
    borderWidth: 4,
    borderColor: C.ctaBlue,
  },
  sheet: {
    flex: 1,
    backgroundColor: C.sheetBg,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: C.slate800,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 10,
  },
  grab: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.stroke,
    marginBottom: 4,
  },
  err: { fontFamily: FONT.regular, fontSize: 12, color: C.error },
  lbl: {
    fontFamily: FONT.semibold,
    fontSize: 11,
    letterSpacing: 1.1,
    color: C.gold,
  },
  name: { fontFamily: FONT.bold, fontSize: 22, color: C.text },
  addr: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: C.slate200,
    lineHeight: 21,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  dirBtn: {
    backgroundColor: C.ctaBlue,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  dirTxt: { fontFamily: FONT.semibold, color: C.white, fontSize: 15 },
  callBtn: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.stroke,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callTxt: { fontFamily: FONT.semibold, color: C.gold, fontSize: 14 },
  noContact: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: C.noContactBg,
    borderWidth: 1,
    borderColor: C.noContactStroke,
  },
  noContactTxt: {
    color: C.noContactText,
    fontFamily: FONT.regular,
    fontSize: 13,
  },
});
