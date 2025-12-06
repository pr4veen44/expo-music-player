import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../components/Icon";
import { useAudio } from "../../context/AudioContext";

const STORAGE_KEY = "user_name";

export default function ProfileScreen() {
  const { playlists, favorites, allSongs } = useAudio();
  const [name, setName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [askingForName, setAskingForName] = useState(false);

  useEffect(() => {
    const loadName = async () => {
      const savedName = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedName) {
        setName(savedName);
        setInputValue(savedName);
      } else {
        setAskingForName(true);
      }
    };
    loadName();
  }, []);

  const handleSaveName = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed.length) return;
    setName(trimmed);
    await AsyncStorage.setItem(STORAGE_KEY, trimmed);
    setAskingForName(false);
  };

  const profileLetter = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <LinearGradient
      colors={["#2b0542", "#121212", "#000000"]}
      locations={[0, 0.4, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            onPress={() => {
              setInputValue(name);
              setAskingForName(true);
            }}
            style={styles.editButton}
          >
            <Icon name="create-outline" size={16} color="#fff" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{profileLetter}</Text>
          </View>
          <View>
            <Text style={styles.nameText}>
              {name || "Tell us your name to personalize the app."}
            </Text>
            {name ? (
              <Text style={styles.caption}>Welcome back 👋</Text>
            ) : (
              <TouchableOpacity onPress={() => setAskingForName(true)}>
                <Text style={styles.promptLink}>Tap to introduce yourself</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatPill label="Songs" value={allSongs.length} icon="musical-notes" />
          <StatPill label="Playlists" value={playlists.length} icon="list" />
          <StatPill label="Favorites" value={favorites.length} icon="heart" />
        </View>

        {/*<View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <TouchableOpacity style={styles.row}>
            <Icon name="moon" size={18} color="#fff" />
            <View style={styles.rowTextWrapper}>
              <Text style={styles.rowTitle}>Dark mode</Text>
              <Text style={styles.rowSubtitle}>
                Optimized for low-light listening
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Icon name="notifications" size={18} color="#fff" />
            <View style={styles.rowTextWrapper}>
              <Text style={styles.rowTitle}>Notifications</Text>
              <Text style={styles.rowSubtitle}>
                Stay updated with playback activity
              </Text>
            </View>
          </TouchableOpacity>
        </View>*/}
      </SafeAreaView>

      <Modal
        animationType="fade"
        visible={askingForName}
        transparent
        onRequestClose={() => {
          if (name) {
            setAskingForName(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What&apos;s your name?</Text>
            <Text style={styles.modalSubtitle}>
              We&apos;ll use it to personalize your profile tile.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your name"
              placeholderTextColor="#666"
              value={inputValue}
              onChangeText={setInputValue}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <TouchableOpacity
              style={[
                styles.saveButton,
                { opacity: inputValue.trim() ? 1 : 0.4 },
              ]}
              disabled={!inputValue.trim()}
              onPress={handleSaveName}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

function StatPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <View style={styles.statPill}>
      <Icon name={icon} size={20} color="#c7a6ff" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 32,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#402061",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
  },
  nameText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  caption: {
    color: "#9c9c9c",
    marginTop: 6,
    fontSize: 14,
  },
  promptLink: {
    marginTop: 6,
    color: "#c7a6ff",
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  statPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    marginHorizontal: 6,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 6,
  },
  statValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    color: "#b3b3b3",
    fontSize: 13,
  },
  settingsCard: {
    marginTop: 32,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 6,
  },
  rowTextWrapper: {
    flex: 1,
  },
  rowTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  rowSubtitle: {
    color: "#8d8d8d",
    fontSize: 13,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "#1b1b1b",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 24,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  modalSubtitle: {
    color: "#9c9c9c",
    marginTop: 6,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: "#262626",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 14,
    backgroundColor: "#8a2be2",
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

