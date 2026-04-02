import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Permissions'>;

export function PermissionsScreen({ navigation }: Props) {
  const [note, setNote] = useState<string | null>(null);

  const requestAll = async () => {
    setNote(null);
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch {
      setNote((n) => (n ?? '') + 'Vị trí: lỗi xin quyền. ');
    }
    try {
      await Notifications.requestPermissionsAsync();
    } catch {
      setNote((n) => (n ?? '') + 'Thông báo: lỗi xin quyền. ');
    }
    navigation.replace('Home');
  };

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Quyền truy cập</Text>
      <Text style={styles.text}>
        Ứng dụng cần vị trí và thông báo để điều hành theo đặc tả (GPS + chấm
        công).
      </Text>
      {note ? <Text style={styles.warn}>{note}</Text> : null}
      <Button title="Cho phép và tiếp tục" onPress={() => void requestAll()} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  text: { marginBottom: 16, color: '#444' },
  warn: { color: '#ad6800', marginBottom: 12 },
});
