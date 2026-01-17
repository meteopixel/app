# Meteopixel App

A React Native mobile and web app for visualizing weather station data in real-time. Compare your station measurements with official weather data from Open-Meteo.

This is our IDPA project for our BM. The idea was to build a weather station and create a system to collect and compare the data we collect to official sources (OpenMeteo API). We have two main components: a [Go backend](https://github.com/meteopixel/backend) which handles storage, ingestion, and comparison of the data points, and this React Native frontend to visualize these things instantly.

Built with Expo and React Native, using React Query for data fetching and NativeWind for styling.

## Tech Stack

- [Expo](https://expo.dev/) 
- [Expo Router](https://docs.expo.dev/router/introduction/) 
- [React Query](https://tanstack.com/query) 
- [NativeWind](https://www.nativewind.dev/) 
- [React Native MMKV](https://github.com/mrousavy/react-native-mmkv) ^

## Getting Started

Install dependencies:

```bash
bun install
```

Then run it:

```bash
bun run start
```


## Configuration

On first launch, the app will prompt you to choose a server URL. The default is the hosted instance, but you can enter your own backend URL (e.g., `http://127.0.0.1:8080`). You can change this later by going back to the onboarding screen from the login page.
