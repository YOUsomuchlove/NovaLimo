import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { endShift } from '../api/client';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import type { MainTabParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = BottomTabScreenProps<MainTabParamList, 'Shift'>;

/** mbDrvShiftEnd */
export function EndShiftScreen(_props: Props) {
  const { token } = useAuth();
  const [k1, setK1] = useState(true);
  const [k2, setK2] = useState(false);
  const [loading, setLoading] = useState(false);

  const onEnd = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await endShift(token);
    } catch {
      /* toast */
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell style={styles.shell}>
      <Text style={styles.title}>Kết thúc ca</Text>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Ca sáng · 06:30 – nay</Text>
        <Text style={styles.heroSub}>3 chuyến · 120 km</Text>
      </View>
      <Text style={styles.checkTitle}>Checklist trước khi off</Text>
      <View style={styles.check}>
        <View style={styles.row}>
          <Text style={styles.rowTxt}>Đã giao hết hàng COD</Text>
          <Switch value={k1} onValueChange={setK1} trackColor={{ true: C.goldDim }} />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowTxt}>Xe đã kiểm tra</Text>
          <Switch value={k2} onValueChange={setK2} trackColor={{ true: C.goldDim }} />
        </View>
      </View>
      <Pressable style={[styles.endBtn, loading && { opacity: 0.7 }]} onPress={() => void onEnd()}>
        <Text style={styles.endTxt}>Kết thúc ca & báo cáo</Text>
      </Pressable>
      <Text style={styles.note}>
        Sau khi kết thúc ca, bạn sẽ không thể cập nhật trạng thái chuyến/đơn hàng. Nếu cần chỉnh sửa,
        liên hệ điều hành.
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, gap: 12 },
  title: { fontFamily: FONT.bold, fontSize: 18, color: C.text },
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
  checkTitle: { fontFamily: FONT.semibold, color: '#E5E7EB', fontSize: 13, marginTop: 4 },
  check: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.stroke,
    padding: 16,
    gap: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTxt: { fontFamily: FONT.regular, color: C.text, flex: 1, marginRight: 12 },
  endBtn: {
    marginTop: 8,
    backgroundColor: C.shiftOrange,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: C.shiftOrangeStroke,
    paddingVertical: 18,
    alignItems: 'center',
  },
  endTxt: { fontFamily: FONT.bold, color: '#fff', fontSize: 16 },
  note: { fontFamily: FONT.regular, fontSize: 11, color: C.muted, lineHeight: 16 },
});
