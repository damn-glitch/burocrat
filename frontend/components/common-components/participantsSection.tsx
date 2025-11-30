import AddParticipantIcon from '@/assets/images/icons/addParticipantIcon.svg';
import ParticipantsScrollWrapper from '@/components/common-components/participantsScroll';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    onAddPress: () => void;
    title?: string;
    addButtonLabel?: string;
};

export default function ParticipantsSection({
    participants,
    selectedParticipantIds,
    onToggleParticipant,
    onAddPress,
    title,
    addButtonLabel,
}: Props) {
    const theme = useTheme();
    const { t } = useTranslation();

    const styles = StyleSheet.create({
        participantsSection: {
            marginTop: 24,
        },
        participantsHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        sectionLabel: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        addParticipantButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: theme.colors.gray100,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
        },
        addParticipantText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
    });

    return (
        <View style={styles.participantsSection}>
            <View style={styles.participantsHeader}>
                <Text style={styles.sectionLabel}>
                    {title ?? t('projectForm.fields.participants')}
                </Text>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.addParticipantButton}
                    onPress={onAddPress}
                >
                    <AddParticipantIcon width={18} height={18} />
                    <Text style={styles.addParticipantText}>
                        {addButtonLabel ?? t('projectForm.fields.addParticipant')}
                    </Text>
                </TouchableOpacity>
            </View>
            <ParticipantsScrollWrapper
                participants={participants}
                selectedParticipantIds={selectedParticipantIds}
                onToggleParticipant={onToggleParticipant}
            />
        </View>
    );
}
