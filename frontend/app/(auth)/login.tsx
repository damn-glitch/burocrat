import Error from '@/components/common-components/error';
import FormEmailInput from '@/components/auth-components/formEmailInput';
import FormPasswordInput from '@/components/auth-components/formPassword';
import FormPrimaryButton from '@/components/auth-components/formPrimaryButton';
import SupportLink from '@/components/auth-components/supportLink';
import SupportText from '@/components/auth-components/supportText';
import Logo from '@/components/common-components/logo';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApi } from '@/api';
import { storage } from '@/storage';
import { router } from 'expo-router';

export default function Login() {
    const theme = useTheme();
    const { t } = useTranslation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.white100,
        },
        container: {
            paddingHorizontal: 16,
            paddingTop: 40,
            flex: 1,
        },

        formContainer: {
            gap: 12,
            marginBottom: 16,
        },
        textLinkContainer: {
            alignItems: 'center',
            marginBottom: 30,
            marginTop: 12,
        },
    });

    const handleEmailChange = (value: string, isValid: boolean) => {
        setEmail(value);
        setIsEmailValid(isValid);
        if (formError) setFormError(null);
    };

    const { data, loading, error, execute, reset } = useApi();
    const handleSubmit = async () => {
        if (!isEmailValid) {
            setFormError(t('login.errorEmail'));
            return;
        }

        try {
            const response: any = await execute({
                method: 'POST',
                url: '/auth/login',
                data: {
                    identifier: email,
                    password: password,
                },
            });

            // response должен содержать data
            console.log('Full response:', response);

            const authData = response;

            if (authData) {
                // Токены
                storage.set('access_token', authData.access_token);
                storage.set('refresh_token', authData.refresh_token);

                // Данные пользователя
                storage.set('user.id', authData.user?.id);
                storage.set('user.email', authData.user?.email);
                storage.set('user.firstname', authData.user?.firstname ?? '');
                storage.set('user.lastname', authData.user?.lastname ?? '');
                storage.set('user.middlename', authData.user?.middlename ?? '');

                console.log('Auth data saved:', authData);
                router.navigate('/main');
            } else {
                console.log('No auth data received');
            }
        } catch (err: any) {
            console.log('Login error:', err);
            console.log('Error response:', err?.response?.data);
        }

        console.log('Form submitted with email:', email);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.container}>
                <Logo />

                <SupportText
                    mainText={t('login.welcomeMain')}
                    secondaryText={t('login.welcomeSecondary')}
                />

                <Error error={formError ?? ''} hidden={!formError} />

                <View style={styles.formContainer}>
                    <FormEmailInput
                        label={t('login.labelEmail')}
                        placeholder={t('login.placeholderEmail')}
                        keyboardType="email-address"
                        value={email}
                        onChange={handleEmailChange}
                    />

                    <FormPasswordInput
                        label={t('login.labelPassword')}
                        placeholder={t('login.placeholderPassword')}
                        keyboardType="default"
                        hidden={true}
                        onChangePassword={setPassword}
                    />
                </View>

                <View style={styles.textLinkContainer}>
                    <SupportLink label={t('login.forgotPassword')} to="/forgotPassword" />
                </View>

                <View>
                    <FormPrimaryButton label={t('login.loginButton')} onPress={handleSubmit} />
                </View>

                {/*<DividerWithText text={t('login.or')} />*/}

                {/*<View>*/}
                {/*    <FormSecondaryButton*/}
                {/*        label={t('login.googleButton')}*/}
                {/*        onPress={function (): void {*/}
                {/*            console.log('Google login pressed');*/}
                {/*        }}*/}
                {/*        icon={*/}
                {/*            <GoogleLogo*/}
                {/*                stroke={theme.colors.primaryText}*/}
                {/*                strokeWidth={0.01}*/}
                {/*                width={24}*/}
                {/*                height={24}*/}
                {/*            />*/}
                {/*        }*/}
                {/*    />*/}
                {/*</View>*/}

                <View style={[styles.textLinkContainer]}>
                    <SupportLink label={t('login.noAccount')} to="/register" />
                </View>
            </View>
        </SafeAreaView>
    );
}
