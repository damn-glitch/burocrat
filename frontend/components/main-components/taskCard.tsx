import TaskCompletedIcon from '@/assets/images/icons/taskCompletedIcon.svg';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Participants from '../common-components/participants';

type Participant = {
    id: string;
    avatar: string;
};

type TaskCardProps = {
    title: string;
    description: string;
    date: string;
    timeRange: string;
    participants: Participant[];
    maxVisibleParticipants?: number;
    isCompleted: boolean;
    onPress?: () => void;
    onStatusChange?: (completed: boolean) => void;
};

export default function TaskCard({ title, description, date, timeRange, participants, maxVisibleParticipants, isCompleted = false, onPress, onStatusChange, }: TaskCardProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            justifyContent: 'center',
            backgroundColor: theme.colors.white100,
            borderRadius: 16,
            padding: 16,
            height: 124,
            borderColor: theme.colors.black20,
            borderWidth: 1,
        },
        topContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        topContainerText: {
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
        },
        title: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
            textDecorationLine: isCompleted ? 'line-through' : 'none',
            textDecorationColor: theme.colors.primaryText,
        },
        description: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
        },
        timeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        dateText: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.secondaryText,
            marginRight: 4,
        },
        timeText: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.secondaryText,
        },
        bottomContainer: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        statusContainer: {
            width: 24,
            height: 24,
            borderColor: isCompleted ? "transparent" : theme.colors.black20,
            borderRadius: 12,
            borderWidth: 2,
            justifyContent: 'center',
            alignItems: 'center',
        },
        participantsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        avatarContainer: {
            marginLeft: -8,
        },
        avatarImage: {
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.white100,
        },
        extraParticipantsBadge: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: theme.colors.whiteIcon,
            borderWidth: 1,
            borderColor: theme.colors.white100,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: -8,
        },
        extraParticipantsText: {
            ...textStyles.medium,
            fontSize: 10,
            color: theme.colors.black80,
        },
        line: {
            width: '100%',
            height: 1,
            backgroundColor: theme.colors.black10,
        },
    });

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={1}
        >
            <View style={styles.topContainer}>
                <View style={styles.topContainerText}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    <Text style={styles.description} numberOfLines={1}>{description}</Text>
                </View>

                <TouchableOpacity
                    style={styles.statusContainer}
                    onPress={() => onStatusChange && onStatusChange(!isCompleted)}
                >
                    {isCompleted && (<TaskCompletedIcon />)}
                </TouchableOpacity>
            </View>

            <View style={styles.line} />

            <View style={styles.bottomContainer}>
                <View style={styles.timeContainer}>
                    <Text style={styles.dateText}>{date}</Text>
                    <Text style={styles.timeText}>{timeRange}</Text>
                </View>

                <View style={styles.participantsContainer}>
                    <Participants
                        participants={participants}
                        maxVisible={maxVisibleParticipants}
                        avatarSize={24}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
}