import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store';
import { Screen, Glass, Btn, Chip, Badge, Icon, Sheet, Field, C, g } from '../ui';
import { sendTest } from '../notify';

export default function Settings() {
  const { garage, setGarage, mechanics, jobs, saveMechanic, deleteMechanic, resetData, notif, setNotif } = useStore();
  const [name, setName] = useState(garage);
  const [open, setOpen] = useState(false);
  const [m, setM] = useState({ name: '', specialty: '' });

  const add = () => {
    if (!m.name.trim()) return Alert.alert('Mechanic name is required');
    saveMechanic({ name: m.name.trim(), specialty: m.specialty.trim() });
    setM({ name: '', specialty: '' }); setOpen(false);
  };
  const testNotify = async () => {
    const ok = await sendTest();
    Alert.alert(ok ? 'Test scheduled' : 'Not allowed', ok ? 'A notification will appear in about 3 seconds.' : 'Please allow notifications for this app in your phone settings.');
  };
  const del = (x) => Alert.alert('Remove mechanic', `Remove ${x.name}? Their jobs become unassigned.`, [
    { text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => deleteMechanic(x.id) }]);
  const reset = () => Alert.alert('Reset all data', 'This restores the demo data and removes your changes.', [
    { text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: resetData }]);

  return (
    <Screen title="Settings" sub="Garage & mechanics">
      <Glass>
        <Field label="Garage name" value={name} onChangeText={setName} onEndEditing={() => name.trim() && setGarage(name.trim())} />
      </Glass>
      <Text style={g.h2}>Notifications</Text>
      <Glass>
        <Text style={g.dim}>Phone alerts for reminders, appointments and job due dates.</Text>
        <View style={[g.row, { marginVertical: 10 }]}>
          <Chip label="On" color={C.green} active={notif !== false} onPress={() => setNotif(true)} />
          <Chip label="Off" color={C.red} active={notif === false} onPress={() => setNotif(false)} />
        </View>
        <Btn small title="Send test notification" onPress={testNotify} />
      </Glass>
      <View style={[g.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={g.h2}>Mechanic Management</Text>
        <Btn small title="+ Add" onPress={() => setOpen(true)} />
      </View>
      {mechanics.map((x) => {
        const mine = jobs.filter((j) => j.mechanicId === x.id);
        const active = mine.filter((j) => j.status !== 'Completed');
        return (
          <Glass key={x.id} glow={C.purple}>
            <View style={[g.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[g.txt, { fontSize: 17, fontWeight: '800' }]}>{x.name}</Text>
                <Text style={g.dim}>{x.specialty || 'General mechanic'}</Text>
              </View>
              <TouchableOpacity onPress={() => del(x)}><Icon name="trash" color={C.red} size={20} /></TouchableOpacity>
            </View>
            <View style={[g.row, { marginTop: 8 }]}>
              <Badge label={`${active.length} active`} color={C.blue} />
              <Badge label={`${mine.length - active.length} completed`} color={C.green} />
            </View>
            {active.map((j) => <Text key={j.id} style={[g.txt, { marginTop: 4 }]}>• {j.vehicle} – {j.customer} ({j.status})</Text>)}
          </Glass>
        );
      })}
      <Text style={g.h2}>Data</Text>
      <Btn title="Reset to demo data" colors={[C.red, C.amber]} onPress={reset} />
      <Sheet visible={open} onClose={() => setOpen(false)} title="Add Mechanic">
        <Field label="Name" value={m.name} onChangeText={(v) => setM({ ...m, name: v })} />
        <Field label="Specialty" value={m.specialty} onChangeText={(v) => setM({ ...m, specialty: v })} placeholder="Auto electrical, Engine..." />
        <Btn title="Save Mechanic" onPress={add} />
      </Sheet>
    </Screen>
  );
}
