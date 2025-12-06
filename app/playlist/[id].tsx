import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmDialog from "../../components/ConfirmDialog";
import Icon from "../../components/Icon";
import SongRow from "../../components/SongRow";
import { Song, useAudio } from "../../context/AudioContext";

export default function PlaylistDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { playlists, favorites, playSong, toggleFavorite, removeFromPlaylist, addToPlaylist, allSongs } = useAudio();
    const [addSongsVisible, setAddSongsVisible] = useState(false);
    const [pendingRemoval, setPendingRemoval] = useState<Song | null>(null);

    const isFavorites = id === 'favorites';
    const resolvedPlaylist = isFavorites
        ? { name: 'Liked Songs', songs: favorites, id: 'favorites' }
        : playlists.find(p => p.id === id);

    const availableSongs = resolvedPlaylist
        ? allSongs.filter(song => !resolvedPlaylist.songs.some(s => s.id === song.id))
        : [];

    if (!resolvedPlaylist) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Playlist not found</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const playlist = resolvedPlaylist;

    const handlePlaySong = (song: Song) => {
        playSong(song, playlist.songs);
    };

    const handlePlayAll = () => {
        if (playlist.songs.length > 0) {
            playSong(playlist.songs[0], playlist.songs);
        }
    };

    const handleShufflePlay = () => {
        if (playlist.songs.length === 0) return;
        const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
        playSong(shuffled[0], shuffled);
    };

    const handleOptionPress = (song: Song) => {
        setPendingRemoval(song);
    };

    const handleAddSongToPlaylist = async (song: Song) => {
        await addToPlaylist(playlist.id, song);
    };

    return (
        <LinearGradient colors={['#2b0542', '#121212', '#000']} locations={[0, 0.3, 1]} style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{playlist.name}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.playlistHeader}>
                    <LinearGradient
                        colors={isFavorites ? ['#450af5', '#8a2be2'] : ['#333', '#1a1a1a']}
                        style={styles.artwork}
                    >
                        <Icon name={isFavorites ? "heart" : "musical-notes"} size={60} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.playlistName}>{playlist.name}</Text>
                    <Text style={styles.songCount}>{playlist.songs.length} songs</Text>
                </View>

                {playlist.songs.length > 0 && (
                    <View style={styles.playlistActions}>
                        <TouchableOpacity style={styles.actionButton} onPress={handlePlayAll}>
                            <Icon name="play" size={18} color="#000" />
                            <Text style={styles.actionButtonText}>Play All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]} onPress={handleShufflePlay}>
                            <Icon name="shuffle" size={18} color="#fff" />
                            <Text style={[styles.actionButtonText, { color: '#fff' }]}>Shuffle</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!isFavorites && (
                    <TouchableOpacity style={styles.addSongsButton} onPress={() => setAddSongsVisible(true)}>
                        <Icon name="add" size={18} color="#fff" />
                        <Text style={styles.addSongsText}>Add songs</Text>
                    </TouchableOpacity>
                )}

                <FlatList
                    data={playlist.songs}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <SongRow
                            song={item}
                            onPress={() => handlePlaySong(item)}
                            onOptionPress={() => handleOptionPress(item)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                />
            </SafeAreaView>

            {!isFavorites && (
                <Modal transparent visible={addSongsVisible} animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Add songs to {playlist.name}</Text>
                            {availableSongs.length === 0 ? (
                                <Text style={styles.noSongsText}>All your songs are already in this playlist.</Text>
                            ) : (
                                <ScrollView style={{ maxHeight: 350 }}>
                                    {availableSongs.map(song => (
                                        <TouchableOpacity
                                            key={song.id}
                                            style={styles.addSongRow}
                                            onPress={async () => {
                                                await handleAddSongToPlaylist(song);
                                            }}
                                        >
                                            <View>
                                                <Text style={styles.addSongTitle}>{song.name}</Text>
                                                <Text style={styles.addSongSubtitle}>{song.artist || 'Unknown Artist'}</Text>
                                            </View>
                                            <Icon name="add-circle-outline" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                            <TouchableOpacity style={styles.closeButton} onPress={() => setAddSongsVisible(false)}>
                                <Text style={styles.closeButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
            <ConfirmDialog
                visible={!!pendingRemoval}
                title="Remove from playlist?"
                message="This will only remove the song from this playlist."
                confirmLabel="Remove"
                destructive
                onConfirm={async () => {
                    if (!pendingRemoval) return;
                    if (isFavorites) {
                        await toggleFavorite(pendingRemoval);
                    } else {
                        await removeFromPlaylist(playlist.id, pendingRemoval.id);
                    }
                    setPendingRemoval(null);
                }}
                onCancel={() => setPendingRemoval(null)}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        maxWidth: '70%',
    },
    errorText: { color: '#fff', fontSize: 18, textAlign: 'center', marginTop: 50 },
    backText: { color: '#1db954', fontSize: 16, textAlign: 'center', marginTop: 20 },
    playlistHeader: {
        alignItems: 'center',
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        marginBottom: 10,
    },
    playlistActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderRadius: 999,
    },
    secondaryAction: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    actionButtonText: {
        fontWeight: '700',
        color: '#000',
        textTransform: 'uppercase',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    addSongsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
        gap: 8,
        marginBottom: 10,
    },
    addSongsText: {
        color: '#fff',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    artwork: {
        width: 160,
        height: 160,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    playlistName: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    songCount: {
        color: '#b3b3b3',
        fontSize: 14,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 120,
        paddingHorizontal: 10,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#1e1e1e',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    noSongsText: {
        color: '#b3b3b3',
        textAlign: 'center',
        marginBottom: 16,
    },
    addSongRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    addSongTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    addSongSubtitle: {
        color: '#b3b3b3',
        fontSize: 13,
    },
    closeButton: {
        marginTop: 16,
        alignItems: 'center',
        paddingVertical: 10,
    },
    closeButtonText: {
        color: '#c7a6ff',
        fontWeight: '700',
    },
});
