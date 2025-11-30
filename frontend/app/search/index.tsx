import SearchIcon from '@/assets/images/icons/searchIcon.svg';
import FileIcon from '@/components/common-components/fileIcons';
import Header from '@/components/common-components/header';
import CompanyCard from '@/components/companies-components/companyCard';
import ProjectCard from '@/components/main-components/projectCard';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import ArrowRightIcon from '@/assets/images/icons/arrowRightIcon.svg';
import { useApi } from '@/api';

type DocumentItem = {
    id: string;
    title: string;
    company: string;
    project?: string;
    date: string;
    extension: string;
};

type CompanyItem = {
    id: string;
    name: string;
    roleKey: 'owner' | 'admin' | 'user' | 'guest' | 'executor' | 'observer';
    createdAt: string;
    backgroundColor: string;
};

type ProjectItem = {
    id: string;
    name: string;
    company: {
        name: string;
    };
    dueDate?: string;
    backgroundColor: string;
    participants?: { id: string; avatar: string }[];
    progressPercentage?: number;
};

const BULLET = '•';

// --- ДОПОЛНИТЕЛЬНЫЕ МОК-ДАННЫЕ ---
const DOCUMENTS_DATA: DocumentItem[] = [
    {
        id: 'doc-2',
        title: 'Маркетинговый бриф.pdf',
        company: 'Northwind',
        project: 'Запуск бренда',
        date: '05.09.2025',
        extension: 'pdf',
    },
    {
        id: 'doc-3',
        title: 'Техническое задание.docx',
        company: 'Tieu agency',
        project: 'Портал поддержки',
        date: '01.08.2025',
        extension: 'docx',
    },
    {
        id: 'doc-4',
        title: 'Коммерческое предложение.xlsx',
        company: 'Burokrat',
        project: 'CRM 2.0',
        date: '22.07.2025',
        extension: 'xlsx',
    },
];

export default function SearchScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { t } = useTranslation();
    const [query, setQuery] = useState('');

    // --- состояния для кнопок "Загрузить больше/Свернуть" ---
    const [showAllDocuments, setShowAllDocuments] = useState(false);
    const [showAllCompanies, setShowAllCompanies] = useState(false);
    const [showAllProjects, setShowAllProjects] = useState(false);
    const [companies, setCompanies] = useState<CompanyItem[]>([]);
    const normalizedQuery = query.trim().toLowerCase();
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const { execute } = useApi();

    // useEffect для загрузки данных при монтировании
    useEffect(() => {
        fetchCompanies();
        fetchMyProjects();
    }, []);

    const fetchCompanies = async () => {
        const response = await execute({
            method: 'GET',
            url: '/company/my', // твой endpoint
        });

        // Предполагаем, что response.data содержит массив компаний
        console.log(response);
        if (response) {
            // Преобразуем все данные в строки
            const formattedCompanies = response.map((company: any) => ({
                id: String(company.id),
                name: String(company.name || ''),
                roleKey: String(company.roleKey || 'user'),
                createdAt: String(company.created_at || ''),
                backgroundColor: String(company.color || '#1E3A8A'),
            }));
            setCompanies(formattedCompanies);
        }
    };

    const fetchMyProjects = async () => {
        const response = await execute({
            method: 'GET',
            url: `/project/my`, // твой endpoint
        });

        // Предполагаем, что response.data содержит массив компаний
        console.log(response);
        if (response) {
            const formattedProjects = response.map((project: any) => ({
                id: String(project.id),
                name: String(project.name || ''),
                company: project.company,
                created_at: project.created_at ? String(project.created_at) : undefined,
                color: String(project.color || '#0760FB'),
                progressPercentage: project?.progressPercentage ?? Math.floor(Math.random() * 101),
                participants: project?.employee_project_rel || [],
                dueDate: project.created_at ?? '',
            }));
            console.log('FORMATTED', formattedProjects);
            setProjects(formattedProjects);
        }
    };

    const filteredDocuments = useMemo(() => {
        if (!normalizedQuery) return DOCUMENTS_DATA;
        return DOCUMENTS_DATA.filter(doc => {
            const titleMatch = doc.title.toLowerCase().includes(normalizedQuery);
            const companyMatch = doc.company.toLowerCase().includes(normalizedQuery);
            const projectMatch = (doc.project ?? '').toLowerCase().includes(normalizedQuery);
            return titleMatch || companyMatch || projectMatch;
        });
    }, [normalizedQuery]);

    const filteredCompanies = useMemo(() => {
        if (!normalizedQuery) return companies;
        return companies.filter(company => {
            const roleLabel = t(`companies.roles.${company?.roleKey}`);
            return (
                company.name.toLowerCase().includes(normalizedQuery) ||
                roleLabel.toLowerCase().includes(normalizedQuery)
            );
        });
    }, [normalizedQuery, companies, t]);

    const filteredProjects = useMemo(() => {
        if (!normalizedQuery) return projects;
        return projects.filter(project => {
            const titleMatch = project.name.toLowerCase().includes(normalizedQuery);
            const companyMatch = project.company.name.toLowerCase().includes(normalizedQuery);
            return titleMatch || companyMatch;
        });
    }, [normalizedQuery, projects]);

    const hasResults =
        (filteredDocuments && filteredDocuments.length > 0) ||
        (filteredCompanies && filteredCompanies.length > 0) ||
        (filteredProjects && filteredProjects.length > 0);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.white100,
        },
        content: {
            paddingHorizontal: 16,
            paddingBottom: 32,
        },
        searchInputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: theme.colors.gray100,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginTop: 16,
            borderWidth: 1,
            borderColor: theme.colors.black10,
        },
        searchInput: {
            flex: 1,
            ...textStyles.medium,
            fontSize: 18,
            color: theme.colors.primaryText,
        },
        section: {
            marginTop: 24,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        sectionTitle: {
            ...textStyles.semiBold,
            fontSize: 18,
            color: theme.colors.primaryText,
        },
        sectionCount: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
        },
        documentCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.white100,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.black10,
        },
        documentIcon: {
            width: 40,
            alignItems: 'center',
            marginRight: 12,
        },
        documentContent: {
            flex: 1,
            flexDirection: 'column',
            gap: 4,
        },
        documentTitle: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        documentMeta: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
        },
        documentDate: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
        },
        loadMoreButton: {
            alignSelf: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
        },
        loadMoreText: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        cardWrapper: {
            marginBottom: 16,
        },
        projectCompany: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
            marginBottom: 8,
        },
        emptyState: {
            marginTop: 60,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyStateText: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.secondaryText,
            textAlign: 'center',
        },
    });

    // --- функция для отображения 3 или всех элементов ---
    const getVisibleItems = (data: any[], showAll: boolean) => (showAll ? data : data.slice(0, 3));

    return (
        <View style={styles.container}>
            <View style={{ paddingHorizontal: 16 }}>
                <Header
                    title={t('search.title')}
                    backButton
                    onBackPress={() => router.back()}
                    backButtonColor={theme.colors.black100}
                    backButtonBGroundColor={theme.colors.gray100}
                />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.searchInputWrapper}>
                        <SearchIcon width={24} height={24} fill={theme.colors.black60} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder={t('search.placeholder')}
                            placeholderTextColor={theme.colors.black40}
                            style={styles.searchInput}
                            autoCorrect={false}
                            autoCapitalize="none"
                            returnKeyType="search"
                        />
                    </View>

                    {/* DOCUMENTS */}
                    {filteredDocuments && filteredDocuments.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{t('search.documentsSection')}</Text>
                                <Text style={styles.sectionCount}>
                                    {t('search.documentsCount', { count: filteredDocuments.length })}
                                </Text>
                            </View>

                            {getVisibleItems(filteredDocuments ?? [], showAllDocuments).map(document => (
                                <TouchableOpacity
                                    key={document.id}
                                    style={styles.documentCard}
                                    activeOpacity={0.85}
                                    onPress={() => console.log('Open document', document.id)}
                                >
                                    <View style={styles.documentIcon}>
                                        <FileIcon extension={document.extension} />
                                    </View>
                                    <View style={styles.documentContent}>
                                        <Text style={styles.documentTitle}>{document.title}</Text>
                                        <Text style={styles.documentMeta}>
                                            {document.project
                                                ? `${document.company} ${BULLET} ${document.project}`
                                                : document.company}
                                        </Text>
                                        <Text style={styles.documentDate}>{document.date}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}

                            {filteredDocuments && filteredDocuments.length > 3 && (
                                <TouchableOpacity
                                    style={styles.loadMoreButton}
                                    onPress={() => setShowAllDocuments(!showAllDocuments)}
                                    activeOpacity={0.8}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={styles.loadMoreText}>
                                            {showAllDocuments
                                                ? t('addTask.selectDocs.collapse')
                                                : t('addTask.selectDocs.loadMore')}
                                        </Text>
                                        <ArrowRightIcon
                                            fill={theme.colors.primaryText}
                                            width={24}
                                            height={12}
                                            style={{
                                                transform: [{ rotate: showAllDocuments ? '-90deg' : '90deg' }],
                                            }}
                                        />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* COMPANIES */}
                    {filteredCompanies && filteredCompanies.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{t('search.companiesSection')}</Text>
                                <Text style={styles.sectionCount}>
                                    {t('search.companiesCount', { count: filteredCompanies.length })}
                                </Text>
                            </View>

                            {getVisibleItems(filteredCompanies ?? [], showAllCompanies).map(company => (
                                <View key={company?.id} style={styles.cardWrapper}>
                                    <CompanyCard
                                        id={company?.id}
                                        title={company?.name}
                                        userRole={t(`companies.roles.${company?.roleKey}`)}
                                        creationDate={company?.created_at}
                                        backgroundColor={company?.color}
                                        settingButton={false}
                                    />
                                </View>
                            ))}

                            {filteredCompanies && filteredCompanies.length > 3 && (
                                <TouchableOpacity
                                    style={styles.loadMoreButton}
                                    onPress={() => setShowAllCompanies(!showAllCompanies)}
                                    activeOpacity={0.8}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={styles.loadMoreText}>
                                            {showAllCompanies
                                                ? t('addTask.selectDocs.collapse')
                                                : t('addTask.selectDocs.loadMore')}
                                        </Text>
                                        <ArrowRightIcon
                                            fill={theme.colors.primaryText}
                                            width={24}
                                            height={12}
                                            style={{
                                                transform: [{ rotate: showAllCompanies ? '-90deg' : '90deg' }],
                                            }}
                                        />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* PROJECTS */}
                    {filteredProjects && filteredProjects.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{t('search.projectsSection')}</Text>
                                <Text style={styles.sectionCount}>
                                    {t('search.projectsCount', { count: filteredProjects.length })}
                                </Text>
                            </View>

                            {getVisibleItems(filteredProjects ?? [], showAllProjects).map(project => (
                                <View key={project.id} style={styles.cardWrapper}>
                                    <Text style={styles.projectCompany}>{project?.company?.name}</Text>
                                    <ProjectCard
                                        id={project?.id}
                                        title={project?.name}
                                        to={`/companies/project/${project?.id}`}
                                        participants={project?.employee_project_rel}
                                        maxVisibleParticipants={project?.employee_project_rel?.length ?? 0}
                                        settingButton={false}
                                        progressPercentage={project?.progressPercentage ?? 0}
                                        showProgress={Boolean(project.progressPercentage)}
                                        showDueDate={Boolean(project.dueDate)}
                                        dueDate={project.dueDate}
                                        cardWidth="100%"
                                        backgroundColor={project.backgroundColor}
                                    />
                                </View>
                            ))}

                            {filteredProjects && filteredProjects.length > 3 && (
                                <TouchableOpacity
                                    style={styles.loadMoreButton}
                                    onPress={() => setShowAllProjects(!showAllProjects)}
                                    activeOpacity={0.8}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={styles.loadMoreText}>
                                            {showAllProjects
                                                ? t('addTask.selectDocs.collapse')
                                                : t('addTask.selectDocs.loadMore')}
                                        </Text>
                                        <ArrowRightIcon
                                            fill={theme.colors.primaryText}
                                            width={24}
                                            height={12}
                                            style={{
                                                transform: [{ rotate: showAllProjects ? '-90deg' : '90deg' }],
                                            }}
                                        />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {!hasResults && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>{t('search.noResults')}</Text>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
