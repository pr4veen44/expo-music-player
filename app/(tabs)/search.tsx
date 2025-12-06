import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmDialog from "../../components/ConfirmDialog";
import Icon from "../../components/Icon";
import SongRow from "../../components/SongRow";
import { Song, useAudio } from "../../context/AudioContext";

export default function SearchScreen() {
  const router = useRouter();
  const { allSongs, playlists, playSong, addToPlaylist, removeSong } = useAudio();
  const [query, setQuery] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [playlistPickerVisible, setPlaylistPickerVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  const songResults = useMemo(() => {
    if (!normalizedQuery) return allSongs.slice(0, 10);
    return allSongs.filter((song) =>
      `${song.name} ${song.artist || ""}`.toLowerCase().includes(normalizedQuery)
    );
  }, [allSongs, normalizedQuery]);

  const playlistResults = useMemo(() => {
    if (!normalizedQuery) return playlists.slice(0, 6);
    return playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(normalizedQuery)
    );
  }, [playlists, normalizedQuery]);

  const emptyState =
    normalizedQuery.length > 0 &&
    songResults.length === 0 &&
    playlistResults.length === 0;

  const handleSongPress = (song: Song) => {
    playSong(song, allSongs);
  };

  const openSongOptions = (song: Song) => {
    setSelectedSong(song);
    setOptionsVisible(true);
  };

  const handleRemoveSong = () => {
    if (!selectedSong) return;
    setConfirmVisible(true);
  };

  const confirmRemove = async () => {
    if (!selectedSong) return;
    await removeSong(selectedSong.id);
    setSelectedSong(null);
    setOptionsVisible(false);
    setConfirmVisible(false);
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!selectedSong) return;
    await addToPlaylist(playlistId, selectedSong);
    setPlaylistPickerVisible(false);
    setSelectedSong(null);
    setOptionsVisible(false);
  };

  return (
    <LinearGradient
      colors={["#2b0542", "#121212", "#000000"]}
      locations={[0, 0.4, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Search</Text>
            <Text style={styles.subtitle}>
              Find songs, playlists, and artists from your library.
            </Text>
          </View>

          <View style={styles.searchBar}>
            <Icon name="search" size={18} color="#b3b3b3" />
            <TextInput
              placeholder="Search your music"
              placeholderTextColor="#757575"
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Icon name="close-circle" size={16} color="#b3b3b3" />
              </TouchableOpacity>
            )}
          </View>

          {emptyState ? (
            <View style={styles.emptyState}>
              <Icon name="search" size={48} color="#2f2f2f" />
              <Text style={styles.emptyTitle}>No matches found</Text>
              <Text style={styles.emptyText}>
                Try a different keyword or add more music to your library.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Songs</Text>
                {songResults.length === 0 ? (
                  <Text style={styles.helperText}>No songs yet.</Text>
                ) : (
                  songResults.map((song) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      onPress={() => handleSongPress(song)}
                      onOptionPress={() => openSongOptions(song)}
                    />
                  ))
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Playlists</Text>
                {playlistResults.length === 0 ? (
                  <Text style={styles.helperText}>No playlists yet.</Text>
                ) : (
                  playlistResults.map((playlist) => (
                    <TouchableOpacity
                      key={playlist.id}
                      style={styles.playlistRow}
                      onPress={() => router.push(`/playlist/${playlist.id}` as any)}
                    >
                      <View style={styles.playlistIcon}>
                        <Icon name="musical-notes" size={18} color="#fff" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.playlistName}>{playlist.name}</Text>
                        <Text style={styles.playlistMeta}>
                          {playlist.songs.length} songs
                        </Text>
                      </View>
                      <Icon
                        name="chevron-forward"
                        size={16}
                        color="#6f6f6f"
                      />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal transparent visible={optionsVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.optionsContent}>
            <Text style={styles.modalTitle}>{selectedSong?.name}</Text>
            <TouchableOpacity
              style={styles.optionsButton}
              onPress={() => {
                setOptionsVisible(false);
                setPlaylistPickerVisible(true);
              }}
            >
              <Icon name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.optionsButtonText}>Add to playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionsButton} onPress={handleRemoveSong}>
              <Icon name="trash" size={20} color="#f87171" />
              <Text style={[styles.optionsButtonText, styles.dangerText]}>
                Remove from library
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setOptionsVisible(false);
                setSelectedSong(null);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={playlistPickerVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Playlist</Text>
            {playlists.length === 0 ? (
              <Text style={styles.noPlaylistsText}>No playlists created yet.</Text>
            ) : (
              playlists.map((playlist) => (
                <TouchableOpacity
                  key={playlist.id}
                  style={styles.playlistOption}
                  onPress={() => handleAddToPlaylist(playlist.id)}
                >
                  <Icon
                    name="musical-notes"
                    size={18}
                    color="#fff"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={styles.playlistOptionText}>{playlist.name}</Text>
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setPlaylistPickerVisible(false);
                setSelectedSong(null);
              }}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ConfirmDialog
        visible={confirmVisible}
        title="Remove song?"
        message="This removes it from your library and playlists."
        confirmLabel="Remove"
        destructive
        onConfirm={confirmRemove}
        onCancel={() => setConfirmVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 24,
  },
  header: {
    marginTop: 8,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#b3b3b3",
    marginTop: 6,
    fontSize: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  section: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  helperText: {
    color: "#b3b3b3",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  playlistIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#2e2e2e",
    justifyContent: "center",
    alignItems: "center",
  },
  playlistName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  playlistMeta: {
    color: "#8d8d8d",
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
  },
  emptyText: {
    color: "#9f9f9f",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
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
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  noPlaylistsText: {
    color: "#b3b3b3",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  playlistOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  playlistOptionText: {
    color: "#fff",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 10,
  },
  closeButtonText: {
    color: "#c7a6ff",
    fontWeight: "bold",
    fontSize: 16,
  },
  optionsContent: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "#1b1b1b",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 24,
    gap: 16,
  },
  optionsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  optionsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerText: {
    color: "#f87171",
  },
});

