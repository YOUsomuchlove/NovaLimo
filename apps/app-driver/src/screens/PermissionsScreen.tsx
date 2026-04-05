import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import type { RootStackParamList } from '../navigation/types';
import { C, FONT, RADIUS } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Permissions'>;

/** mbDrvPermOverlay + mbDrvPermDialog — nền scrim + card sáng */
export function PermissionsScreen({ navigation }: Props) {
  const [loc, setLoc] = useState(true);
  const [notif, setNotif] = useState(true);

  return (
    <View style={styles.scrim}>
      <ScreenShell style={styles.shell} edges={['top', 'left', 'right', 'bottom']} noInnerPadding>
        <View style={styles.dialog}>
          <Text style={styles.title}>Cho phép NovaLimo</Text>
          <Text style={styles.lead}>
            Để điều hành chuyến và nhận lệnh, ứng dụng cần các quyền sau.
          </Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Định vị khi đang chạy ca</Text>
            <Switch value={loc} onValueChange={setLoc} trackColor={{ true: C.goldDim }} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Thông báo đẩy</Text>
            <Switch value={notif} onValueChange={setNotif} trackColor={{ true: C.goldDim }} />
          </View>

          <Pressable
            style={styles.cta}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
          >
            <Text style={styles.ctaTxt}>Tiếp tục</Text>
          </Pressable>
          <Text style={styles.note}>Có thể chỉnh lại trong Cài đặt hệ thống.</Text>
        </View>
      </ScreenShell>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: C.permScrim,
  },
  shell: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  dialog: {
    backgroundColor: C.permDialogBg,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 36,
    elevation: 12,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: '#0f172a',
  },
  lead: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLabel: { flex: 1, fontFamily: FONT.regular, fontSize: 15, color: '#0f172a', marginRight: 12 },
  cta: {
    backgroundColor: C.gold,
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaTxt: { fontFamily: FONT.semibold, color: C.bg, fontSize: 16 },
  note: { fontSize: 11, color: '#64748b', fontFamily: FONT.regular, textAlign: 'center' },
});
