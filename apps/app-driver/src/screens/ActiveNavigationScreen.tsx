import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ScreenShell } from '../components/ScreenShell';
import type { TripsStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<TripsStackParamList, 'ActiveNav'>;

const MAP = require('../../assets/images/osm-tile-nav.png');

/** mbDrvNavPickup — map + sheet đón */
export function ActiveNavigationScreen({ navigation: _nav }: Props) {
  return (
    <ScreenShell edges={['left', 'right']} noInnerPadding style={styles.shell}>
      <View style={styles.mapBlock}>
        <ImageBackground source={MAP} style={styles.mapImg} resizeMode="cover">
          <View style={styles.tint} />
          <View style={styles.topBar}>
            <Text style={styles.topTitle}>Đang lái</Text>
            <Text style={styles.topSub}>ETA ~ 12 phút</Text>
          </View>
          <View style={styles.searchFake}>
            <Text style={styles.searchTxt}>Tìm điểm đón…</Text>
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
          <View style={styles.pulse} />
          <View style={styles.carDot} />
        </ImageBackground>
      </View>

      <View style={styles.sheet}>
        <View style={styles.grab} />
        <Text style={styles.lbl}>ĐÓN TIẾP THEO</Text>
        <Text style={styles.name}>Trần Thị Mai</Text>
        <Text style={styles.addr}>
          Đón: Ngõ 7 phố Huế, Hàng Bài, Hoàn Kiếm, HN — cổng nhà 12 (biển NovaLimo)
        </Text>
        <Pressable style={styles.dirBtn}>
          <Text style={styles.dirTxt}>Mở chỉ đường</Text>
        </Pressable>
        <View style={styles.swipe}>
          <Text style={styles.swipeTxt}>Vuốt để xác nhận đã đón</Text>
        </View>
        <Pressable style={styles.noContact}>
          <Text style={styles.noContactTxt}>Không liên hệ được khách</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, paddingHorizontal: 0 },
  mapBlock: { height: 320 },
  mapImg: { flex: 1, width: '100%' },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B1220',
    opacity: 0.35,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: C.mapTopBar,
  },
  topTitle: { fontFamily: FONT.semibold, color: C.text, fontSize: 15 },
  topSub: { fontFamily: FONT.regular, color: C.muted, fontSize: 12 },
  searchFake: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  searchTxt: { color: '#64748b', fontFamily: FONT.regular, fontSize: 14 },
  svg: { position: 'absolute', left: 0, right: 0, bottom: 40 },
  pulse: {
    position: 'absolute',
    bottom: 36,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(37,99,235,0.2)',
  },
  carDot: {
    position: 'absolute',
    bottom: 44,
    left: 32,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: C.ctaBlue,
  },
  sheet: {
    flex: 1,
    backgroundColor: C.sheetBg,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 8,
  },
  grab: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.stroke,
    marginBottom: 4,
  },
  lbl: {
    fontFamily: FONT.regular,
    fontSize: 11,
    letterSpacing: 1.2,
    color: C.muted,
  },
  name: { fontFamily: FONT.regular, fontSize: 26, color: C.text },
  addr: { fontFamily: FONT.regular, fontSize: 17, color: '#E2E8F0', lineHeight: 22 },
  dirBtn: {
    backgroundColor: C.ctaBlue,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  dirTxt: { fontFamily: FONT.semibold, color: '#fff', fontSize: 16 },
  swipe: {
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: C.swipeTrack,
    borderWidth: 2,
    borderColor: C.swipeStroke,
    alignItems: 'center',
  },
  swipeTxt: { color: C.success, fontFamily: FONT.semibold, fontSize: 14 },
  noContact: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: C.noContactBg,
    borderWidth: 1,
    borderColor: C.noContactStroke,
  },
  noContactTxt: { color: '#fecaca', fontFamily: FONT.regular, fontSize: 13 },
});
