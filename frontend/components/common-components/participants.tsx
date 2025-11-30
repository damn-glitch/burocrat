import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

type Participant = {
    id: string;
    avatar: string;
};

type ParticipantsProps = {
    participants: Participant[];
    maxVisible?: number;
    avatarSize?: number;
    style?: object;
};

export default function Participants({
    participants,
    maxVisible = 2,
    avatarSize = 24,

    style = {}
}: ParticipantsProps) {
    const theme = useTheme();
    
    const hasMoreParticipants = participants.length > maxVisible;
    
    const extraParticipantsCount = hasMoreParticipants ? 
        participants.length - maxVisible : 0;
    
    const visibleParticipants = hasMoreParticipants ? 
        participants.slice(0, maxVisible) : participants;

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        avatarContainer: {
            marginLeft: -avatarSize / 3,
        },
        firstAvatarContainer: {
            marginLeft: 0,
        },
        avatarImage: {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            borderWidth: 1,
            borderColor:  theme.colors.white100,
        },
        extraParticipantsBadge: {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            backgroundColor: theme.colors.whiteIcon,
            borderWidth: 1,
            borderColor: theme.colors.white100,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: -avatarSize / 3,
        },
        extraParticipantsText: {
            ...textStyles.medium,
            fontSize: avatarSize * 0.4,
            color: theme.colors.black80,
        },
    });

    return (
        <View style={[styles.container, style]}>
            {visibleParticipants.map((participant, index) => (
                <View
                    key={participant.id}
                    style={[
                        styles.avatarContainer,
                        index === 0 && styles.firstAvatarContainer,
                        { zIndex: index }
                    ]}
                >
                    <Image
                        source={{ uri: participant.avatar }}
                        style={styles.avatarImage}
                    />
                </View>
            ))}

            {hasMoreParticipants && (
                <View
                    style={[
                        styles.extraParticipantsBadge,
                        { zIndex: participants.length + 1 }
                    ]}
                >
                    <Text style={styles.extraParticipantsText}>
                        +{extraParticipantsCount}
                    </Text>
                </View>
            )}
        </View>
    );
}