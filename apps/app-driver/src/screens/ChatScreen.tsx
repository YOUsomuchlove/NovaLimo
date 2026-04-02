import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { postDriverChat } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen(_props: Props) {
  const { token } = useAuth();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const send = async () => {
    if (!token || !message.trim()) return;
    setStatus(null);
    try {
      await postDriverChat(token, message.trim());
      setMessage('');
      setStatus('Đã gửi (Socket.io → điều hành).');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Lỗi');
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Liên lạc điều hành</Text>
      <Text style={styles.hint}>
        Tin nhắn broadcast qua namespace /realtime (MVP). Web Admin có thể
        subscribe sự kiện driver_chat.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nội dung"
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <Button title="Gửi" onPress={() => void send()} />
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  hint: { color: '#666', marginBottom: 12, fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  status: { marginTop: 12, color: '#1677ff' },
});
