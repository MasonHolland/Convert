# Convert

An iOS-first app to use instead of Apple's Weather app. It does three things, each with its own tab at the bottom of the screen:

| Tab | What it does |
| --- | --- |
| **Weather** | Temperature only, always shown in **both °C and °F** |
| **Currency** | Converts between about 160 currencies, with saved default currencies and favorites |
| **Measure** | Converts weight and distance (metric, imperial, US, nautical), with a saved default pair for each |

This first version is built with Expo / React Native. It already uses native iOS parts (the system tab bar, SF Symbols icons, large collapsing titles, sheet pickers and haptics). A fully native App Store build is planned for later.

---

## Features

### Weather
- **My Location:** asks for location permission when you first open the tab and shows the temperature where you are.
- **Saved cities:** search for any city with **+** and swipe left and right between cities. Dots at the top show which city you're on. Press and hold a city's name to remove it.
- For each location you see:
  - The current temperature, large, in °C and °F
  - Feels-like temperature and today's high and low
  - An hour-by-hour strip for the next 24 hours
  - A 7-day list of highs and lows, with a bar showing each day's range against the whole week
- **Pull down to refresh.** The last forecast is saved, so it's still there offline (marked "Offline").
- If you deny location access, you can still add cities by hand, and there's a shortcut to iOS Settings.

### Currency
- Type an amount on the top row and the converted amount appears below. Tap a currency code to change it, or tap the ⇅ button to swap the two.
- The currency picker can be searched by code or name and shows a flag next to each currency.
- **Favorites:** tap the ☆ next to any currency in the picker. Favorites sit at the top of the list and show as quick-pick chips below the converter.
- **Defaults:** the ⚙︎ icon opens a screen where you set your default "from" and "to" currencies and manage favorites. The tab always opens on your default pair. If you switch to a different pair, a **Set as default** button appears.
- Shows the exchange rate (e.g. `1 USD = 0.91 EUR`) and when the rates were last updated.
- **Works offline:** it uses the last rates it downloaded and says it's offline.

### Measure
- A switch at the top chooses **Weight** or **Distance**.
- **Weight units:** milligram, gram, kilogram, metric ton, ounce, pound, stone
- **Distance units:** millimetre, centimetre, metre, kilometre, inch, foot, yard, mile, nautical mile
- Any unit converts to any other (metric↔imperial, metric↔metric and so on).
- Below the converter, a table shows your amount in every unit of that category.
- **Defaults:** each category has its own default pair (built-in defaults are kg → lb and km → mi). Change them with ⚙︎ or **Set as default**.
- Works fully offline.

### General
- Follows the system light / dark mode.
- Number keyboard for entering amounts; both `12.5` and `12,5` are accepted.
- Defaults, favorites, saved cities, rates and forecasts are all stored on the device.

---

## Installation

### Requirements
- [Node.js](https://nodejs.org/) LTS (this was built with Node 26)
- An iPhone with **Expo Go** installed from the App Store (or an Android phone with Expo Go from the Play Store)
- The computer and the phone on the same Wi-Fi network

A Mac and Xcode are **not** needed to try the app.

### Run it on your phone
```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npx expo start
```
3. **iPhone:** open the Camera app and scan the QR code shown in the terminal. It opens in Expo Go.
   **Android:** scan the QR code from inside Expo Go.
4. Allow location access when asked, so the Weather tab can show your current location.

If the phone can't connect (for example on a guest or office network), run `npx expo start --tunnel` instead.

### Run it in a browser (for quick checks during development)
```bash
npm run web
```
Open the URL it prints. Note that in a browser the tabs appear at the top instead of the bottom, and flags may show as letters on Windows.

### Useful commands
| Command | What it does |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run web` | Run in a browser |
| `npm test` | Run the unit tests (Jest) |
| `npm run typecheck` | Check TypeScript types |
| `npm run lint` | Run ESLint |
| `npx expo-doctor` | Check for dependency and configuration problems |

### Building a real iOS app (later)
Expo's cloud service, EAS, can build and sign the iOS app without a Mac:
```bash
npx eas-cli@latest build -p ios      # needs an Apple Developer account
npx eas-cli@latest submit -p ios     # upload to TestFlight / App Store
```
Before the first store build, change `ios.bundleIdentifier` in `app.json` (currently `com.convert.app`) to an identifier you own.

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | [Expo](https://expo.dev) SDK 58 · React Native 0.88 · React 19.3 |
| Language | TypeScript 6 (strict) |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routes). Native tabs (`expo-router/native-tabs`) give the real iOS tab bar, and each tab has its own native stack with a large-title header |
| Icons | `expo-symbols`: SF Symbols on iOS, Material Symbols on Android and web |
| State | [Zustand](https://github.com/pmndrs/zustand) 5 with the `persist` middleware |
| Storage | `@react-native-async-storage/async-storage` |
| Location | `expo-location` (location only while the app is in use, plus reverse geocoding for the city name) |
| Haptics | `expo-haptics` |
| Testing | Jest 30 with `jest-expo` |
| Linting | ESLint 9 with `eslint-config-expo` |

### Data sources (both free, no API key needed)
| Data | Service | Endpoint |
| --- | --- | --- |
| Forecast | [Open-Meteo](https://open-meteo.com/) | `api.open-meteo.com/v1/forecast` |
| City search | Open-Meteo Geocoding | `geocoding-api.open-meteo.com/v1/search` |
| Exchange rates | [ExchangeRate-API (open access)](https://www.exchangerate-api.com/docs/free) | `open.er-api.com/v6/latest/USD` |

Temperatures are downloaded in °C and converted to °F on the phone. Exchange rates are quoted against USD, so any pair converts as `amount / rate[from] × rate[to]`.

### Project structure
```
app/                          Screens (Expo Router: every file is a route)
  _layout.tsx                 Root stack and theme; waits for saved data to load
  (tabs)/_layout.tsx          Native bottom tabs
  (tabs)/(weather)/index.tsx  Weather tab: location pages you swipe between
  (tabs)/currency/index.tsx   Currency tab
  (tabs)/measure/index.tsx    Measure tab
  city-search.tsx             Modal: search for and add a city
  settings/currency.tsx       Modal: default currency pair and favorites
  settings/measure.tsx        Modal: default unit pairs
src/
  api/weather.ts              Open-Meteo forecast + geocoding clients
  api/rates.ts                Exchange-rate client
  lib/temperature.ts          °C ↔ °F helpers
  lib/units.ts                Unit list (each with a factor to grams or metres) and conversion
  lib/currency.ts             Currency conversion, names and flags
  lib/format.ts               Input parsing and number formatting
  lib/time.ts                 Formats each location's local times
  hooks/                      useCurrentPlace, useForecast, useRates
  store/useAppStore.ts        Saved state (cities, defaults, favorites, cached data)
  components/                 Shared UI (ConverterCard, PickerSheet, DualTemp, WeatherPage …)
components/, constants/       Theme helpers and the iOS-style colors
__tests__/                    Unit tests
```

### Adding a measurement unit
Add an entry to `UNITS` in `src/lib/units.ts`. Its `factor` is how many base units (grams for weight, metres for distance) one of the new unit equals. Pickers, the "all units" table and conversions pick it up automatically.

---

## License

<!--
TODO: Choose a license before sharing this code publicly.
The Expo template's MIT LICENSE (which named Expo as copyright holder) was removed.
Options: MIT or Apache-2.0 (permissive), or keep no license (all rights reserved).
Pick one at https://choosealicense.com and add a LICENSE file with your name.
-->

No license has been chosen yet. All rights reserved.
