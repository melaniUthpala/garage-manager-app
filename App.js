import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StoreProvider, useStore } from './src/store';
import { syncNotifications } from './src/notify';
import { Icon, C } from './src/ui';
import Home from './src/screens/Home';
import CalendarScreen from './src/screens/Calendar';
import Jobs from './src/screens/Jobs';
import Stock from './src/screens/Stock';
import Settings from './src/screens/Settings';

const Tab = createBottomTabNavigator();
const ICON = { Home: 'home', Calendar: 'calendar', Jobs: 'jobs', Stock: 'stock', Settings: 'settings' };
const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#25272A' } };

// Floating pill-shaped glass navigation
function TabBar({ state, navigation }) {
  return (
    <View style={{ position: 'absolute', left: 30, right: 30, bottom: 22 }}>
      <View style={{
        flexDirection: 'row', backgroundColor: 'rgba(28,30,34,0.95)', borderRadius: 38, borderWidth: 1,
        borderColor: 'rgba(32,216,232,0.3)', paddingVertical: 10, paddingHorizontal: 6,
        shadowColor: C.cyan, shadowOpacity: 0.35, shadowRadius: 18, elevation: 12,
      }}>
        {state.routes.map((r, i) => {
          const on = state.index === i;
          return (
            <TouchableOpacity
              key={r.key} style={{ flex: 1, alignItems: 'center' }} accessibilityLabel={r.name}
              onPress={() => {
                const e = navigation.emit({ type: 'tabPress', target: r.key, canPreventDefault: true });
                if (!on && !e.defaultPrevented) navigation.navigate(r.name);
              }}
            >
              <View style={{
                width: 46, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
                backgroundColor: on ? 'rgba(32,216,232,0.16)' : 'transparent',
                borderWidth: on ? 1 : 0, borderColor: 'rgba(32,216,232,0.55)',
              }}>
                <Icon name={ICON[r.name]} size={22} color={on ? '#ffffff' : 'rgba(255,255,255,0.6)'} />
              </View>
              {on ? <View style={{ width: 16, height: 3, borderRadius: 2, marginTop: 4, backgroundColor: C.cyan, shadowColor: C.cyan, shadowOpacity: 1, shadowRadius: 6 }} /> : <View style={{ height: 7 }} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function NotificationSync() {
  const { jobs, reminders, notif } = useStore();
  useEffect(() => { syncNotifications({ jobs, reminders, enabled: notif !== false }); }, [jobs, reminders, notif]);
  return null;
}

export default function App() {
  return (
    <StoreProvider>
      <StatusBar style="light" />
      <NotificationSync />
      <NavigationContainer theme={theme}>
        <Tab.Navigator tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, animation: 'shift' }}>
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Calendar" component={CalendarScreen} />
          <Tab.Screen name="Jobs" component={Jobs} />
          <Tab.Screen name="Stock" component={Stock} />
          <Tab.Screen name="Settings" component={Settings} />
        </Tab.Navigator>
      </NavigationContainer>
    </StoreProvider>
  );
}
