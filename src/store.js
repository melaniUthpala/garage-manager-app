import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'garage-manager-v1';
export const STATUSES = ['Received', 'In Progress', 'Completed'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n) => String(n).padStart(2, '0');
export const toStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromStr = (s) => new Date(s + 'T00:00:00');
export const today = () => toStr(new Date());
export const addDays = (s, n) => { const d = fromStr(s); d.setDate(d.getDate() + n); return toStr(d); };
export const validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(fromStr(s));

const seed = () => {
  const t = today();
  const J = (i, customer, vehicle, model, mechanicId, desc, priority, status, start, due, tl) => ({
    id: 'j' + i, customer, vehicle, model, mechanicId, desc, priority, status, start, due,
    parts: [], created: i, timeline: tl,
  });
  return {
    garage: 'Rangika Auto Electrical',
    mechanics: [
      { id: 'm1', name: 'Kamal Perera', specialty: 'Auto electrical' },
      { id: 'm2', name: 'Nuwan Silva', specialty: 'Engine & wiring' },
    ],
    parts: [
      { id: 'p1', name: 'Battery 12V 45Ah', category: 'Batteries', stock: 6, min: 3 },
      { id: 'p2', name: 'Alternator belt', category: 'Engine', stock: 2, min: 4 },
      { id: 'p3', name: 'Spark plug set', category: 'Engine', stock: 14, min: 5 },
      { id: 'p4', name: 'Fuse pack', category: 'Electrical', stock: 30, min: 10 },
      { id: 'p5', name: 'H4 headlight bulb', category: 'Lighting', stock: 3, min: 4 },
    ],
    jobs: [
      J(1, 'Nimal Perera', 'CAB-1234', 'Toyota Axio', 'm1', 'Battery replacement', 'Medium', 'Completed', addDays(t, -3), addDays(t, -2),
        [{ status: 'Received', date: addDays(t, -3) }, { status: 'In Progress', date: addDays(t, -3) }, { status: 'Completed', date: addDays(t, -1) }]),
      J(2, 'Sunil Silva', 'KP-5678', 'Suzuki Alto', 'm2', 'Full wiring repair', 'High', 'In Progress', addDays(t, -1), addDays(t, 2),
        [{ status: 'Received', date: addDays(t, -1) }, { status: 'In Progress', date: t }]),
      J(3, 'Amaya Fernando', 'WP-4410', 'Honda Vezel', 'm1', 'Headlight not working', 'Urgent', 'Received', t, addDays(t, 1),
        [{ status: 'Received', date: t }]),
      J(4, 'Ruwan Jayasinghe', 'NC-9021', 'Nissan Sunny', 'm2', 'Alternator check', 'Low', 'Received', addDays(t, 2), addDays(t, 4),
        [{ status: 'Received', date: t }]),
    ],
    reminders: [
      { id: 'r1', title: 'Order alternator belts', date: t, done: false },
      { id: 'r2', title: 'Call Amaya about headlight', date: addDays(t, 1), done: false },
    ],
  };
};

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);
const uid = () => Date.now().toString() + Math.floor(Math.random() * 1000);

export function StoreProvider({ children }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => setData(v ? JSON.parse(v) : seed()))
      .catch(() => setData(seed()));
  }, []);
  useEffect(() => {
    if (data) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  if (!data) return null;
  const up = (fn) => setData((p) => ({ ...p, ...fn(p) }));
  const advance = (old, status) => ({
    ...old, status,
    timeline: status !== old.status ? [...old.timeline, { status, date: today() }] : old.timeline,
  });

  const actions = {
    setGarage: (garage) => up(() => ({ garage })),
    setNotif: (notif) => up(() => ({ notif })),
    resetData: () => setData(seed()),
    saveJob: (j) => up((p) => j.id
      ? { jobs: p.jobs.map((x) => (x.id === j.id ? { ...advance(x, j.status), ...j, status: j.status, parts: x.parts, timeline: advance(x, j.status).timeline } : x)) }
      : { jobs: [{ ...j, id: uid(), parts: [], created: Date.now(), timeline: [{ status: j.status, date: today() }] }, ...p.jobs] }),
    setStatus: (id, status) => up((p) => ({ jobs: p.jobs.map((x) => (x.id === id ? advance(x, status) : x)) })),
    deleteJob: (id) => up((p) => ({ jobs: p.jobs.filter((x) => x.id !== id) })),
    // Inventory usage: deduct stock automatically and record it on the job
    usePart: (jobId, partId, qty) => {
      const part = data.parts.find((x) => x.id === partId);
      if (!part || qty < 1 || part.stock < qty) return false;
      up((p) => ({
        parts: p.parts.map((x) => (x.id === partId ? { ...x, stock: x.stock - qty } : x)),
        jobs: p.jobs.map((x) => (x.id === jobId ? { ...x, parts: [...x.parts, { partId, name: part.name, qty }] } : x)),
      }));
      return true;
    },
    savePart: (pt) => up((p) => pt.id
      ? { parts: p.parts.map((x) => (x.id === pt.id ? pt : x)) }
      : { parts: [{ ...pt, id: uid() }, ...p.parts] }),
    deletePart: (id) => up((p) => ({ parts: p.parts.filter((x) => x.id !== id) })),
    adjustStock: (id, delta) => up((p) => ({ parts: p.parts.map((x) => (x.id === id ? { ...x, stock: Math.max(0, x.stock + delta) } : x)) })),
    saveMechanic: (m) => up((p) => ({ mechanics: [{ ...m, id: uid() }, ...p.mechanics] })),
    deleteMechanic: (id) => up((p) => ({
      mechanics: p.mechanics.filter((x) => x.id !== id),
      jobs: p.jobs.map((j) => (j.mechanicId === id ? { ...j, mechanicId: '' } : j)),
    })),
    saveReminder: (r) => up((p) => ({ reminders: [{ ...r, id: uid(), done: false }, ...p.reminders] })),
    toggleReminder: (id) => up((p) => ({ reminders: p.reminders.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) })),
    deleteReminder: (id) => up((p) => ({ reminders: p.reminders.filter((x) => x.id !== id) })),
  };
  return <Ctx.Provider value={{ ...data, ...actions }}>{children}</Ctx.Provider>;
}
