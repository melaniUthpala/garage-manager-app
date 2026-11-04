import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useStore, today, addDays, fromStr, STATUSES, DAYS } from '../store';
import { Screen, Glass, CountUp, Badge, Icon, C, STAT, g } from '../ui';
import CarHero from '../Car';
import JobForm from '../JobForm';

function WeekChart({ data }) {
  const [sel, setSel] = useState(null);
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(a, { toValue: 1, duration: 900, useNativeDriver: false }).start(); }, []);
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View>
      <Text style={[g.dim, { height: 18 }]}>{sel !== null ? `${data[sel].label}: ${data[sel].value} job(s) completed` : 'Tap a bar for details'}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 130 }}>
        {data.map((d, i) => (
          <TouchableOpacity key={i} style={{ flex: 1, alignItems: 'center' }} onPress={() => setSel(i)}>
            <Animated.View style={{ width: 22, height: a.interpolate({ inputRange: [0, 1], outputRange: [4, 8 + (d.value / max) * 100] }) }}>
              <LinearGradient colors={sel === i ? [C.emerald, C.turquoise] : [C.cyan, '#1a6f86']} style={{ flex: 1, borderRadius: 8 }} />
            </Animated.View>
            <Text style={[g.dim, { marginTop: 6, fontSize: 11 }]}>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const Float = ({ side, top, label, children }) => (
  <Glass glow={C.cyan} style={[s.float, side === 'left' ? { left: 0 } : { right: 0 }, { top }]}>
    <Text style={s.fLabel} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
    {children}
  </Glass>
);

export default function Home() {
  const nav = useNavigation();
  const { jobs, parts, mechanics, garage, reminders } = useStore();
  const [idx, setIdx] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const t = today();
  const W = Dimensions.get('window').width - 32;
  const heroH = W * 0.74;

  const active = jobs.filter((j) => j.status !== 'Completed');
  const list = active.length ? active : jobs;
  const cur = list.length ? list[((idx % list.length) + list.length) % list.length] : null;
  const progress = cur ? (STATUSES.indexOf(cur.status) + 1) / 3 : 0;
  const todayJobs = jobs.filter((j) => j.start === t || j.due === t);
  const low = parts.filter((p) => p.stock <= p.min);
  const inProg = jobs.filter((j) => j.status === 'In Progress').length;
  const done = jobs.filter((j) => j.status === 'Completed').length;
  const remPending = reminders.filter((r) => !r.done && r.date <= t).length;
  const mechName = (id) => (mechanics.find((m) => m.id === id) || {}).name || 'Unassigned';
  const week = [...Array(7)].map((_, i) => {
    const d = addDays(t, i - 6);
    const value = jobs.filter((j) => j.timeline.some((x) => x.status === 'Completed' && x.date === d)).length;
    return { label: DAYS[fromStr(d).getDay()], value };
  });
  const recent = [...jobs].sort((a, b) => b.created - a.created).slice(0, 4);

  return (
    <Screen bare>
      {/* top bar */}
      <View style={s.top}>
        <TouchableOpacity style={s.round} onPress={() => nav.navigate('Calendar')} accessibilityLabel="Reminders">
          <Icon name="bell" size={20} />
          {remPending > 0 && <View style={s.dot} />}
        </TouchableOpacity>
        <View style={s.pill}><View style={s.live} /><Text style={s.pillT}>Garage online</Text></View>
        <TouchableOpacity style={s.round} onPress={() => nav.navigate('Settings')} accessibilityLabel="Settings">
          <Icon name="settings" size={20} />
        </TouchableOpacity>
      </View>

      <Text style={s.hello}>WELCOME BACK</Text>
      <Text style={s.name}>{garage}</Text>
      <View style={s.tagRow}><Icon name="bolt" size={13} color={C.cyan} /><Text style={s.tag}>  SMART GARAGE MANAGER</Text></View>

      {/* hero: car + floating glass cards */}
      <View style={{ height: heroH, marginTop: 6 }}>
        <View style={{ alignItems: 'center' }}>
          <CarHero plate={cur ? cur.vehicle : 'GARAGE'} width={W * 0.88} />
        </View>
        <Float side="left" top={heroH * 0.52} label="ACTIVE JOBS">
          <CountUp value={active.length} style={s.fNum} />
          <Text style={s.fSub} numberOfLines={1}>in the garage</Text>
        </Float>
        <Float side="right" top={4} label="TODAY">
          <CountUp value={todayJobs.length} style={s.fNum} />
          <Text style={s.fSub} numberOfLines={1}>{todayJobs[0] ? todayJobs[0].vehicle : 'no appointments'}</Text>
        </Float>
      </View>

      {/* stats under the car */}
      <View style={s.trio}>
        {[['jobs', inProg, 'In progress', C.cyan], ['check', done, 'Completed', C.emerald], ['alert', low.length, 'Low stock', low.length ? C.red : C.sub]].map(([ic, v, l, c]) => (
          <View key={l} style={{ alignItems: 'center', flex: 1 }}>
            <View style={s.trioIcon}><Icon name={ic} size={16} color={c} /></View>
            <CountUp value={v} style={s.trioNum} />
            <Text style={s.trioLbl}>{l}</Text>
          </View>
        ))}
      </View>

      {/* glowing action ring */}
      <View style={s.cta}>
        <TouchableOpacity style={s.side} onPress={() => nav.navigate('Calendar')}>
          <View style={s.sideBtn}><Icon name="calendar" size={20} /></View><Text style={s.sideT}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFormOpen(true)} activeOpacity={0.85}>
          <Svg width={124} height={124}>
            <Circle cx="62" cy="62" r="57" fill="none" stroke="rgba(32,216,232,0.16)" strokeWidth="10" />
            <Circle cx="62" cy="62" r="51" fill="none" stroke="rgba(32,216,232,0.7)" strokeWidth="2" strokeDasharray="3 6" />
            <Circle cx="62" cy="62" r="42" fill="#15181b" stroke="#ffffff" strokeWidth="3" />
          </Svg>
          <View style={s.ringText}><Text style={s.ringSm}>NEW</Text><Text style={s.ringBig}>JOB</Text></View>
        </TouchableOpacity>
        <TouchableOpacity style={s.side} onPress={() => nav.navigate('Stock')}>
          <View style={s.sideBtn}><Icon name="stock" size={20} />{low.length > 0 && <View style={s.dot} />}</View><Text style={s.sideT}>Stock</Text>
        </TouchableOpacity>
      </View>

      {remPending > 0 && (
        <Glass glow={C.amber}><View style={[g.row, { alignItems: 'center' }]}>
          <Icon name="bell" color={C.amber} /><Text style={[g.txt, { marginLeft: 10 }]}>{remPending} reminder(s) need attention</Text>
        </View></Glass>
      )}

      {/* vehicle status + service progress */}
      <Text style={g.h2}>Vehicle Status</Text>
      <Glass glow={C.cyan}>
        {cur ? (
          <>
            <View style={[g.row, { alignItems: 'center', justifyContent: 'space-between' }]}>
              <TouchableOpacity onPress={() => setIdx((i) => i - 1)} style={{ padding: 6 }}><Icon name="left" /></TouchableOpacity>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={s.vName}>{cur.vehicle}</Text>
                <Text style={g.dim}>{cur.model || 'Model not set'} · {cur.customer}</Text>
                <Text style={g.dim}>🔧 {mechName(cur.mechanicId)}</Text>
              </View>
              <TouchableOpacity onPress={() => setIdx((i) => i + 1)} style={{ padding: 6 }}><Icon name="right" /></TouchableOpacity>
            </View>
            <View style={{ alignItems: 'center', marginVertical: 10 }}><Badge label={cur.status} color={STAT[cur.status]} /></View>
            <Text style={s.fLabel}>SERVICE PROGRESS</Text>
            <View style={s.bar}><LinearGradient colors={[C.cyan, C.emerald]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${progress * 100}%`, height: 6, borderRadius: 3 }} /></View>
            <View style={[g.row, { justifyContent: 'space-between' }]}>
              {STATUSES.map((x) => <Text key={x} style={[g.dim, { fontSize: 10 }]}>{x}</Text>)}
            </View>
          </>
        ) : <Text style={g.dim}>No jobs yet. Tap NEW JOB to add the first vehicle.</Text>}
      </Glass>

      {/* mechanic availability */}
      <Text style={g.h2}>Mechanic Availability</Text>
      <Glass>
        {mechanics.length === 0 && <Text style={g.dim}>No mechanics added yet.</Text>}
        {mechanics.map((m) => {
          const n = jobs.filter((j) => j.mechanicId === m.id && j.status !== 'Completed').length;
          return (
            <View key={m.id} style={[g.row, { alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 }]}>
              <View style={[g.row, { alignItems: 'center' }]}>
                <View style={[s.live, { backgroundColor: n === 0 ? C.emerald : C.cyan, shadowColor: n === 0 ? C.emerald : C.cyan }]} />
                <Text style={g.txt}>{m.name}</Text>
              </View>
              <Text style={g.dim}>{n === 0 ? 'Available' : `${n} active job${n > 1 ? 's' : ''}`}</Text>
            </View>
          );
        })}
      </Glass>

      {/* inventory alerts */}
      <Text style={g.h2}>Inventory Alerts</Text>
      <TouchableOpacity activeOpacity={0.85} onPress={() => nav.navigate('Stock')}>
        <Glass glow={low.length ? C.red : undefined}>
          {low.length === 0 ? <Text style={g.dim}>All stock levels look healthy.</Text> : low.map((p) => (
            <View key={p.id} style={[g.row, { justifyContent: 'space-between', paddingVertical: 3 }]}>
              <Text style={g.txt}>{p.name}</Text><Text style={{ color: C.red, fontWeight: '700' }}>{p.stock} left</Text>
            </View>
          ))}
        </Glass>
      </TouchableOpacity>

      <Text style={g.h2}>Weekly Progress</Text>
      <Glass><WeekChart data={week} /></Glass>

      <Text style={g.h2}>Recent Garage Jobs</Text>
      {recent.map((j) => (
        <Glass key={j.id}>
          <View style={[g.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <View>
              <Text style={[g.txt, { fontWeight: '700', fontSize: 16 }]}>{j.vehicle}</Text>
              <Text style={g.dim}>{j.customer} · {j.model || 'No model'}</Text>
            </View>
            <Badge label={j.status} color={STAT[j.status]} />
          </View>
        </Glass>
      ))}

      <JobForm visible={formOpen} onClose={() => setFormOpen(false)} />
    </Screen>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  round: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: C.line },
  pillT: { color: '#fff', fontSize: 12, fontWeight: '600' },
  live: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.emerald, marginRight: 8, shadowColor: C.emerald, shadowOpacity: 1, shadowRadius: 6 },
  dot: { position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: C.red },
  hello: { color: '#fff', textAlign: 'center', fontSize: 22, fontWeight: '300', letterSpacing: 3 },
  name: { color: '#fff', textAlign: 'center', fontSize: 15, fontWeight: '600', marginTop: 4, letterSpacing: 1 },
  tagRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  tag: { color: C.cyan, fontSize: 11, letterSpacing: 1.5 },
  float: { position: 'absolute', width: 106, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center', borderRadius: 24 },
  fLabel: { color: C.cyan, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  fNum: { color: '#fff', fontSize: 30, fontWeight: '300' },
  fSub: { color: C.sub, fontSize: 10, marginTop: 2 },
  trio: { flexDirection: 'row', marginTop: 10 },
  trioIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  trioNum: { color: '#fff', fontSize: 26, fontWeight: '300' },
  trioLbl: { color: C.sub, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 14, marginBottom: 14 },
  ringText: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ringSm: { color: C.cyan, fontSize: 10, letterSpacing: 2 },
  ringBig: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  side: { alignItems: 'center', width: 80 },
  sideBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  sideT: { color: C.sub, fontSize: 11, marginTop: 6 },
  vName: { color: '#fff', fontSize: 22, fontWeight: '300', letterSpacing: 2 },
  bar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8 },
});