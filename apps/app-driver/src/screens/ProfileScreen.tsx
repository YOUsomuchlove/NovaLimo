import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import type { TripsStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<TripsStackParamList, 'Profile'>;

/** mbDrvProfile */
export function ProfileScreen(_props: Props) {
  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <Text style={styles.title}>Hồ sơ tài xế</Text>
      <ScrollView>
        <ListCard title="Nguyễn Văn Tài" subtitle="090x · GPLX hạng D">
          <Text style={styles.muted}>Xe gán: 29A-12345</Text>
        </ListCard>
        <Pressable>
          <ListCard title="Đổi mật khẩu" subtitle="Bảo mật tài khoản" />
        </Pressable>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  title: { fontFamily: FONT.bold, fontSize: 20, color: C.text, marginBottom: 12 },
  muted: { fontFamily: FONT.regular, fontSize: 13, color: C.muted, marginTop: 4 },
});
