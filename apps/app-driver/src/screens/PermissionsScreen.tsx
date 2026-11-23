import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { registerDriverPushToken } from '../api/client';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { C, FONT, RADIUS } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Permissions'>;

/** mbDrvPermOverlay + mbDrvPermDialog — xin quyền Location, Notifications & Camera thực tế */
export function PermissionsScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [loc, setLoc] = useState(true);
  const [notif, setNotif] = useState(true);
  const [cam, setCam] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const onContinue = async () => {
    setRequesting(true);
    try {
      if (loc) {
        await Location.requestForegroundPermissionsAsync();
      }
      if (cam) {
        await Camera.requestCameraPermissionsAsync();
      }
      if (notif) {
        const perm = await Notifications.requestPermissionsAsync();
        if (perm.status === 'granted' && token && Platform.OS !== 'web') {
          try {
            const pushTok = await Notifications.getDevicePushTokenAsync();
            if (pushTok?.data) {
              await registerDriverPushToken(
                token,
                String(pushTok.data),
                Platform.OS === 'ios' ? 'ios' : 'android',
              );
            }
          } catch {
            /* ignore on simulator without push entitlement */
          }
        }
      }
    } catch {
      /* continue even if OS dialog dismissed */
    } finally {
      setRequesting(false);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  return (
    <View style={styles.scrim}>
      <ScreenShell
        style={styles.shell}
        edges={['top', 'left', 'right', 'bottom']}
        noInnerPadding
      >
        <View style={styles.dialog}>
          <Text style={styles.title}>Cho phép NovaLimo</Text>
          <Text style={styles.lead}>
            Để điều hành chuyến, gửi tọa độ GPS và quét mã vận đơn, ứng dụng cần
            các quyền sau:
          </Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Định vị GPS khi đang chạy ca</Text>
            <Switch
              value={loc}
              onValueChange={setLoc}
              trackColor={{ true: C.goldDim }}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Thông báo đẩy lệnh điều hành</Text>
            <Switch
              value={notif}
              onValueChange={setNotif}
              trackColor={{ true: C.goldDim }}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>
              Camera quét QR vận đơn & chụp POD
            </Text>
            <Switch
              value={cam}
              onValueChange={setCam}
              trackColor={{ true: C.goldDim }}
            />
          </View>

          <Pressable
            style={styles.cta}
            onPress={() => void onContinue()}
            disabled={requesting}
          >
            {requesting ? (
              <ActivityIndicator color={C.bg} />
            ) : (
              <Text style={styles.ctaTxt}>Cấp quyền & Tiếp tục</Text>
            )}
          </Pressable>
          <Text style={styles.note}>
            Có thể chỉnh lại trong Cài đặt hệ thống.
          </Text>
        </View>
      </ScreenShell>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: C.permScrim,
  },
  shell: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  dialog: {
    backgroundColor: C.permDialogBg,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    shadowColor: C.black,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 36,
    elevation: 12,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: C.permDialogTitle,
  },
  lead: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.permDialogText,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLabel: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 15,
    color: C.permDialogTitle,
    marginRight: 12,
  },
  cta: {
    backgroundColor: C.gold,
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaTxt: { fontFamily: FONT.semibold, color: C.bg, fontSize: 16 },
  note: {
    fontSize: 11,
    color: C.permDialogMuted,
    fontFamily: FONT.regular,
    textAlign: 'center',
  },
});
