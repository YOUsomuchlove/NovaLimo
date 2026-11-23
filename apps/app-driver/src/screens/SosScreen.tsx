import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { IncidentKind } from '@limousine-workspace/shared-types';
import { reportDriverIncident } from '../api/client';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import type { TripsStackParamList } from '../navigation/types';
import { C, FONT, RADIUS } from '../theme/tokens';

type Props = NativeStackScreenProps<TripsStackParamList, 'Sos'>;

const LEVELS: { kind: IncidentKind; label: string; defaultDesc: string }[] = [
  {
    kind: 'OTHER',
    label: 'Ùn tắc / Trễ giờ lộ trình',
    defaultDesc: 'Tắc đường nghiêm trọng trên tuyến, dự kiến trễ giờ đón/trả.',
  },
  {
    kind: 'BREAKDOWN',
    label: 'Sự cố kỹ thuật / Hỏng xe',
    defaultDesc:
      'Xe gặp sự cố kỹ thuật trên đường, cần hỗ trợ kỹ thuật hoặc điều xe thay thế.',
  },
  {
    kind: 'ACCIDENT',
    label: 'Va chạm giao thông',
    defaultDesc:
      'Xảy ra va chạm giao thông trên hành trình, cần điều hành hỗ trợ xử lý.',
  },
  {
    kind: 'SECURITY',
    label: 'SOS Khẩn cấp — An toàn & An ninh',
    defaultDesc: 'Tình huống khẩn cấp cần hỗ trợ ngay lập tức!',
  },
  {
    kind: 'MEDICAL',
    label: 'Cấp cứu y tế hành khách',
    defaultDesc: 'Hành khách trên xe gặp vấn đề sức khỏe khẩn cấp.',
  },
];

/** mbDrvIncident — gửi cảnh báo SOS / sự cố kèm tọa độ GPS về trung tâm điều hành */
export function SosScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [sel, setSel] = useState(0);
  const [desc, setDesc] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sentOk, setSentOk] = useState(false);

  const onSendReport = async () => {
    if (!token || sending) return;
    setSending(true);
    setErr(null);
    setSentOk(false);
    try {
      let location: { lat: number; lng: number } | undefined;
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        }
      } catch {
        /* ignore */
      }
      const chosen = LEVELS[sel];
      await reportDriverIncident(token, {
        kind: chosen.kind,
        description: desc.trim() || chosen.defaultDesc,
        location,
      });
      setSentOk(true);
      setDesc('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không gửi được báo cáo sự cố');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <Text style={styles.title}>Báo sự cố / SOS khẩn cấp</Text>
      <Text style={styles.body}>
        Chọn phân loại sự cố. Báo cáo sẽ phát tín hiệu khẩn cấp trực tiếp lên
        màn hình Giám sát GPS của Điều hành.
      </Text>

      <ScrollView style={styles.list}>
        {LEVELS.map((l, i) => (
          <Pressable
            key={l.kind}
            onPress={() => setSel(i)}
            style={[styles.level, sel === i && styles.levelOn]}
          >
            <Text style={[styles.levelTxt, sel === i && styles.levelTxtOn]}>
              {l.label}
            </Text>
          </Pressable>
        ))}

        <View style={{ marginTop: 6 }}>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            placeholder="Mô tả chi tiết tình huống, vị trí…"
            placeholderTextColor={C.muted}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        </View>

        {err ? <Text style={styles.err}>{err}</Text> : null}
        {sentOk ? (
          <Text style={styles.ok}>
            Đã phát cảnh báo sự cố tới trung tâm điều hành!
          </Text>
        ) : null}
      </ScrollView>

      <Pressable
        style={styles.sos}
        onPress={() => void Linking.openURL('tel:113')}
      >
        <Text style={styles.sosTxt}>SOS — Gọi khẩn cấp 113</Text>
      </Pressable>

      <Pressable
        style={[styles.send, sending && { opacity: 0.7 }]}
        disabled={sending}
        onPress={() => void onSendReport()}
      >
        {sending ? (
          <ActivityIndicator color={C.white} />
        ) : (
          <Text style={styles.sendTxt}>Gửi báo cáo cho điều hành</Text>
        )}
      </Pressable>

      {sentOk ? (
        <Pressable
          style={{ marginTop: 8, alignItems: 'center' }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: C.gold, fontFamily: FONT.semibold }}>
            Quay lại
          </Text>
        </Pressable>
      ) : null}
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
  body: {
    color: C.muted,
    fontFamily: FONT.regular,
    marginBottom: 12,
    lineHeight: 20,
  },
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
  input: {
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontFamily: FONT.regular,
    backgroundColor: C.card,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  err: { fontFamily: FONT.regular, color: C.error, marginTop: 8 },
  ok: { fontFamily: FONT.semibold, color: C.success, marginTop: 8 },
  sos: {
    backgroundColor: C.sosRed,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: C.sosStroke,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  sosTxt: { fontFamily: FONT.bold, color: C.white, fontSize: 17 },
  send: {
    backgroundColor: C.success,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendTxt: { fontFamily: FONT.semibold, color: C.white, fontSize: 15 },
});
