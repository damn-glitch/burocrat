import FormEmailInput from "@/components/auth-components/formEmailInput";
import FormPrimaryButton from "@/components/auth-components/formPrimaryButton";
import Logo from "@/components/common-components/logo";
import { textStyles } from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function ForgotPassword() {
    const theme = useTheme();
    const { t } = useTranslation();

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

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.container}>
                <Logo 
                    backButton
                />

                <View style={styles.regContainer}>
                    <Text style={styles.regText}>{t('forgotPassword.title')}</Text>
                    <Text style={styles.regTextDescription}>
                        {t('forgotPassword.emailDescription')}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <FormEmailInput
                        label={t('forgotPassword.emailLabel')}
                        placeholder={t('forgotPassword.emailPlaceholder')}
                        keyboardType="email-address"
                    />
                </View>

                <View>
                    <FormPrimaryButton
                        label={t('forgotPassword.continue')}
                        onPress={() => console.log("Continue pressed")}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
