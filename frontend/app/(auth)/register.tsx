import GoogleLogo from '@/assets/images/icons/googleLogo.svg';
import DividerWithText from '@/components/auth-components/dividerWithText';
import FormEmailInput from '@/components/auth-components/formEmailInput';
import FormPrimaryButton from '@/components/auth-components/formPrimaryButton';
import FormSecondaryButton from '@/components/auth-components/formSecondaryButton';
import SupportLink from '@/components/auth-components/supportLink';
import Logo from '@/components/common-components/logo';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { storage } from '@/storage';
import { useState } from 'react';

export default function Register() {
    const theme = useTheme();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
        },
        container: {
            paddingHorizontal: 16,
            paddingTop: 40,
            flex: 1,
        },
        regContainer: {
            marginTop: 24,
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
        },
        regText: {
            ...textStyles.bold,
            color: theme.colors.primaryText,
            fontSize: 24,
            textAlign: 'center',
        },
        regTextDescription: {
            ...textStyles.medium,
            color: theme.colors.secondaryText,
            fontSize: 16,
            textAlign: 'center',
        },
        formContainer: {
            gap: 12,
            marginBottom: 16,
        },
        textLinkContainer: {
            alignItems: 'center',
            marginBottom: 30,
        },
    });
    const [error, setError] = useState<string | null>(null);

    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (error) setError(null);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.container}>
                <Logo />

                <View style={styles.regContainer}>
                    <Text style={styles.regText}>{t('register.title')}</Text>
                    <Text style={styles.regTextDescription}>{t('register.emailDescription')}</Text>
                </View>

                <View style={styles.formContainer}>
                    <FormEmailInput
                        onChange={handleEmailChange}
                        label={t('register.emailLabel')}
                        placeholder={t('register.emailPlaceholder')}
                        keyboardType="email-address"
                    />
                </View>

                <View>
                    <FormPrimaryButton
                        label={t('register.continue')}
                        onPress={function (): void {
                            storage.set('registrationEmail', email);
                            router.navigate('/register/verificationCode');
                            console.log('Continue pressed', email);
                        }}
                    />
                </View>

                <DividerWithText text={t('register.or')} />

                <View style={styles.formContainer}>
                    <FormSecondaryButton
                        label={t('register.continueWithGoogle')}
                        onPress={function (): void {
                            console.log('Google pressed');
                        }}
                        icon={
                            <GoogleLogo
                                stroke={theme.colors.primaryText}
                                strokeWidth={0.01}
                                width={24}
                                height={24}
                            />
                        }
                    />
                </View>

                <View style={[styles.textLinkContainer, { marginTop: 12 }]}>
                    <SupportLink label={t('register.alreadyHaveAccount')} to="/login" />
                </View>
            </View>
        </SafeAreaView>
    );
}
