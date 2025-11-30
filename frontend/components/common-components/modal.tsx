import React from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '@/context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModalWindowProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    children?: React.ReactNode;
}

export default function ModalWindow({
    visible,
    onConfirm,
    onCancel,
    children,
}: ModalWindowProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        modal: {
            justifyContent: 'flex-end',
            margin: 0,
        },
        container: {
            backgroundColor: theme.colors.white100,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: SCREEN_HEIGHT * 0.9,
            minHeight: SCREEN_HEIGHT * 0.3,
            paddingTop: 16,
        },
        dragIndicator: {
            width: 64,
            height: 4,
            borderRadius: 3,
            backgroundColor: theme.colors.black10,
            alignSelf: 'center',
            marginBottom: 16,
        },
        scrollContent: {
            paddingBottom: 32,
        },
    });

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onCancel}
            style={styles.modal}
            backdropOpacity={0.3}
            useNativeDriver={false}
            hideModalContentWhileAnimating
            swipeDirection="down"
            onSwipeComplete={onCancel}
        >
            <View style={styles.container}>
                <View style={styles.dragIndicator} />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {children}
                </ScrollView>
            </View>
        </Modal>
    );
}
