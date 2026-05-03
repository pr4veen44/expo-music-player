# Audio Player (Expo + React Native)

A modern local-audio music player built using **Expo**, **expo-av**, and **Expo Router**, featuring playlists, a global audio context, a persistent mini-player, and smooth filesystem-based navigation.

---

## Features

**Playback Engine**

-   Powered by **expo-av** (`Audio.Sound`)

-   Global **AudioContext** manages:

    -   Loading & unloading tracks

    -   Play / pause / seek

    -   Playback status tracking (position, duration, isPlaying)

    -   Queue management (next, previous, set queue, set current)

-   Single shared audio instance across the app for smooth transitions

**Navigation (Expo Router)**

-   Bottom tab navigation inside `app/(tabs)`

-   Dynamic route pages (e.g., `/playlist/[id]`)

-   Modal routes for overlays

-   MiniPlayer placed inside the root layout to remain visible everywhere

**UI Components**

-   `MiniPlayer.tsx` --- responsive miniplayer bar

-   `SongRow.tsx` --- song list item with action menu

-   Reusable themed UI: `ThemedText`, `ThemedView`

-   Custom dialogs & parallax scroll integration

**Library & Playlists**

-   Song library stored in central state

-   Dynamic playlist pages (`playlist/[id].tsx`)

-   Add/remove songs from playlists

-   Playlists can trigger queue updates and playback immediately

**Theming**

-   Global theme in `constants/theme.ts`

-   Dark mode foundation with purple accent colors

-   Theme-aware components via `useThemeColor`

---

## Directory Structure

```
app/
├── (tabs)/
│   ├── index.tsx        # Home
│   ├── library.tsx      # Library
│   ├── search.tsx       # Search
│   ├── profile.tsx      # Profile
│   └── _layout.tsx      # Tab layout
│
├── playlist/
│   └── [id].tsx         # Playlist detail screen
│
├── player.tsx           # Fullscreen player
├── modal.tsx            # Modal screen
└── _layout.tsx          # Root layout

components/
├── MiniPlayer.tsx
├── SongRow.tsx
└── ui/

context/
└── AudioContext.tsx     # Playback state & controls

constants/
└── theme.ts

assets/
scripts/
```

---

## Installation

```
npm install
npx expo start
```

Run on emulator or device

```
npx expo run:android
npx expo run:ios
```

---

## AudioContext Overview

Handles the entire audio lifecycle:

-   Controls for:

    -   `play()`

    -   `pause()`

    -   `seek(ms)`

    -   `loadTrack(uri)`

-   Maintains:

    -   Current track info

    -   Playback state

    -   Queue & current index

-   Subscribes to playback status updates and exposes them to UI components

-   Used by the MiniPlayer, full player screen, playlists, and library

---

## Routing Overview

-   `/` → Home

-   `/player` → Fullscreen player

-   `/playlist/[id]` → Playlist detail page

-   `(tabs)` folder manages bottom tab navigation

-   MiniPlayer rendered globally, visible across all screens

---

## Development Commands

Reset Expo cache:

`npx expo start -c`

Reset project files:

`node scripts/reset-project.js`
