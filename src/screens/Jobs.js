import { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { useStore, STATUSES } from '../store';
import { Screen, Glass, Btn, Chip, Badge, Icon, Sheet, Stepper, Field, C, PRIO, STAT, g } from '../ui';
import JobForm from '../JobForm';

function Timeline({ job }) {
  const at = STATUSES.indexOf(job.status);
  return (
    <View style={[g.row, { alignItems: 'center', marginVertical: 10 }]}>
      {STATUSES.map((s, i) => {
        const done = i <= at, e = job.timeline.find((x) => x.status === s);
        return (
          <View key={s} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <View style={{ flex: 1, height: 2, backgroundColor: i > 0 && done ? STAT[s] : i > 0 ? C.line : 'transparent' }} />
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: done ? STAT[s] : 'transparent', borderWidth: 2, borderColor: done ? STAT[s] : C.line, alignItems: 'center', justifyContent: 'center', shadowColor: STAT[s], shadowOpacity: done ? 0.9 : 0, shadowRadius: 8 }}>
                {done && <Icon name="check" size={12} />}
              </View>
              <View style={{ flex: 1, height: 2, backgroundColor: i < 2 && i < at ? STAT[STATUSES[i + 1]] : i < 2 ? C.line : 'transparent' }} />
            </View>
            <Text style={{ color: done ? '#fff' : C.sub, fontSize: 11, marginTop: 4 }}>{s}</Text>
            <Text style={{ color: C.sub, fontSize: 10 }}>{e ? e.date.slice(5) : '–'}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function Jobs() {
  const { jobs, parts, mechanics, setStatus, deleteJob, usePart } = useStore();
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ open: false, job: null });
  const [partFor, setPartFor] = useState(null);
  const [pick, setPick] = useState(null);
  const [qty, setQty] = useState(1);

  const text = q.trim().toLowerCase();
  const list = jobs.filter((j) => (filter === 'All' || j.status === filter) &&
    (!text || [j.vehicle, j.customer, j.model].some((v) => (v || '').toLowerCase().includes(text))));
  const mech = (id) => (mechanics.find((m) => m.id === id) || {}).name || 'Unassigned';

  const confirmDel = (j) => Alert.alert('Delete job', `Delete ${j.vehicle}?`, [
    { text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteJob(j.id) }]);
  const applyPart = () => {
    if (!pick) return Alert.alert('Select a part');
    if (!usePart(partFor, pick, qty)) return Alert.alert('Not enough stock', 'Reduce the quantity or add stock first.');
    setPartFor(null); setPick(null); setQty(1);
  };

  return (
    <Screen title="Garage Jobs" sub={`${jobs.length} jobs`} right={<Btn small title="+ New Job" onPress={() => setForm({ open: true, job: null })} />}>
      <Field label="Search" value={q} onChangeText={setQ} placeholder="Vehicle, customer or model" />
      <View style={g.row}>{['All', ...STATUSES].map((s) => <Chip key={s} label={s} color={STAT[s] || C.cyan} active={filter === s} onPress={() => setFilter(s)} />)}</View>
      {list.length === 0 && <Text style={[g.dim, { textAlign: 'center', marginTop: 24 }]}>No jobs found.</Text>}
      {list.map((j) => {
        const next = STATUSES[STATUSES.indexOf(j.status) + 1];
        return (
          <Glass key={j.id} glow={PRIO[j.priority]}>
            <View style={[g.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
              <Text style={[g.txt, { fontSize: 20, fontWeight: '800' }]}>{j.vehicle}</Text>
              <Badge label={j.priority} color={PRIO[j.priority]} />
            </View>
            <Text style={g.txt}>{j.customer} · {j.model || 'Model not set'}</Text>
            <Text style={g.dim}>🔧 {mech(j.mechanicId)}</Text>
            {j.photo ? <Image source={{ uri: j.photo }} style={{ width: '100%', height: 160, borderRadius: 14, marginTop: 8 }} /> : null}
            {j.desc ? <Text style={[g.txt, { marginTop: 6 }]}>{j.desc}</Text> : null}
            <Text style={[g.dim, { marginTop: 4 }]}>Start {j.start} → Due {j.due}</Text>
            <Timeline job={j} />
            {j.parts.length > 0 && <Text style={g.dim}>Parts used: {j.parts.map((p) => `${p.name} ×${p.qty}`).join(', ')}</Text>}
            <View style={[g.row, { marginTop: 10, alignItems: 'center' }]}>
              {next ? <Btn small title={`Mark ${next}`} colors={[STAT[next], C.blue]} onPress={() => setStatus(j.id, next)} style={{ marginRight: 8, marginBottom: 6 }} />
                : <Badge label="Completed ✓" color={C.green} />}
              <Btn small title="Use part" colors={[C.purple, C.pink]} onPress={() => { setPartFor(j.id); setPick(null); setQty(1); }} style={{ marginRight: 8, marginBottom: 6 }} />
              <TouchableOpacity style={{ padding: 8 }} onPress={() => setForm({ open: true, job: j })}><Icon name="edit" size={20} color={C.cyan} /></TouchableOpacity>
              <TouchableOpacity style={{ padding: 8 }} onPress={() => confirmDel(j)}><Icon name="trash" size={20} color={C.red} /></TouchableOpacity>
            </View>
          </Glass>
        );
      })}
      <JobForm visible={form.open} job={form.job} onClose={() => setForm({ open: false, job: null })} />
      <Sheet visible={partFor !== null} onClose={() => setPartFor(null)} title="Use spare part">
        <Text style={g.dim}>Stock is deducted automatically.</Text>
        <View style={[g.row, { marginTop: 10 }]}>
          {parts.map((p) => <Chip key={p.id} label={`${p.name} (${p.stock})`} color={p.stock === 0 ? C.red : C.cyan} active={pick === p.id} onPress={() => setPick(p.id)} />)}
        </View>
        <Stepper value={qty} onChange={setQty} />
        <Btn title="Use part" onPress={applyPart} />
      </Sheet>
    </Screen>
  );
}
