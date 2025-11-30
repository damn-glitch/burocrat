import ArrowRightIcon from '@/assets/images/icons/arrowRightIcon.svg';
import BellSettingIcon from '@/assets/images/icons/bellSettingIcon.svg';
import DataSettingIcon from '@/assets/images/icons/dataSettingIcon.svg';
import ExitSettingIcon from '@/assets/images/icons/exitSettingIcon.svg';
import LanguageSettingIcon from '@/assets/images/icons/languageSettingIcon.svg';
import LocketSettingIcon from '@/assets/images/icons/locketSettingIcon.svg';
import Header from '@/components/common-components/header';
import Skeleton from '@/components/common-components/skeleton';
import ProfileSettingOption from '@/components/main-components/profileSettingOption';
import ProfileStats from '@/components/main-components/profileStats';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '@/storage';

export default function Profile() {
    const theme = useTheme();
    const { t } = useTranslation();
    const [loadingUser, setLoadingUser] = useState(true);

    const [tasksData, setTasksData] = useState({
        inProgress: 10,
        waiting: 3,
        pending: 4,
        overdue: 1,
    });

    useEffect(() => {
        const timer = setTimeout(() => setLoadingUser(false), 1);
        return () => clearTimeout(timer);
    }, []);

    const styles = StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: theme.colors.background },
        container: {
            flex: 1,
            paddingHorizontal: 16,
            paddingBottom: 40,
        },
        userContainer: {
            width: '100%',
            height: 88,
            backgroundColor: theme.colors.white100,
            borderRadius: 8,
            marginTop: 8,
            paddingVertical: 16,
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
        },
        userTextContainer: {
            flex: 1,
            justifyContent: 'center',
        },
        userImage: {
            width: 56,
            height: 56,
            borderRadius: 28,
            marginRight: 16,
            backgroundColor: theme.colors.whiteIcon,
        },
        userName: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        description: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.secondaryText,
        },

        profileSettingsContainer: {
            gap: 8,
        },
        profileSettingsText: {
            ...textStyles.medium,
            fontSize: 20,
            color: theme.colors.primaryText,
            marginTop: 32,
            marginBottom: 8,
        },
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Header
                    title={t('profile.title')}
                    backButton
                    backButtonColor={theme.colors.black60}
                    backButtonBGroundColor={theme.colors.white100}
                />

                {loadingUser ? (
                    <Skeleton height={88} style={{ marginTop: 8, borderRadius: 8 }} />
                ) : (
                    <Link href="./profileSetting">
                        <TouchableOpacity style={styles.userContainer} activeOpacity={0.8}>
                            <Image style={styles.userImage} />

                            <View style={styles.userTextContainer}>
                                <Text style={styles.userName}>
                                    {storage.getString('firstname') + ' ' + storage.getString('lastname')}
                                </Text>
                                <Text style={styles.description}>{t('profile.viewProfile')}</Text>
                            </View>

                            <ArrowRightIcon width={24} height={16} fill={theme.colors.black100} />
                        </TouchableOpacity>
                    </Link>
                )}

                <View style={{ backgroundColor: theme.colors.white100, padding: 16, borderRadius: 8 }}>
                    <ProfileStats data={tasksData} />
                </View>
                <View style={styles.profileSettingsContainer}>
                    <Text style={styles.profileSettingsText}>{t('profile.settingsTitle')}</Text>

                    <ProfileSettingOption title={t('profile.personalInfo')} icon={<DataSettingIcon />} to="/" />
                    <ProfileSettingOption title={t('profile.language')} icon={<LanguageSettingIcon />} to="/" />
                    <ProfileSettingOption title={t('profile.notifications')} icon={<BellSettingIcon />} to="/" />
                    <ProfileSettingOption title={t('profile.privacy')} icon={<LocketSettingIcon />} to="/" />
                    <ProfileSettingOption title={t('profile.logout')} icon={<ExitSettingIcon />} to="/" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
