import { useLocalSearchParams, useRouter } from 'expo-router';
import SearchIcon from '@/assets/images/icons/searchIcon.svg';
import Header from '@/components/common-components/header';
import Navbar from '@/components/common-components/navbar';
import PlusButton from '@/components/common-components/plusButton';
import DocumentsTab, { DocumentsTabRef } from '@/components/companies-components/documentsTab';
import ParticipantsTab, { Participant, ParticipantsTabRef } from '@/components/companies-components/participantsTab';
import ProjectCard from '@/components/main-components/projectCard';
import TaskCard from '@/components/main-components/taskCard';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import React, { JSX, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApi } from '@/api';

const mockDocuments = [
    { id: '1', name: 'Пример договора.pdf', size: 200, extension: 'pdf' },
    { id: '2', name: 'Пример договора.pdf', size: 200, extension: 'pdf' },
    { id: '3', name: 'Пример договора.pdf', size: 200, extension: 'pdf' },
];

const taskCardsData = [
    {
        id: '1',
        title: 'Продумать логику приложения',
        description: 'Burocrat app design',
        date: 'Сегодня',
        timeRange: '10:00 - 12:00',
        participants: [
            { id: '1', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
            { id: '2', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
        ],
        isCompleted: true,
    },
    {
        id: '2',
        title: 'Продумать логику приложения',
        description: 'Burocrat app design',
        date: 'Сегодня',
        timeRange: '10:00 - 12:00',
        participants: [
            { id: '1', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
            { id: '2', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
        ],
        isCompleted: false,
    },
];

const mockProject = {
    id: '2',
    title: 'Burokrat app design',
    to: '/companies/project/1',
    progressPercentage: 55,
    participants: [
        { id: 'u1', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { id: 'u2', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
        { id: 'u3', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
    ],
    maxVisibleParticipants: 2,
    dueDate: '30.09.2024',
    backgroundColor: '#1E3A8A',
};

export default function ProjectDetails() {
    const theme = useTheme();
    const router = useRouter();
    const tabs = useMemo(() => ['Задачи', 'Документы', 'Участники', 'Финансы'], []);
    const [activeTab, setActiveTab] = useState('Задачи');
    const [documents, setDocuments] = useState(mockDocuments);
    const { projectID } = useLocalSearchParams();

    const documentsTabRef = useRef<DocumentsTabRef>(null);
    const participantsTabRef = useRef<ParticipantsTabRef>(null);
    const [project, setProject] = useState<any>(null);

    const { execute } = useApi();

    // useEffect для загрузки данных при монтировании
    useEffect(() => {
        console.log(projectID, 'id');
        fetchProjectDetail(+projectID);
    }, []);

    const fetchProjectDetail = async (id: number) => {
        const response = await execute({
            method: 'GET',
            url: `/project/${id}`, // твой endpoint
        });

        // Предполагаем, что response.data содержит массив компаний
        if (response) {
            setProject(response);
        }
    };

    const [participants, setParticipants] = useState<Participant[]>([
        {
            id: '1',
            name: 'Eldos M.',
            email: 'eldoscar@gmail.com',
            avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
            role: 'Владелец',
        },
        {
            id: '2',
            name: 'Tleukhan M.',
            email: 'tleukhan@gmail.com',
            avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
            role: 'Исполнитель',
        },
    ]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: 16,
            paddingBottom: 176,
        },
        content: {
            flex: 1,
            marginTop: 16,
        },
        mainTasksCardContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            justifyContent: 'center',
        },
    });

    const handleNewParticipantAdded = (email: string, role: string) => {
        console.log(`Добавлен новый участник проекта: ${email} с ролью ${role}`);

        const newParticipant: Participant = {
            id: Date.now().toString(),
            name: email.split('@')[0],
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`,
            role: role as Participant['role'],
        };

        setParticipants(prev => [...prev, newParticipant]);
    };

    const tabContent: Record<string, JSX.Element> = useMemo(
        () => ({
            Задачи: (
                <View>
                    <View style={styles.mainTasksCardContainer}>
                        {taskCardsData.map(task => (
                            <TaskCard
                                key={task.id}
                                {...task}
                                maxVisibleParticipants={2}
                                onPress={() => console.log(`Нажата задача: ${task.title}`)}
                                onStatusChange={completed => {
                                    console.log(
                                        `Статус задачи \"${task.title}\" изменен на: ${completed ? 'выполнено' : 'не выполнено'}`
                                    );
                                }}
                            />
                        ))}
                    </View>
                </View>
            ),
            Документы: (
                <DocumentsTab
                    ref={documentsTabRef}
                    documents={documents}
                    onDocumentAdded={newDocs => {
                        setDocuments(prevDocs => [...prevDocs, ...newDocs]);
                    }}
                />
            ),
            Участники: (
                <ParticipantsTab
                    ref={participantsTabRef}
                    participants={participants}
                    onParticipantAdded={handleNewParticipantAdded}
                    availableRoles={['Владелец', 'Исполнитель', 'Наблюдатель']}
                />
            ),
            Финансы: (
                <View>
                    <Text style={textStyles.bold}>Финансовая сводка</Text>
                    <Text style={textStyles.regular}>— Доход: 3 200 000 ₸</Text>
                    <Text style={textStyles.regular}>— Расход: 1 870 000 ₸</Text>
                </View>
            ),
        }),
        [participants, documents]
    );

    const handleAddTask = () => {
        console.log('Добавить задачу');
    };

    const handleAddDocument = () => {
        if (documentsTabRef.current) {
            documentsTabRef.current.openFileUploadModal();
        }
    };

    const handleAddParticipant = () => {
        if (participantsTabRef.current) {
            participantsTabRef.current.openAddParticipantsModal();
        }
    };

    const plusButtonConfig: Record<string, { visible: boolean; onPress: () => void }> = {
        Задачи: { visible: true, onPress: handleAddTask },
        Документы: { visible: true, onPress: handleAddDocument },
        Участники: { visible: true, onPress: handleAddParticipant },
        Финансы: {
            visible: false,
            onPress: () => {},
        },
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
                <Header
                    backButton
                    backButtonColor={theme.colors.black60}
                    backButtonBGroundColor={theme.colors.white100}
                    avatarImage="https://randomuser.me/api/portraits/men/22.jpg"
                    helpButton
                    helpButtonColor={theme.colors.black60}
                    helpButtonBGroundColor={theme.colors.white100}
                    helpButtonImage={<SearchIcon />}
                    helpButtonImageSize={20}
                    helpButtonOnPress={() => router.push('/search' as any)}
                />

                <ProjectCard
                    id={project?.id}
                    title={project?.name}
                    progressPercentage={project?.progressPercentage ?? Math.floor(Math.random() * 101)}
                    participants={project?.employee_project_rel}
                    maxVisibleParticipants={project?.employee_project_rel.length ?? 0}
                    dueDate={project?.dueDate ?? project?.created_at}
                    cardWidth="100%"
                    cardHeight={180}
                    backgroundColor={project?.color}
                />

                <Navbar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                <View style={styles.content}>{tabContent[activeTab]}</View>
            </ScrollView>

            {plusButtonConfig[activeTab].visible && (
                <View
                    style={{
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                        zIndex: 100,
                    }}
                    pointerEvents="box-none"
                >
                    <PlusButton onPress={plusButtonConfig[activeTab].onPress} />
                </View>
            )}
        </View>
    );
}
