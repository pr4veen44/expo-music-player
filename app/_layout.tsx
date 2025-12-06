import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import MiniPlayer from "../components/MiniPlayer";
import { AudioProvider } from "../context/AudioContext";

export default function Layout() {
  const pathname = usePathname();
  const showMiniPlayer = !pathname.includes("/player");

  return (
    <AudioProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: "#121212" }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#121212" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="player" options={{ headerShown: false }} />
          <Stack.Screen name="playlist/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ headerShown: false, presentation: "transparentModal" }}
          />
        </Stack>
        {showMiniPlayer && <MiniPlayer />}
      </View>
    </AudioProvider>
  );
}
