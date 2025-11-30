import askAiIcon from '@/assets/images/icons/lampIcon.svg';
import EditIcon from '@/assets/images/icons/editIcon.svg';
import generateIcon from '@/assets/images/icons/generateIcon.svg';
import NotificationBellIcon from '@/assets/images/icons/notificationBellIcon.svg';
import qrIcon from '@/assets/images/icons/qrIcon.svg';
import AvatarCircleButton from '@/components/common-components/avatarCircleButton';
import CircleButton from '@/components/common-components/circleButton';
import Skeleton from '@/components/common-components/skeleton';
import HelpCard from '@/components/main-components/helpCard';
import ProjectCard from '@/components/main-components/projectCard';
import SectionHeader from '@/components/main-components/sectionHeader';
import TaskCard from '@/components/main-components/taskCard';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { storage } from '@/storage';
import { useApi } from '@/api';

export default function MainScreen() {
    const theme = useTheme();
    const { width } = Dimensions.get('window');
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Array<any>>([]);
    const { execute } = useApi();

    // useEffect для загрузки данных при монтировании
    useEffect(() => {
        fetchMyProjects();
    }, []);
    const fetchMyProjects = async () => {
        const response = await execute({
            method: 'GET',
            url: `/project/my`, // твой endpoint
        });

        // Предполагаем, что response.data содержит массив компаний
        console.log(response);
        if (response) {
            setProjects(response);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1);
        return () => clearTimeout(timer);
    }, []);

    const GAP = 10;

    const numColumns = width > 768 ? 3 : 2;

    const helpCards = [
        {
            id: '1',
            icon: qrIcon,
            title: t('main.helpCards.scanTitle'),
            description: t('main.helpCards.scanDescription'),
            fill: theme.colors.black60,
            size: 22,
            to: '/main/scan',
        },
        {
            id: '2',
            icon: EditIcon,
            title: t('main.helpCards.editTitle'),
            description: t('main.helpCards.editDescription'),
            fill: 'transparent',
            size: 22,
            to: '/main/editDocs',
        },
        {
            id: '3',
            icon: generateIcon,
            title: t('main.helpCards.generateTitle'),
            description: t('main.helpCards.generateDescription'),
            fill: theme.colors.black60,
            size: 20,
            to: '/main/generate',
        },
        {
            id: '4',
            icon: askAiIcon,
            title: t('main.helpCards.askAiTitle'),
            description: t('main.helpCards.askAiDescription'),
            fill: theme.colors.black60,
            size: 22,
        },
    ];

    const rows = [];
    for (let i = 0; i < helpCards.length; i += numColumns) {
        rows.push(helpCards.slice(i, i + numColumns));
    }

    const projectCardsData = [
        {
            id: '1',
            title: 'Burokrat app design',
            progressPercentage: 55,
            participants: [
                { id: '1', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
                { id: '2', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
                { id: '3', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
            ],
            dueDate: '25 авг',
            backgroundColor: '#1E3A8A',
        },
        {
            id: '2',
            title: 'Burokrat app design',
            progressPercentage: 0,
            participants: [
                { id: '1', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
                { id: '2', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
                { id: '3', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
            ],
            dueDate: '25 авг',
            backgroundColor: '#8B5CF6',
        },
        {
            id: '3',
            title: 'Burokrat app design',
            progressPercentage: 0,
            participants: [
                { id: '1', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
                { id: '2', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
                { id: '3', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
            ],
            dueDate: '25 авг',
            backgroundColor: '#059669',
        },
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

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        header: {
            backgroundColor: theme.colors.black80,
            height: 94,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 22,
            paddingHorizontal: 16,
        },
        headerUserContainer: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        headerTextContainer: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 4,
        },
        headerWelcomeText: {
            ...textStyles.medium,
            color: theme.colors.white60,
            fontSize: 16,
            fontWeight: '500',
        },
        headerUserName: {
            ...textStyles.semiBold,
            color: theme.colors.white100,
            fontSize: 16,
            fontWeight: '600',
        },

        main: {
            flex: 1,
            width: '100%',
            backgroundColor: theme.colors.background,
            paddingHorizontal: 16,
            paddingTop: 32,
            paddingBottom: 104,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            marginTop: -22,
            marginBottom: 0,
        },
        mainHelpContainer: {
            marginBottom: 34,
        },
        mainHelpText: {
            ...textStyles.semiBold,
            fontSize: 24,
            color: theme.colors.primaryText,
            marginBottom: 18,
            fontWeight: '600',
        },
        mainHelpCardContainer: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            columnGap: 10,
            rowGap: 10,
            justifyContent: 'space-between',
        },
        row: {
            flexDirection: 'row',
            marginBottom: GAP,
        },
        cardWrapper: {
            flex: 1,
            marginRight: GAP,
        },
        lastCardInRow: {
            marginRight: 0,
        },
        emptyCardSlot: {
            flex: 1,
            marginRight: GAP,
        },

        mainProjectsContainer: {
            marginBottom: 34,
        },

        projectsScrollViewContainer: {
            marginHorizontal: -16,
            marginTop: 16,
        },

        mainTasksCardContainer: {
            marginTop: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            justifyContent: 'center',
        },
    });

    return (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
            <View style={styles.header}>
                <Link href="/main/profile">
                    <View style={styles.headerUserContainer}>
                        <AvatarCircleButton />
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerWelcomeText}>{t('main.welcome')}</Text>
                            <Text style={styles.headerUserName}>
                                {storage.getString('firstname') +
                                    '.' +
                                    storage.getString('lastname')?.toString().toUpperCase()[0]}
                            </Text>
                        </View>
                    </View>
                </Link>

                <CircleButton
                    svg={NotificationBellIcon}
                    size={48}
                    iconSize={20}
                    iconStrokeColor={theme.colors.black60}
                    strokeWidth={2}
                    iconFillColor="transparent"
                    to="/main/notifications"
                />
            </View>

            <View style={styles.main}>
                {loading ? (
                    <>
                        <Skeleton width="60%" height={32} style={{ marginBottom: 18 }} />
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 34 }}>
                            <Skeleton width="48%" height={90} />
                            <Skeleton width="48%" height={90} />
                        </View>
                        <Skeleton width="40%" height={28} style={{ marginBottom: 16 }} />
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 34 }}>
                            <Skeleton width={180} height={120} />
                            <Skeleton width={180} height={120} />
                        </View>
                        <Skeleton width="40%" height={28} style={{ marginBottom: 16 }} />
                        <View style={{ gap: 8 }}>
                            <Skeleton width="100%" height={64} />
                            <Skeleton width="100%" height={64} />
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.mainHelpContainer}>
                            <Text style={styles.mainHelpText}>{t('main.helpTitle')}</Text>
                            {rows.map((row, rowIndex) => (
                                <View key={`row-${rowIndex}`} style={styles.row}>
                                    {row.map((card, index) => (
                                        <View
                                            key={card.id}
                                            style={[
                                                styles.cardWrapper,
                                                index === row.length - 1 ? styles.lastCardInRow : null,
                                            ]}
                                        >
                                            <HelpCard
                                                icon={card.icon}
                                                title={card.title}
                                                description={card.description}
                                                iconSize={card.size}
                                                iconStrokeColor={theme.colors.black60}
                                                iconFillColor={card.fill}
                                                strokeWidth={0.1}
                                                to={card.to}
                                            />
                                        </View>
                                    ))}
                                    {row.length < numColumns &&
                                        Array(numColumns - row.length)
                                            .fill(0)
                                            .map((_, index) => (
                                                <View
                                                    key={`empty-${index}`}
                                                    style={[
                                                        styles.emptyCardSlot,
                                                        index === numColumns - row.length - 1
                                                            ? styles.lastCardInRow
                                                            : null,
                                                    ]}
                                                />
                                            ))}
                                </View>
                            ))}
                        </View>

                        <View style={styles.mainProjectsContainer}>
                            <SectionHeader
                                title={t('main.projectsTitle')}
                                linkText={t('main.projectsLink')}
                                to="/companies"
                            />
                            <View style={styles.projectsScrollViewContainer}>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingRight: 32 }}
                                    style={{ paddingLeft: 16 }}
                                >
                                    {projects.map((project, index) => (
                                        <View
                                            key={project.id}
                                            style={{
                                                marginRight: index < projectCardsData.length - 1 ? 10 : 0,
                                            }}
                                        >
                                            <ProjectCard
                                                key={project?.id}
                                                id={project?.id}
                                                title={project?.name}
                                                to={`/companies/project/${project?.id}`}
                                                progressPercentage={
                                                    project?.progressPercentage ?? Math.floor(Math.random() * 101)
                                                }
                                                backgroundColor={project?.color}
                                                participants={project?.employee_project_rel}
                                                maxVisibleParticipants={project?.employee_project_rel.length ?? 0}
                                            />
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <View>
                            <SectionHeader
                                title={t('main.tasksTitle')}
                                linkText={t('main.tasksLink')}
                                to="companies/project/allTasks"
                            />
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
                    </>
                )}
            </View>
        </ScrollView>
    );
}
