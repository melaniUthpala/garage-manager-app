# Garage Manager 🔧

A React Native (Expo) mobile app for managing a vehicle repair garage — built as a learning project for **Rangika Auto Electrical**.

Dark glassmorphism + neon UI with purple / blue / cyan gradients.

## Features

- **Dashboard** – today's overview with animated stats, interactive weekly progress chart, recent jobs
- **Calendar** – day / week / month views, repair appointments, upcoming tasks, reminders, schedule new jobs
- **Garage Jobs** – customer, vehicle number & model, assigned mechanic, repair description, priority, status, start & due dates, vehicle photo, job timeline (Received → In Progress → Completed), search & filters
- **Inventory** – spare parts, categories, stock in / out, low stock alerts, add / edit / delete
- **Inventory usage tracking** – using a part on a job deducts the stock automatically
- **Mechanic management** – mechanic details with their active and completed jobs
- **Phone notifications** – reminders, appointments and due-date alerts (can be turned off in Settings)
- **Offline storage** – everything is saved on the phone (AsyncStorage); photos are kept in the app's permanent folder

## Tech stack

React Native · Expo · React Navigation (bottom tabs) · AsyncStorage · react-native-svg · expo-linear-gradient · expo-image-picker · expo-notifications · expo-file-system

## Screenshots

| Home | Calendar | Jobs |
| --- | --- | --- |
| ![Home](docs/screenshots/home.png) | ![Calendar](docs/screenshots/calendar.png) | ![Jobs](docs/screenshots/jobs.png) |

| Stock | Settings |
| --- | --- |
| ![Stock](docs/screenshots/stock.png) | ![Settings](docs/screenshots/settings.png) |

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (phone and computer on the same WiFi).

## Build an Android APK

```bash
npm install -g eas-cli
eas login
eas init
eas build -p android --profile preview
```

## Project structure

```
App.js                 navigation + notification sync
src/store.js           data, actions, AsyncStorage persistence
src/ui.js              glass cards, buttons, icons, shared UI
src/notify.js          phone notifications
src/photo.js           permanent photo storage
src/JobForm.js         add / edit job form
src/screens/           Home, Calendar, Jobs, Stock, Settings
```

## Using your own car photo

The Home screen draws a built-in sports car illustration. To use a real photo instead:

1. Save a transparent PNG (about 900px wide, under 300 KB) as `assets/car.png`
2. In `src/carImage.js` set: `export const CAR_PHOTO = require('../assets/car.png');`
