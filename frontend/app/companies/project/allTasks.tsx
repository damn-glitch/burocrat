import CalendarIcon from '@/assets/images/icons/calendarIcon.svg';
import ClockIcon from '@/assets/images/icons/clockIcon.svg';
import DownloadIcon from '@/assets/images/icons/downloadIcon.svg';
import EditIcon from '@/assets/images/icons/editIcon.svg';
import LocationPointIcon from '@/assets/images/icons/locationPointIcon.svg';
import SortIcon from '@/assets/images/icons/sortIcon.svg';
import SuccessIcon from '@/assets/images/icons/successIcon.svg';
import UsersIcon from '@/assets/images/icons/usersIcon.svg';
import CalendarWithPeriod from '@/components/common-components/calendarWithPeriod';
import Dropdown from '@/components/common-components/dropdown';
import FileIcon from '@/components/common-components/fileIcons';
import Header from '@/components/common-components/header';
import ModalWindow from '@/components/common-components/modal';
import TaskCard from '@/components/main-components/taskCard';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";


type Participant = {
    id: string;
    avatar: string;
};

type Task = {
    id: string;
    title: string;
    description: string;
    date: string;
    timeRange: string;
    participants: Participant[];
    isCompleted: boolean;
    files?: {
        id: string;
        name: string;
        size: string;
        extension: string;
    }[];
    location: string;
};

const initialTasks: Task[] = [
    {
        id: '1',
        title: 'Продумать логику приложения',
        description: 'Burokrat app design',
        date: '2025-06-13',
        timeRange: '10:00 - 12:00',
        participants: [
            { id: '1', avatar: 'https://i.pravatar.cc/150?img=1' },
            { id: '2', avatar: 'https://i.pravatar.cc/150?img=2' },
        ],
        isCompleted: true,
        files: [
            { id: '1', name: 'Пример договора.pdf', size: '200 Кб', extension: 'pdf' },
            { id: '2', name: 'Пример договора.pdf', size: '200 Кб', extension: 'pdf' },
            { id: '3', name: 'Пример договора.pdf', size: '200 Кб', extension: 'pdf' },
        ],
        location: 'ул. Ленина, 12, офис 34',
    },
    {
        id: '2',
        title: 'Продумать логику приложения',
        description: 'Burokrat app design',
        date: '2025-06-13',
        timeRange: '14:00 - 15:00',
        participants: [
            { id: '3', avatar: 'https://i.pravatar.cc/150?img=3' },
        ],
        isCompleted: false,
        location: 'ул. Ленина, 12, офис 34',
    },
    {
        id: '3',
        title: 'Продумать логику приложения',
        description: 'Burokrat app design',
        date: '2025-06-14',
        timeRange: '10:00 - 12:00',
        participants: [
            { id: '4', avatar: 'https://i.pravatar.cc/150?img=4' },
            { id: '5', avatar: 'https://i.pravatar.cc/150?img=5' },
        ],
        isCompleted: true,
        location: 'ул. Ленина, 12, офис 34',
    },
];

export default function AllTasks() {
    const theme = useTheme();
    const { t } = useTranslation();
    const [selectedSort, setSelectedSort] = useState('Сортировка');
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [period, setPeriod] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });

    const [selectedFilter, setSelectedFilter] = useState('К выполнению');
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showTaskModal, setShowTaskModal] = useState(false);

    const sortOptions = [
        t('allTasks.sortPlaceholder'),
        t('allTasks.filters.all'),
        t('allTasks.filters.toDo'),
        t('allTasks.filters.inProgress'),
        t('allTasks.filters.done')
    ];
    const filters = [
        t('allTasks.filters.all'),
        t('allTasks.filters.toDo'),
        t('allTasks.filters.inProgress'),
        t('allTasks.filters.done')
    ];

    const formatPeriod = () => {
        if (period.start && period.end) {
            const start = new Date(period.start).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            });
            const end = new Date(period.end).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            });
            return `${start} - ${end}`;
        }
        return '11.06.25 - 23.06.25';
    };

    const groupTasksByDate = (taskList: Task[]) => {
        return taskList.reduce((groups: Record<string, Task[]>, task) => {
            const date = task.date;
            if (!groups[date]) groups[date] = [];
            groups[date].push(task);
            return groups;
        }, {});
    };

    const handleTaskPress = (task: Task) => {
        setSelectedTask(task);
        setShowTaskModal(true);
    };

    const groupedTasks = groupTasksByDate(tasks);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.white100,
            paddingHorizontal: 16,
        },
        actionsContainer: {
            flexDirection: 'row',
            gap: 8,
            marginTop: 16,
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        sortButton: {
            width: '42%',
        },
        calendarButton: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.black20,
            borderRadius: 12,
            backgroundColor: theme.colors.white100,
            paddingVertical: 12,
            paddingHorizontal: 16,
            gap: 8,
            width: '55%',
            height: 56,
        },
        calendarButtonText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },

        filtersContainer: {
            marginTop: 16,
            marginBottom: 8,
            marginHorizontal: -16,
        },
        filtersScroll: {
            paddingHorizontal: 16,
        },
        filterButton: {
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 32,
            marginRight: 8,
        },
        filterButtonActive: {
            backgroundColor: theme.colors.black100,
        },
        filterButtonInactive: {
            backgroundColor: theme.colors.gray100,
        },
        filterTextActive: {
            color: theme.colors.white100,
            ...textStyles.medium,
            fontSize: 16,
        },
        filterTextInactive: {
            color: theme.colors.black100,
            ...textStyles.medium,
            fontSize: 16,
        },



        taskModal: {
            padding: 16,
            paddingTop: 0,
            width: '100%',
        },
        taskModalHeader: {
            marginBottom: 8,
        },
        taskModalDate: {
            ...textStyles.semiBold,
            fontSize: 20,
            color: theme.colors.secondaryText,
            marginBottom: 4,
        },
        taskModalTitle: {
            ...textStyles.bold,
            fontSize: 24,
            color: theme.colors.primaryText,
            marginBottom: 16,
        },
        taskModalActions: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 16,
        },
        taskModalActionButton: {
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            height: 100,
            borderRadius: 16,
            backgroundColor: theme.colors.gray100,
            gap: 6,
        },
        taskModalStatusButton: {
            backgroundColor: theme.colors.success5,
        },
        taskModalStatusActiveText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.successText,
        },
        taskModalStatusText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        taskModalWaitingButton: {
            backgroundColor: theme.colors.warning15,
        },
        taskModalWaitingText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.orangeWarningText,
        },
        taskModalDescription: {
            ...textStyles.regular,
            fontSize: 16,
            color: theme.colors.primaryText,
        },

        taskModalLocationText: {
            ...textStyles.semiBold,
            fontSize: 18,
            color: theme.colors.primaryText,
        },

        taskModalHeaderTitle: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        participantItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8
        },
        participantAvatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 12,
        },
        participantName: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        participantRole: {
            ...textStyles.regular,
            fontSize: 14,
            color: theme.colors.secondaryText,
        },
        participantDivider: {
            height: 1,
            backgroundColor: theme.colors.black10,
            marginVertical: 8,
        },

        taskModalFilesSubtitle: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
        },
        fileItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.black10,
        },
        fileInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        fileIconContainer: {
            marginRight: 12,
        },
        fileDetails: {
            flex: 1,
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
            marginTop: 4,
        },
        downloadButton: {
            padding: 8,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 56 }}
            >
                <Header
                    title={t('allTasks.header')}
                    titleFontSize={16}
                    backButton
                    backButtonColor={theme.colors.black60}
                    backButtonBGroundColor={theme.colors.white100}
                />

                <View style={styles.actionsContainer}>
                    <View style={styles.sortButton}>
                        <Dropdown
                            value={selectedSort === t('allTasks.sortPlaceholder') ? null : selectedSort}
                            items={sortOptions}
                            onChange={setSelectedSort}
                            placeholder={t('allTasks.sortPlaceholder')}
                            width={'100%'}
                            buttonStyle={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: theme.colors.black20,
                                borderRadius: 12,
                                backgroundColor: theme.colors.white100,
                                paddingVertical: 12,
                                justifyContent: 'space-between',
                                height: 56,
                                width: '100%',
                            }}
                            buttonTextStyle={{
                                ...textStyles.medium,
                                fontSize: 14,
                                color: theme.colors.primaryText,
                            }}
                            renderButtonContent={() => (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <SortIcon width={24} height={24} fill={theme.colors.black60} />
                                    <Text style={styles.calendarButtonText}>
                                        {selectedSort === 'Сортировка' ? 'Сортировка' : selectedSort}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.calendarButton}
                        onPress={() => setShowCalendarModal(true)}
                        activeOpacity={0.8}
                    >
                        <CalendarIcon width={20} height={20} stroke={theme.colors.black60} />
                        <View>
                            <Text style={[styles.calendarButtonText, { fontSize: 12, opacity: 0.7 }]}>
                                {t('allTasks.periodLabel')}
                            </Text>
                            <Text style={[styles.calendarButtonText, { ...textStyles.semiBold, fontSize: 14 }]}>
                                {formatPeriod()}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.filtersContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersScroll}
                    >
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterButton,
                                    selectedFilter === filter
                                        ? styles.filterButtonActive
                                        : styles.filterButtonInactive,
                                ]}
                                onPress={() => setSelectedFilter(filter)}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={
                                        selectedFilter === filter
                                            ? styles.filterTextActive
                                            : styles.filterTextInactive
                                    }
                                >
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={{ marginTop: 24 }}>
                    {Object.entries(groupedTasks).map(([date, tasksForDate]) => {
                        const isToday =
                            new Date(date).toDateString() === new Date().toDateString();
                        const title = isToday
                            ? t('allTasks.todayTasks')
                            : t('allTasks.dateTasks', {
                                date: new Date(date).toLocaleDateString('ru-RU', {
                                    day: '2-digit',
                                    month: '2-digit',
                                })
                            });

                        return (
                            <View key={date} style={{ marginBottom: 24 }}>
                                <Text style={{ ...textStyles.semiBold, fontSize: 16, marginBottom: 12 }}>
                                    {title}
                                </Text>
                                {tasksForDate.map((task) => (
                                    <View key={task.id} style={{ marginBottom: 12 }}>
                                        <TaskCard
                                            title={task.title}
                                            description={task.description}
                                            date={isToday ? t('allTasks.todayTasks') : new Date(task.date).toLocaleDateString('ru-RU')}
                                            timeRange={task.timeRange}
                                            participants={task.participants}
                                            isCompleted={task.isCompleted}
                                            onStatusChange={(completed) => {
                                                setTasks((prev) =>
                                                    prev.map((t) =>
                                                        t.id === task.id ? { ...t, isCompleted: completed } : t
                                                    )
                                                );
                                            }}
                                            onPress={() => handleTaskPress(task)}
                                        />
                                    </View>
                                ))}
                            </View>
                        );
                    })}
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

                <ModalWindow
                    visible={showTaskModal}
                    onCancel={() => setShowTaskModal(false)}
                    onConfirm={() => setShowTaskModal(false)}
                >
                    {selectedTask && (
                        <View style={styles.taskModal}>
                            <View style={styles.taskModalHeader}>
                                <Text style={styles.taskModalDate}>
                                    {new Date(selectedTask.date).toDateString() === new Date().toDateString()
                                        ? t('allTasks.todayTasks')
                                        : new Date(selectedTask.date).toLocaleDateString('ru-RU')}
                                </Text>
                                <Text style={styles.taskModalTitle}>{selectedTask.title}</Text>
                            </View>

                            <View style={styles.taskModalActions}>
                                <TouchableOpacity
                                    style={[
                                        styles.taskModalActionButton,
                                        selectedTask.isCompleted
                                            ? styles.taskModalStatusButton
                                            : styles.taskModalWaitingButton,
                                    ]}
                                    onPress={() => {
                                        setTasks((prev) =>
                                            prev.map((t) =>
                                                t.id === selectedTask.id ? { ...t, isCompleted: !t.isCompleted } : t
                                            )
                                        );
                                        setSelectedTask(prev => prev ? { ...prev, isCompleted: !prev.isCompleted } : null);
                                    }}
                                >
                                    {selectedTask.isCompleted ? (
                                        <>
                                            <SuccessIcon width={24} height={24} />
                                            <Text style={styles.taskModalStatusActiveText}>{t('allTasks.completed')}</Text>
                                        </>
                                    ) : (
                                        <>
                                            <ClockIcon width={24} height={24} fill={theme.colors.orangeWarningIcon} />
                                            <Text style={styles.taskModalWaitingText}>{t('allTasks.waiting')}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.taskModalActionButton}
                                    onPress={() => {
                                        setShowTaskModal(false);
                                    }}
                                >
                                    <EditIcon width={24} height={24} stroke={theme.colors.black100} />
                                    <Text style={styles.taskModalStatusText}>{t('allTasks.edit')}</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.taskModalDescription}>{selectedTask.description}</Text>

                            <View style={{ marginVertical: 24 }}>
                                <Text style={styles.taskModalHeaderTitle}>
                                    {t('allTasks.location')}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
                                    <LocationPointIcon width={28} height={28} fill={theme.colors.black100} />
                                    <Text style={styles.taskModalLocationText}>{selectedTask.location}</Text>
                                </View>
                            </View>

                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                    <UsersIcon width={24} height={24} stroke={theme.colors.black60} />
                                    <Text style={[styles.taskModalHeaderTitle, { marginLeft: 8, marginBottom: 0 }]}>
                                        {t('allTasks.participants')} ({selectedTask.participants.length})
                                    </Text>
                                </View>

                                {selectedTask.participants.map((participant, index) => (
                                    <React.Fragment key={participant.id}>
                                        <View style={styles.participantItem}>
                                            <Image
                                                source={{ uri: participant.avatar }}
                                                style={styles.participantAvatar}
                                            />
                                            <View>
                                                <Text style={styles.participantName}>Eidos M.</Text>
                                                {index === 0 && (
                                                    <Text style={styles.participantRole}>Организатор</Text>
                                                )}
                                            </View>
                                        </View>
                                        {index < selectedTask.participants.length - 1 && (
                                            <View style={styles.participantDivider} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </View>


                            <View>
                                <View style={{ flexDirection: 'column', marginBottom: 16, marginTop: 24 }}>
                                    <Text style={styles.taskModalHeaderTitle}>
                                        {t('allTasks.attachedFiles')}
                                    </Text>
                                    <Text style={styles.taskModalFilesSubtitle}>
                                        {t('allTasks.attachedFilesSubtitle')}
                                    </Text>
                                </View>

                                {selectedTask.files ? (
                                    selectedTask.files.map((file, index) => (
                                        <View key={file.id} style={styles.fileItem}>
                                            <View style={styles.fileInfo}>
                                                <View style={styles.fileIconContainer}>
                                                    <FileIcon extension={file.extension} />
                                                </View>
                                                <View style={styles.fileDetails}>
                                                    <Text style={styles.fileName}>{file.name}</Text>
                                                    <Text style={styles.fileSize}>{file.size}</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.downloadButton}
                                                onPress={() => console.log(`Downloading file: ${file.name}`)}
                                            >
                                                <DownloadIcon width={24} height={24} stroke={theme.colors.black60} />
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                ) : (
                                    <Text>{t('allTasks.noFiles')}</Text>
                                )}
                            </View>
                        </View>
                    )}
                </ModalWindow>
            </ScrollView>
        </SafeAreaView>
    );
}
