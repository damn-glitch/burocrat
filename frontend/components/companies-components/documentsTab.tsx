import CloseIcon from '@/assets/images/icons/closeIcon.svg';
import CreateDocIcon from '@/assets/images/icons/createDocIcon.svg';
import CreateFolderIcon from '@/assets/images/icons/createFolderIcon.svg';
import FolderCompanyEmptyIcon from '@/assets/images/icons/folderCompanyEmptyIcon.svg';
import FolderCompanyIcon from '@/assets/images/icons/folderCompanyIcon.svg';
import ActionSheet from '@/components/common-components/actionSheet';
import FileIcon from '@/components/common-components/fileIcons';
import ModalWindow from '@/components/common-components/modal';
import FileUploadModal from '@/components/companies-components/fileUploadModal';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import {
    clearFolderNavigationEntry,
    setFolderNavigationEntry,
    updateFolderNavigationEntry,
} from '@/utils/folderNavigationStore';
import { useRouter } from 'expo-router';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export type DocumentsTabRef = {
    openFileUploadModal: () => void;
    openCreateFolderModal: () => void;
};

export type Document = {
    id: string;
    name: string;
    size: number;
    extension: string;
    updatedAt?: string;
};

export type Folder = {
    id: string;
    name: string;
    description?: string;
    updatedAt?: string;
    documents: Document[];
};

type DocumentsTabProps = {
    documents: Document[];
    initialFolders?: Folder[];
    onDocumentAdded?: (documents: Document[]) => void;
    onFolderCreated?: (folder: Folder) => void;
    onFolderUpdated?: (folder: Folder) => void;
    onFolderDeleted?: (folderId: string) => void;
};

type SelectedItem =
    | { type: 'folder'; id: string }
    | { type: 'document'; id: string };

const KB_LABEL = 'КБ';
const MB_LABEL = 'МБ';
const MENU_DOTS = '\u22ee';

const makeFolderMenuKey = (folderId: string) => `folder-${folderId}`;
const makeDocumentMenuKey = (documentId: string) => `document-${documentId}`;

const parseDateToNumber = (value?: string) =>
    value ? new Date(value).getTime() || 0 : 0;

const sumFolderSize = (folder: Folder) =>
    folder.documents.reduce((acc, doc) => acc + (doc.size || 0), 0);

const formatSize = (bytes: number) => {
    if (!bytes || bytes <= 0) {
        return `0 ${KB_LABEL}`;
    }

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

const areFolderListsEqual = (current: Folder[], next: Folder[]) => {
    if (current === next) {
        return true;
    }

    if (current.length !== next.length) {
        return false;
    }

    for (let i = 0; i < current.length; i += 1) {
        const currentFolder = current[i];
        const nextFolder = next[i];

        if (!nextFolder) {
            return false;
        }

        if (
            currentFolder.id !== nextFolder.id ||
            currentFolder.name !== nextFolder.name ||
            (currentFolder.description ?? '') !== (nextFolder.description ?? '') ||
            (currentFolder.updatedAt ?? '') !== (nextFolder.updatedAt ?? '')
        ) {
            return false;
        }

        if (currentFolder.documents.length !== nextFolder.documents.length) {
            return false;
        }

        for (let j = 0; j < currentFolder.documents.length; j += 1) {
            const currentDocument = currentFolder.documents[j];
            const nextDocument = nextFolder.documents[j];

            if (
                !nextDocument ||
                currentDocument.id !== nextDocument.id ||
                currentDocument.name !== nextDocument.name ||
                currentDocument.extension !== nextDocument.extension ||
                currentDocument.size !== nextDocument.size ||
                (currentDocument.updatedAt ?? '') !== (nextDocument.updatedAt ?? '')
            ) {
                return false;
            }
        }
    }

    return true;
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

const DocumentsTab = forwardRef<DocumentsTabRef, DocumentsTabProps>(
    (
        {
            documents,
            initialFolders,
            onDocumentAdded,
            onFolderCreated,
            onFolderUpdated,
            onFolderDeleted,
        },
        ref,
    ) => {
        const theme = useTheme();
        const router = useRouter();
        const { t } = useTranslation();

        const safeDocuments = useMemo(() => documents ?? [], [documents]);
        const safeInitialFolders = useMemo(() => initialFolders ?? [], [initialFolders]);

        const [folders, setFolders] = useState<Folder[]>(safeInitialFolders);
        const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
        const [isFolderModalVisible, setFolderModalVisible] = useState(false);
        const [folderModalMode, setFolderModalMode] = useState<'create' | 'edit'>('create');
        const [folderForm, setFolderForm] = useState({ name: '', description: '' });
        const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
        const [showUploadModal, setShowUploadModal] = useState(false);

        const menuButtonRefs = useRef<Record<string, React.RefObject<View | null>>>({});

        const ensureRef = useCallback((key: string) => {
            if (!menuButtonRefs.current[key]) {
                menuButtonRefs.current[key] = React.createRef<View>() as React.RefObject<
                    View | null
                >;
            }
            return menuButtonRefs.current[key]!;
        }, []);

        useEffect(() => {
            setFolders(prev => (areFolderListsEqual(prev, safeInitialFolders) ? prev : safeInitialFolders));
        }, [safeInitialFolders]);

        const resetFolderForm = useCallback(() => {
            setFolderForm({ name: '', description: '' });
            setEditingFolderId(null);
        }, []);

        const openCreateFolderModal = useCallback(() => {
            resetFolderForm();
            setFolderModalMode('create');
            setFolderModalVisible(true);
        }, [resetFolderForm]);

        useImperativeHandle(
            ref,
            () => ({
                openFileUploadModal: () => setShowUploadModal(true),
                openCreateFolderModal,
            }),
            [openCreateFolderModal],
        );

        const sortedFolders = useMemo(
            () =>
                [...folders].sort(
                    (a, b) => parseDateToNumber(b.updatedAt) - parseDateToNumber(a.updatedAt),
                ),
            [folders],
        );

        const rootItems = useMemo(
            () => [
                ...sortedFolders.map(folder => ({ type: 'folder' as const, value: folder })),
                ...safeDocuments.map(document => ({ type: 'document' as const, value: document })),
            ],
            [sortedFolders, safeDocuments],
        );

        useEffect(() => {
            rootItems.forEach(item => {
                const key =
                    item.type === 'folder'
                        ? makeFolderMenuKey(item.value.id)
                        : makeDocumentMenuKey(item.value.id);
                ensureRef(key);
            });
        }, [rootItems, ensureRef]);

        const getFilesLabel = useCallback(
            (count: number) => t(`documentsTab.files_${getFilesKeySuffix(count)}` as const),
            [t],
        );

        const updateFolderState = useCallback(
            (updatedFolder: Folder) => {
                setFolders(prev =>
                    prev.map(folder => (folder.id === updatedFolder.id ? updatedFolder : folder)),
                );
                onFolderUpdated?.(updatedFolder);
                updateFolderNavigationEntry(updatedFolder);
            },
            [onFolderUpdated],
        );

        const removeFolderState = useCallback(
            (folderId: string) => {
                setFolders(prev => prev.filter(folder => folder.id !== folderId));
                onFolderDeleted?.(folderId);
                clearFolderNavigationEntry(folderId);
            },
            [onFolderDeleted],
        );

        const closeFolderModal = useCallback(() => {
            setFolderModalVisible(false);
            resetFolderForm();
        }, [resetFolderForm]);

        const openEditFolderModal = useCallback(
            (folderId: string) => {
                const folder = folders.find(item => item.id === folderId);
                if (!folder) return;

                setFolderForm({
                    name: folder.name,
                    description: folder.description ?? '',
                });
                setEditingFolderId(folderId);
                setFolderModalMode('edit');
                setFolderModalVisible(true);
            },
            [folders],
        );

        const handleFolderSubmit = useCallback(() => {
            const trimmedName = folderForm.name.trim();
            const trimmedDescription = folderForm.description.trim();

            if (!trimmedName) {
                return;
            }

            if (folderModalMode === 'create') {
                const newFolder: Folder = {
                    id: `folder-${Date.now()}`,
                    name: trimmedName,
                    description: trimmedDescription,
                    updatedAt: new Date().toISOString(),
                    documents: [],
                };

                setFolders(prev => [newFolder, ...prev]);
                onFolderCreated?.(newFolder);
                closeFolderModal();
                return;
            }

            if (!editingFolderId) {
                return;
            }

            const existingFolder = folders.find(folder => folder.id === editingFolderId);
            if (!existingFolder) {
                return;
            }

            const updatedFolder: Folder = {
                ...existingFolder,
                name: trimmedName,
                description: trimmedDescription,
                updatedAt: new Date().toISOString(),
            };

            updateFolderState(updatedFolder);
            closeFolderModal();
        }, [
            closeFolderModal,
            editingFolderId,
            folderForm.description,
            folderForm.name,
            folderModalMode,
            folders,
            onFolderCreated,
            updateFolderState,
        ]);

        const handleDeleteFolder = useCallback(
            (folderId: string) => {
                removeFolderState(folderId);
                if (selectedItem?.type === 'folder' && selectedItem.id === folderId) {
                    setSelectedItem(null);
                }
            },
            [removeFolderState, selectedItem],
        );

        const handleFileUploadComplete = useCallback(
            (files: any[]) => {
                const uploaded = files.map((file: any) => ({
                    id: file.id,
                    name: file.name,
                    size: file.size || 0,
                    extension: file.extension,
                    updatedAt: new Date().toISOString(),
                }));

                onDocumentAdded?.(uploaded);
                setShowUploadModal(false);
            },
            [onDocumentAdded],
        );

        const handleOpenFolder = useCallback(
            (folder: Folder) => {
                const payload = encodeURIComponent(JSON.stringify(folder));

                setFolderNavigationEntry(folder.id, {
                    folder,
                    onUpdate: updateFolderState,
                    onDelete: removeFolderState,
                });

                router.push({
                    pathname: '/companies/folders/[folderId]',
                    params: {
                        folderId: folder.id,
                        data: payload,
                    },
                });
            },
            [removeFolderState, router, updateFolderState],
        );

        const openActionSheet = useCallback((item: SelectedItem) => {
            setSelectedItem(item);
        }, []);

        const closeActionSheet = useCallback(() => {
            setSelectedItem(null);
        }, []);

        const documentOptions = useMemo(() => {
            if (!selectedItem || selectedItem.type !== 'document') {
                return [];
            }

            return [
                {
                    label: t('documentsTab.documentActions.share'),
                    onPress: () => console.log('Share document', selectedItem.id),
                    icon: 'share' as const,
                },
                {
                    label: t('documentsTab.documentActions.move'),
                    onPress: () => console.log('Move document', selectedItem.id),
                    icon: 'move' as const,
                },
                {
                    label: t('documentsTab.documentActions.rename'),
                    onPress: () => console.log('Rename document', selectedItem.id),
                    icon: 'edit' as const,
                },
                {
                    label: t('documentsTab.documentActions.delete'),
                    onPress: () => console.log('Delete document', selectedItem.id),
                    icon: 'delete' as const,
                    destructive: true,
                },
            ];
        }, [selectedItem, t]);

        const actionSheetOptions = useMemo(() => {
            if (!selectedItem) return [];

            if (selectedItem.type === 'folder') {
                const folder = folders.find(item => item.id === selectedItem.id);
                if (!folder) return [];

                return [
                    {
                        label: t('documentsTab.folderActions.share'),
                        onPress: () => console.log('Share folder', folder.id),
                        icon: 'share' as const,
                    },
                    {
                        label: t('documentsTab.folderActions.move'),
                        onPress: () => console.log('Move folder', folder.id),
                        icon: 'move' as const,
                    },
                    {
                        label: t('documentsTab.folderActions.edit'),
                        onPress: () => openEditFolderModal(folder.id),
                        icon: 'edit' as const,
                    },
                    {
                        label: t('documentsTab.folderActions.delete'),
                        onPress: () => handleDeleteFolder(folder.id),
                        icon: 'delete' as const,
                        destructive: true,
                    },
                ];
            }

            return documentOptions;
        }, [documentOptions, folders, handleDeleteFolder, openEditFolderModal, selectedItem, t]);

        const actionSheetTriggerRef =
            selectedItem?.type === 'folder'
                ? ensureRef(makeFolderMenuKey(selectedItem.id))
                : selectedItem?.type === 'document'
                ? ensureRef(makeDocumentMenuKey(selectedItem.id))
                : undefined;

        const styles = useMemo(
            () =>
                StyleSheet.create({
                    actionsContainer: {
                        flexDirection: 'row',
                        gap: 12,
                        marginBottom: 20,
                    },
                    actionButton: {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        paddingHorizontal: 16,
                        height: 44,
                        borderRadius: 8,
                        backgroundColor: theme.colors.white100,
                        borderWidth: 1,
                        borderColor: theme.colors.black20,
                    },
                    actionButtonText: {
                        ...textStyles.medium,
                        fontSize: 16,
                        color: theme.colors.primaryText,
                    },
                    itemsContainer: {
                        gap: 12,
                    },
                    folderCard: {
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: theme.colors.white100,
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                    },
                    folderIconWrapper: {
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                    },
                    folderInfo: {
                        flex: 1,
                    },
                    folderName: {
                        ...textStyles.semiBold,
                        fontSize: 16,
                        color: theme.colors.primaryText,
                        marginBottom: 4,
                    },
                    folderMeta: {
                        ...textStyles.medium,
                        fontSize: 13,
                        color: theme.colors.secondaryText,
                    },
                    documentRow: {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: theme.colors.white100,
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                    },
                    documentInfo: {
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                    },
                    documentIcon: {
                        width: 40,
                        alignItems: 'center',
                        marginRight: 12,
                    },
                    documentTextBlock: {
                        flex: 1,
                    },
                    documentName: {
                        ...textStyles.semiBold,
                        fontSize: 16,
                        color: theme.colors.primaryText,
                    },
                    documentSize: {
                        ...textStyles.medium,
                        fontSize: 14,
                        color: theme.colors.secondaryText,
                        marginTop: 6,
                    },
                    menuButton: {
                        padding: 6,
                    },
                    menuDots: {
                        fontSize: 22,
                        color: theme.colors.black100,
                    },
                    emptyState: {
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 16,
                        backgroundColor: theme.colors.white100,
                        paddingVertical: 40,
                        paddingHorizontal: 16,
                    },
                    emptyTitle: {
                        ...textStyles.semiBold,
                        fontSize: 16,
                        color: theme.colors.primaryText,
                        marginBottom: 8,
                    },
                    emptySubtitle: {
                        ...textStyles.medium,
                        fontSize: 14,
                        color: theme.colors.secondaryText,
                        textAlign: 'center',
                    },
                    modalContent: {
                        paddingHorizontal: 20,
                    },
                    modalHeader: {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 16,
                    },
                    modalTitle: {
                        ...textStyles.semiBold,
                        fontSize: 20,
                        color: theme.colors.primaryText,
                    },
                    inputLabel: {
                        ...textStyles.semiBold,
                        fontSize: 16,
                        color: theme.colors.primaryText,
                        marginBottom: 8,
                    },
                    input: {
                        borderWidth: 1,
                        borderColor: theme.colors.black10,
                        borderRadius: 8,
                        padding: 16,
                        backgroundColor: theme.colors.gray100,
                        ...textStyles.medium,
                        fontSize: 16,
                        color: theme.colors.primaryText,
                        marginBottom: 16,
                    },
                    modalButton: {
                        marginTop: 8,
                        paddingVertical: 16,
                        borderRadius: 14,
                        backgroundColor: theme.colors.blue,
                        alignItems: 'center',
                    },
                    modalButtonDisabled: {
                        backgroundColor: theme.colors.black20,
                    },
                    modalButtonText: {
                        ...textStyles.semiBold,
                        fontSize: 16,
                        color: theme.colors.white100,
                    },
                }),
            [theme],
        );

        const renderFolderCard = (folder: Folder) => {
            const hasDocuments = folder.documents.length > 0;
            const menuRef = ensureRef(makeFolderMenuKey(folder.id));
            const documentsCount = folder.documents.length;

            const metaText = t('folder.meta', {
                count: documentsCount,
                files: getFilesLabel(documentsCount),
                size: formatSize(sumFolderSize(folder)),
            });

            return (
                <TouchableOpacity
                    key={folder.id}
                    style={styles.folderCard}
                    activeOpacity={0.85}
                    onPress={() => handleOpenFolder(folder)}
                >
                    <View style={styles.folderIconWrapper}>
                        {hasDocuments ? (
                            <FolderCompanyIcon width={40} height={40} />
                        ) : (
                            <FolderCompanyEmptyIcon width={40} height={40} />
                        )}
                    </View>
                    <View style={styles.folderInfo}>
                        <Text style={styles.folderName}>{folder.name}</Text>
                        <Text style={styles.folderMeta}>{metaText}</Text>
                    </View>
                    <TouchableOpacity
                        ref={menuRef}
                        style={styles.menuButton}
                        onPress={() => openActionSheet({ type: 'folder', id: folder.id })}
                    >
                        <Text style={styles.menuDots}>{MENU_DOTS}</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            );
        };

        const renderDocumentRow = (document: Document) => {
            const menuRef = ensureRef(makeDocumentMenuKey(document.id));

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
                        onPress={() => openActionSheet({ type: 'document', id: document.id })}
                    >
                        <Text style={styles.menuDots}>{MENU_DOTS}</Text>
                    </TouchableOpacity>
                </View>
            );
        };

        const renderRoot = () => (
            <View>
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        activeOpacity={0.85}
                        onPress={() => setShowUploadModal(true)}
                    >
                        <CreateDocIcon width={24} height={24} />
                        <Text style={styles.actionButtonText}>{t('documentsTab.actions.upload')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        activeOpacity={0.85}
                        onPress={openCreateFolderModal}
                    >
                        <CreateFolderIcon width={24} height={24} />
                        <Text style={styles.actionButtonText}>
                            {t('documentsTab.actions.createFolder')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemsContainer}>
                    {rootItems.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>{t('documentsTab.empty.title')}</Text>
                            <Text style={styles.emptySubtitle}>
                                {t('documentsTab.empty.subtitle')}
                            </Text>
                        </View>
                    )}

                    {rootItems.map(item =>
                        item.type === 'folder'
                            ? renderFolderCard(item.value)
                            : renderDocumentRow(item.value),
                    )}
                </View>
            </View>
        );

        return (
            <View>
                {renderRoot()}

                <ActionSheet
                    visible={Boolean(selectedItem)}
                    onClose={closeActionSheet}
                    options={actionSheetOptions}
                    triggerRef={actionSheetTriggerRef}
                />

                <ModalWindow
                    visible={isFolderModalVisible}
                    onCancel={closeFolderModal}
                    onConfirm={handleFolderSubmit}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {folderModalMode === 'create'
                                    ? t('documentsTab.modal.createTitle')
                                    : t('documentsTab.modal.editTitle')}
                            </Text>
                            <TouchableOpacity onPress={closeFolderModal}>
                                <CloseIcon width={24} height={24} fill={theme.colors.black60} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>{t('documentsTab.modal.nameLabel')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('documentsTab.modal.namePlaceholder')}
                            placeholderTextColor={theme.colors.black40}
                            value={folderForm.name}
                            onChangeText={value => setFolderForm(prev => ({ ...prev, name: value }))}
                        />

                        <Text style={styles.inputLabel}>
                            {t('documentsTab.modal.descriptionLabel')}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('documentsTab.modal.descriptionPlaceholder')}
                            placeholderTextColor={theme.colors.black40}
                            value={folderForm.description}
                            onChangeText={value =>
                                setFolderForm(prev => ({ ...prev, description: value }))
                            }
                        />

                        <TouchableOpacity
                            style={[
                                styles.modalButton,
                                !folderForm.name.trim() && styles.modalButtonDisabled,
                            ]}
                            activeOpacity={0.8}
                            onPress={handleFolderSubmit}
                            disabled={!folderForm.name.trim()}
                        >
                            <Text style={styles.modalButtonText}>
                                {folderModalMode === 'create'
                                    ? t('documentsTab.modal.createButton')
                                    : t('documentsTab.modal.saveButton')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ModalWindow>

                <FileUploadModal
                    visible={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    onUploadComplete={handleFileUploadComplete}
                />
            </View>
        );
    },
);

DocumentsTab.displayName = 'DocumentsTab';

export default DocumentsTab;
