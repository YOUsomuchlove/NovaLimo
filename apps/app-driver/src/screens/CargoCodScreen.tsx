import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import type { CargoTabStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<CargoTabStackParamList, 'CargoCod'>;

/** mbDrvCargoCod */
export function CargoCodScreen(_props: Props) {
  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <Text style={styles.title}>COD & bàn giao tiền</Text>
      <ScrollView>
        <ListCard title="Đơn #1001" subtitle="Thu COD 350.000đ · Momo">
          <Text style={styles.small}>Trạng thái: chờ xác nhận</Text>
        </ListCard>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  title: { fontFamily: FONT.bold, fontSize: 18, color: C.text, marginBottom: 12 },
  small: { fontFamily: FONT.regular, fontSize: 12, color: C.muted },
});
