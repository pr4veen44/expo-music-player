import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmDialog from "../../components/ConfirmDialog";
import Icon from "../../components/Icon";
import SongRow from "../../components/SongRow";
import { Song, useAudio } from "../../context/AudioContext";

export default function Home() {
    const { playSong, playlists, addToPlaylist, allSongs, addSongs, removeSong } = useAudio();
    const [greeting, setGreeting] = useState("Good Morning");
    const [playlistPickerVisible, setPlaylistPickerVisible] = useState(false);
    const [songOptionsVisible, setSongOptionsVisible] = useState(false);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [confirmVisible, setConfirmVisible] = useState(false);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    const pickSongs = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "audio/mpeg",
                multiple: true,
                copyToCacheDirectory: true,
            });

            if (!result.assets) return;

            const newSongs: Song[] = result.assets.map((file) => ({
                id: file.uri, // Use URI as ID for now
                uri: file.uri,
                name: file.name.replace('.mp3', ''),
                artist: 'Unknown Artist',
            }));

            await addSongs(newSongs);
        } catch (err) {
            console.log("Error picking songs", err);
        }
    };

    const openSongOptions = (song: Song) => {
        setSelectedSong(song);
        setSongOptionsVisible(true);
    };

    const closeSongOptions = () => {
        setSongOptionsVisible(false);
    };

    const handleAddToPlaylist = async (playlistId: string) => {
        if (selectedSong) {
            await addToPlaylist(playlistId, selectedSong);
            setPlaylistPickerVisible(false);
            setSelectedSong(null);
            closeSongOptions();
        }
    };

    const handleRemoveSong = () => {
        if (!selectedSong) return;
        setConfirmVisible(true);
    };

    const confirmRemoveSong = async () => {
        if (!selectedSong) return;
        await removeSong(selectedSong.id);
        setSelectedSong(null);
        setConfirmVisible(false);
        closeSongOptions();
    };

    return (
        <LinearGradient
            colors={['#2b0542', '#121212', '#000000']} // Deep purple to black
            locations={[0, 0.4, 1]}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.greeting}>{greeting}</Text>

                    </View>

                    <View style={styles.actionsContainer}>
                        <TouchableOpacity onPress={pickSongs} style={styles.actionButton}>
                            <LinearGradient
                                colors={['#8a2be2', '#4b0082']} // BlueViolet to Indigo
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientButton}
                            >
                                <Icon name="add-circle-outline" size={24} color="#fff" />
                                <Text style={styles.actionText}>Import Music</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Recently Added</Text>

                    {allSongs.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Icon name="musical-notes" size={56} color="#333" />
                            <Text style={styles.emptyText}>Your library is empty</Text>
                            <Text style={styles.emptySubText}>Import songs to start listening</Text>
                        </View>
                    ) : (
                        <View style={styles.songList}>
                            {allSongs.map((song) => (
                                <SongRow
                                    key={song.id}
                                    song={song}
                                    onPress={() => playSong(song, allSongs)}
                                    onOptionPress={() => openSongOptions(song)}
                                />
                            ))}
                        </View>
                    )}
                </ScrollView>

                <Modal transparent visible={songOptionsVisible} animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.optionsContent}>
                            <Text style={styles.modalTitle}>{selectedSong?.name}</Text>
                            <TouchableOpacity
                                style={styles.optionsButton}
                                onPress={() => {
                                    setSongOptionsVisible(false);
                                    setPlaylistPickerVisible(true);
                                }}
                            >
                                <Icon name="add-circle-outline" size={20} color="#fff" />
                                <Text style={styles.optionsButtonText}>Add to playlist</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.optionsButton}
                                onPress={handleRemoveSong}
                            >
                                <Icon name="trash" size={20} color="#f87171" />
                                <Text style={[styles.optionsButtonText, styles.dangerText]}>
                                    Remove from library
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.closeButton} onPress={closeSongOptions}>
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
                                playlists.map(playlist => (
                                    <TouchableOpacity
                                        key={playlist.id}
                                        style={styles.playlistOption}
                                        onPress={() => handleAddToPlaylist(playlist.id)}
                                    >
                                        <Icon name="musical-notes" size={18} color="#fff" style={{ marginRight: 10 }} />
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
            </SafeAreaView>
            <ConfirmDialog
                visible={confirmVisible}
                title="Remove song?"
                message="This removes it from your library and playlists."
                confirmLabel="Remove"
                destructive
                onConfirm={confirmRemoveSong}
                onCancel={() => setConfirmVisible(false)}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 120 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 30,
    },
    greeting: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
    headerIcons: {
        flexDirection: 'row',
    },
    icon: {
        marginLeft: 20,
        opacity: 0.8,
    },
    actionsContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    actionButton: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#8a2be2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
    },
    actionText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 10,
        fontSize: 18,
    },
    sectionTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        marginLeft: 20,
        marginBottom: 15,
        letterSpacing: 0.5,
    },
    songList: {
        paddingHorizontal: 10,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
        opacity: 0.7,
    },
    emptyText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptySubText: {
        color: '#b3b3b3',
        marginTop: 8,
        fontSize: 16,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#1e1e1e',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#333',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    noPlaylistsText: {
        color: '#b3b3b3',
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16,
    },
    playlistOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    playlistOptionText: {
        color: '#fff',
        fontSize: 16,
    },
    optionsContent: {
        width: '80%',
        backgroundColor: '#1e1e1e',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#333',
        gap: 16,
    },
    optionsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    optionsButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    dangerText: {
        color: '#f87171',
    },
    closeButton: {
        marginTop: 20,
        alignItems: 'center',
        paddingVertical: 10,
    },
    closeButtonText: {
        color: '#8a2be2',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
