import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, fromStr } from './store';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
    }),
  });
} catch (e) { /* notifications not available here */ }

export async function ensurePermission() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Garage reminders', importance: Notifications.AndroidImportance.MAX,
      });
    }
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return !!req.granted;
  } catch (e) { return false; }
}

const at = (dateStr, h) => { const d = fromStr(dateStr); d.setHours(h, 0, 0, 0); return d; };

// Re-schedules every phone notification from the current data.
export async function syncNotifications({ jobs, reminders, enabled }) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled || !(await ensurePermission())) return;

    const items = [];
    reminders.filter((r) => !r.done).forEach((r) =>
      items.push({ when: at(r.date, 9), title: '🔔 Reminder', body: r.title }));
    jobs.filter((j) => j.status !== 'Completed').forEach((j) => {
      const what = `${j.vehicle} · ${j.desc || j.customer}`;
      items.push({ when: at(j.start, 8), title: '🔧 Appointment today', body: `${j.vehicle} · ${j.customer}` });
      items.push({ when: at(addDays(j.due, -1), 18), title: '⏰ Job due tomorrow', body: what });
      items.push({ when: at(j.due, 8), title: '⏰ Job due today', body: what });
    });

    const now = Date.now();
    const future = items.filter((i) => i.when.getTime() > now).sort((a, b) => a.when - b.when).slice(0, 50);
    for (const i of future) {
      await Notifications.scheduleNotificationAsync({
        content: { title: i.title, body: i.body, sound: true },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: i.when, channelId: 'default' },
      });
    }
  } catch (e) { console.log('Notification sync error:', e); }
}

export async function sendTest() {
  try {
    if (!(await ensurePermission())) return false;
    await Notifications.scheduleNotificationAsync({
      content: { title: '🔧 Garage Manager', body: 'Test notification works!', sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, channelId: 'default' },
    });
    return true;
  } catch (e) { return false; }
}
