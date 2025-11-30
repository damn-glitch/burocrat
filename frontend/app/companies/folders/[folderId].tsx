import CloseIcon from '@/assets/images/icons/closeIcon.svg';
import ActionSheet from '@/components/common-components/actionSheet';
import FileIcon from '@/components/common-components/fileIcons';
import Header from '@/components/common-components/header';
import ModalWindow from '@/components/common-components/modal';
import type { Document, Folder } from '@/components/companies-components/documentsTab';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import {
    clearFolderNavigationEntry,
    getFolderNavigationEntry,
    updateFolderNavigationEntry,
} from '@/utils/folderNavigationStore';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


type SelectedItem =
    | { type: 'folder' }
    | { type: 'document'; id: string };

const KB_LABEL = 'КБ';
const MB_LABEL = 'МБ';
const MENU_DOTS = '\u22ee';

type ActionSheetTriggerRef =
    | React.RefObject<View>
    | React.RefObject<View | null>
    | React.MutableRefObject<View | null>;

const formatSize = (bytes: number) => {
    if (!bytes || bytes <= 0) return `0 ${KB_LABEL}`;

    const kilo = 1024;
    const mega = kilo * 1024;

    if (bytes >= mega) {
        const value = bytes / mega;
        const formatted =
            value >= 10 ? Math.round(value).toString() : value.toFixed(1).replace('.', ',');
        return `${formatted} ${MB_LABEL}`;
    }

    const kiloValue = Math.max(1, Math.round(bytes / kilo));
    return `${kiloValue} ${KB_LABEL}`;
};

const getFilesKeySuffix = (count: number) => {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod100 >= 11 && mod100 <= 14) {
        return 'many';
    }

    if (mod10 === 1) {
        return 'one';
    }

    if (mod10 >= 2 && mod10 <= 4) {
        return 'few';
    }

    return 'many';
};

const FolderDetailsScreen = () => {
    const { t } = useTranslation();
    const { folderId, data } = useLocalSearchParams<{ folderId: string; data?: string }>();
    const theme = useTheme();
    const router = useRouter();

    const [folder, setFolder] = useState<Folder | null>(null);
    const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [folderForm, setFolderForm] = useState({ name: '', description: '' });

    const folderMenuRef = useRef<View | null>(null);
    const documentMenuRefs = useRef<Record<string, React.RefObject<View | null>>>({});

    const ensureDocumentMenuRef = useCallback((id: string) => {
        if (!documentMenuRefs.current[id]) {
            documentMenuRefs.current[id] = React.createRef<View>() as React.RefObject<View | null>;
        }
        return documentMenuRefs.current[id]!;
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (typeof folderId !== 'string') return;

            const entry = getFolderNavigationEntry(folderId);
            let shouldClear = false;

            if (entry) {
                setFolder(entry.folder);
                shouldClear = true;
            } else if (data) {
                try {
                    const parsed = JSON.parse(decodeURIComponent(data)) as Folder;
                    setFolder(parsed);
                } catch (error) {
                    console.warn('Failed to parse folder payload', error);
                }
            }

            return () => {
                if (shouldClear) clearFolderNavigationEntry(folderId);
            };
        }, [folderId, data]),
    );

    const folderMeta = useMemo(() => {
        if (!folder) return '';
        const count = folder.documents.length;
        const size = folder.documents.reduce((acc, doc) => acc + (doc.size || 0), 0);
        const filesLabel = t(`folder.files_${getFilesKeySuffix(count)}` as const);
        return t('folder.meta', {
            count,
            files: filesLabel,
            size: formatSize(size),
        });
    }, [folder, t]);

    const closeModal = useCallback(() => setModalVisible(false), []);

    const openEditModal = useCallback(() => {
        if (!folder) return;
        setFolderForm({ name: folder.name, description: folder.description || '' });
        setModalVisible(true);
    }, [folder]);

    const handleFolderSave = useCallback(() => {
        if (!folder) return;

        const trimmedName = folderForm.name.trim();
        const trimmedDescription = folderForm.description.trim();
        if (!trimmedName) return;

        const updatedFolder: Folder = {
            ...folder,
            name: trimmedName,
            description: trimmedDescription,
            updatedAt: new Date().toISOString(),
        };

        setFolder(updatedFolder);

        const entry = getFolderNavigationEntry(folder.id);
        entry?.onUpdate?.(updatedFolder);
        updateFolderNavigationEntry(updatedFolder);

        closeModal();
    }, [closeModal, folder, folderForm.description, folderForm.name]);

    const handleDeleteFolder = () => {
        if (!folder) return;
        const entry = getFolderNavigationEntry(folder.id);
        entry?.onDelete?.(folder.id);
        clearFolderNavigationEntry(folder.id);
        router.back();
    };

    const documentActions = useCallback(
        (documentId: string) => [
            { label: t('folder.documentActions.share'), onPress: () => console.log('Share document', documentId), icon: 'share' as const },
            { label: t('folder.documentActions.move'), onPress: () => console.log('Move document', documentId), icon: 'move' as const },
            { label: t('folder.documentActions.rename'), onPress: () => console.log('Rename document', documentId), icon: 'edit' as const },
            { label: t('folder.documentActions.delete'), onPress: () => console.log('Delete document', documentId), icon: 'delete' as const, destructive: true },
        ],
        [t],
    );

    const actionSheetOptions = useMemo(() => {
        if (!selectedItem) return [];

        if (selectedItem.type === 'folder' && folder) {
            return [
                { label: t('folder.actions.share'), onPress: () => console.log('Share folder', folder.id), icon: 'share' as const },
                { label: t('folder.actions.move'), onPress: () => console.log('Move folder', folder.id), icon: 'move' as const },
                { label: t('folder.actions.edit'), onPress: openEditModal, icon: 'edit' as const },
                { label: t('folder.actions.delete'), onPress: handleDeleteFolder, icon: 'delete' as const, destructive: true },
            ];
        }

        if (selectedItem.type === 'document') {
            return documentActions(selectedItem.id);
        }

        return [];
    }, [selectedItem, folder, documentActions, handleDeleteFolder, openEditModal, t]);
    
    const actionSheetTriggerRef: ActionSheetTriggerRef | undefined =
        selectedItem?.type === 'folder'
            ? folderMenuRef
            : selectedItem?.type === 'document'
            ? ensureDocumentMenuRef(selectedItem.id)
            : undefined;

    if (!folder) return null;

    const styles = StyleSheet.create({
        screen: { flex: 1, backgroundColor: theme.colors.background },
        container: { flex: 1, paddingHorizontal: 16 },
        headerWrapper: { position: 'relative', marginBottom: 16 },
        folderMenuButton: { position: 'absolute', right: 0, top: 8, padding: 8 },
        folderInfoBlock: {
            backgroundColor: theme.colors.white100,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 20,
            marginBottom: 20,
        },
        folderDescription: { ...textStyles.medium, fontSize: 15, color: theme.colors.primaryText },
        folderMeta: { ...textStyles.medium, fontSize: 13, color: theme.colors.secondaryText, marginTop: 10 },
        documentRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.colors.white100,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 16,
            marginBottom: 12,
        },
        documentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
        documentIcon: { width: 40, alignItems: 'center', marginRight: 12 },
        documentTextBlock: { flex: 1 },
        documentName: { ...textStyles.semiBold, fontSize: 16, color: theme.colors.primaryText },
        documentSize: { ...textStyles.medium, fontSize: 14, color: theme.colors.secondaryText, marginTop: 6 },
        menuButton: { padding: 6 },
        menuDots: { fontSize: 22, color: theme.colors.black100 },
        emptyState: {
            backgroundColor: theme.colors.white100,
            borderRadius: 16,
            paddingVertical: 40,
            alignItems: 'center',
            paddingHorizontal: 16,
        },
        emptyTitle: { ...textStyles.semiBold, fontSize: 16, color: theme.colors.primaryText, marginBottom: 8 },
        emptySubtitle: { ...textStyles.medium, fontSize: 14, color: theme.colors.secondaryText, textAlign: 'center' },
        modalContent: { paddingHorizontal: 20,},
        modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
        modalTitle: { ...textStyles.semiBold, fontSize: 20, color: theme.colors.primaryText },
        inputLabel: { ...textStyles.medium, fontSize: 14, color: theme.colors.secondaryText, marginBottom: 8 },
        input: {
            borderWidth: 1,
            borderColor: theme.colors.black20,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: theme.colors.white100,
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.primaryText,
            marginBottom: 16,
        },
        textArea: { height: 100, textAlignVertical: 'top' },
        modalButton: {
            marginTop: 8,
            paddingVertical: 16,
            borderRadius: 14,
            backgroundColor: theme.colors.blue,
            alignItems: 'center',
        },
        modalButtonDisabled: { backgroundColor: theme.colors.black20 },
        modalButtonText: { ...textStyles.semiBold, fontSize: 16, color: theme.colors.white100 },
    });

    const renderDocument = (document: Document) => {
        const menuRef = ensureDocumentMenuRef(document.id);

        return (
            <View key={document.id} style={styles.documentRow}>
                <View style={styles.documentInfo}>
                    <View style={styles.documentIcon}>
                        <FileIcon extension={document.extension} />
                    </View>
                    <View style={styles.documentTextBlock}>
                        <Text style={styles.documentName}>{document.name}</Text>
                        <Text style={styles.documentSize}>{formatSize(document.size)}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    ref={menuRef}
                    style={styles.menuButton}
                    onPress={() => setSelectedItem({ type: 'document', id: document.id })}
                >
                    <Text style={styles.menuDots}>{MENU_DOTS}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.screen}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.headerWrapper}>
                    <Header
                        title={folder.name}
                        titleFontSize={20}
                        backButton
                        backButtonColor={theme.colors.black100}
                        backButtonBGroundColor={theme.colors.white100}
                    />
                    <TouchableOpacity ref={folderMenuRef} style={styles.folderMenuButton} onPress={() => setSelectedItem({ type: 'folder' })}>
                        <Text style={styles.menuDots}>{MENU_DOTS}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.folderInfoBlock}>
                    <Text style={styles.folderDescription}>
                        {folder.description?.trim() || t('folder.noDescription')}
                    </Text>
                    <Text style={styles.folderMeta}>{folderMeta}</Text>
                </View>

                {folder.documents.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>{t('folder.emptyTitle')}</Text>
                        <Text style={styles.emptySubtitle}>{t('folder.emptySubtitle')}</Text>
                    </View>
                ) : (
                    folder.documents.map(renderDocument)
                )}
            </ScrollView>

            <ActionSheet
                visible={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                options={actionSheetOptions}
                triggerRef={actionSheetTriggerRef}
            />

            <ModalWindow visible={isModalVisible} onCancel={closeModal} onConfirm={handleFolderSave}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{t('folder.editTitle')}</Text>
                        <TouchableOpacity onPress={closeModal}>
                            <CloseIcon width={24} height={24} fill={theme.colors.black60} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.inputLabel}>{t('folder.nameLabel')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t('folder.namePlaceholder')}
                        placeholderTextColor={theme.colors.black40}
                        value={folderForm.name}
                        onChangeText={value => setFolderForm(prev => ({ ...prev, name: value }))}
                    />

                    <Text style={styles.inputLabel}>{t('folder.descriptionLabel')}</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder={t('folder.descriptionPlaceholder')}
                        placeholderTextColor={theme.colors.black40}
                        multiline
                        value={folderForm.description}
                        onChangeText={value => setFolderForm(prev => ({ ...prev, description: value }))}
                    />

                    <TouchableOpacity
                        style={[
                            styles.modalButton,
                            !folderForm.name.trim() && styles.modalButtonDisabled,
                        ]}
                        activeOpacity={0.8}
                        onPress={handleFolderSave}
                        disabled={!folderForm.name.trim()}
                    >
                        <Text style={styles.modalButtonText}>{t('folder.saveButton')}</Text>
                    </TouchableOpacity>
                </View>
            </ModalWindow>
        </View>
    );
};

export default FolderDetailsScreen;
