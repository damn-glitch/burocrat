import AnalyticsIcon from '@/assets/images/icons/analyticsIcon.svg';
import CompanyIcon from '@/assets/images/icons/companyIcon.svg';
import FinancesIcon from '@/assets/images/icons/financesIcon.svg';
import HomeIcon from '@/assets/images/icons/homeIcon.svg';
import { textStyles } from "@/constants/typography";
import { useTheme } from '@/context/ThemeContext';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function TabsLayout() {
    const theme = useTheme();
    const { t } = useTranslation();

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <Tabs screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: theme.colors.black80,
                        borderRadius: 16,
                        marginHorizontal: 16,
                        height: 72,
                        position: 'absolute',
                        borderTopWidth: 0,
                        marginBottom: 16,
                        paddingTop: 8,
                        maxWidth: 500,
                        alignSelf: 'center',
                        shadowColor: 'transparent',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0,
                        shadowRadius: 0,
                        elevation: 0,
                    },
                    tabBarItemStyle: {
                        alignContent: 'center',
                    },
                    tabBarActiveTintColor: theme.colors.white100,
                    tabBarInactiveTintColor: theme.colors.white40,
                    tabBarLabelStyle: {
                        ...textStyles.medium,
                        fontSize: 10,
                        fontWeight: '500',
                    },
                    tabBarShowLabel: true,
                }}>

                    <Tabs.Screen
                        name="main"
                        options={{
                            tabBarLabel: t('navigation.tabs.main'),
                            tabBarIcon: ({ color, size }) => (
                                <HomeIcon
                                    width={20}
                                    height={20}
                                    fill={color}
                                    strokeWidth={0.1}
                                />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="companies"
                        options={{
                            title: t('navigation.tabs.companies'),
                            tabBarLabel: t('navigation.tabs.companies'),
                            tabBarIcon: ({ color, size }) => (
                                <CompanyIcon
                                    width={20}
                                    height={20}
                                    fill={color}
                                    strokeWidth={0.1}
                                />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="analytics"
                        options={{
                            title: t('navigation.tabs.analytics'),
                            tabBarLabel: t('navigation.tabs.analytics'),
                            tabBarIcon: ({ color, size }) => (
                                <AnalyticsIcon
                                    width={20}
                                    height={20}
                                    fill={color}
                                    strokeWidth={0.1}
                                />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="finances"
                        options={{
                            title: t('navigation.tabs.finances'),
                            tabBarLabel: t('navigation.tabs.finances'),
                            tabBarIcon: ({ color, size }) => (
                                <FinancesIcon
                                    width={20}
                                    height={20}
                                    fill={color}
                                    strokeWidth={0.1}
                                />
                            ),
                        }}
                    />

                </Tabs>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}