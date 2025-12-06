import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    visible,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    destructive = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!visible) return null;

    return (
        <Modal transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.actions}>
                        <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
                            <Text style={styles.cancelText}>{cancelLabel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.confirm, destructive && styles.destructive]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmText}>{confirmLabel}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        backgroundColor: '#18121f',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
    },
    message: {
        color: '#cfcfcf',
        fontSize: 15,
        lineHeight: 21,
        marginBottom: 24,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 999,
    },
    cancel: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    cancelText: {
        color: '#f5f5f5',
        fontWeight: '600',
    },
    confirm: {
        backgroundColor: '#8a2be2',
    },
    destructive: {
        backgroundColor: '#e5484d',
    },
    confirmText: {
        color: '#fff',
        fontWeight: '700',
    },
});

