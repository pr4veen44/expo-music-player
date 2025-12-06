import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { useAudio } from '../context/AudioContext';

export default function MiniPlayer() {
    const { currentSong, isPlaying, pauseSong, resumeSong, position, duration } = useAudio();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    if (!currentSong) return null;

    const progress = duration ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    bottom: insets.bottom + 72,
                },
            ]}
            activeOpacity={0.9}
            onPress={() => router.push('/player')}
        >
            <LinearGradient colors={['#281133', '#1a1a1a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
                <View style={styles.content}>
                    <View style={styles.imagePlaceholder}>
                        <Icon name="musical-note" size={18} color="#d8c6ff" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title} numberOfLines={1}>{currentSong.name}</Text>
                        <Text style={styles.artist} numberOfLines={1}>{currentSong.artist || 'Unknown Artist'}</Text>
                    </View>
                    <TouchableOpacity onPress={isPlaying ? pauseSong : resumeSong} style={styles.playButton}>
                        <Icon name={isPlaying ? "pause" : "play"} size={20} color="#080808" />
                    </TouchableOpacity>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progress, { width: `${progress}%` }]} />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
    },
    gradient: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 6,
    },
    imagePlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    artist: {
        color: '#c7c7c7',
        fontSize: 12,
        marginTop: 2,
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBar: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        backgroundColor: '#8a2be2',
    },
});
