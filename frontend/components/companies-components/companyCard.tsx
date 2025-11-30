import TrashIcon from '@/assets/images/icons/trashIcon.svg';
import ActionSheet from '@/components/common-components/actionSheet';
import ConfirmModal from '@/components/common-components/confirmModal';
import { textStyles } from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CompanyCardProps = {
    id: string;
    title: string;
    userRole: string;
    creationDate: string;
    settingButton?: boolean;
    backgroundColor?: string;
    isArchived?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onArchive?: () => void;
    onShare?: () => void;
    onRestore?: () => void;
};

export default function CompanyCard({
    id,
    title,
    userRole,
    creationDate,
    settingButton = true,
    backgroundColor,
    isArchived = false,
    onEdit = () => console.log('Edit company', id),
    onDelete = () => console.log('Delete company', id),
    onShare = () => console.log('Share company', id),
    onArchive = () => console.log('Archive company', id),
    onRestore = () => console.log('Restore company', id),
}: CompanyCardProps) {
    const theme = useTheme();
    const { t } = useTranslation();
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const settingButtonRef = useRef<View>(null) as React.RefObject<View>;

    const actionOptions = isArchived
        ? [
            {
                label: t('companies.companyCard.actions.restore'),
                onPress: onRestore,
                icon: 'restore' as 'restore',
            },
            {
                label: t('companies.companyCard.actions.delete'),
                onPress: () => setShowConfirmModal(true),
                destructive: true,
                icon: 'delete' as 'delete',
            },
        ]
        : [
            {
                label: t('companies.companyCard.actions.share'),
                onPress: onShare,
                icon: 'share' as 'share',
            },
            {
                label: t('companies.companyCard.actions.edit'),
                onPress: onEdit,
                icon: 'edit' as 'edit',
            },
            {
                label: t('companies.companyCard.actions.delete'),
                onPress: () => setShowConfirmModal(true),
                destructive: true,
                icon: 'delete' as 'delete',
            },
        ];

    const gradientPalette: Record<string, [string, string, string]> = {
        '#1E3A8A': ['#150F4D', '#2b2566ff', '#3b389bff'],
        '#059669': ['#034734ff', '#085f46ff', '#059669'],
        '#6B7280': ['#374151', '#4B5563', '#6B7280'],
        '#8B5CF6': ['#4a11a7ff', '#692cd3ff', '#8B5CF6'],
        '#BE185D': ['#4d0c26ff', '#941447ff', '#BE185D'],
        '#374151': ['#111827', '#1F2937', '#374151'],
        '#D1D5DB': ['#5c5d5fff', '#7e7e7eff', '#a5a5a5ff'],
        '#F59E0B': ['#B45309', '#D97706', '#F59E0B'],
        '#EF4444': ['#810808ff', '#b61e1eff', '#EF4444'],
    };

    const backgroundGradient = backgroundColor && gradientPalette[backgroundColor]
        ? gradientPalette[backgroundColor]
        : gradientPalette['#1E3A8A'];

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            height: 180,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 21,
            flexDirection: 'column',
            justifyContent: 'space-between',
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        settingButton: {
            paddingBottom: 8,
            paddingLeft: 8,
        },
        settingButtonText: {
            color: theme.colors.white100,
            fontSize: 20,
        },
        content: {
            flexDirection: 'column',
            gap: 16,
        },
        title: {
            ...textStyles.semiBold,
            color: theme.colors.white100,
            fontSize: 24,
        },
        bottomContent: {
            flexDirection: 'row',
            gap: 46,
            alignItems: 'center',
        },
        contentContainer: {
            flexDirection: 'column',
            gap: 4,
        },
        contentTitle: {
            ...textStyles.medium,
            color: theme.colors.white60,
            fontSize: 14,
        },
        contentValue: {
            ...textStyles.medium,
            color: theme.colors.white100,
            fontSize: 14,
        },

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
            backgroundColor: theme.colors.blue,
            height: 36,
        },
        confirmButtonText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.white100,
        },
    });

    return (
        <>
            <LinearGradient
                colors={backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <View style={styles.actions}>
                    {settingButton && (
                        <TouchableOpacity
                            ref={settingButtonRef}
                            activeOpacity={0.8}
                            style={styles.settingButton}
                            onPress={(e) => {
                                if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
                                if (e && typeof e.preventDefault === 'function') e.preventDefault();
                                setShowActionSheet(true);
                            }}
                            onPressIn={(e) => {
                                if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
                            }}
                        >
                            <Text style={styles.settingButtonText}>•••</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.bottomContent}>
                        <View style={styles.contentContainer}>
                            <Text style={styles.contentTitle}>{t('companies.companyCard.role')}</Text>
                            <Text style={styles.contentValue}>{userRole}</Text>
                        </View>
                        <View style={styles.contentContainer}>
                            <Text style={styles.contentTitle}>{t('companies.companyCard.creationDate')}</Text>
                            <Text style={styles.contentValue}>{creationDate}</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ActionSheet
                visible={showActionSheet}
                onClose={() => setShowActionSheet(false)}
                options={actionOptions}
                triggerRef={settingButtonRef}
            />

            <ConfirmModal
                visible={showConfirmModal}
                icon={<TrashIcon width={24} height={24} color="#EF4444" />}
                title={t('companies.companyCard.confirmModal.title', { title })}
                description={t('companies.companyCard.confirmModal.description')}
                confirmText={t('companies.companyCard.confirmModal.confirmText')}
                cancelText={t('companies.companyCard.confirmModal.cancelText')}
                onCancel={() => setShowConfirmModal(false)}
                onConfirm={() => {
                    setShowConfirmModal(false);
                    onArchive?.();
                }}
                confirmButtonBGcolor={theme.colors.blue}
            />
        </>
    );
}


