import { useEffect, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { persistPhoto } from './photo';
import { useStore, STATUSES, PRIORITIES, today, addDays, validDate } from './store';
import { Sheet, Field, DateField, Chip, Btn, C, PRIO, STAT, g } from './ui';

// Add / edit a garage job (also used by the Calendar "Schedule New Job")
export default function JobForm({ visible, onClose, job, defaultStart }) {
  const { mechanics, saveJob } = useStore();
  const blank = () => {
    const s = defaultStart || today();
    return { customer: '', vehicle: '', model: '', mechanicId: '', desc: '', priority: 'Medium', status: 'Received', photo: null, start: s, due: addDays(s, 3) };
  };
  const [f, setF] = useState(blank());
  useEffect(() => { if (visible) setF(job ? { ...job } : blank()); }, [visible]);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const pickPhoto = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.5 });
    if (!r.canceled) set('photo')(persistPhoto(r.assets[0].uri));
  };
  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
    const r = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!r.canceled) set('photo')(persistPhoto(r.assets[0].uri));
  };

  const save = () => {
    if (!f.customer.trim() || !f.vehicle.trim()) return Alert.alert('Missing info', 'Customer name and vehicle number are required.');
    if (!validDate(f.start) || !validDate(f.due)) return Alert.alert('Dates', 'Use the format YYYY-MM-DD.');
    saveJob(f);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={job ? 'Edit Job' : 'Schedule New Job'}>
      <Field label="Customer name" value={f.customer} onChangeText={set('customer')} placeholder="e.g. Nimal Perera" />
      <Field label="Vehicle number" value={f.vehicle} onChangeText={set('vehicle')} autoCapitalize="characters" placeholder="CAB-1234" />
      <Field label="Vehicle model" value={f.model} onChangeText={set('model')} placeholder="Toyota Axio" />
      <Text style={g.label}>Assigned mechanic</Text>
      <View style={g.row}>
        <Chip label="Unassigned" active={!f.mechanicId} onPress={() => set('mechanicId')('')} />
        {mechanics.map((m) => <Chip key={m.id} label={m.name} active={f.mechanicId === m.id} onPress={() => set('mechanicId')(m.id)} />)}
      </View>
      <Field label="Repair description" value={f.desc} onChangeText={set('desc')} multiline placeholder="What needs to be repaired?" />
      <Text style={g.label}>Vehicle photo</Text>
      {f.photo ? <Image source={{ uri: f.photo }} style={{ width: '100%', height: 180, borderRadius: 14, marginBottom: 8 }} /> : null}
      <View style={g.row}>
        <Chip label="📷 Take photo" onPress={takePhoto} />
        <Chip label="🖼 Gallery" onPress={pickPhoto} />
        {f.photo ? <Chip label="Remove" color={C.red} active onPress={() => set('photo')(null)} /> : null}
      </View>
      <Text style={g.label}>Priority</Text>
      <View style={g.row}>{PRIORITIES.map((p) => <Chip key={p} label={p} color={PRIO[p]} active={f.priority === p} onPress={() => set('priority')(p)} />)}</View>
      <Text style={g.label}>Status</Text>
      <View style={g.row}>{STATUSES.map((s) => <Chip key={s} label={s} color={STAT[s]} active={f.status === s} onPress={() => set('status')(s)} />)}</View>
      <DateField label="Start date" value={f.start} onChange={set('start')} />
      <DateField label="Due date" value={f.due} onChange={set('due')} />
      <Btn title={job ? 'Update Job' : 'Save Job'} onPress={save} />
    </Sheet>
  );
}
