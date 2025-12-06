import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from './Icon';
import { Song } from '../context/AudioContext';

interface SongRowProps {
    song: Song;
    onPress: () => void;
    isPlaying?: boolean;
    onOptionPress?: () => void;
}

export default function SongRow({ song, onPress, isPlaying, onOptionPress }: SongRowProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.iconContainer}>
                <Icon name="musical-note" size={20} color="#b3b3b3" />
            </View>
            <View style={styles.infoContainer}>
                <Text style={[styles.title, isPlaying && styles.activeText]} numberOfLines={1}>
                    {song.name}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                    {song.artist || 'Unknown Artist'}
                </Text>
            </View>
            {onOptionPress && (
                <TouchableOpacity onPress={onOptionPress} style={styles.optionButton}>
                    <Icon name="ellipsis-vertical" size={18} color="#b3b3b3" />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#282828',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderRadius: 4,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 4,
    },
    activeText: {
        color: '#1db954',
        fontWeight: 'bold',
    },
    artist: {
        color: '#b3b3b3',
        fontSize: 14,
    },
    optionButton: {
        padding: 8,
    },
});
