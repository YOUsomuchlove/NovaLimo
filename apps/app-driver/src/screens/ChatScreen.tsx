import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { io } from 'socket.io-client';
import type { ChatMessageDto } from '@limousine-workspace/shared-types';
import { RealtimeEvents } from '@limousine-workspace/utils-core';
import { fetchDriverChat, getApiBaseUrl, sendDriverChat } from '../api/client';
import { MiniChatShiftPreview } from '../components/MiniChatShiftPreview';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import { C, FONT } from '../theme/tokens';

/** mbDrvChat — chat trực tuyến với tổng đài điều hành qua REST + Socket.io */
export function ChatScreen() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const list = await fetchDriverChat(token);
      setMessages(list);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không tải được hội thoại');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!token) return;
    const baseOrigin = getApiBaseUrl().replace(/\/api$/, '');
    const socket = io(`${baseOrigin}/realtime`, {
      auth: { token },
      transports: ['websocket'],
    });
    socket.on(RealtimeEvents.chatMessage, (msg: ChatMessageDto) => {
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
      );
    });
    return () => {
      socket.disconnect();
    };
  }, [token]);

  const onSend = async () => {
    const clean = text.trim();
    if (!clean || !token || sending) return;
    setSending(true);
    setErr(null);
    try {
      const created = await sendDriverChat(token, clean);
      setText('');
      setMessages((prev) =>
        prev.some((m) => m.id === created.id) ? prev : [...prev, created],
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gửi tin nhắn thất bại');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenShell style={styles.shell}>
      <Text style={styles.hdr}>Điều hành NovaLimo</Text>
      <MiniChatShiftPreview />

      {loading ? (
        <ActivityIndicator color={C.gold} style={{ marginTop: 8 }} />
      ) : null}
      {err ? <Text style={styles.err}>{err}</Text> : null}

      <FlatList
        style={styles.list}
        data={messages}
        keyExtractor={(i) => i.id}
        refreshing={loading}
        onRefresh={() => void load()}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>
              Chưa có tin nhắn. Hãy nhắn cho điều hành nếu cần hỗ trợ trên
              tuyến.
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const isMe = item.sender_role === 'DRIVER';
          const timeStr = new Date(item.created_at).toLocaleTimeString(
            'vi-VN',
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          );
          return (
            <View style={[styles.bubble, isMe && styles.bubbleMe]}>
              <Text style={styles.who}>
                {isMe ? 'Bạn' : item.sender_name || 'Điều hành'}
              </Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.at}>{timeStr}</Text>
            </View>
          );
        }}
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn gửi điều hành…"
          placeholderTextColor={C.muted}
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => void onSend()}
        />
        <Pressable
          style={[styles.send, sending && { opacity: 0.6 }]}
          disabled={sending}
          onPress={() => void onSend()}
        >
          <Text style={styles.sendTxt}>Gửi</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  hdr: { fontFamily: FONT.bold, fontSize: 17, color: C.text, marginBottom: 4 },
  err: { fontFamily: FONT.regular, fontSize: 12, color: C.error, marginTop: 6 },
  empty: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.muted,
    marginTop: 16,
  },
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
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: C.slate900 },
  who: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    color: C.gold,
    marginBottom: 4,
  },
  body: { fontFamily: FONT.regular, fontSize: 15, color: C.text },
  at: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
    textAlign: 'right',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: C.stroke,
    minHeight: 76,
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
