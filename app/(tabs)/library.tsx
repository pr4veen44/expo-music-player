import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmDialog from '../../components/ConfirmDialog';
import Icon from '../../components/Icon';
import { Playlist, useAudio } from '../../context/AudioContext';

export default function Library() {
    const router = useRouter();
    const { playlists, createPlaylist, favorites, renamePlaylist, deletePlaylist } = useAudio();

    const [createVisible, setCreateVisible] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [playlistOptionsVisible, setPlaylistOptionsVisible] = useState(false);
    const [renameVisible, setRenameVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [renameValue, setRenameValue] = useState('');

    const sortedPlaylists = useMemo(
        () => playlists.slice().sort((a, b) => a.name.localeCompare(b.name)),
        [playlists]
    );

    const handleCreatePlaylist = () => {
        if (!newPlaylistName.trim()) return;
        createPlaylist(newPlaylistName.trim());
        setNewPlaylistName('');
        setCreateVisible(false);
    };

    const openPlaylistOptions = (playlist: Playlist) => {
        setSelectedPlaylist(playlist);
        setPlaylistOptionsVisible(true);
    };

    const handleRename = async () => {
        if (selectedPlaylist && renameValue.trim()) {
            await renamePlaylist(selectedPlaylist.id, renameValue);
            setRenameVisible(false);
            setPlaylistOptionsVisible(false);
        }
    };

    const handleDelete = async () => {
        if (selectedPlaylist) {
            await deletePlaylist(selectedPlaylist.id);
            setDeleteVisible(false);
            setPlaylistOptionsVisible(false);
            setSelectedPlaylist(null);
        }
    };

    const renderPlaylist = ({ item }: { item: Playlist }) => (
        <View style={styles.playlistCard}>
            <TouchableOpacity
                style={styles.playlistPressable}
                onPress={() => router.push(`/playlist/${item.id}` as const)}
            >
                <View style={styles.playlistIcon}>
                    <Icon name="musical-notes" size={20} color="#d6c6ff" />
                </View>
                <View style={styles.playlistInfo}>
                    <Text style={styles.playlistName}>{item.name}</Text>
                    <Text style={styles.playlistCount}>{item.songs.length} songs</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.optionsButton}
                onPress={() => openPlaylistOptions(item)}
            >
                <Icon name="ellipsis-horizontal" size={18} color="#cfcfcf" />
            </TouchableOpacity>
        </View>
    );

    return (
        <LinearGradient colors={['#2b0542', '#121212', '#030303']} locations={[0, 0.4, 1]} style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.eyebrow}>Collection</Text>
                        <Text style={styles.title}>Your Library</Text>
                    </View>
                    <TouchableOpacity onPress={() => setCreateVisible(true)} style={styles.addButton}>
                        <Icon name="add" size={26} color="#080808" />
                    </TouchableOpacity>
                </View>

                <View style={styles.favoritesCard}>
                    <TouchableOpacity
                        style={styles.favoritesContent}
                        onPress={() => router.push('/playlist/favorites' as const)}
                    >
                        <LinearGradient
                            colors={['#5d2de2', '#a855f7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.favoritesIcon}
                        >
                            <Icon name="heart" size={24} color="#fff" />
                        </LinearGradient>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.favoritesTitle}>Liked Songs</Text>
                            <Text style={styles.favoritesMeta}>{favorites.length} saved</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color="#cfcfcf" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={sortedPlaylists}
                    keyExtractor={item => item.id}
                    renderItem={renderPlaylist}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Icon name="musical-notes" size={48} color="#444" />
                            <Text style={styles.emptyTitle}>No playlists yet</Text>
                            <Text style={styles.emptySubtitle}>Create one to curate your mood.</Text>
                        </View>
                    }
                />
            </SafeAreaView>

            {/* Create playlist */}
            <Modal transparent visible={createVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Create playlist</Text>
                        <TextInput
                            style={styles.textField}
                            value={newPlaylistName}
                            onChangeText={setNewPlaylistName}
                            placeholder="Evening vibes"
                            placeholderTextColor="#6c6c6c"
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalButtonGhost} onPress={() => setCreateVisible(false)}>
                                <Text style={styles.modalGhostText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={handleCreatePlaylist}>
                                <Text style={styles.modalButtonText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Playlist options */}
            <Modal transparent visible={playlistOptionsVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.sheet}>
                        <Text style={styles.sheetTitle}>{selectedPlaylist?.name}</Text>
                        <TouchableOpacity
                            style={styles.sheetRow}
                            onPress={() => {
                                if (!selectedPlaylist) return;
                                setRenameValue(selectedPlaylist.name);
                                setRenameVisible(true);
                            }}
                        >
                            <Icon name="create-outline" size={20} color="#fff" />
                            <Text style={styles.sheetRowText}>Rename playlist</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.sheetRow}
                            onPress={() => setDeleteVisible(true)}
                        >
                            <Icon name="trash" size={20} color="#fda4af" />
                            <Text style={[styles.sheetRowText, styles.destructiveText]}>Delete playlist</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sheetClose} onPress={() => setPlaylistOptionsVisible(false)}>
                            <Text style={styles.sheetCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Rename */}
            <Modal transparent visible={renameVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Rename playlist</Text>
                        <TextInput
                            style={styles.textField}
                            value={renameValue}
                            onChangeText={setRenameValue}
                            placeholder="New name"
                            placeholderTextColor="#6c6c6c"
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalButtonGhost} onPress={() => setRenameVisible(false)}>
                                <Text style={styles.modalGhostText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={handleRename}>
                                <Text style={styles.modalButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ConfirmDialog
                visible={deleteVisible}
                title="Delete playlist?"
                message="This removes the playlist permanently. Your songs stay in the library."
                confirmLabel="Delete"
                destructive
                onConfirm={handleDelete}
                onCancel={() => setDeleteVisible(false)}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
        marginBottom: 24,
    },
    eyebrow: {
        color: '#b8b1c7',
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    title: {
        color: '#fff',
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    addButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoritesCard: {
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 24,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    favoritesContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        gap: 16,
    },
    favoritesIcon: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoritesTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    favoritesMeta: {
        color: '#d5d1e0',
        marginTop: 4,
    },
    listContent: {
        paddingBottom: 120,
        gap: 14,
    },
    playlistCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    playlistPressable: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 14,
    },
    playlistIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playlistInfo: { flex: 1 },
    playlistName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    playlistCount: {
        color: '#9f9f9f',
        marginTop: 4,
    },
    optionsButton: {
        padding: 8,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 80,
        gap: 12,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    emptySubtitle: {
        color: '#9f9f9f',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        borderRadius: 24,
        backgroundColor: '#18121f',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        padding: 24,
        gap: 20,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    textField: {
        backgroundColor: '#1f172a',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalButtonGhost: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    modalGhostText: {
        color: '#fff',
        fontWeight: '600',
    },
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: '#8a2be2',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
    sheet: {
        width: '100%',
        borderRadius: 28,
        backgroundColor: '#18121f',
        padding: 24,
        gap: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    sheetTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    sheetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    sheetRowText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    destructiveText: {
        color: '#fda4af',
    },
    sheetClose: {
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    sheetCloseText: {
        color: '#cfcfcf',
        fontWeight: '600',
    },
});
