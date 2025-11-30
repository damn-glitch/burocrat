import Header from '@/components/common-components/header';
import Skeleton from '@/components/common-components/skeleton';
import Notification from '@/components/main-components/notification';
import { textStyles } from "@/constants/typography";
import { useTheme } from '@/context/ThemeContext';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type NotificationType = {
    id: string;
    type: string;
    avatar: string;
    user: string;
    text: string;
    project: string;
    isRequest: boolean;
    onPress: () => void;
    createdAt: string;
    company: string;
};

const Notifications = () => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('Все');
    const underlineAnim = useRef(new Animated.Value(0)).current;
    const tabRefs = useRef<(View | null)[]>([]);
    const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { key: t('notifications.tabs.all'), filter: (_n: NotificationType) => true },
        { key: t('notifications.tabs.users'), filter: (n: NotificationType) => n.type === 'user' },
        { key: t('notifications.tabs.ai'), filter: (n: NotificationType) => n.type === 'ai' },
    ];

    const notificationsData = [
        {
            id: '1',
            type: 'user',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            user: 'Иван Иванов',
            text: 'отправил вам сообщение',
            project: 'Проект Альфа',
            isRequest: true,
            onPress: () => { },
            createdAt: '2 ч. назад',
            company: 'ТехКорп',
        },
        {
            id: '2',
            type: 'ai',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            user: 'ИИ',
            text: 'подготовил отчет',
            project: 'Проект Бета',
            isRequest: false,
            onPress: () => { },
            createdAt: '1 ч. назад',
            company: 'ТехКорп',
        },
        {
            id: '3',
            type: 'user',
            avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            user: 'Петр Петров',
            text: 'приглашает вас в проект',
            project: 'Проект Гамма',
            isRequest: true,
            onPress: () => { },
            createdAt: '5 мин. назад',
            company: 'БизнесГрупп',
        },
        {
            id: '323',
            type: 'user',
            avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            user: 'Петр Петров',
            text: 'приглашает вас в проект',
            project: 'Проект Гамма',
            isRequest: true,
            onPress: () => { },
            createdAt: '5 мин. назад',
            company: 'БизнесГрупп',
        }, {
            id: '321312',
            type: 'user',
            avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            user: 'Петр Петров',
            text: 'приглашает вас в проект',
            project: 'Проект Гамма',
            isRequest: true,
            onPress: () => { },
            createdAt: '5 мин. назад',
            company: 'БизнесГрупп',
        }, {
            id: '213312',
            type: 'user',
            avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            user: 'Петр Петров',
            text: 'приглашает вас в проект',
            project: 'Проект Гамма',
            isRequest: true,
            onPress: () => { },
            createdAt: '5 мин. назад',
            company: 'БизнесГрупп',
        },
    ];

    useEffect(() => {
        if (tabLayouts.length === tabs.length) {
            Animated.timing(underlineAnim, {
                toValue: tabs.findIndex(tab => tab.key === activeTab),
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    }, [activeTab, tabLayouts]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1);
        return () => clearTimeout(timer);
    }, []);

    const handleTabLayout = (event: import('react-native').LayoutChangeEvent, idx: number) => {
        const { x, width } = event.nativeEvent.layout;
        setTabLayouts((prev) => {
            const next = [...prev];
            next[idx] = { x, width };
            return next;
        });
    };

    const underlineStyle = () => {
        if (tabLayouts.length !== tabs.length) return {};
        const inputRange = tabs.map((_, i) => i);
        const outputRange = tabLayouts.map((tab) => tab.x);
        const widthRange = tabLayouts.map((tab) => tab.width);

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

    const styles = StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: theme.colors.white100 },
        tabContainer: {
            flexDirection: 'row',
            paddingVertical: 16,
            backgroundColor: theme.colors.white100,
            borderBottomWidth: 1,
            borderTopWidth: 1,
            borderColor: theme.colors.black20,
            position: 'relative',
            height: 56,
            alignItems: 'center',
        },
        tabWrapper: {
            alignItems: 'center',
            height: 56,
            justifyContent: 'center',
            maxWidth: 127,
            minWidth: 100,
            paddingHorizontal: 8,
        },
        tabText: {
            ...textStyles.semiBold,
            fontSize: 16,
        },
        animatedUnderline: {
            position: 'absolute',
            bottom: 0,
            height: 3,
            backgroundColor: theme.colors.black100,
            borderRadius: 1.5,
        },
        listContainer: {
            flex: 1,
            backgroundColor: theme.colors.white100,
        },
    });

    const filteredNotifications = notificationsData
        .filter(tabs.find(tab => tab.key === activeTab)?.filter || (() => true))
        .sort((a, b) => {
            const parseTime = (str: string) => {
                if (!str) return 0;
                if (str.includes('мин')) return -parseInt(str);
                if (str.includes('ч')) return -parseInt(str) * 60;
                return 0;
            };
            return parseTime(a.createdAt) - parseTime(b.createdAt);
        });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <Header
                title={t('notifications.title')}
                backButton
                backButtonColor={theme.colors.black60}
                backGroundColor={theme.colors.white100}
            />

            <View style={styles.tabContainer}>
                {tabs.map((tab, idx) => (
                    <Pressable
                        key={tab.key}
                        onPress={() => setActiveTab(tab.key)}
                        style={styles.tabWrapper}
                        ref={(el) => { tabRefs.current[idx] = el; }}
                        onLayout={(e) => handleTabLayout(e, idx)}
                    >
                        <Text style={styles.tabText}>
                            {tab.key}
                        </Text>
                    </Pressable>
                ))}
                {tabLayouts.length === tabs.length && (
                    <Animated.View
                        style={[
                            styles.animatedUnderline,
                            underlineStyle(),
                        ]}
                    />
                )}
            </View>

            <View style={styles.listContainer}>
                {loading ? (
                    <View>
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} height={88} style={{ marginBottom: 12, borderRadius: 12 }} />
                        ))}
                    </View>
                ) : (
                    <FlatList
                        data={filteredNotifications}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Notification {...item} />
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

export default Notifications;