import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmDialog from "../components/ConfirmDialog";
import Icon from "../components/Icon";
import { useAudio } from "../context/AudioContext";

export default function PlayerScreen() {
    const router = useRouter();
    const {
        currentSong,
        isPlaying,
        duration,
        position,
        pauseSong,
        resumeSong,
        nextSong,
        prevSong,
        seek,
        isShuffle,
        repeatMode,
        toggleShuffle,
        toggleRepeat,
        favorites,
        toggleFavorite,
        playlists,
        addToPlaylist,
        removeSong
    } = useAudio();

    const [sliderValue, setSliderValue] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [playlistPickerVisible, setPlaylistPickerVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);

    useEffect(() => {
        if (!isSeeking && duration > 0) {
            setSliderValue(position / duration);
        }
    }, [position, duration, isSeeking]);

    const formatTime = (millis: number) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return `${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`;
    };

    const handleSlidingComplete = async (value: number) => {
        const seekPosition = value * duration;
        await seek(seekPosition);
        setIsSeeking(false);
    };

    if (!currentSong) {
        return (
            <View style={styles.container}>
                <Text style={{ color: "#fff" }}>No song playing</Text>
            </View>
        );
    }

    const isFavorite = favorites.some(f => f.uri === currentSong.uri);

    return (
        <LinearGradient
            colors={['#2b0542', '#121212', '#000']}
            locations={[0, 0.5, 1]}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <Icon name="chevron-down" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Now Playing</Text>
                    <TouchableOpacity style={styles.headerButton} onPress={() => setOptionsVisible(true)}>
                        <Icon name="ellipsis-horizontal" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.artworkContainer}>
                    <View style={styles.artworkWrapper}>
                        <LinearGradient
                            colors={['#333', '#1a1a1a']}
                            style={styles.artworkPlaceholder}
                        >
                            <Icon name="musical-note" size={96} color="#666" />
                        </LinearGradient>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.textContainer}>
                        <Text style={styles.songTitle} numberOfLines={1}>{currentSong.name}</Text>
                        <Text style={styles.artistName} numberOfLines={1}>{currentSong.artist || "Unknown Artist"}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleFavorite(currentSong)}>
                        <Icon
                            name="heart"
                            size={22}
                            color={isFavorite ? "#1db954" : "#fff"}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.progressContainer}>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={1}
                        value={sliderValue}
                        onSlidingStart={() => setIsSeeking(true)}
                        onSlidingComplete={handleSlidingComplete}
                        minimumTrackTintColor="#fff"
                        maximumTrackTintColor="rgba(255,255,255,0.3)"
                        thumbTintColor="#fff"
                    />
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>{formatTime(position)}</Text>
                        <Text style={styles.timeText}>{formatTime(duration)}</Text>
                    </View>
                </View>

                <View style={styles.controlsContainer}>
                    <TouchableOpacity onPress={toggleShuffle}>
                        <Icon
                            name="shuffle"
                            size={22}
                            color={isShuffle ? "#1db954" : "#b3b3b3"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={prevSong}>
                        <Icon name="play-skip-back" size={30} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={isPlaying ? pauseSong : resumeSong} style={styles.playButton}>
                        <Icon name={isPlaying ? "pause" : "play"} size={32} color="#000" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={nextSong}>
                        <Icon name="play-skip-forward" size={30} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleRepeat}>
                        <View>
                            <Icon
                                name="repeat"
                                size={22}
                                color={repeatMode !== 'OFF' ? "#1db954" : "#b3b3b3"}
                            />
                            {repeatMode === 'ONE' && (
                                <Text style={styles.repeatOneIndicator}>1</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                <Modal transparent visible={optionsVisible} animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.optionsContent}>
                            <Text style={styles.modalTitle}>{currentSong?.name}</Text>
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
                            <TouchableOpacity style={styles.optionsButton} onPress={() => setConfirmVisible(true)}>
                                <Icon name="trash" size={20} color="#f87171" />
                                <Text style={[styles.optionsButtonText, styles.dangerText]}>
                                    Remove from library
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setOptionsVisible(false)}>
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
                                        onPress={async () => {
                                            if (!currentSong) return;
                                            await addToPlaylist(playlist.id, currentSong);
                                            setPlaylistPickerVisible(false);
                                        }}
                                    >
                                        <Icon name="musical-notes" size={18} color="#fff" style={{ marginRight: 10 }} />
                                        <Text style={styles.playlistOptionText}>{playlist.name}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                            <TouchableOpacity style={styles.closeButton} onPress={() => setPlaylistPickerVisible(false)}>
                                <Text style={styles.closeButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <ConfirmDialog
                    visible={confirmVisible}
                    title="Remove song?"
                    message="This removes the song from your library and playlists."
                    confirmLabel="Remove"
                    destructive
                    onConfirm={async () => {
                        if (!currentSong) return;
                        await removeSong(currentSong.id);
                        setConfirmVisible(false);
                        setOptionsVisible(false);
                        setPlaylistPickerVisible(false);
                        router.back();
                    }}
                    onCancel={() => setConfirmVisible(false)}
                />
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 30,
    },
    headerButton: {
        padding: 10,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    artworkContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 40,
        paddingHorizontal: 30,
    },
    artworkWrapper: {
        width: '100%',
        aspectRatio: 1,
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    artworkPlaceholder: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    infoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 30,
        marginBottom: 30,
    },
    textContainer: {
        flex: 1,
        marginRight: 20,
    },
    songTitle: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
    },
    artistName: {
        color: "#b3b3b3",
        fontSize: 18,
    },
    progressContainer: {
        paddingHorizontal: 30,
        marginBottom: 30,
    },
    slider: {
        width: "100%",
        height: 40,
    },
    timeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: -10,
    },
    timeText: {
        color: "#b3b3b3",
        fontSize: 12,
        fontWeight: "500",
    },
    controlsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 30,
        paddingBottom: 40,
    },
    playButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },
    repeatOneIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1db954',
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
