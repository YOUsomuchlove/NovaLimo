import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import type { TripsStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<TripsStackParamList, 'Income'>;

/** mbDrvEarn */
export function IncomeScreen(_props: Props) {
  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <Text style={styles.title}>Thu nhập & đối soát</Text>
      <ScrollView>
        <ListCard title="Ca 04/04" subtitle="Doanh thu gộp">
          <Text style={styles.amt}>12.400.000đ</Text>
        </ListCard>
        <ListCard title="Tiền mặt cần nộp" subtitle="COD đã thu">
          <Text style={styles.amt}>2.100.000đ</Text>
        </ListCard>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  title: { fontFamily: FONT.bold, fontSize: 20, color: C.text, marginBottom: 12 },
  amt: { fontFamily: FONT.bold, fontSize: 18, color: C.gold, marginTop: 4 },
});
