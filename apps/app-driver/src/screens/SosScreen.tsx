import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import type { TripsStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<TripsStackParamList, 'Sos'>;

const LEVELS = ['Nhẹ — trễ giờ', 'Trung bình — hỏng xe', 'Nặng — an toàn'];

/** mbDrvIncident */
export function SosScreen(_props: Props) {
  const [sel, setSel] = useState(0);

  return (
    <ScreenShell style={styles.shell}>
      <Text style={styles.title}>Báo sự cố / SOS</Text>
      <Text style={styles.body}>Chọn mức độ. Mức khẩn cấp sẽ gọi điều hành + 113.</Text>
      <ScrollView style={styles.list}>
        {LEVELS.map((l, i) => (
          <Pressable
            key={l}
            onPress={() => setSel(i)}
            style={[styles.level, sel === i && styles.levelOn]}
          >
            <Text style={[styles.levelTxt, sel === i && styles.levelTxtOn]}>{l}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable style={styles.sos} onPress={() => void Linking.openURL('tel:113')}>
        <Text style={styles.sosTxt}>SOS — Gọi khẩn cấp</Text>
      </Pressable>
      <Pressable style={styles.send} onPress={() => undefined}>
        <Text style={styles.sendTxt}>Gửi báo cáo cho điều hành</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  title: {
    fontSize: 20,
    fontFamily: FONT.bold,
    color: C.text,
    marginBottom: 6,
  },
  body: { color: C.muted, fontFamily: FONT.regular, marginBottom: 12, lineHeight: 20 },
  list: { flex: 1, marginBottom: 12 },
  level: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.stroke,
    backgroundColor: C.card,
    marginBottom: 10,
  },
  levelOn: { borderColor: C.gold, backgroundColor: C.tabActive },
  levelTxt: { fontFamily: FONT.regular, color: C.text, fontSize: 15 },
  levelTxtOn: { fontFamily: FONT.semibold, color: C.gold },
  sos: {
    backgroundColor: C.sosRed,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: C.sosStroke,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  sosTxt: { fontFamily: FONT.bold, color: '#fff', fontSize: 17 },
  send: {
    backgroundColor: C.success,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendTxt: { fontFamily: FONT.semibold, color: '#fff', fontSize: 15 },
});
