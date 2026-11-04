import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useStore, today, addDays, fromStr, toStr, validDate, DAYS } from '../store';
import { Screen, Glass, Btn, Chip, Badge, Icon, Sheet, Field, DateField, C, PRIO, g } from '../ui';
import JobForm from '../JobForm';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const mondayOf = (s) => { const d = fromStr(s); return addDays(s, -((d.getDay() + 6) % 7)); };

export default function CalendarScreen() {
  const { jobs, reminders, saveReminder, toggleReminder, deleteReminder } = useStore();
  const [mode, setMode] = useState('Month');
  const [sel, setSel] = useState(today());
  const [jobOpen, setJobOpen] = useState(false);
  const [remOpen, setRemOpen] = useState(false);
  const [rem, setRem] = useState({ title: '', date: today() });

  const d = fromStr(sel);
  const step = (n) => {
    if (mode === 'Month') setSel(toStr(new Date(d.getFullYear(), d.getMonth() + n, 1)));
    else setSel(addDays(sel, mode === 'Week' ? 7 * n : n));
  };
  const jobsOn = (x) => jobs.filter((j) => j.start === x || j.due === x);
  const remOn = (x) => reminders.filter((r) => r.date === x);

  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const cells = [
    ...Array((first.getDay() + 6) % 7).fill(null),
    ...Array.from({ length: new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() }, (_, i) => toStr(new Date(d.getFullYear(), d.getMonth(), i + 1))),
  ];
  const weekDays = [...Array(7)].map((_, i) => addDays(mondayOf(sel), i));
  const agendaDays = mode === 'Week' ? weekDays : [sel];
  const title = mode === 'Month' ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}` : mode === 'Week' ? `Week of ${mondayOf(sel)}` : sel;
  const t = today();
  const upcoming = jobs.filter((j) => j.status !== 'Completed' && j.due >= t && j.due <= addDays(t, 7)).sort((a, b) => (a.due > b.due ? 1 : -1));

  const saveRem = () => {
    if (!rem.title.trim() || !validDate(rem.date)) return Alert.alert('Reminder', 'Enter a title and a valid date (YYYY-MM-DD).');
    saveReminder(rem); setRemOpen(false);
  };
  const DayCell = ({ x, big }) => {
    const j = jobsOn(x).length, r = remOn(x).length, on = x === sel;
    return (
      <TouchableOpacity onPress={() => setSel(x)} style={{ width: big ? '14.28%' : '14.28%', aspectRatio: big ? 1 : 0.8, alignItems: 'center', justifyContent: 'center' }}>
        <View style={[{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, on && { backgroundColor: C.purple, shadowColor: C.purple, shadowOpacity: 0.9, shadowRadius: 10 }, x === t && !on && { borderWidth: 1, borderColor: C.cyan }]}>
          <Text style={{ color: on ? '#05161b' : '#fff', fontWeight: on ? '800' : '500' }}>{fromStr(x).getDate()}</Text>
        </View>
        <View style={{ flexDirection: 'row', height: 6, marginTop: 2 }}>
          {j > 0 && <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.cyan, marginHorizontal: 1 }} />}
          {r > 0 && <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.pink, marginHorizontal: 1 }} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen title="Calendar" sub="Schedule & reminders" right={<Btn small title="+ Schedule Job" onPress={() => setJobOpen(true)} />}>
      <View style={g.row}>{['Day', 'Week', 'Month'].map((m) => <Chip key={m} label={m} active={mode === m} onPress={() => setMode(m)} />)}</View>
      <Glass glow={C.purple}>
        <View style={[g.row, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }]}>
          <TouchableOpacity onPress={() => step(-1)}><Icon name="left" /></TouchableOpacity>
          <Text style={[g.txt, { fontWeight: '800', fontSize: 16 }]}>{title}</Text>
          <TouchableOpacity onPress={() => step(1)}><Icon name="right" /></TouchableOpacity>
        </View>
        {mode !== 'Day' && <View style={g.row}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => <Text key={i} style={[g.dim, { width: '14.28%', textAlign: 'center' }]}>{l}</Text>)}</View>}
        {mode === 'Month' && <View style={g.row}>{cells.map((x, i) => (x ? <DayCell key={x} x={x} big /> : <View key={'e' + i} style={{ width: '14.28%' }} />))}</View>}
        {mode === 'Week' && <View style={g.row}>{weekDays.map((x) => <DayCell key={x} x={x} />)}</View>}
        {mode === 'Day' && <Text style={[g.dim, { textAlign: 'center' }]}>{DAYS[d.getDay()]} · {jobsOn(sel).length} job(s) · {remOn(sel).length} reminder(s)</Text>}
      </Glass>

      <Text style={g.h2}>{mode === 'Week' ? 'This week' : `Schedule · ${sel}`}</Text>
      {agendaDays.every((x) => !jobsOn(x).length && !remOn(x).length) && <Text style={g.dim}>Nothing scheduled.</Text>}
      {agendaDays.map((x) => (jobsOn(x).length || remOn(x).length) ? (
        <Glass key={x}>
          <Text style={[g.txt, { fontWeight: '700', marginBottom: 6 }]}>{DAYS[fromStr(x).getDay()]} {x}</Text>
          {jobsOn(x).map((j) => (
            <View key={j.id} style={[g.row, { alignItems: 'center', marginBottom: 4 }]}>
              <Badge label={j.start === x ? 'Appointment' : 'Due'} color={j.start === x ? C.cyan : PRIO[j.priority]} />
              <Text style={g.txt}>{j.vehicle} · {j.customer}</Text>
            </View>
          ))}
          {remOn(x).map((r) => <View key={r.id} style={[g.row, { alignItems: 'center' }]}><Badge label="Reminder" color={C.pink} /><Text style={g.txt}>{r.title}</Text></View>)}
        </Glass>
      ) : null)}

      <Text style={g.h2}>Upcoming Tasks (7 days)</Text>
      {upcoming.length === 0 && <Text style={g.dim}>No upcoming due dates.</Text>}
      {upcoming.map((j) => (
        <Glass key={j.id}><View style={[g.row, { justifyContent: 'space-between' }]}>
          <Text style={g.txt}>{j.vehicle} · {j.desc || j.customer}</Text><Badge label={`Due ${j.due}`} color={PRIO[j.priority]} />
        </View></Glass>
      ))}

      <View style={[g.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={g.h2}>Reminders</Text>
        <Btn small title="+ Add" colors={[C.pink, C.purple]} onPress={() => { setRem({ title: '', date: sel }); setRemOpen(true); }} />
      </View>
      {reminders.map((r) => (
        <Glass key={r.id}><View style={[g.row, { alignItems: 'center', justifyContent: 'space-between' }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleReminder(r.id)}>
            <Text style={[g.txt, r.done && { textDecorationLine: 'line-through', opacity: 0.5 }]}>{r.done ? '✓ ' : '🔔 '}{r.title}</Text>
            <Text style={g.dim}>{r.date}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteReminder(r.id)}><Icon name="trash" color={C.red} size={20} /></TouchableOpacity>
        </View></Glass>
      ))}

      <JobForm visible={jobOpen} onClose={() => setJobOpen(false)} defaultStart={sel} />
      <Sheet visible={remOpen} onClose={() => setRemOpen(false)} title="New Reminder">
        <Field label="Reminder" value={rem.title} onChangeText={(v) => setRem({ ...rem, title: v })} placeholder="e.g. Call customer" />
        <DateField label="Date" value={rem.date} onChange={(v) => setRem({ ...rem, date: v })} />
        <Btn title="Save Reminder" onPress={saveRem} />
      </Sheet>
    </Screen>
  );
}
