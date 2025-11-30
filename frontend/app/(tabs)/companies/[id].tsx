import { useApi } from '@/api';
import SearchIcon from '@/assets/images/icons/searchIcon.svg';
import Header from '@/components/common-components/header';
import Navbar from '@/components/common-components/navbar';
import PlusButton from '@/components/common-components/plusButton';
import CompanyCard from '@/components/companies-components/companyCard';
import DocumentsTab, { DocumentsTabRef, Folder } from '@/components/companies-components/documentsTab';
import ParticipantsTab, { Participant, ParticipantsTabRef } from '@/components/companies-components/participantsTab';
import ProjectCard from '@/components/main-components/projectCard';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { JSX, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const mockProjects = [
    {
        id: '1',
        title: 'Проект 1',
        progressPercentage: 75,
        participants: [
            { id: '1', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
            { id: '2', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
            { id: '3', avatar: 'https://randomuser.me/api/portraits/men/55.jpg' },
        ],
        dueDate: '01.11.2025',
        backgroundColor: '#1E3A8A',
    },
    {
        id: '2',
        title: 'Проект 2',
        progressPercentage: 30,
        participants: [
            { id: '1', avatar: 'https://randomuser.me/api/portraits/women/22.jpg' },
            { id: '2', avatar: 'https://randomuser.me/api/portraits/men/33.jpg' },
        ],
        dueDate: '15.12.2025',
        backgroundColor: '#8B5CF6',
    },
    {
        id: '3',
        title: 'Проект 3',
        progressPercentage: 100,
        participants: [
            { id: '1', avatar: 'https://randomuser.me/api/portraits/men/41.jpg' },
            { id: '2', avatar: 'https://randomuser.me/api/portraits/women/28.jpg' },
            { id: '3', avatar: 'https://randomuser.me/api/portraits/men/39.jpg' },
            { id: '4', avatar: 'https://randomuser.me/api/portraits/women/30.jpg' },
        ],
        dueDate: '15.10.2025',
        backgroundColor: '#059669',
    },
];

const mockDocuments = [
    { id: 'doc-1', name: 'Пример договора.pdf', size: 200 * 1024, extension: 'pdf' },
    { id: 'doc-2', name: 'Договор на оказание услуг.pdf', size: 220 * 1024, extension: 'pdf' },
    { id: 'doc-3', name: 'Счет-фактура.pdf', size: 180 * 1024, extension: 'pdf' },
];

const mockFolders: Folder[] = [
    {
        id: 'folder-1',
        name: 'Папка с договорами',
        description: 'Папка для договоров с ИП Махмутов',
        updatedAt: '2024-08-01T12:00:00.000Z',
        documents: [
            { id: 'f-doc-1', name: 'Пример договора.pdf', size: 200 * 1024, extension: 'pdf' },
            { id: 'f-doc-2', name: 'Пример договора.pdf', size: 200 * 1024, extension: 'pdf' },
            { id: 'f-doc-3', name: 'Пример договора.pdf', size: 200 * 1024, extension: 'pdf' },
            { id: 'f-doc-4', name: 'Пример договора.pdf', size: 200 * 1024, extension: 'pdf' },
            { id: 'f-doc-5', name: 'Пример договора.pdf', size: 200 * 1024, extension: 'pdf' },
        ],
    },
    {
        id: 'folder-2',
        name: 'Новая папка',
        description: 'Добавьте описание папки',
        updatedAt: '2024-08-10T08:30:00.000Z',
        documents: [],
    },
];
export default function CompanyDetails() {
    const theme = useTheme();
    const router = useRouter();
    const { t } = useTranslation();
    const { id } = useLocalSearchParams();

    const tabs = useMemo(() => ['Проекты', 'Документы', t('participants.title'), 'Аналитика'], []); // Используем t()
    const [activeTab, setActiveTab] = useState<string>('Проекты');
    const [documents, setDocuments] = useState(mockDocuments);
    const [folders, setFolders] = useState<Folder[]>(mockFolders);
    const [company, setCompany] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);

    const { execute } = useApi();

    // useEffect для загрузки данных при монтировании
    useFocusEffect(
        React.useCallback(() => {
            console.log('CompanyDetails focused, refreshing data...');
            if (id) {
                fetchCompanyDetail(+id);
                fetchCompanyProjects(+id);
            }
        }, [id])
    );

    const fetchCompanyDetail = async (id: number) => {
        const response = await execute({
            method: 'GET',
            url: `/company/${id}`, // твой endpoint
        });

        // Предполагаем, что response.data содержит массив компаний
        if (response) {
            setCompany(response);
        }
    };

    const fetchCompanyProjects = async (id: number) => {
        const response = await execute({
            method: 'GET',
            url: `/project/company/${id}`, // твой endpoint
        });

        // Предполагаем, что response.data содержит массив компаний
        console.log(response);
        if (response) {
            setProjects(response);
        }
    };

    const documentsTabRef = useRef<DocumentsTabRef>(null);
    const participantsTabRef = useRef<ParticipantsTabRef>(null);

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
        {
            id: '3',
            name: 'Nurzat S.',
            email: 'nurzats@gmail.com',
            avatar: 'https://ui-avatars.com/api/?name=NS&background=random',
            role: 'Исполнитель',
        },
    ]);

    const handleFolderCreated = (folder: Folder) => {
        setFolders(prev => [folder, ...prev]);
    };

    const handleFolderUpdated = (folder: Folder) => {
        setFolders(prev => prev.map(item => (item.id === folder.id ? folder : item)));
    };

    const handleFolderDeleted = (folderId: string) => {
        setFolders(prev => prev.filter(item => item.id !== folderId));
    };

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
        sectionTitle: {
            ...textStyles.semiBold,
            fontSize: 20,
            marginBottom: 16,
            color: theme.colors.black100,
        },
        projectsContainer: {
            gap: 16,
        },
        createProjectButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.gray100,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
        },
        createProjectText: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.black60,
        },
    });

    const handleAddProject = () => {
        router.push(`/companies/${id}/createProject`);
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

    const handleNewParticipantAdded = (email: string, role: string) => {
        console.log(`Добавлен новый участник: ${email} с ролью ${role}`);

        const newParticipant: Participant = {
            id: Date.now().toString(),
            name: email.split('@')[0],
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`,
            role: role as Participant['role'],
        };

        setParticipants(prev => [...prev, newParticipant]);
    };

    const handleAddAnalytics = () => {
        console.log('Добавить аналитику');
    };

    const plusButtonConfig: Record<string, { visible: boolean; onPress: () => void }> = {
        Проекты: { visible: true, onPress: handleAddProject },
        Документы: { visible: true, onPress: handleAddDocument },
        Участники: { visible: true, onPress: handleAddParticipant },
        Аналитика: { visible: false, onPress: handleAddAnalytics },
    };

    const tabContent: Record<string, JSX.Element> = useMemo(
        () => ({
            Проекты: (
                <View>
                    <View style={styles.projectsContainer}>
                        {projects.map(project => (
                            <ProjectCard
                                key={project?.id}
                                id={project?.id}
                                title={project?.name}
                                to={`/companies/project/${project?.id}`}
                                progressPercentage={project?.progressPercentage ?? Math.floor(Math.random() * 101)}
                                participants={project?.employee_project_rel}
                                maxVisibleParticipants={project?.employee_project_rel.length ?? 0}
                                dueDate={project?.dueDate ?? project?.created_at}
                                cardWidth="100%"
                                cardHeight={160}
                                backgroundColor={project?.color}
                            />
                        ))}
                    </View>
                </View>
            ),
            Документы: (
                <DocumentsTab
                    ref={documentsTabRef}
                    documents={documents}
                    initialFolders={folders}
                    onDocumentAdded={newDocs => {
                        setDocuments(prevDocs => [...prevDocs, ...newDocs]);
                    }}
                    onFolderCreated={handleFolderCreated}
                    onFolderUpdated={handleFolderUpdated}
                    onFolderDeleted={handleFolderDeleted}
                />
            ),
            [t('participants.title')]: (
                <ParticipantsTab
                    ref={participantsTabRef}
                    participants={participants}
                    onParticipantAdded={handleNewParticipantAdded}
                    availableRoles={[
                        t('participants.roles.owner'),
                        t('participants.roles.executor'),
                        t('participants.roles.observer'),
                    ]}
                />
            ),
            Аналитика: (
                <View>
                    <Text style={textStyles.bold}>Финансовая сводка</Text>
                    <Text style={textStyles.regular}>— Доход: 3 200 000 ₸</Text>
                    <Text style={textStyles.regular}>— Расход: 1 870 000 ₸</Text>
                </View>
            ),
        }),
        [projects, participants, documents, t]
    );

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

                <CompanyCard
                    id={company?.id}
                    title={company?.name}
                    userRole="Владелец"
                    creationDate={company?.created_at}
                    backgroundColor={company?.color}
                    onEdit={() => {
                        router.push(`/companies/${id}/edit`);
                    }}
                    onDelete={() => {
                        console.log('Delete company', '1');
                    }}
                    onArchive={() => {
                        console.log('Archive company', '1');
                    }}
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
