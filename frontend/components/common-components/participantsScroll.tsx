import { Image, ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';

type ParticipantCard = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    source: 'company' | 'invited';
};

type Props = {
    participants: ParticipantCard[];
    selectedParticipantIds: string[];
    onToggleParticipant: (participant: ParticipantCard) => void;
};

export default function ParticipantsScrollWrapper({
    participants,
    selectedParticipantIds,
    onToggleParticipant,
}: Props) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        wrapper: {
            marginHorizontal: -16,
            marginTop: 12,
        },
        content: {
            paddingHorizontal: 16,
            gap: 12,
        },
        card: {
            width: 140,
            minHeight: 160,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.black10,
            backgroundColor: theme.colors.white100,
            padding: 16,
            alignItems: 'center',
            gap: 12,
        },
        avatar: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.gray100,
        },
        name: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
            textAlign: 'center',
        },
        role: {
            ...textStyles.regular,
            fontSize: 12,
            color: theme.colors.black60,
            textAlign: 'center',
        },
        actionButton: {
            marginTop: 8,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: theme.colors.gray100,
        },
        actionButtonSelected: {
            backgroundColor: theme.colors.black100,
        },
        actionText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
            textAlign: 'center',
        },
        actionTextSelected: {
            color: theme.colors.white100,
        },
        avatarFallback: {
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {participants.map(participant => {
                    const isSelected =
                        participant.source === 'company'
                            ? selectedParticipantIds.includes(participant.id)
                            : true;

                    const actionLabel =
                        participant.source === 'company'
                            ? isSelected
                                ? 'Удалить'
                                : 'Добавить'
                            : 'Удалить';

                    return (
                        <View key={participant.id} style={styles.card}>
                            {participant.avatar ? (
                                <Image source={{ uri: participant.avatar }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarFallback]}>
                                    <Text style={styles.name}>{participant.name.charAt(0)}</Text>
                                </View>
                            )}
                            <Text style={styles.name}>{participant.name}</Text>
                            <Text style={styles.role}>{participant.role}</Text>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={[
                                    styles.actionButton,
                                    isSelected && styles.actionButtonSelected,
                                ]}
                                onPress={() => onToggleParticipant(participant)}
                            >
                                <Text
                                    style={[
                                        styles.actionText,
                                        isSelected && styles.actionTextSelected,
                                    ]}
                                >
                                    {actionLabel}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}
