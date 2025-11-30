import FileBlankIcon from '@/assets/images/icons/fileBlankIcon.svg';
import TrashIcon from '@/assets/images/icons/trashIcon.svg';
import FileIcon from '@/components/common-components/fileIcons';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

type FileLike = {
    name: string;
    size?: number;
};

type FileSectionProps = {
    files: FileLike[];
    onRemoveFile: (index: number) => void;
    onPickFile: () => void;
    title?: string | null;
    description?: string;
    uploadHint?: string;
    uploadButtonLabel?: string;
    removeButtonLabel?: string;
    style?: StyleProp<ViewStyle>;
};

function formatFileSize(size: number | undefined): string {
    if (!size || size <= 0) {
        return '0 Б';
    }

    if (size < 1024) {
        return `${size} Б`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} КБ`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} МБ`;
}

export default function FilesSection({
    files,
    onRemoveFile,
    onPickFile,
    title,
    description,
    uploadHint,
    uploadButtonLabel,
    removeButtonLabel,
    style,
}: FileSectionProps) {
    const theme = useTheme();
    const { t } = useTranslation();

    const styles = StyleSheet.create({
        container: {
            marginTop: 24,
            gap: 16,
        },
        title: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        description: {
            ...textStyles.regular,
            fontSize: 14,
            color: theme.colors.secondaryText,
        },
        uploadArea: {
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.colors.black20,
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
            gap: 12,
            backgroundColor: theme.colors.white100,
        },
        uploadHint: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
            textAlign: 'center',
        },
        uploadButton: {
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: theme.colors.gray100,
        },
        uploadButtonText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        fileList: {
            gap: 12,
        },
        fileCard: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.black10,
            backgroundColor: theme.colors.white100,
        },
        fileInfo: {
            flex: 1,
            gap: 4,
            minWidth: 0,
        },
        fileName: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        fileSize: {
            ...textStyles.regular,
            fontSize: 12,
            color: theme.colors.secondaryText,
        },
        removeButton: {

        },
        removeButtonText: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.primaryText,
        },
    });

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.title}>
                {title ?? t('projectForm.fields.files')}
            </Text>
            <Text style={styles.description}>
                {description ?? t('projectForm.fields.filesDescription')}
            </Text>

            <TouchableOpacity activeOpacity={0.85} style={styles.uploadArea} onPress={onPickFile}>
                <FileBlankIcon width={24} height={24} />
                <Text style={styles.uploadHint}>
                    {uploadHint ?? t('projectForm.fields.filesHint')}
                </Text>
                <View style={styles.uploadButton}>
                    <Text style={styles.uploadButtonText}>
                        {uploadButtonLabel ?? t('projectForm.fields.uploadFile')}
                    </Text>
                </View>
            </TouchableOpacity>

            <View style={styles.fileList}>
                {files.map((file, index) => {
                    const extension = file.name.split('.').pop()?.toLowerCase();
                    return (
                        <View key={`${file.name}-${index}`} style={styles.fileCard}>
                            <FileIcon extension={extension} />
                            <View style={styles.fileInfo}>
                                <Text numberOfLines={1} style={styles.fileName}>
                                    {file.name}
                                </Text>
                                <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.removeButton}
                                activeOpacity={0.8}
                                onPress={() => onRemoveFile(index)}
                            >
                                <TrashIcon width={20} height={20} fill={theme.colors.black60} />
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
