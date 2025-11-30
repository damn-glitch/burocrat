import CalendarIcon from '@/assets/images/icons/calendarIcon.svg';
import TrashIcon from '@/assets/images/icons/trashIcon.svg';
import ActionSheet from '@/components/common-components/actionSheet';
import ConfirmModal from '@/components/common-components/confirmModal';
import { textStyles } from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { router, useRouter } from "expo-router";
import React, { useRef, useState } from 'react';
import { DimensionValue, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Participants from '@/components/common-components/participants';

type Participant = {
    id: string;
    avatar: string;
};

type ProjectCardProps = {
    id: string;
    title: string;
    to?: string;
    onPress?: () => void;
    progressPercentage?: number;
    showProgress?: boolean;
    participants?: Participant[];
    maxVisibleParticipants?: number;
    dueDate?: string;
    showDueDate?: boolean;
    cardWidth?: DimensionValue;
    cardHeight?: DimensionValue;
    backgroundColor?: string;
    settingButton?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onShare?: () => void;
};

export default function ProjectCard({
    id,
    title,
    to,
    onPress,
    progressPercentage,
    showProgress = true,
    participants = [],
    maxVisibleParticipants,
    dueDate,
    showDueDate = true,
    cardWidth,
    cardHeight,
    backgroundColor,
    settingButton = true,
    onEdit = () => router.push(`/companies/project/${id}/editProject`),
    onDelete = () => console.log('Delete project', id),
    onShare = () => console.log('Share project', id),
}: ProjectCardProps) {
    const theme = useTheme();
    const router = useRouter();
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const settingButtonRef = useRef<View>(null) as React.RefObject<View>;

    const actionOptions = [
        {
            label: "Поделиться",
            onPress: onShare,
            icon: 'share' as 'share',
        },
        {
            label: "Редактировать",
            onPress: onEdit,
            icon: 'edit' as 'edit',
        },
        {
            label: "Удалить",
            onPress: () => setShowDeleteModal(true),
            destructive: true,
            icon: 'delete' as 'delete',
        },
    ];

    const gradientPalette: Record<string, [string, string, string]> = {
        '#1E3A8A': ['#4287FF', '#0760FB', '#6DA0FF'],
        '#059669': ['#43E97B', '#38F9D7', '#059669'],
        '#6B7280': ['#A5A5A5', '#6B7280', '#374151'],
        '#8B5CF6': ['#A084E8', '#8B5CF6', '#692CD3'],
        '#BE185D': ['#FF5F6D', '#FFC371', '#BE185D'],
        '#374151': ['#4B5563', '#374151', '#111827'],
        '#D1D5DB': ['#5C5D5F', '#7E7E7E', '#A5A5A5'],
        '#F59E0B': ['#FFB347', '#F59E0B', '#FFD700'],
        '#EF4444': ['#FF5858', '#EF4444', '#810808'],
    };

    const fallbackGradients: [string, string, string][] = [
        ['#0760FB', '#4287FF', '#6DA0FF'],
        ['#0A2540', '#1B3A66', '#2C4F8C'],
        ['#121212', '#1E1E1E', '#3E3E3E'],
    ];

    const parsedId = parseInt(id, 10);
    const fallbackIndex = Number.isNaN(parsedId)
        ? 0
        : Math.abs(parsedId) % fallbackGradients.length;

    const backgroundGradient = backgroundColor && gradientPalette[backgroundColor]
        ? gradientPalette[backgroundColor]
        : fallbackGradients[fallbackIndex];

    const safeProgress = Math.max(0, Math.min(progressPercentage ?? 0, 100));
    const shouldShowProgress = showProgress && typeof progressPercentage === 'number';
    const hasParticipants = participants.length > 0;
    const shouldShowDueDate = showDueDate && Boolean(dueDate);

    const styles = StyleSheet.create({
        container: {
            width: cardWidth || 200,
            height: cardHeight || 140,
            borderRadius: 16,
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 16,
        },
        projectInfoContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: shouldShowProgress ? 8 : 0,
        },
        projectInfoTitle: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.white100,
            flex: 1,
        },
        settingButton: {
            paddingBottom: 8,
            paddingLeft: 8,
        },
        settingButtonText: {
            ...textStyles.semiBold,
            fontSize: 18,
            color: theme.colors.white100,
            letterSpacing: 2,
        },
        progressContainer: {
            flexDirection: 'column',
            gap: 6,
            marginBottom: 16,
        },
        progressContent: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        progressText: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.white100,
        },
        progressPercentageText: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.white80,
        },
        segmentedProgressBar: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            height: 4,
            gap: 2,
        },
        segmentContainer: {
            flex: 1,
            backgroundColor: theme.colors.white60,
            borderRadius: 2,
            overflow: 'hidden',
        },
        segment: {
            height: '100%',
            width: 0,
            backgroundColor: theme.colors.white100,
            borderRadius: 2,
        },
        extraInfoContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        dueDateContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        dueDateText: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.white80,
        },
    });

    const handleCardPress = () => {
        if (onPress) {
            onPress();
            return;
        }

        if (to) {
            router.push(to as any);
        }
    };

    return (
        <>
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleCardPress}
            >
                <LinearGradient
                    colors={backgroundGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.container}
                >
                    <View style={styles.projectInfoContainer}>
                        <Text
                            style={styles.projectInfoTitle}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {title}
                        </Text>
                        {settingButton && (
                            <TouchableOpacity
                                ref={settingButtonRef}
                                activeOpacity={0.8}
                                style={styles.settingButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setShowActionSheet(true);
                                }}
                            >
                                <Text style={styles.settingButtonText}>•••</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {shouldShowProgress && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressContent}>
                                <Text style={styles.progressText}>Прогресс</Text>
                                <Text style={styles.progressPercentageText}>{safeProgress}%</Text>
                            </View>

                            <View style={styles.segmentedProgressBar}>
                                {[0, 1, 2, 3, 4].map((segment) => {
                                    const segmentValue = 20;
                                    const segmentStartPercent = segment * segmentValue;
                                    const fillPercent = Math.max(
                                        0,
                                        Math.min(segmentValue, safeProgress - segmentStartPercent),
                                    );
                                    const isFilled = fillPercent > 0;

                                    return (
                                        <View key={segment} style={styles.segmentContainer}>
                                            <View
                                                style={[
                                                    styles.segment,
                                                    isFilled && { width: `${(fillPercent / segmentValue) * 100}%` },
                                                ]}
                                            />
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {(hasParticipants || shouldShowDueDate) && (
                        <View style={styles.extraInfoContainer}>
                            {hasParticipants ? (
                                <Participants
                                    participants={participants}
                                    maxVisible={maxVisibleParticipants || 2}
                                    avatarSize={24}
                                />
                            ) : (
                                <View />
                            )}

                            {shouldShowDueDate && (
                                <View style={styles.dueDateContainer}>
                                    <CalendarIcon
                                        width={16}
                                        height={16}
                                        stroke={theme.colors.white80}
                                        strokeWidth={1.5}
                                    />
                                    <Text style={styles.dueDateText}>{dueDate}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>

            <ActionSheet
                visible={showActionSheet}
                onClose={() => setShowActionSheet(false)}
                options={actionOptions}
                triggerRef={settingButtonRef}
            />

            <ConfirmModal
                visible={showDeleteModal}
                icon={<TrashIcon width={24} height={24} color="#EF4444" />}
                title={`Удалить проект “${title}”?`}
                description={`Этот проект будет безвозвратно удалён. Вы уверены, что хотите продолжить?`}
                confirmText="Удалить"
                cancelText="Отмена"
                confirmButtonBGcolor="#EF4444"
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    setShowDeleteModal(false);
                    onDelete?.();
                }}
            />
        </>
    );
}
