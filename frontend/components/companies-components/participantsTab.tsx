import Skeleton from '@/components/common-components/skeleton';
import { useTheme } from '@/context/ThemeContext';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import AddParticipantsModal from './addParticipantsModal';
import ParticipantCard from './participantCard';

export type Participant = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'Владелец' | 'Исполнитель' | 'Наблюдатель' | 'Администратор';
};

export type ParticipantsTabRef = {
    openAddParticipantsModal: () => void;
};

type ParticipantsTabProps = {
    participants: Participant[];
    onParticipantAdded?: (email: string, role: string) => void;
    availableRoles?: string[];
    isLoading?: boolean;
};

const ParticipantsTab = forwardRef<ParticipantsTabRef, ParticipantsTabProps>((props, ref) => {
    const {
        participants = [],
        onParticipantAdded,
        availableRoles = ["Владелец", "Исполнитель", "Наблюдатель"],
        isLoading = false
    } = props;

    const theme = useTheme();
    const { t } = useTranslation(); 
    const [showAddParticipantsModal, setShowAddParticipantsModal] = useState(false);

    useImperativeHandle(ref, () => ({
        openAddParticipantsModal: () => {
            setShowAddParticipantsModal(true);
        }
    }));

    const handleParticipantAdded = (email: string, role: string) => {
        if (onParticipantAdded) {
            onParticipantAdded(email, role);
        }
    };

    const styles = StyleSheet.create({
        container: {
            gap: 8
        },
        skeletonContainer: {
            marginBottom: 8
        },
        skeletonRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        skeletonAvatarContainer: {
            marginRight: 12
        },
        skeletonInfoContainer: {
            flex: 1
        }
    });

    const renderSkeleton = () => {
        return Array(3).fill(0).map((_, index) => (
            <View key={index} style={styles.skeletonContainer}>
                <View style={styles.skeletonRow}>
                    <View style={styles.skeletonAvatarContainer}>
                        <Skeleton
                            width={40}
                            height={40}
                            style={{ borderRadius: 20 }}
                        />
                    </View>
                    <View style={styles.skeletonInfoContainer}>
                        <Skeleton
                            width="40%"
                            height={18}
                            style={{ marginBottom: 4 }}
                        />
                        <Skeleton
                            width="60%"
                            height={14}
                        />
                    </View>
                    <Skeleton
                        width={100}
                        height={32}
                        style={{ borderRadius: 16 }}
                    />
                </View>
            </View>
        ));
    };

    return (
        <>
            <View style={styles.container}>
                {isLoading ? (
                    renderSkeleton()
                ) : (
                    participants.map(participant => (
                        <ParticipantCard
                            key={participant.id}
                            name={participant.name}
                            avatar={participant.avatar}
                            role={participant.role}
                            availableRoles={availableRoles}
                        />
                    ))
                )}
            </View>

            <AddParticipantsModal
                visible={showAddParticipantsModal}
                onClose={() => setShowAddParticipantsModal(false)}
                onAddParticipant={handleParticipantAdded}
                companyParticipants={participants}
            />
        </>
    );
});

ParticipantsTab.displayName = 'ParticipantsTab';

export default ParticipantsTab;