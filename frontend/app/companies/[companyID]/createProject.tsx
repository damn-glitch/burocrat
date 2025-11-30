import CalendarIcon from '@/assets/images/icons/calendarIcon.svg';
import CalendarWithPeriod from '@/components/common-components/calendarWithPeriod';
import FilesSection from '@/components/common-components/filesSection';
import Header from '@/components/common-components/header';
import ModalWindow from '@/components/common-components/modal';
import ParticipantsSection from '@/components/common-components/participantsSection';
import PrimaryButton from '@/components/common-components/primaryButton';
import UniversalTextInput from '@/components/common-components/universalTextInput';
import AddParticipantsModal from '@/components/companies-components/addParticipantsModal';
import ProjectCard from '@/components/main-components/projectCard';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApi } from '@/api';

type ParticipantCard = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    source: 'company' | 'invited';
};

type PeriodValue = {
    start: string | null;
    end: string | null;
};

const COLORS = ['#1E3A8A', '#059669', '#6B7280', '#8B5CF6', '#BE185D', '#374151', '#D1D5DB', '#F59E0B', '#EF4444'];

const COMPANY_PARTICIPANTS: ParticipantCard[] = [
    {
        id: '1',
        name: 'Nurzat S.',
        email: 'nurzat@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        role: 'Менеджер',
        source: 'company',
    },
    {
        id: '2',
        name: 'Eldos M.',
        email: 'eldos@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        role: 'Дизайнер',
        source: 'company',
    },
    {
        id: '3',
        name: 'Tleukhan M.',
        email: 'tleukhan@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        role: 'Разработчик',
        source: 'company',
    },
];

const FILES_SECTION_DESCRIPTION =
    'Прикрепите файлы, важные для проекта. Участники смогут увидеть их в разделе «О проекте».';
const FILES_SECTION_HINT = 'Выберите файл или перетащите его сюда\nPDF, DOC, PNG, JPEG форматы до 50 МБ';

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year.slice(2)}`;
};

export default function CreateProject() {
    const theme = useTheme();
    const router = useRouter();
    const { t } = useTranslation();

    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
    const [invitedParticipants, setInvitedParticipants] = useState<ParticipantCard[]>([]);
    const [participantsModalVisible, setParticipantsModalVisible] = useState(false);

    const [files, setFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);

    const [period, setPeriod] = useState<PeriodValue>({ start: null, end: null });
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const { companyID } = useLocalSearchParams();
    const { execute } = useApi();
    const createProjectRequest = async () => {
        const response = await execute({
            method: 'POST',
            url: `/project`, // твой endpoint
            data: {
                name: projectName,
                description: projectDescription,
                color: selectedColor,
                company_id: +companyID,
                participants: participantsPreview.map(participant => ({
                    id: participant.id,
                    name: participant.name,
                    email: participant.email,
                    role: participant.role,
                })),
                files: files.map(file => file.name),
                period,
            },
        });

        // Предполагаем, что response.data содержит массив компаний
        console.log(response);
    };

    const participantsPreview = useMemo(
        () => [
            ...COMPANY_PARTICIPANTS.filter(participant => selectedParticipantIds.includes(participant.id)),
            ...invitedParticipants,
        ],
        [selectedParticipantIds, invitedParticipants]
    );

    const projectCardParticipants = participantsPreview.map(participant => ({
        id: participant.id,
        avatar: participant.avatar,
    }));

    const projectCardDueDate =
        period.start && period.end ? `${formatDate(period.start)} - ${formatDate(period.end)}` : undefined;

    const handleToggleParticipant = (participant: ParticipantCard) => {
        if (participant.source === 'company') {
            setSelectedParticipantIds(prev =>
                prev.includes(participant.id) ? prev.filter(id => id !== participant.id) : [...prev, participant.id]
            );
            return;
        }

        setInvitedParticipants(prev => prev.filter(item => item.id !== participant.id));
    };

    const handleAddInvitedParticipant = (email: string, role: string) => {
        const nameCandidate = email.split('@')[0] || 'Новый участник';
        const name = nameCandidate.charAt(0).toUpperCase() + nameCandidate.slice(1);

        const newParticipant: ParticipantCard = {
            id: `invited-${Date.now()}`,
            name,
            email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            role,
            source: 'invited',
        };

        setInvitedParticipants(prev => [...prev, newParticipant]);
        setParticipantsModalVisible(false);
    };

    const handlePickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({ multiple: true });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setFiles(prev => [...prev, ...result.assets]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleSaveProject = () => {
        console.log('Создание проекта', {
            name: projectName,
            description: projectDescription,
            color: selectedColor,
            participants: participantsPreview.map(participant => ({
                id: participant.id,
                name: participant.name,
                email: participant.email,
                role: participant.role,
            })),
            files: files.map(file => file.name),
            period,
        });
        createProjectRequest().then(() => {
            router.back();
        });
    };

    const participantsForDisplay = useMemo(
        () => [...COMPANY_PARTICIPANTS, ...invitedParticipants],
        [invitedParticipants]
    );

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.white100,
            paddingHorizontal: 16,
        },
        pageTitle: {
            ...textStyles.semiBold,
            fontSize: 24,
            color: theme.colors.primaryText,
            marginTop: 24,
        },
        previewContainer: {
            marginTop: 24,
        },
        colorsContainer: {
            marginTop: 16,
        },
        colorLabel: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
            marginBottom: 8,
        },
        sectionTitle: {
            ...textStyles.semiBold,
            fontSize: 20,
            color: theme.colors.primaryText,
            marginTop: 32,
        },
        sectionLabel: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        colorsScrollContainer: {
            paddingVertical: 8,
        },
        colorCircle: {
            width: 40,
            height: 40,
            borderRadius: 40,
            marginRight: 12,
            borderColor: 'transparent',
        },
        selectedColorCircle: {
            borderColor: theme.colors.black40,
            borderWidth: 4,
            elevation: 2,
        },
        participantsSection: {
            marginTop: 24,
        },
        participantsHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
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

        periodSection: {
            marginTop: 32,
        },
        periodSelector: {
            marginTop: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.black20,
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: theme.colors.white100,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        periodInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            flex: 1,
        },
        periodTextGroup: {
            flexDirection: 'column',
            gap: 4,
        },
        periodLabel: {
            ...textStyles.regular,
            fontSize: 12,
            color: theme.colors.secondaryText,
        },
        periodValue: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        clearPeriodButton: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: theme.colors.gray100,
            marginLeft: 12,
        },
        clearPeriodText: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.primaryText,
        },
        saveButtonContainer: {
            marginVertical: 40,
        },
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <Header
                    title={t('projectForm.headerCreate')}
                    titleFontSize={16}
                    backButton
                    backButtonColor={theme.colors.black60}
                    backButtonBGroundColor={theme.colors.white100}
                />

                <Text style={styles.pageTitle}>{t('projectForm.mainTitleCreate')}</Text>

                <View style={styles.previewContainer}>
                    <ProjectCard
                        id="preview"
                        title={projectName || 'Название'}
                        progressPercentage={0}
                        showProgress={true}
                        participants={projectCardParticipants}
                        dueDate={projectCardDueDate}
                        showDueDate={Boolean(projectCardDueDate)}
                        cardWidth="100%"
                        cardHeight={180}
                        backgroundColor={selectedColor}
                        settingButton={false}
                    />
                </View>

                <UniversalTextInput
                    label={t('projectForm.fields.title')}
                    placeholder={t('projectForm.fields.titlePlaceholder')}
                    containerStyle={{ marginTop: 24 }}
                    value={projectName}
                    onChangeText={setProjectName}
                />

                <View style={styles.colorsContainer}>
                    <Text style={styles.colorLabel}>{t('projectForm.fields.color')}</Text>
                    <View style={{ marginHorizontal: -16 }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
                        >
                            {COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorCircle,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.selectedColorCircle,
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                    activeOpacity={0.8}
                                />
                            ))}
                        </ScrollView>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{t('projectForm.fields.detailsTitle')}</Text>

                <UniversalTextInput
                    label={t('projectForm.fields.description')}
                    placeholder={t('projectForm.fields.descriptionPlaceholder')}
                    multiline
                    numberOfLines={4}
                    inputStyle={{ minHeight: 96, textAlignVertical: 'top' }}
                    containerStyle={{ marginTop: 16 }}
                    value={projectDescription}
                    onChangeText={setProjectDescription}
                />

                <ParticipantsSection
                    participants={participantsForDisplay}
                    selectedParticipantIds={selectedParticipantIds}
                    onToggleParticipant={handleToggleParticipant}
                    onAddPress={() => setParticipantsModalVisible(true)}
                />

                <FilesSection
                    files={files}
                    onRemoveFile={handleRemoveFile}
                    onPickFile={handlePickFile}
                    description={t('projectForm.fields.filesDescription')}
                    uploadHint={t('projectForm.fields.filesHint')}
                    uploadButtonLabel={t('projectForm.fields.uploadFile')}
                    removeButtonLabel={t('projectForm.fields.removeFile')}
                />

                <View style={styles.periodSection}>
                    <Text style={styles.sectionLabel}>{t('projectForm.fields.period')}</Text>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.periodSelector}
                        onPress={() => setShowCalendarModal(true)}
                    >
                        <View style={styles.periodInfo}>
                            <CalendarIcon width={24} height={24} stroke={theme.colors.black40} strokeWidth={1.5} />
                            <View style={styles.periodTextGroup}>
                                <Text style={styles.periodLabel}>{t('projectForm.fields.periodLabel')}</Text>
                                <Text style={styles.periodValue}>
                                    {projectCardDueDate ?? t('projectForm.fields.periodValue')}
                                </Text>
                            </View>
                        </View>

                        {projectCardDueDate && (
                            <TouchableOpacity
                                style={styles.clearPeriodButton}
                                onPress={() => setPeriod({ start: null, end: null })}
                            >
                                <Text style={styles.clearPeriodText}>{t('projectForm.fields.clearPeriod')}</Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.saveButtonContainer}>
                    <PrimaryButton label={t('projectForm.saveButtonCreate')} onPress={handleSaveProject} />
                </View>
            </ScrollView>

            <ModalWindow
                visible={showCalendarModal}
                onCancel={() => setShowCalendarModal(false)}
                onConfirm={() => setShowCalendarModal(false)}
            >
                <CalendarWithPeriod
                    value={period}
                    onSave={range => {
                        setPeriod(range);
                        setShowCalendarModal(false);
                    }}
                    onClose={() => setShowCalendarModal(false)}
                />
            </ModalWindow>

            <AddParticipantsModal
                visible={participantsModalVisible}
                onClose={() => setParticipantsModalVisible(false)}
                onAddParticipant={handleAddInvitedParticipant}
                companyParticipants={COMPANY_PARTICIPANTS.map(({ id, name, email, avatar, role }) => ({
                    id,
                    name,
                    email,
                    avatar,
                    role: role as any,
                }))}
            />
        </SafeAreaView>
    );
}
