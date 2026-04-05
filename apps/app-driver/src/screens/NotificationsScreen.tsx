import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import type { TripsStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<TripsStackParamList, 'Notifications'>;

const MOCK = [
  { id: '1', t: 'Lệnh mới', d: 'Thêm 1 khách cho chuyến NB-08:30', time: '09:12' },
  { id: '2', t: 'Nhắc COD', d: 'Thu 350k tại điểm trả Mai', time: 'Hôm qua' },
];

/** mbDrvNotif */
export function NotificationsScreen(_props: Props) {
  return (
    <ScreenShell style={styles.shell}>
      <Text style={styles.title}>Thông báo</Text>
      <FlatList
        data={MOCK}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text style={styles.muted}>Chưa có thông báo.</Text>}
        renderItem={({ item }) => (
          <ListCard title={item.t} subtitle={item.d}>
            <Text style={styles.time}>{item.time}</Text>
          </ListCard>
        )}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  title: {
    fontSize: 20,
    fontFamily: FONT.bold,
    color: C.text,
    marginBottom: 12,
  },
  muted: { color: C.muted, fontFamily: FONT.regular },
  time: { fontSize: 11, color: C.muted, fontFamily: FONT.regular, marginTop: 4 },
});
