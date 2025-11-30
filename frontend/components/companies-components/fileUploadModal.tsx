import CloseIcon from '@/assets/images/icons/closeIcon.svg';
import FileBlankIcon from '@/assets/images/icons/fileBlankIcon.svg';
import TrashIcon from '@/assets/images/icons/trashIcon.svg';
import FileIcon from '@/components/common-components/fileIcons';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type FileItem = {
    id: string;
    name: string;
    size: number;
    uri: string;
    type: string;
    extension: string;
    status: 'uploading' | 'uploaded' | 'error';
    progress: number;
};

type FileUploadModalProps = {
    visible: boolean;
    onClose: () => void;
    onUploadComplete: (files: FileItem[]) => void;
};

export default function FileUploadModal({ visible, onClose, onUploadComplete }: FileUploadModalProps) {
    const theme = useTheme();
    const { t } = useTranslation();
    const [files, setFiles] = useState<FileItem[]>([]);
    const uploadCallbacks = useRef<Record<string, (progress: {totalBytesWritten: number; totalBytesExpectedToWrite: number}) => void>>({});
    const uploadTasks = useRef<Record<string, FileSystem.UploadTask>>({});

    const pickDocument = useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
                copyToCacheDirectory: true,
                multiple: true,
            });

            if (result.canceled) {
                return;
            }

            const newFiles = result.assets.map(file => {
                const fileNameParts = file.name.split('.');
                const extension = fileNameParts.length > 1
                    ? fileNameParts[fileNameParts.length - 1].toLowerCase()
                    : '';

                return {
                    id: Math.random().toString(36).substring(2, 15),
                    name: file.name,
                    size: file.size || 0,
                    uri: file.uri,
                    type: file.mimeType || '',
                    extension,
                    status: 'uploading' as const,
                    progress: 0
                };
            });

            setFiles(prev => [...prev, ...newFiles]);

            newFiles.forEach(uploadFile);

        } catch (err) {
            console.log('Ошибка при выборе документа:', err);
        }
    }, []);

    const uploadFile = async (file: FileItem) => {
        try {
            uploadCallbacks.current[file.id] = (uploadProgress: {totalBytesWritten: number; totalBytesExpectedToWrite: number}) => {
                const progress = Math.round((uploadProgress.totalBytesWritten / uploadProgress.totalBytesExpectedToWrite) * 100);
                updateFileProgress(file.id, progress);
            };

            const options: FileSystem.FileSystemUploadOptions = {
                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                fieldName: 'file',
                parameters: { 
                    fileName: file.name,
                    fileType: file.type
                },
                httpMethod: 'POST',
                sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
                mimeType: file.type,
            };

            updateFileProgress(file.id, 100);
            updateFileStatus(file.id, 'uploaded');

            // В реальном приложении используйте реальный API endpoint
            /*
            const uploadUrl = 'https://your-real-api.com/upload';
            
            const uploadTask = FileSystem.uploadAsync(
                uploadUrl,
                file.uri,
                options
            );
            
            uploadTasks.current[file.id] = uploadTask;
            
            const response = await uploadTask;
            
            if (response.status >= 200 && response.status < 300) {
                updateFileStatus(file.id, 'uploaded');
            } else {
                console.error('Ошибка при загрузке:', response);
                updateFileStatus(file.id, 'error');
            }
            */
        } catch (error) {
            console.error('Ошибка загрузки файла:', error);
            updateFileStatus(file.id, 'error');
        }
    };

    // Обновление прогресса для конкретного файла
    const updateFileProgress = (fileId: string, progress: number) => {
        setFiles(prevFiles => 
            prevFiles.map(file => 
                file.id === fileId 
                    ? { ...file, progress } 
                    : file
            )
        );
    };

    const updateFileStatus = (fileId: string, status: 'uploading' | 'uploaded' | 'error') => {
        setFiles(prevFiles => 
            prevFiles.map(file => 
                file.id === fileId 
                    ? { ...file, status } 
                    : file
            )
        );
    };

    const handleRemoveFile = (fileId: string) => {
        if (uploadTasks.current[fileId]) {
            uploadTasks.current[fileId].cancelAsync();
            delete uploadTasks.current[fileId];
            delete uploadCallbacks.current[fileId];
        }
        
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    };

    const handleDone = () => {
        const uploadedFiles = files.filter(file => file.status === 'uploaded');
        onUploadComplete(uploadedFiles);
        setFiles([]);
        onClose();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' Б';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' КБ';
        else return (bytes / 1048576).toFixed(1) + ' МБ';
    };

    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            width: '90%',
            maxHeight: 400,
            backgroundColor: theme.colors.white100,
            borderRadius: 12,
            overflow: 'hidden',
        },
        header: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.black10,
        },
        headerTitle: {
            ...textStyles.semiBold,
            fontSize: 18,
            color: theme.colors.black100,
        },
        closeButton: {
            padding: 4,
        },
        closeButtonText: {
            fontSize: 20,
            color: theme.colors.black60,
        },
        helperText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
        },
        dropZone: {
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.colors.black20,
            borderRadius: 8,
            padding: 24,
            alignItems: 'center',
            justifyContent: 'center',
            margin: 16,
        },
        dropZoneIcon: {
            marginBottom: 12,
        },
        dropZoneText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.black100,
            textAlign: 'center',
        },
        dropZoneSubtext: {
            ...textStyles.regular,
            fontSize: 12,
            color: theme.colors.secondaryText,
            textAlign: 'center',
            marginTop: 4,
        },
        addFileButton: {
            backgroundColor: theme.colors.white100,
            borderWidth: 1,
            borderColor: theme.colors.black40,
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 16,
            alignItems: 'center',
            marginTop: 12,
        },
        addFileButtonText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        filesList: {
            marginHorizontal: 16,
        },
        fileItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: theme.colors.white100,
            borderRadius: 8,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: theme.colors.black10,
        },
        fileIcon: {
            marginRight: 12,
        },
        fileDetails: {
            flex: 1,
        },
        fileName: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.black100,
        },
        fileSize: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.secondaryText,
            flexDirection: 'row',
        },
        removeButton: {
            padding: 8,
        },
        progressBar: {
            height: 4,
            backgroundColor: theme.colors.black10,
            borderRadius: 2,
            marginTop: 4,
            width: '100%',
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            backgroundColor: theme.colors.blue,
        },
        footer: {
            borderTopWidth: 1,
            borderTopColor: theme.colors.black10,
            padding: 16,
        },
        doneButton: {
            backgroundColor: theme.colors.black100,
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: 'center',
        },
        doneButtonText: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.white100,
        },
    });

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <ScrollView
                    style={styles.modalContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.headerTitle}>{t('fileUploadModal.header')}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <CloseIcon width={24} height={24} fill={theme.colors.black60} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.helperText}>
                            {t('fileUploadModal.helperText')}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.dropZone}
                        onPress={pickDocument}
                    >
                        <View style={styles.dropZoneIcon}>
                            <FileBlankIcon width={32} height={32} />
                        </View>
                        <Text style={styles.dropZoneText}>
                            {t('fileUploadModal.dropZoneText')}
                        </Text>
                        <Text style={styles.dropZoneSubtext}>
                            {t('fileUploadModal.dropZoneSubtext')}
                        </Text>
                        <TouchableOpacity
                            style={styles.addFileButton}
                            onPress={pickDocument}
                        >
                            <Text style={styles.addFileButtonText}>{t('fileUploadModal.addFileButton')}</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>

                    {files.length > 0 && (
                        <View style={styles.filesList}>
                            {files.map(file => (
                                <View key={file.id} style={styles.fileItem}>
                                    <View style={styles.fileIcon}>
                                        <FileIcon extension={file.extension} />
                                    </View>
                                    <View style={styles.fileDetails}>
                                        <Text style={styles.fileName} numberOfLines={1}>
                                            {file.name}
                                        </Text>
                                        <Text style={styles.fileSize}>
                                            {formatFileSize(file.size)} из {formatFileSize(file.size)} •
                                            {file.status === 'uploading'
                                                ? ` ${t('fileUploadModal.fileUploading')}`
                                                : ` ${t('fileUploadModal.fileUploaded')}`}
                                        </Text>
                                        {file.status === 'uploading' && (
                                            <View style={styles.progressBar}>
                                                <View
                                                    style={[
                                                        styles.progressFill,
                                                        { width: `${file.progress}%` }
                                                    ]}
                                                />
                                            </View>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleRemoveFile(file.id)}
                                        style={styles.removeButton}
                                    >
                                        {file.status === 'uploading' ? (
                                            <Text style={{ fontSize: 18, color: theme.colors.black60 }}>×</Text>
                                        ) : (
                                            <TrashIcon
                                                width={18}
                                                height={18}
                                                fill={theme.colors.black60}
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={handleDone}
                            disabled={files.length === 0 || files.some(file => file.status === 'uploading')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.doneButtonText}>{t('fileUploadModal.doneButton')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}