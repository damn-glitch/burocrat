import FolderIcon from '@/assets/images/icons/emptyFolderIcon.svg';
import SearchIcon from '@/assets/images/icons/searchIcon.svg';
import Header from '@/components/common-components/header';
import PlusButton from '@/components/common-components/plusButton';
import CompanyCard from '@/components/companies-components/companyCard';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApi } from '@/api';

const mockCompanies = [
    {
        id: '1',
        name: 'Компания 1',
        status: 'archive',
        userRole: 'Владелец',
        created_at: '01.01.2024',
    },
];

export default function Companies() {
    const theme = useTheme();
    const router = useRouter();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('active');
    const tabRefs = useRef<(View | null)[]>([]);
    const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
    const underlineAnim = useRef(new Animated.Value(0)).current;
    const [companies, setCompanies] = useState([]);

    const tabs = [
        { key: 'active', label: t('companies.list.tabs.active') },
        { key: 'archive', label: t('companies.list.tabs.archive') },
    ];

    const { execute } = useApi();

    // useEffect для загрузки данных при монтировании
    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        const response = await execute({
            method: 'GET',
            url: '/company/my', // твой endpoint
        });

        // Предполагаем, что response.data содержит массив компаний
        console.log(response);
        if (response) {
            setCompanies(response);
        }
    };

    useEffect(() => {
        if (tabLayouts.length === tabs.length) {
            Animated.timing(underlineAnim, {
                toValue: tabs.findIndex(tab => tab.key === activeTab),
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    }, [activeTab, tabLayouts, t]);

    const handleTabLayout = (event: import('react-native').LayoutChangeEvent, idx: number) => {
        const { x, width } = event.nativeEvent.layout;
        setTabLayouts(prev => {
            const next = [...prev];
            next[idx] = { x, width };
            return next;
        });
    };

    const activeBgStyle = () => {
        if (tabLayouts.length !== tabs.length) return {};
        const inputRange = tabs.map((_, i) => i);
        const outputRange = tabLayouts.map(tab => tab.x);
        const widthRange = tabLayouts.map(tab => tab.width);

        return {
            left: underlineAnim.interpolate({
                inputRange,
                outputRange,
            }),
            width: underlineAnim.interpolate({
                inputRange,
                outputRange: widthRange,
            }),
        };
    };

    const handleArchiveCompany = (companyId: string) => {
        setCompanies(prevCompanies =>
            prevCompanies.map(company => (company.id === companyId ? { ...company, status: 'archive' } : company))
        );
    };

    const handleRestoreCompany = (companyId: string) => {
        setCompanies(prevCompanies =>
            prevCompanies.map(company => (company.id === companyId ? { ...company, status: 'active' } : company))
        );
    };

    const handleDeleteCompany = (companyId: string) => {
        setCompanies(prevCompanies => prevCompanies.filter(company => company.id !== companyId));
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: 16,
            paddingBottom: 80,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 16,
        },
        headerTitle: {
            ...textStyles.semiBold,
            fontSize: 24,
            color: theme.colors.primaryText,
        },
        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        headerSearchContainer: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.white100,
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerAvatar: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.whiteIcon,
        },

        tabsContainer: {
            flexDirection: 'row',
            backgroundColor: theme.colors.whiteIcon,
            borderRadius: 12,
            marginBottom: 16,
            height: 48,
            alignItems: 'center',
            position: 'relative',
        },
        tab: {
            flex: 1,
            height: 40,
            margin: 4,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
        },
        tabText: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.black40,
        },
        tabTextActive: {
            color: theme.colors.black100,
        },
        activeBg: {
            position: 'absolute',
            top: 4,
            bottom: 4,
            borderRadius: 8,
            backgroundColor: theme.colors.white100,
            zIndex: 0,
        },

        noDataContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 8,
            marginBottom: 160,
        },
        noDataText: {
            ...textStyles.medium,
            color: theme.colors.secondaryText,
            fontSize: 16,
        },

        addButtonContainer: {
            position: 'absolute',
            right: 16,
            bottom: 100,
            zIndex: 100,
        },
        settingButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.white100,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            right: 16,
            top: 16,
            zIndex: 10,
        },
        settingButtonText: {
            ...textStyles.semiBold,
            fontSize: 24,
            color: theme.colors.primaryText,
        },
    });

    return (
        <View style={styles.container}>
            <Header
                title={t('companies.list.title')}
                avatarImage="https://randomuser.me/api/portraits/men/22.jpg"
                helpButton
                helpButtonColor={theme.colors.black60}
                helpButtonBGroundColor={theme.colors.white100}
                helpButtonImage={<SearchIcon />}
                helpButtonOnPress={() => router.push('/search' as any)}
            />

            <View style={styles.tabsContainer}>
                {tabLayouts.length === tabs.length && <Animated.View style={[styles.activeBg, activeBgStyle()]} />}
                {tabs.map((tab, idx) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={styles.tab}
                        onPress={() => setActiveTab(tab.key)}
                        activeOpacity={0.8}
                        ref={el => {
                            tabRefs.current[idx] = el;
                        }}
                        onLayout={e => handleTabLayout(e, idx)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === 'active' && (
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                    {companies.filter(company => true /*company.status === 'active'*/).length === 0 ? (
                        <View style={styles.noDataContainer}>
                            <FolderIcon />
                            <Text style={styles.noDataText}>{t('companies.list.emptyActive')}</Text>
                        </View>
                    ) : (
                        companies
                            .filter(company => true /*company.status === 'active'*/)
                            .map((company: any) => (
                                <Link key={company?.id} href={`/companies/${company?.id}`} asChild>
                                    <TouchableOpacity activeOpacity={0.85} style={{ marginBottom: 16 }}>
                                        <CompanyCard
                                            id={company?.id}
                                            title={company?.name}
                                            userRole={t(
                                                `companies.roles.${'Владелец' /*company?.userRole.toLowerCase()*/}`
                                            )}
                                            creationDate={company?.created_at}
                                            backgroundColor={company?.color}
                                            isArchived={false}
                                            onEdit={() => {
                                                router.push(`/companies/${company?.id}/edit`);
                                            }}
                                            onDelete={() => handleDeleteCompany(company?.id)}
                                            onShare={() => {
                                                console.log('Share company?', company?.id);
                                            }}
                                            onArchive={() => handleArchiveCompany(company?.id)}
                                        />
                                    </TouchableOpacity>
                                </Link>
                            ))
                    )}
                </ScrollView>
            )}

            {activeTab === 'archive' && (
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                    {companies.filter(company => company.status === 'archive').length === 0 ? (
                        <View style={styles.noDataContainer}>
                            <FolderIcon />
                            <Text style={styles.noDataText}>{t('companies.list.emptyArchive')}</Text>
                        </View>
                    ) : (
                        companies
                            .filter(company => company.status === 'archive')
                            .map(company => (
                                <Link key={company.id} href={`/companies/${company.id}`} asChild>
                                    <TouchableOpacity activeOpacity={0.85} style={{ marginBottom: 16 }}>
                                        <CompanyCard
                                            id={company.id}
                                            title={company.name}
                                            userRole={t(
                                                `companies.roles.${'Владелец' /*company.userRole.toLowerCase()*/}`
                                            )}
                                            creationDate={company.created_at}
                                            isArchived={true}
                                            onEdit={() => {
                                                router.push(`/companies/${company.id}/edit`);
                                            }}
                                            onDelete={() => handleDeleteCompany(company.id)}
                                            onRestore={() => handleRestoreCompany(company.id)}
                                        />
                                    </TouchableOpacity>
                                </Link>
                            ))
                    )}
                </ScrollView>
            )}
            <PlusButton onPress={() => router.push('/companies/createCompany')} />
        </View>
    );
}
