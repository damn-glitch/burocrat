import FormPasswordInput from "@/components/auth-components/formPassword";
import FormPrimaryButton from "@/components/auth-components/formPrimaryButton";
import SupportText from "@/components/auth-components/supportText";
import Logo from "@/components/common-components/logo";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreatePassword() {
    const [password, setPassword] = useState("");
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const { t } = useTranslation();

    const handlePasswordChange = (value: string, isValid: boolean) => {
        setPassword(value);
        setIsPasswordValid(isValid);
    };

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
        },
        container: {
            paddingHorizontal: 16,
            paddingTop: 40,
            paddingBottom: 24,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
        },
        content: {
            flex: 1,
        },
        formContainer: {
            marginTop: 24,
        },
        buttonContainer: {
            marginTop: 'auto',
            paddingVertical: 16,
        }
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Logo
                        backButton
                    />

                    <SupportText
                        mainText={t('createNewPassword.title')}
                        secondaryText={t('createNewPassword.description')}
                    />

                    <View style={styles.formContainer}>
                        <FormPasswordInput
                            label={t('createNewPassword.label')}
                            placeholder={t('createNewPassword.placeholder')}
                            showStrengthIndicator
                            hidden={true}
                            onChangePassword={handlePasswordChange}
                        />
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <FormPrimaryButton
                        label={t('createNewPassword.saveButton')}
                        onPress={() => {
                            console.log("Password:", password);
                        }}
                        disabled={!isPasswordValid}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}