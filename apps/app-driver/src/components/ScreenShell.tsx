import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { C } from '../theme/tokens';

type Props = ViewProps & {
  /** Khi true: chỉ padding ngang (stack đã có header). */
  underStackHeader?: boolean;
  edges?: Edge[];
  /** Map full-bleed — bỏ padding ngang */
  noInnerPadding?: boolean;
};

export function ScreenShell({
  style,
  children,
  underStackHeader,
  edges,
  noInnerPadding,
  ...rest
}: Props) {
  const e = edges ?? (underStackHeader ? ['left', 'right', 'bottom'] : ['top', 'left', 'right', 'bottom']);
  return (
    <SafeAreaView style={[styles.safe, underStackHeader && styles.underHeader, style]} edges={e} {...rest}>
      <View style={[styles.inner, noInnerPadding && styles.innerFlush]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  underHeader: {
    paddingTop: 0,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
  },
  innerFlush: {
    paddingHorizontal: 0,
  },
});
