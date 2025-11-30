import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { textStyles } from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";

type ConfirmModalProps = {
    visible: boolean;
    icon?: React.ReactNode;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onCancel: () => void;
    onConfirm: () => void;
    confirmButtonBGcolor?: string;
};

export default function ConfirmModal({
    visible,
    icon,
    title,
    description,
    confirmText = 'Подтвердить',
    cancelText = 'Отмена',
    onCancel,
    onConfirm,
    confirmButtonBGcolor,
}: ConfirmModalProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: theme.colors.black40,
            alignItems: 'center',
            justifyContent: 'center',
        },
        modalContainer: {
            backgroundColor: theme.colors.white100,
            borderRadius: 12,
            paddingVertical: 24,
            width: '90%',
            shadowColor: theme.colors.black100,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
        },
        modalIconContainer: {
            alignItems: 'center',
            marginBottom: 12,
        },
        modalTitle: {
            ...textStyles.semiBold,
            fontSize: 16,
            textAlign: 'center',
            color: theme.colors.primaryText,
            marginBottom: 8,
        },
        modalDescription: {
            ...textStyles.medium,
            fontSize: 16,
            textAlign: 'center',
            color: theme.colors.secondaryText,
            marginBottom: 20,
        },
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
            borderTopWidth: 1,
            borderTopColor: theme.colors.black20,
            borderStyle: 'dashed',
            paddingTop: 16,
            paddingHorizontal: 12,
        },
        cancelButton: {
            flex: 1,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.black20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.white100,
            height: 36,
        },
        cancelButtonText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        confirmButton: {
            flex: 1,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: confirmButtonBGcolor || theme.colors.blue,
            height: 36,
        },
        confirmButtonText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.white100,
        },
    });

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onCancel}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={{ paddingHorizontal: 12 }}>
                        {icon && <View style={styles.modalIconContainer}>{icon}</View>}
                        <Text style={styles.modalTitle}>{title}</Text>
                        {description && (
                            <Text style={styles.modalDescription}>{description}</Text>
                        )}
                    </View>
                    <View style={styles.modalButtons}>
                        <Pressable
                            onPress={onCancel}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </Pressable>
                        <Pressable
                            onPress={onConfirm}
                            style={styles.confirmButton}
                        >
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}