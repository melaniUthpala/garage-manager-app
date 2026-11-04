import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Animated,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { addDays, today } from './store';

export const C = {
  purple: '#36E6C0', blue: '#20D8E8', cyan: '#20D8E8', pink: '#35E89A',
  green: '#35E89A', amber: '#E8C46A', red: '#FF6B6B',
  turquoise: '#36E6C0', emerald: '#35E89A',
  text: '#ffffff', sub: '#AEB6C2', line: 'rgba(32,216,232,0.22)',
  charcoal: '#25272A', slate: '#30343E',
};
export const PRIO = { Low: C.sub, Medium: C.cyan, High: C.amber, Urgent: C.red };
export const STAT = { Received: C.sub, 'In Progress': C.cyan, Completed: C.green };

// ---- Custom SVG icons ----
const ICONS = {
  home: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  calendar: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 10h18M8 3v4M16 3v4',
  jobs: 'M7 4h10a2 2 0 0 1 2 2v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a2 2 0 0 1 2-2zM9 3h6v3H9zM9 11h6M9 15h6',
  stock: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
  settings: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2',
  plus: 'M12 5v14M5 12h14', minus: 'M5 12h14', close: 'M6 6l12 12M18 6L6 18',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  edit: 'M4 20h4L19 9l-4-4L4 16z', check: 'M5 13l4 4L19 7',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  bell: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
  alert: 'M12 3l10 18H2zM12 10v5M12 18v.5',
  left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7',
};
export const Icon = ({ name, size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d={ICONS[name]} />
  </Svg>
);

// ---- Glass card (translucent gradient + neon border glow) ----
export function Glass({ children, style, glow }) {
  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.11)', 'rgba(255,255,255,0.03)']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[g.card, glow && { borderColor: glow, shadowColor: glow, shadowOpacity: 0.8, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }, style]}
    >
      {children}
    </LinearGradient>
  );
}

export function Btn({ title, onPress, colors = [C.cyan, C.turquoise, C.emerald], small, style }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[g.btn, small && { paddingVertical: 8, paddingHorizontal: 14 }]}>
        <Text style={g.btnT}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function Chip({ label, active, color = C.cyan, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[g.chip, active && { backgroundColor: color + '33', borderColor: color }]}>
      <Text style={[g.chipT, active && { color: '#fff', fontWeight: '700' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export const Badge = ({ label, color }) => (
  <View style={[g.badge, { backgroundColor: color + '33', borderColor: color }]}>
    <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{label}</Text>
  </View>
);

export function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={g.label}>{label}</Text>
      <TextInput placeholderTextColor="rgba(255,255,255,0.35)" style={g.input} {...props} />
    </View>
  );
}

// Date text field + quick chips (Today, +1, +3, +7)
export function DateField({ label, value, onChange }) {
  return (
    <View>
      <Field label={label + ' (YYYY-MM-DD)'} value={value} onChangeText={onChange} autoCapitalize="none" />
      <View style={[g.row, { marginTop: -4, marginBottom: 10 }]}>
        {[['Today', 0], ['+1d', 1], ['+3d', 3], ['+7d', 7]].map(([l, n]) => (
          <Chip key={l} label={l} onPress={() => onChange(addDays(today(), n))} />
        ))}
      </View>
    </View>
  );
}

export function Stepper({ value, onChange }) {
  return (
    <View style={[g.row, { alignItems: 'center', justifyContent: 'center', marginVertical: 12 }]}>
      <TouchableOpacity style={g.step} onPress={() => onChange(Math.max(1, value - 1))}><Icon name="minus" /></TouchableOpacity>
      <Text style={g.stepN}>{value}</Text>
      <TouchableOpacity style={g.step} onPress={() => onChange(value + 1)}><Icon name="plus" /></TouchableOpacity>
    </View>
  );
}

export function Sheet({ visible, onClose, title, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={g.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={g.sheet}>
          <View style={[g.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
            <Text style={g.sheetT}>{title}</Text>
            <TouchableOpacity onPress={onClose}><Icon name="close" color={C.sub} /></TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 30 }}>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function CountUp({ value, style }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const a = new Animated.Value(0);
    const id = a.addListener(({ value: v }) => setN(Math.round(v)));
    Animated.timing(a, { toValue: value, duration: 900, useNativeDriver: false }).start();
    return () => a.removeListener(id);
  }, [value]);
  return <Text style={style}>{n}</Text>;
}

// Screen wrapper: gradient background, neon glows, slide/fade-in on every focus
export function Screen({ title, sub, right, bare, children }) {
  const a = useRef(new Animated.Value(0)).current;
  useFocusEffect(useCallback(() => {
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 380, useNativeDriver: true }).start();
  }, [a]));
  return (
    <LinearGradient colors={['#1c1e21', '#25272A', '#2d323b']} style={{ flex: 1 }}>
      <View style={[g.glow, { top: -70, left: -70, backgroundColor: C.purple }]} />
      <View style={[g.glow, { bottom: 140, right: -90, backgroundColor: C.cyan }]} />
      <Animated.View style={{ flex: 1, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }}>
        <ScrollView contentContainerStyle={g.pad} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {bare ? null : (
            <View style={[g.row, { alignItems: 'center', marginBottom: 16 }]}>
              <View style={{ flex: 1 }}>
                <Text style={g.title}>{title}</Text>
                {sub ? <Text style={g.subT}>{sub}</Text> : null}
              </View>
              {right}
            </View>
          )}
          {children}
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
}

export const g = StyleSheet.create({
  pad: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 130 },
  glow: { position: 'absolute', width: 240, height: 240, borderRadius: 120, opacity: 0.22 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  title: { color: '#fff', fontSize: 24, fontWeight: '300', letterSpacing: 2, textTransform: 'uppercase' },
  subT: { color: C.sub, marginTop: 2 },
  h2: { color: '#AEB6C2', fontSize: 12, fontWeight: '700', letterSpacing: 1.8, textTransform: 'uppercase', marginTop: 20, marginBottom: 10 },
  txt: { color: '#fff' }, dim: { color: C.sub, fontSize: 13 },
  card: { borderRadius: 20, borderWidth: 1, borderColor: C.line, padding: 14, marginBottom: 12, overflow: 'hidden' },
  btn: { paddingVertical: 13, paddingHorizontal: 18, borderRadius: 14, alignItems: 'center' },
  btnT: { color: '#05161b', fontWeight: '800' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, borderWidth: 1, borderColor: C.line, marginRight: 8, marginBottom: 8 },
  chipT: { color: C.sub, fontSize: 13 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10, borderWidth: 1, marginRight: 6 },
  label: { color: C.sub, fontSize: 12, marginBottom: 4 },
  input: { color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 12 },
  step: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  stepN: { color: '#fff', fontSize: 28, fontWeight: '800', marginHorizontal: 24 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#25272A', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 18, maxHeight: '88%', borderWidth: 1, borderColor: C.line },
  sheetT: { color: '#fff', fontSize: 20, fontWeight: '800' },
});
