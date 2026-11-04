import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store';
import { Screen, Glass, Btn, Chip, Badge, Icon, Sheet, Stepper, Field, C, g } from '../ui';

export default function Stock() {
  const { parts, savePart, deletePart, adjustStock } = useStore();
  const [cat, setCat] = useState('All');
  const [form, setForm] = useState(null); // part being added / edited
  const [adj, setAdj] = useState(null);   // part for stock in / out
  const [qty, setQty] = useState(1);

  const cats = ['All', ...new Set(parts.map((p) => p.category).filter(Boolean))];
  const list = parts.filter((p) => cat === 'All' || p.category === cat);
  const low = parts.filter((p) => p.stock <= p.min);

  const save = () => {
    if (!form.name.trim()) return Alert.alert('Part name is required');
    savePart({ ...form, name: form.name.trim(), category: (form.category || 'General').trim(), stock: parseInt(form.stock, 10) || 0, min: parseInt(form.min, 10) || 0 });
    setForm(null);
  };
  const confirmDel = (p) => Alert.alert('Delete part', `Delete ${p.name}?`, [
    { text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deletePart(p.id) }]);
  const move = (sign) => { adjustStock(adj.id, sign * qty); setAdj(null); setQty(1); };

  return (
    <Screen title="Inventory" sub={`${parts.length} spare parts`} right={<Btn small title="+ Add Part" onPress={() => setForm({ name: '', category: '', stock: '0', min: '3' })} />}>
      {low.length > 0 && (
        <Glass glow={C.red}>
          <View style={[g.row, { alignItems: 'center' }]}><Icon name="alert" color={C.red} /><Text style={[g.txt, { fontWeight: '700', marginLeft: 8 }]}>Low stock alert</Text></View>
          <Text style={[g.dim, { marginTop: 4 }]}>{low.map((p) => `${p.name} (${p.stock})`).join(' · ')}</Text>
        </Glass>
      )}
      <View style={g.row}>{cats.map((c) => <Chip key={c} label={c} active={cat === c} onPress={() => setCat(c)} />)}</View>
      {list.map((p) => {
        const isLow = p.stock <= p.min, ratio = Math.min(1, p.stock / Math.max(1, p.min * 3));
        return (
          <Glass key={p.id} glow={isLow ? C.red : undefined}>
            <View style={[g.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[g.txt, { fontWeight: '800', fontSize: 16 }]}>{p.name}</Text>
                <Text style={g.dim}>{p.category} · min {p.min}</Text>
              </View>
              <Text style={{ color: isLow ? C.red : C.green, fontSize: 30, fontWeight: '800' }}>{p.stock}</Text>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 10 }}>
              <LinearGradient colors={isLow ? [C.red, C.amber] : [C.cyan, C.green]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${ratio * 100}%`, height: 6, borderRadius: 3 }} />
            </View>
            <View style={[g.row, { alignItems: 'center' }]}>
              {isLow && <Badge label="LOW" color={C.red} />}
              <Btn small title="Stock In" colors={[C.green, C.cyan]} style={{ marginRight: 8 }} onPress={() => { setAdj({ ...p, dir: 1 }); setQty(1); }} />
              <Btn small title="Stock Out" colors={[C.red, C.amber]} onPress={() => { setAdj({ ...p, dir: -1 }); setQty(1); }} />
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={{ padding: 8 }} onPress={() => setForm({ ...p, stock: String(p.stock), min: String(p.min) })}><Icon name="edit" size={20} color={C.cyan} /></TouchableOpacity>
              <TouchableOpacity style={{ padding: 8 }} onPress={() => confirmDel(p)}><Icon name="trash" size={20} color={C.red} /></TouchableOpacity>
            </View>
          </Glass>
        );
      })}
      <Sheet visible={form !== null} onClose={() => setForm(null)} title={form && form.id ? 'Edit Part' : 'Add Part'}>
        {form && (<>
          <Field label="Part name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <Field label="Category" value={form.category} onChangeText={(v) => setForm({ ...form, category: v })} placeholder="Batteries, Engine, Lighting..." />
          <View style={g.row}>{cats.filter((c) => c !== 'All').map((c) => <Chip key={c} label={c} active={form.category === c} onPress={() => setForm({ ...form, category: c })} />)}</View>
          <Field label="Available stock" value={form.stock} onChangeText={(v) => setForm({ ...form, stock: v })} keyboardType="number-pad" />
          <Field label="Low stock level" value={form.min} onChangeText={(v) => setForm({ ...form, min: v })} keyboardType="number-pad" />
          <Btn title="Save Part" onPress={save} />
        </>)}
      </Sheet>
      <Sheet visible={adj !== null} onClose={() => setAdj(null)} title={adj ? `${adj.dir > 0 ? 'Stock In' : 'Stock Out'} · ${adj.name}` : ''}>
        {adj && (<>
          <Text style={[g.dim, { textAlign: 'center' }]}>Current stock: {adj.stock}</Text>
          <Stepper value={qty} onChange={setQty} />
          <Btn title={adj.dir > 0 ? `Add ${qty}` : `Remove ${qty}`} colors={adj.dir > 0 ? [C.green, C.cyan] : [C.red, C.amber]} onPress={() => move(adj.dir)} />
        </>)}
      </Sheet>
    </Screen>
  );
}
