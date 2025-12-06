import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Song {
    uri: string;
    name: string;
    id: string; // unique identifier
    artist?: string;
    album?: string;
    image?: string;
}

export interface Playlist {
    id: string;
    name: string;
    songs: Song[];
}

export type RepeatMode = 'OFF' | 'ALL' | 'ONE';

interface AudioContextType {
    currentSong: Song | null;
    isPlaying: boolean;
    soundObj: Audio.Sound | null;
    queue: Song[];
    playlists: Playlist[];
    favorites: Song[];
    allSongs: Song[];
    isShuffle: boolean;
    repeatMode: RepeatMode;
    playSong: (song: Song, newQueue?: Song[]) => Promise<void>;
    pauseSong: () => Promise<void>;
    resumeSong: () => Promise<void>;
    nextSong: () => Promise<void>;
    prevSong: () => Promise<void>;
    seek: (positionMillis: number) => Promise<void>;
    addToPlaylist: (playlistId: string, song: Song) => Promise<void>;
    removeFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
    renamePlaylist: (playlistId: string, name: string) => Promise<void>;
    deletePlaylist: (playlistId: string) => Promise<void>;
    createPlaylist: (name: string) => Promise<void>;
    toggleFavorite: (song: Song) => Promise<void>;
    addSongs: (songs: Song[]) => Promise<void>;
    removeSong: (songId: string) => Promise<void>;
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    playbackStatus: AVPlaybackStatus | null;
    duration: number;
    position: number;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [soundObj, setSoundObj] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState<Song[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [favorites, setFavorites] = useState<Song[]>([]);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatus | null>(null);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('OFF');

    // Initialize data and audio mode
    useEffect(() => {
        const init = async () => {
            await loadData();
            // Configure background audio mode
            await Audio.setAudioModeAsync({
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                interruptionModeIOS: 1, // DO_NOT_MIX (numeric constant)
                shouldDuckAndroid: true,
                // interruptionModeAndroid omitted for compatibility
                playThroughEarpieceAndroid: false,
            });
        };
        init();
        return () => {
            if (soundObj) {
                soundObj.unloadAsync();
            }
        };
    }, []);

    const loadData = async () => {
        try {
            const savedPlaylists = await AsyncStorage.getItem('playlists');
            const savedFavorites = await AsyncStorage.getItem('favorites');
            const savedAllSongs = await AsyncStorage.getItem('allSongs');
            if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
            if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
            if (savedAllSongs) setAllSongs(JSON.parse(savedAllSongs));
        } catch (e) {
            console.error('Failed to load data', e);
        }
    };

    const saveData = async (key: string, value: any) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Failed to save data', e);
        }
    };

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        setPlaybackStatus(status);
        if (status.isLoaded) {
            setDuration(status.durationMillis ?? 0);
            setPosition(status.positionMillis);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
                nextSong();
            }
        }
    };

    const playSong = async (song: Song, newQueue?: Song[]) => {
        try {
            if (soundObj) {
                await soundObj.unloadAsync();
                setSoundObj(null);
            }
            const { sound } = await Audio.Sound.createAsync(
                { uri: song.uri },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );
            setSoundObj(sound);
            setCurrentSong(song);
            setIsPlaying(true);
            if (newQueue) setQueue(newQueue);
        } catch (error) {
            console.error('Error playing song', error);
        }
    };

    const pauseSong = async () => {
        if (soundObj) {
            await soundObj.pauseAsync();
            setIsPlaying(false);
        }
    };

    const resumeSong = async () => {
        if (soundObj) {
            await soundObj.playAsync();
            setIsPlaying(true);
        }
    };

    const nextSong = async () => {
        if (!currentSong || queue.length === 0) return;
        if (repeatMode === 'ONE') {
            await seek(0);
            await resumeSong();
            return;
        }
        const currentIndex = queue.findIndex(s => s.uri === currentSong.uri);
        let nextIndex = -1;
        if (isShuffle) {
            if (queue.length > 1) {
                do {
                    nextIndex = Math.floor(Math.random() * queue.length);
                } while (nextIndex === currentIndex);
            } else {
                nextIndex = 0;
            }
        } else {
            if (currentIndex < queue.length - 1) {
                nextIndex = currentIndex + 1;
            } else if (repeatMode === 'ALL') {
                nextIndex = 0;
            }
        }
        if (nextIndex !== -1) {
            await playSong(queue[nextIndex]);
        }
    };

    const prevSong = async () => {
        if (!currentSong || queue.length === 0) return;
        if (position > 3000) {
            await seek(0);
            return;
        }
        const currentIndex = queue.findIndex(s => s.uri === currentSong.uri);
        let prevIndex = -1;
        if (isShuffle) {
            if (queue.length > 1) {
                do {
                    prevIndex = Math.floor(Math.random() * queue.length);
                } while (prevIndex === currentIndex);
            } else {
                prevIndex = 0;
            }
        } else {
            if (currentIndex > 0) {
                prevIndex = currentIndex - 1;
            } else if (repeatMode === 'ALL') {
                prevIndex = queue.length - 1;
            }
        }
        if (prevIndex !== -1) {
            await playSong(queue[prevIndex]);
        } else {
            await seek(0);
        }
    };

    const seek = async (positionMillis: number) => {
        if (soundObj) {
            await soundObj.setPositionAsync(positionMillis);
        }
    };

    const createPlaylist = async (name: string) => {
        const newPlaylist: Playlist = { id: Date.now().toString(), name, songs: [] };
        const updated = [...playlists, newPlaylist];
        setPlaylists(updated);
        saveData('playlists', updated);
    };

    const addToPlaylist = async (playlistId: string, song: Song) => {
        const updated = playlists.map(p => {
            if (p.id === playlistId) {
                return { ...p, songs: [...p.songs, song] };
            }
            return p;
        });
        setPlaylists(updated);
        saveData('playlists', updated);
    };

    const removeFromPlaylist = async (playlistId: string, songId: string) => {
        const updated = playlists.map(p => {
            if (p.id === playlistId) {
                return { ...p, songs: p.songs.filter(s => s.id !== songId) };
            }
            return p;
        });
        setPlaylists(updated);
        saveData('playlists', updated);
    };

    const renamePlaylist = async (playlistId: string, name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const updated = playlists.map(p => (p.id === playlistId ? { ...p, name: trimmed } : p));
        setPlaylists(updated);
        saveData('playlists', updated);
    };

    const deletePlaylist = async (playlistId: string) => {
        const updated = playlists.filter(p => p.id !== playlistId);
        setPlaylists(updated);
        saveData('playlists', updated);
    };

    const toggleFavorite = async (song: Song) => {
        let updated;
        if (favorites.some(f => f.uri === song.uri)) {
            updated = favorites.filter(f => f.uri !== song.uri);
        } else {
            updated = [...favorites, song];
        }
        setFavorites(updated);
        saveData('favorites', updated);
    };

    const addSongs = async (songs: Song[]) => {
        const updated = [...allSongs, ...songs];
        setAllSongs(updated);
        saveData('allSongs', updated);
    };
    const removeSong = async (songId: string) => {
        const updatedAllSongs = allSongs.filter(song => song.id !== songId);
        setAllSongs(updatedAllSongs);
        saveData('allSongs', updatedAllSongs);

        const updatedPlaylists = playlists.map(playlist => ({
            ...playlist,
            songs: playlist.songs.filter(song => song.id !== songId),
        }));
        setPlaylists(updatedPlaylists);
        saveData('playlists', updatedPlaylists);

        const updatedFavorites = favorites.filter(song => song.id !== songId);
        setFavorites(updatedFavorites);
        saveData('favorites', updatedFavorites);

        const updatedQueue = queue.filter(song => song.id !== songId);
        setQueue(updatedQueue);

        if (currentSong?.id === songId) {
            if (soundObj) {
                try {
                    await soundObj.stopAsync();
                    await soundObj.unloadAsync();
                } catch (error) {
                    console.error('Failed to stop sound', error);
                }
                setSoundObj(null);
            }
            setCurrentSong(null);
            setIsPlaying(false);
        }
    };

    const toggleShuffle = () => {
        setIsShuffle(prev => !prev);
    };

    const toggleRepeat = () => {
        setRepeatMode(prev => {
            if (prev === 'OFF') return 'ALL';
            if (prev === 'ALL') return 'ONE';
            return 'OFF';
        });
    };

    return (
        <AudioContext.Provider
            value={{
                currentSong,
                isPlaying,
                soundObj,
                queue,
                playlists,
                favorites,
                allSongs,
                isShuffle,
                repeatMode,
                playSong,
                pauseSong,
                resumeSong,
                nextSong,
                prevSong,
                seek,
                addToPlaylist,
                removeFromPlaylist,
                renamePlaylist,
                deletePlaylist,
                createPlaylist,
                toggleFavorite,
                addSongs,
                toggleShuffle,
                toggleRepeat,
                playbackStatus,
                duration,
                position,
                removeSong,
            }}
        >
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) throw new Error('useAudio must be used within an AudioProvider');
    return context;
};
