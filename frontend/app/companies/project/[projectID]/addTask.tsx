import CalendarIcon from '@/assets/images/icons/calendarIcon.svg';
import CheckedIcon from '@/assets/images/icons/checkedIcon.svg';
import ClockIcon from '@/assets/images/icons/clockIcon.svg';
import DeleteIcon from '@/assets/images/icons/deleteIcon.svg';
import PlusIcon from '@/assets/images/icons/plusIcon.svg';
import CalendarWithPeriod from '@/components/common-components/calendarWithPeriod';
import Dropdown from '@/components/common-components/dropdown';
import Error from '@/components/common-components/error';
import FileIcon from '@/components/common-components/fileIcons';
import FilesSection from '@/components/common-components/filesSection';
import Header from '@/components/common-components/header';
import ModalWindow from '@/components/common-components/modal';
import PrimaryButton from '@/components/common-components/primaryButton';
import UniversalTextInput from '@/components/common-components/universalTextInput';
import ParticipantsSection from '@/components/common-components/participantsSection';
import AddParticipantsModal from '@/components/companies-components/addParticipantsModal';
import { COMPANY_DOCUMENTS, CompanyDocument, parseSelectedDocumentsParam } from '@/constants/companyDocuments';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const TASK_TYPES = [
    { key: 'meeting', label: 'Собрание', color: '#4287FF' },
    { key: 'appointment', label: 'Встреча', color: '#BA6EFA' },
    { key: 'delivery', label: 'Доставка', color: '#2EBAD8' },
    { key: 'report', label: 'Отчет', color: '#FE6AC1' },
    { key: 'call', label: 'Созвон', color: '#779FED' },
];

type ParticipantCard = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    source: 'company' | 'invited';
};

const COMPANY_PARTICIPANTS: ParticipantCard[] = [
    {
        id: '1',
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        avatar: '',
        role: 'Владелец',
        source: 'company',
    },
    {
        id: '2',
        name: 'Мария Петрова',
        email: 'maria@example.com',
        avatar: '',
        role: 'Исполнитель',
        source: 'company',
    },
];

export default function AddTask() {
    const theme = useTheme();
    const { t } = useTranslation();
    const router = useRouter();
    const params = useLocalSearchParams<{ projectID?: string | string[]; selectedDocs?: string | string[] }>();

    const projectIDParam = useMemo(() => {
        if (typeof params.projectID === 'string' && params.projectID.length > 0) {
            return params.projectID;
        }
        if (Array.isArray(params.projectID) && params.projectID[0]) {
            return params.projectID[0];
        }
        return '[projectID]';
    }, [params.projectID]);

    const initialSelectedDocIds = useMemo(
        () => parseSelectedDocumentsParam(params.selectedDocs),
        [params.selectedDocs],
    );

    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [files, setFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
    const [dateType, setDateType] = useState<'today' | 'tomorrow' | 'period'>('today');
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [period, setPeriod] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('23:30');
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');
    const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
    const [selectedCompanyDocIds, setSelectedCompanyDocIds] = useState<string[]>(initialSelectedDocIds);
    const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
    const [invitedParticipants, setInvitedParticipants] = useState<ParticipantCard[]>([]);

    useEffect(() => {
        setSelectedCompanyDocIds(prev => {
            const incoming = initialSelectedDocIds;
            if (incoming.length === prev.length && incoming.every(id => prev.includes(id))) {
                return prev;
            }
            return incoming;
        });
    }, [initialSelectedDocIds]);

    const documentById = useMemo(() => {
        const map = new Map<string, CompanyDocument>();
        COMPANY_DOCUMENTS.forEach(doc => map.set(doc.id, doc));
        return map;
    }, []);

    const recentCompanyDocs = useMemo(() => {
        const selectedDocs = selectedCompanyDocIds
            .map(id => documentById.get(id))
            .filter((doc): doc is CompanyDocument => Boolean(doc));

        const sortedByDate = [...COMPANY_DOCUMENTS].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );

        const combined: CompanyDocument[] = [];

        selectedDocs.forEach(doc => {
            if (!combined.find(item => item.id === doc.id)) {
                combined.push(doc);
            }
        });

        sortedByDate.forEach(doc => {
            if (!combined.find(item => item.id === doc.id)) {
                combined.push(doc);
            }
        });

        return combined.slice(0, 3);
    }, [selectedCompanyDocIds, documentById]);

    const participantsForDisplay = useMemo(
        () => [...COMPANY_PARTICIPANTS, ...invitedParticipants],
        [invitedParticipants],
    );

    const handleCompanyDocPress = (doc: CompanyDocument) => {
        setSelectedCompanyDocIds(prev => {
            const next = prev.includes(doc.id)
                ? prev.filter(id => id !== doc.id)
                : [...prev, doc.id];

            const nextValue = next.join(',');
            router.setParams({ selectedDocs: nextValue.length > 0 ? nextValue : undefined });
            return next;
        });
    };

    const handleMorePress = () => {
        const selectedParam = selectedCompanyDocIds.filter(Boolean).join(',');
        router.push({
            pathname: '/companies/project/[projectID]/selectDocs',
            params: {
                projectID: projectIDParam,
                ...(selectedParam ? { selectedDocs: selectedParam } : {}),
            },
        });
    };

    const handleToggleParticipant = (participant: ParticipantCard) => {
        if (participant.source === 'company') {
            setSelectedParticipantIds(prev =>
                prev.includes(participant.id)
                    ? prev.filter(id => id !== participant.id)
                    : [...prev, participant.id],
            );
            return;
        }

        setInvitedParticipants(prev => prev.filter(item => item.id !== participant.id));
    };

    const handleAddInvitedParticipant = (email: string, role: string) => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            return;
        }

        const namePart = trimmedEmail.split('@')[0];
        const newParticipant: ParticipantCard = {
            id: Date.now().toString(),
            name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
            email: trimmedEmail,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(namePart)}&background=random`,
            role,
            source: 'invited',
        };

        setInvitedParticipants(prev => [...prev, newParticipant]);
    };

    const handlePickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({ multiple: true });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setFiles(prev => [...prev, ...result.assets]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, fileIndex) => fileIndex !== index));
    };

    const generateTimes = () => {
        const times = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hh = h.toString().padStart(2, '0');
                const mm = m.toString().padStart(2, '0');
                times.push(`${hh}:${mm}`);
            }
        }
        return times;
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}.${month}.${year.slice(2)}`;
    };

    const times = generateTimes();


    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.white100,
            paddingHorizontal: 16,
        },

        mainTitle: {
            ...textStyles.semiBold,
            fontSize: 24,
            color: theme.colors.primaryText,
            marginTop: 24,
        },
        taskItemContainer: {
            marginTop: 24,
            flexDirection: 'column',
            gap: 8,
        },
        taskItemTitle: {
            ...textStyles.semiBold,
            color: theme.colors.primaryText,
            fontSize: 16,
        },
        typesWrap: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 8,
        },
        typeBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            borderWidth: 1,
            paddingHorizontal: 20,
            paddingVertical: 8,
            marginBottom: 8,
            backgroundColor: 'transparent',
        },
        typeBtnText: {
            ...textStyles.medium,
            fontSize: 14,
        },
        addTypeBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.colors.black20,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
        },

        companyDocsSection: {
            marginTop: 12,
        },
        companyDocsHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        companyDocsTitle: {
            ...textStyles.semiBold,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        moreButtonText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.blue,
        },
        companyDocsList: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 12,
        },
        companyDocCard: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: theme.colors.black10,
            borderRadius: 12,
            backgroundColor: theme.colors.white100,
            width: 220
        },
        companyDocCardSelected: {
            borderColor: theme.colors.blue,
        },
        companyDocIcon: {
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
        },
        companyDocInfo: {
            flex: 1,
            minWidth: 0,
        },
        companyDocName: {
            ...textStyles.semiBold,
            fontSize: 14,
            color: theme.colors.primaryText,
            maxWidth: 120,
        },
        companyDocMeta: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.secondaryText,
            marginTop: 4,
            maxWidth: 120,
        },
        companyDocAction: {
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.black10,
            backgroundColor: theme.colors.white100,
            alignItems: 'center',
            justifyContent: 'center',
        },
        companyDocActionSelected: {
            borderColor: theme.colors.blue,
        },

        periodsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
        },
        periodButton: {
            paddingVertical: 8,
            width: '32%',
            borderRadius: 8,
            backgroundColor: theme.colors.white100,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.black20,
        },
        periodButtonText: {
            ...textStyles.semiBold,
            fontSize: 12,
            color: theme.colors.primaryText,
        },
        periodButtonActive: {
            backgroundColor: theme.colors.black100,
        },
        periodButtonTextActive: {
            color: theme.colors.white100,
        },
        selectedPeriodBlock: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 16,
            backgroundColor: theme.colors.white100,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.black20,
            height: 54,
            paddingHorizontal: 20,
        },
        selectedPeriodLabel: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.primaryText,
        },
        selectedPeriodDates: {
            ...textStyles.semiBold,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        clearPeriodBtn: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.white100,
        },
        clearPeriodBtnText: {
            fontSize: 14,
            color: theme.colors.black60,
        },
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 56 }}
            >
                <Header
                    title={t('addTask.header')}
                    titleFontSize={16}
                    backButton
                    backButtonColor={theme.colors.black60}
                    backButtonBGroundColor={theme.colors.white100}
                />

                <Text style={styles.mainTitle}>{t('addTask.mainTitle')}</Text>

                <UniversalTextInput
                    label={t('addTask.fields.title')}
                    placeholder={t('addTask.fields.titlePlaceholder')}
                    containerStyle={{ marginTop: 24 }}
                    value={title}
                    onChangeText={setTitle}
                />

                <View style={styles.taskItemContainer}>
                    <Text style={styles.taskItemTitle}>{t('addTask.fields.type')}</Text>
                    <View style={styles.typesWrap}>
                        {TASK_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type.key}
                                style={[
                                    styles.typeBtn,
                                    {
                                        borderColor: type.color,
                                        backgroundColor: selectedType === type.key ? `${type.color}20` : 'transparent',
                                    },
                                ]}
                                activeOpacity={0.8}
                                onPress={() => setSelectedType(type.key)}
                            >
                                <Text
                                    style={[
                                        styles.typeBtnText,
                                        { color: type.color, fontWeight: selectedType === type.key ? '600' : '400' },
                                    ]}
                                >
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.addTypeBtn} activeOpacity={0.7} onPress={() => {/* добавить тип */ }}>
                            <PlusIcon width={26} height={26} fill={theme.colors.black40} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.mainTitle}>{t('addTask.fields.description')}</Text>
                <UniversalTextInput
                    label={t('addTask.fields.description')}
                    placeholder={t('addTask.fields.descriptionPlaceholder')}
                    multiline
                    numberOfLines={4}
                    inputStyle={{ minHeight: 80, textAlignVertical: 'top' }}
                    containerStyle={{ marginTop: 24 }}
                />

                <ParticipantsSection
                    title={t('addTask.fields.participants')}
                    addButtonLabel={t('addTask.fields.other')}
                    participants={participantsForDisplay}
                    selectedParticipantIds={selectedParticipantIds}
                    onToggleParticipant={handleToggleParticipant}
                    onAddPress={() => setParticipantsModalVisible(true)}
                />

                <View style={styles.taskItemContainer}>
                    <Text style={styles.taskItemTitle}>{t('addTask.fields.files')}</Text>

                    {recentCompanyDocs.length > 0 && (
                        <View style={styles.companyDocsSection}>
                            <View style={styles.companyDocsHeader}>
                                <Text style={styles.companyDocsTitle}>{t('addTask.fields.companyDocuments')}</Text>
                                <TouchableOpacity activeOpacity={0.8} onPress={handleMorePress}>
                                    <Text style={styles.moreButtonText}>{t('addTask.fields.more')}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Горизонтальный скролл документов */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
                            >
                                {recentCompanyDocs.map((doc) => {
                                    const isSelected = selectedCompanyDocIds.includes(doc.id);

                                    return (
                                        <TouchableOpacity
                                            key={doc.id}
                                            style={[
                                                styles.companyDocCard,
                                                isSelected && styles.companyDocCardSelected,
                                            ]}
                                            activeOpacity={0.8}
                                            onPress={() => handleCompanyDocPress(doc)}
                                        >
                                            <View style={styles.companyDocIcon}>
                                                <FileIcon extension={doc.extension} />
                                            </View>

                                            <View style={styles.companyDocInfo}>
                                                <Text
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                    style={styles.companyDocName}
                                                >
                                                    {doc.name}
                                                </Text>
                                                <Text
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                    style={styles.companyDocMeta}
                                                >
                                                    {doc.project ?? doc.companyName}
                                                </Text>
                                            </View>

                                            <View
                                                style={[
                                                    styles.companyDocAction,
                                                    isSelected && styles.companyDocActionSelected,
                                                ]}
                                            >
                                                {isSelected ? (
                                                    <CheckedIcon width={20} height={20} fill={theme.colors.blue} />
                                                ) : (
                                                    <PlusIcon width={20} height={20} fill={theme.colors.primaryText} />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    )}

                    <FilesSection
                        title={null}
                        description={t('addTask.filesSection.description')}
                        uploadHint={t('addTask.filesSection.hint')}
                        uploadButtonLabel={t('addTask.fields.uploadFile')}
                        removeButtonLabel={t('addTask.filesSection.removeButton')}
                        files={files}
                        onPickFile={handlePickFile}
                        onRemoveFile={handleRemoveFile}
                        style={{ marginTop: 16 }}
                    />
                </View>

                <View style={styles.taskItemContainer}>
                    <Text style={styles.taskItemTitle}>{t('addTask.fields.deadlines')}</Text>

                    {dateType === 'period' && period.start && period.end ? (
                        <TouchableOpacity
                            style={styles.selectedPeriodBlock}
                            activeOpacity={0.9}
                            onPress={() => setShowCalendarModal(true)}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                <CalendarIcon width={24} height={24} stroke={theme.colors.black40} />
                                <View style={{ flexDirection: 'column', gap: 4 }}>
                                    <Text style={styles.selectedPeriodLabel}>Выбранный период</Text>
                                    <Text style={styles.selectedPeriodDates}>
                                        {formatDate(period.start)} – {formatDate(period.end)}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.clearPeriodBtn}
                                onPress={(e) => {
                                    e.stopPropagation?.();
                                    setPeriod({ start: null, end: null });
                                    setDateType('today');
                                }}
                            >
                                <DeleteIcon width={28} height={28} fill={theme.colors.black60} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.periodsContainer}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.periodButton, dateType === 'today' && styles.periodButtonActive]}
                                onPress={() => setDateType('today')}
                            >
                                <Text style={[styles.periodButtonText, dateType === 'today' && styles.periodButtonTextActive]}>Сегодня</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.periodButton, dateType === 'tomorrow' && styles.periodButtonActive]}
                                onPress={() => setDateType('tomorrow')}
                            >
                                <Text style={[styles.periodButtonText, dateType === 'tomorrow' && styles.periodButtonTextActive]}>Завтра</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.periodButton}
                                onPress={() => {
                                    setDateType('period');
                                    setShowCalendarModal(true);
                                }}
                            >
                                <Text style={styles.periodButtonText}>Выбрать период</Text>
                            </TouchableOpacity>
                        </View>
                    )}


                    <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Dropdown
                                value={startTime}
                                items={times}
                                onChange={setStartTime}
                                width={'100%'}
                                buttonStyle={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: theme.colors.black20,
                                    borderRadius: 12,
                                    backgroundColor: theme.colors.white100,
                                    paddingVertical: 12,
                                    paddingHorizontal: 14,
                                    justifyContent: 'space-between',
                                }}
                                buttonTextStyle={{
                                    ...textStyles.medium,
                                    fontSize: 16,
                                    color: theme.colors.primaryText,
                                    flex: 1,
                                    textAlign: 'center',
                                }}
                                arrowWidth={18}
                                arrowHeight={18}
                                arrowStyle={{ marginLeft: 8 }}
                                renderButtonContent={() => (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <ClockIcon width={18} height={18} fill={theme.colors.black40} />
                                            <Text style={{ marginLeft: 8, ...textStyles.medium, fontSize: 14, color: theme.colors.primaryText }}>
                                                {t('addTask.time.from')}
                                            </Text>
                                        </View>
                                        <Text style={{ marginLeft: 8, ...textStyles.semiBold, fontSize: 16, color: theme.colors.primaryText }}>{startTime}</Text>
                                    </View>
                                )}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Dropdown
                                value={endTime}
                                items={times}
                                onChange={setEndTime}
                                width={'100%'}
                                buttonStyle={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: theme.colors.black20,
                                    borderRadius: 12,
                                    backgroundColor: theme.colors.white100,
                                    paddingVertical: 12,
                                    paddingHorizontal: 14,
                                    justifyContent: 'space-between',
                                }}
                                buttonTextStyle={{
                                    ...textStyles.medium,
                                    fontSize: 16,
                                    color: theme.colors.primaryText,
                                    flex: 1,
                                    textAlign: 'center',
                                }}
                                arrowWidth={18}
                                arrowHeight={18}
                                arrowStyle={{ marginLeft: 8 }}
                                renderButtonContent={() => (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <ClockIcon width={18} height={18} fill={theme.colors.black40} />
                                            <Text style={{ marginLeft: 8, ...textStyles.medium, fontSize: 14, color: theme.colors.primaryText }}>
                                                {t('addTask.time.to')}
                                            </Text>
                                        </View>
                                        <Text style={{ marginLeft: 8, ...textStyles.semiBold, fontSize: 16, color: theme.colors.primaryText }}>{endTime}</Text>
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                </View>

                <UniversalTextInput
                    label={t('addTask.fields.location')}
                    placeholder={t('addTask.fields.locationPlaceholder')}
                    containerStyle={{ marginTop: 24 }}
                />

                <View style={styles.taskItemContainer}>
                    <Error error={error} />
                </View>

                <View style={styles.taskItemContainer}>
                    <PrimaryButton
                        label={t('addTask.saveButton')}
                        onPress={() => {
                            if (!title.trim()) {
                                setError(t('addTask.errors.emptyTitle'));
                                return;
                            }
                            setError('');
                        }}
                    />
                </View>


                <ModalWindow
                    visible={showCalendarModal}
                    onCancel={() => setShowCalendarModal(false)}
                    onConfirm={() => setShowCalendarModal(false)}
                >
                    <CalendarWithPeriod
                        value={period}
                        onSave={(range) => {
                            setPeriod(range);
                            setShowCalendarModal(false);
                        }}
                        onClose={() => setShowCalendarModal(false)}
                    />
                </ModalWindow>
            </ScrollView>

            {/* Модальное окно добавления участников */}
            <AddParticipantsModal
                visible={participantsModalVisible}
                onClose={() => setParticipantsModalVisible(false)}
                onAddParticipant={handleAddInvitedParticipant}
                companyParticipants={COMPANY_PARTICIPANTS.map(({ source, ...participant }) => ({
                    ...participant,
                    role: participant.role as any,
                }))}
            />
        </SafeAreaView>
    );
}
