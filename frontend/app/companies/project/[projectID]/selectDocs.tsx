import ArrowRightIcon from '@/assets/images/icons/arrowRightIcon.svg';
import TaskCompletedIcon from '@/assets/images/icons/taskCompletedIcon.svg';
import FileIcon from '@/components/common-components/fileIcons';
import Header from '@/components/common-components/header';
import UniversalTextInput from '@/components/common-components/universalTextInput';
import { COMPANY_DOCUMENT_GROUPS, CompanyDocument, parseSelectedDocumentsParam } from '@/constants/companyDocuments';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

type CompanyWithFilteredDocs = {
    id: string;
    name: string;
    totalDocuments: number;
    documents: CompanyDocument[];
};

const pluralize = (count: number, variants: { one: string; few: string; many: string }) => {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod100 >= 11 && mod100 <= 14) {
        return variants.many;
    }

    if (mod10 === 1) {
        return variants.one;
    }

    if (mod10 >= 2 && mod10 <= 4) {
        return variants.few;
    }

    return variants.many;
};

const buildDocumentsCountLabel = (count: number) =>
    `${count} ${pluralize(count, { one: 'документ', few: 'документа', many: 'документов' })}`;

const buildFilesAddLabel = (count: number) =>
    `${count} ${pluralize(count, { one: 'файл', few: 'файла', many: 'файлов' })}`;

export default function SelectDocs() {
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

    const initialSelectedIds = useMemo(
        () => parseSelectedDocumentsParam(params.selectedDocs),
        [params.selectedDocs],
    );

    const [searchValue, setSearchValue] = useState('');
    const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});
    const [selectedDocIds, setSelectedDocIds] = useState<string[]>(initialSelectedIds);

    useEffect(() => {
        setSelectedDocIds(prev => {
            if (prev.length === initialSelectedIds.length && prev.every(id => initialSelectedIds.includes(id))) {
                return prev;
            }
            return initialSelectedIds;
        });
    }, [initialSelectedIds]);

    const normalizedSearch = searchValue.trim().toLowerCase();

    const companies = useMemo<CompanyWithFilteredDocs[]>(() => {
        return COMPANY_DOCUMENT_GROUPS.map(group => {
            const filteredDocs = group.documents.filter(doc => {
                if (!normalizedSearch) return true;
                return (
                    doc.name.toLowerCase().includes(normalizedSearch) ||
                    doc.project?.toLowerCase().includes(normalizedSearch)
                );
            });

            return {
                id: group.id,
                name: group.name,
                totalDocuments: group.documents.length,
                documents: filteredDocs,
            };
        }).filter(company => company.documents.length > 0 || !normalizedSearch);
    }, [normalizedSearch]);

    const toggleCompanyExpand = (companyId: string) => {
        setExpandedCompanies(prev => ({
            ...prev,
            [companyId]: !prev[companyId],
        }));
    };

    const toggleDocSelection = (docId: string) => {
        setSelectedDocIds(prev => {
            const next = prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId];
            return next;
        });
    };

    const handleAddDocuments = () => {
        if (selectedDocIds.length === 0) return;
        router.replace({
            pathname: '/companies/project/[projectID]/addTask',
            params: {
                projectID: projectIDParam,
                selectedDocs: selectedDocIds.join(','),
            },
        });
    };

    const selectedCount = selectedDocIds.length;
    const isAddDisabled = selectedCount === 0;
    const addButtonLabel = isAddDisabled
        ? t('addTask.selectDocs.addButtonPlaceholder')
        : `${t('addTask.selectDocs.addButtonPrefix')} ${buildFilesAddLabel(selectedCount)}`;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.white100,
        },
        content: {
            paddingBottom: 24,
        },
        headerWrapper: {
            paddingHorizontal: 16,
        },
        title: {
            ...textStyles.semiBold,
            fontSize: 22,
            color: theme.colors.primaryText,
            marginTop: 16,
            paddingHorizontal: 16,
        },
        searchContainer: {
            marginTop: 16,
            paddingHorizontal: 16,
            marginBottom: 8,
        },
        docsGroupContainer: {
            marginTop: 24,
            paddingHorizontal: 16,
        },
        docsInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        docsInfoText: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        docsCountText: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.secondaryText,
        },
        docsItemsContainer: {
            gap: 12,
        },
        docItem: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.black10,
            padding: 12,
            backgroundColor: theme.colors.white100,
        },
        docItemSelected: {
            borderColor: theme.colors.blue,
        },
        docIconContainer: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        docContent: {
            flex: 1,
            gap: 4,
        },
        docTitle: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        docMeta: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.secondaryText,
        },
        docDate: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.secondaryText,
        },
        checkbox: {
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: theme.colors.black20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        checkboxSelected: {
            backgroundColor: theme.colors.blue,
            borderColor: theme.colors.blue,
        },
        loadMoreButton: {
            marginTop: 12,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.black10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
        },
        loadMoreText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        footer: {
            paddingHorizontal: 16,
        },
        addButton: {
            height: 52,
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
        },
        addButtonDisabled: {
            backgroundColor: theme.colors.gray60,
        },
        addButtonEnabled: {
            backgroundColor: theme.colors.black100,
        },
        addButtonText: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.white100,
        },
    });

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.headerWrapper}>
                <Header
                    title={t('addTask.selectDocs.header')}
                    backButton
                    backButtonColor={theme.colors.black60}
                    backButtonBGroundColor={theme.colors.white100}
                />
            </View>

            <Text style={styles.title}>{t('addTask.selectDocs.title')}</Text>

            <View style={styles.searchContainer}>
                <UniversalTextInput
                    isSearchInput
                    value={searchValue}
                    onChangeText={setSearchValue}
                    placeholder={t('addTask.selectDocs.searchPlaceholder')}
                    placeholderTextColor={theme.colors.secondaryText}
                />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {companies.map(company => {
                    const isExpanded = expandedCompanies[company.id];
                    const displayedDocuments = isExpanded
                        ? company.documents
                        : company.documents.slice(0, 3);

                    if (displayedDocuments.length === 0) {
                        return null;
                    }

                    return (
                        <View key={company.id} style={styles.docsGroupContainer}>
                            <View style={styles.docsInfo}>
                                <Text style={styles.docsInfoText}>{company.name}</Text>
                                <Text style={styles.docsCountText}>
                                    {buildDocumentsCountLabel(company.totalDocuments)}
                                </Text>
                            </View>

                            <View style={styles.docsItemsContainer}>
                                {displayedDocuments.map(doc => {
                                    const isSelected = selectedDocIds.includes(doc.id);
                                    return (
                                        <TouchableOpacity
                                            key={doc.id}
                                            style={[
                                                styles.docItem,
                                                isSelected && styles.docItemSelected,
                                            ]}
                                            activeOpacity={0.8}
                                            onPress={() => toggleDocSelection(doc.id)}
                                        >
                                            <View style={styles.docIconContainer}>
                                                <FileIcon extension={doc.extension} />
                                            </View>
                                            <View style={styles.docContent}>
                                                <Text style={styles.docTitle}>{doc.name}</Text>
                                                {doc.project && (
                                                    <Text style={styles.docMeta}>{doc.project}</Text>
                                                )}
                                                <Text style={styles.docDate}>{doc.date}</Text>
                                            </View>
                                            <View
                                                style={[
                                                    styles.checkbox,
                                                    isSelected && styles.checkboxSelected,
                                                ]}
                                            >
                                                {isSelected && <TaskCompletedIcon width={24} height={24} />}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}

                                {company.documents.length > 3 && (
                                    <TouchableOpacity
                                        style={styles.loadMoreButton}
                                        onPress={() => toggleCompanyExpand(company.id)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.loadMoreText}>
                                            {isExpanded
                                                ? t('addTask.selectDocs.collapse')
                                                : t('addTask.selectDocs.loadMore')}
                                        </Text>
                                        <View style={{ transform: [{ rotate: isExpanded ? '270deg' : '90deg' }] }}>
                                            <ArrowRightIcon
                                                fill={theme.colors.primaryText}
                                                width={24}
                                                height={12}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isAddDisabled}
                    onPress={handleAddDocuments}
                    style={[
                        styles.addButton,
                        isAddDisabled ? styles.addButtonDisabled : styles.addButtonEnabled,
                    ]}
                >
                    <Text style={styles.addButtonText}>{addButtonLabel}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
