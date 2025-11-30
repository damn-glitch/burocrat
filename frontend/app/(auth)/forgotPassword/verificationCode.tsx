import Error from "@/components/common-components/error";
import FormPrimaryButton from "@/components/auth-components/formPrimaryButton";
import OTPInput from "@/components/auth-components/otpInput";
import SupportLink from "@/components/auth-components/supportLink";
import Logo from "@/components/common-components/logo";
import { textStyles } from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function VerificationCode() {
    const theme = useTheme();
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);


    const handleCodeChange = (value: string) => {
        setCode(value);
        if (error) setError(null);
    };

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
        },
        container: {
            paddingHorizontal: 16,
            paddingTop: 40,
            flex: 1,
        },
        verifyContainer: {
            marginTop: 24,
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
        },
        verifyText: {
            ...textStyles.bold,
            color: theme.colors.primaryText,
            fontSize: 24,
            textAlign: 'center',
        },
        verifyTextDescription: {
            ...textStyles.medium,
            color: theme.colors.secondaryText,
            fontSize: 16,
            textAlign: 'center',
        },
        formContainer: {
            marginTop: 14,
            marginBottom: 20,
        },
        formText: {
            ...textStyles.medium,
            color: theme.colors.primaryText,
            fontSize: 16,
            textAlign: 'left',
        },
        textLinkContainer: {
            alignItems: 'center',
            marginBottom: 30,
            marginTop: 12,
        },
    });

    const handleSubmit = () => {
        console.log("Код подтверждения:", code);
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Logo
                    backButton
                />

                <View style={styles.verifyContainer}>

                    <Text style={styles.verifyText}>{t('verificationCode.title')}</Text>


                    <Text style={styles.verifyTextDescription}>{t('verificationCode.description')}</Text>
                </View>

                <Error error={t('verificationCode.error')} hidden />

                <Text style={styles.formText}>
                    {t('verificationCode.inputLabel')}
                </Text>

                <View style={styles.formContainer}>
                    <OTPInput
                        length={4}
                        value={code}
                        onChange={handleCodeChange}
                    />
                </View>

                <View>
                    <FormPrimaryButton label={t('verificationCode.continue')} onPress={handleSubmit} />
                </View>

                <View style={[styles.textLinkContainer]}>
                    <SupportLink label={t('verificationCode.resend')} to="" />
                </View>
            </View>
        </SafeAreaView>
    )
}
