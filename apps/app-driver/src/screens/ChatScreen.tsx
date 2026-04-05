import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MiniChatShiftPreview } from '../components/MiniChatShiftPreview';
import { ScreenShell } from '../components/ScreenShell';
import type { MainTabParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = BottomTabScreenProps<MainTabParamList, 'Chat'>;

const MOCK = [
  { id: '1', who: 'Điều hành', body: 'Khách Nguyễn A đổi điểm đón.', at: '10:02' },
  { id: '2', who: 'Bạn', body: 'Đã nhận, đang tới.', at: '10:04' },
];

/** mbDrvChat */
export function ChatScreen(_props: Props) {
  const [text, setText] = useState('');

  return (
    <ScreenShell style={styles.shell}>
      <Text style={styles.hdr}>Điều hành NovaLimo</Text>
      <MiniChatShiftPreview />
      <FlatList
        style={styles.list}
        data={MOCK}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.who === 'Bạn' && styles.bubbleMe]}>
            <Text style={styles.who}>{item.who}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.at}>{item.at}</Text>
          </View>
        )}
      />
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin…"
          placeholderTextColor={C.muted}
          value={text}
          onChangeText={setText}
        />
        <Pressable style={styles.send}>
          <Text style={styles.sendTxt}>Gửi</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  hdr: { fontFamily: FONT.bold, fontSize: 17, color: C.text, marginBottom: 4 },
  list: { flex: 1, marginTop: 8 },
  bubble: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.stroke,
    padding: 10,
    marginBottom: 10,
  },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: '#0f172a' },
  who: { fontFamily: FONT.semibold, fontSize: 12, color: C.gold, marginBottom: 4 },
  body: { fontFamily: FONT.regular, fontSize: 15, color: C.text },
  at: { fontFamily: FONT.regular, fontSize: 11, color: C.muted, marginTop: 4, textAlign: 'right' },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: C.stroke,
    minHeight: 92,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: C.text,
    fontFamily: FONT.regular,
    backgroundColor: C.card,
  },
  send: {
    backgroundColor: C.gold,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendTxt: { fontFamily: FONT.semibold, color: C.bg },
});
