import FormAvatarInput from '@/components/auth-components/formAvatarInput';
import { FormInput } from "@/components/auth-components/formInput";
import FormPrimaryButton from "@/components/auth-components/formPrimaryButton";
import SupportText from "@/components/auth-components/supportText";
import Logo from "@/components/common-components/logo";
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserData() {
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
        formContainer: {
            gap: 12,
            marginBottom: 20,
        },
        avaterContainer: {
            marginBottom: 4,
        },
    })
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Logo
                    backButton
                />

                <SupportText mainText={t('userData.title')} />

                <View style={styles.avaterContainer}>
                    <FormAvatarInput />
                </View>

                <View style={styles.formContainer}>
                    <FormInput
                        label={t('userData.firstNameLabel')}
                        placeholder={t('userData.firstNamePlaceholder')}
                        keyboardType="default"
                    />

                    <FormInput
                        label={t('userData.lastNameLabel')}
                        placeholder={t('userData.lastNamePlaceholder')}
                        keyboardType="default"
                    />
                </View>
                <View>
                    <FormPrimaryButton
                        label={t('userData.registerButton')}
                        onPress={() => { }}
                    />
                </View>

            </View>
        </SafeAreaView>
    )
}