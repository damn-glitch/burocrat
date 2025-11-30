import FileIcon from '@/components/common-components/fileIcons';
import Header from '@/components/common-components/header';
import UniversalTextInput from '@/components/common-components/universalTextInput';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ArrowRightIcon from '@/assets/images/icons/arrowRightIcon.svg';

// Создаем типы для документов и компаний
type DocStatus = 'Подписан' | 'Черновик' | null;

type Document = {
    id: string;
    name: string;
    extension: string;
    category?: string;
    project?: string;
    status?: DocStatus;
    date: string;
};

type Company = {
    id: string;
    name: string;
    documents: Document[];
};

export default function EditDocs() {
    const theme = useTheme();

    // Пример данных для компаний и их документов
    const [companies, setCompanies] = useState<Company[]>([
        {
            id: '1',
            name: 'Tleu agency',
            documents: [
                { id: '1', name: 'Пример договора.pdf', extension: 'pdf', category: 'Бюрократ', date: '10.10.2025' },
                { id: '2', name: 'Пример договора.pdf', extension: 'pdf', project: 'Проект 2', status: 'Черновик', date: '10.10.2025' },
                { id: '3', name: 'Пример договора.pdf', extension: 'pdf', project: 'Проект 2', status: 'Подписан', date: '10.10.2025' },
                { id: '4', name: 'Пример договора.pdf', extension: 'pdf', project: 'Проект 2', date: '10.10.2025' },
                { id: '5', name: 'Документация.docx', extension: 'docx', project: 'Проект 3', date: '05.10.2025' },
                { id: '6', name: 'Презентация.pdf', extension: 'pdf', project: 'Проект 1', date: '01.10.2025' },
            ]
        },
        {
            id: '2',
            name: 'AlmaTech Solutions',
            documents: [
                { id: '7', name: 'Договор поставки.pdf', extension: 'pdf', project: 'Логистика', date: '15.10.2025' },
                { id: '8', name: 'Акт выполненных работ.pdf', extension: 'pdf', status: 'Подписан', date: '12.10.2025' },
                { id: '9', name: 'Техническое задание.docx', extension: 'docx', project: 'Разработка', date: '08.10.2025' },
                { id: '10', name: 'Отчет.pdf', extension: 'pdf', project: 'Финансы', date: '05.10.2025' },
            ]
        }
    ]);

    // Состояния для отслеживания компаний, у которых нужно отобразить все документы
    const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});

    const toggleCompanyExpand = (companyId: string) => {
        setExpandedCompanies(prev => ({
            ...prev,
            [companyId]: !prev[companyId]
        }));
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.white100,
        },
        content: {
            paddingBottom: 24,
        },
        header: {
            paddingHorizontal: 16,
        },
        title: {
            ...textStyles.semiBold,
            fontSize: 24,
            color: theme.colors.primaryText,
            marginTop: 16,
            paddingHorizontal: 16,
        },
        subtitle: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
            lineHeight: 20,
            marginTop: 8,
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
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 8,
        },
        docsInfoText: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        docsCountText: {
            ...textStyles.semiBold,
            fontSize: 14,
            color: theme.colors.secondaryText,
        },
        docsItemsContainer: {
            flexDirection: 'column',
            gap: 8,
            marginTop: 8,
        },
        docItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderWidth: 1,
            borderColor: theme.colors.black10,
            borderRadius: 8,
            height: 100,
        },
        docIconContainer: {
            marginRight: 12,
        },
        docContent: {
            flex: 1,
        },
        docTitle: {
            ...textStyles.semiBold,
            fontSize: 14,
            color: theme.colors.primaryText,
            marginBottom: 4,
        },
        docInfoColumn: {
            flexDirection: 'column',
        },
        docCategory: {
            ...textStyles.medium,
            fontSize: 13,
            color: theme.colors.secondaryText,
            marginRight: 8,
        },
        docStatusContainer: {
            backgroundColor: theme.colors.black100,
            borderRadius: 4,
            marginRight: 8,
            width: 72,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        docStatusText: {
            ...textStyles.medium,
            fontSize: 12,
        },
        docDate: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
        },
        loadMoreButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            marginTop: 8,
        },
        loadMoreText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
            marginRight: 4,
        },
    });

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <Header
                    title="Редактирование"
                    titleFontSize={16}
                    backButton
                    backButtonColor={theme.colors.black60}
                    backButtonBGroundColor={theme.colors.gray100}
                />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>
                    Редактирование документов
                </Text>

                <Text style={styles.subtitle}>
                    В разделе редактирования документов вы можете легко добавить подпись и печать, просто выбрав документ и разместив элементы.
                </Text>

                <View style={styles.searchContainer}>
                    <UniversalTextInput
                        isSearchInput
                        placeholder='Поиск по документам'
                        placeholderTextColor={theme.colors.secondaryText}
                    />
                </View>

                {companies.map(company => {
                    // Определяем, сколько документов показывать
                    const isExpanded = expandedCompanies[company.id];
                    const displayedDocuments = isExpanded
                        ? company.documents
                        : company.documents.slice(0, 3);

                    return (
                        <View key={company.id} style={styles.docsGroupContainer}>
                            <View style={styles.docsInfo}>
                                {/* Название компании */}
                                <Text style={styles.docsInfoText}>{company.name}</Text>

                                {/* Количество документов */}
                                <Text style={styles.docsCountText}>
                                    {company.documents.length} документов
                                </Text>
                            </View>

                            <View style={styles.docsItemsContainer}>
                                {displayedDocuments.map(doc => (
                                    <TouchableOpacity
                                        key={doc.id}
                                        style={styles.docItem}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.docIconContainer}>
                                            <FileIcon extension={doc.extension} />
                                        </View>
                                        <View style={styles.docContent}>
                                            <Text style={styles.docTitle}>{doc.name}</Text>
                                            <View style={styles.docInfoColumn}>
                                                {doc.category && (
                                                    <Text style={styles.docCategory}>{doc.category}</Text>
                                                )}
                                                {doc.project && (
                                                    <Text style={styles.docCategory}>{doc.project}</Text>
                                                )}
                                                <View style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }}>
                                                    {doc.status && (
                                                        <View style={[
                                                            styles.docStatusContainer,
                                                            { backgroundColor: doc.status === 'Подписан' ? theme.colors.black100 : theme.colors.black10 }
                                                        ]}>
                                                            <Text style={[
                                                                styles.docStatusText,
                                                                { color: doc.status === 'Подписан' ? theme.colors.white100 : theme.colors.primaryText }
                                                            ]}>{doc.status}</Text>
                                                        </View>
                                                    )}
                                                    <Text style={styles.docDate}>{doc.date}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <ArrowRightIcon width={24} height={13} fill={theme.colors.black60} />
                                    </TouchableOpacity>
                                ))}

                                {/* Кнопка "Загрузить больше" */}
                                {company.documents.length > 3 && (
                                    <TouchableOpacity
                                        style={styles.loadMoreButton}
                                        onPress={() => toggleCompanyExpand(company.id)}
                                        activeOpacity={0.9}
                                    >
                                        <Text style={styles.loadMoreText}>
                                            {isExpanded ? 'Свернуть' : 'Загрузить больше'}
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
        </SafeAreaView>
    );
}