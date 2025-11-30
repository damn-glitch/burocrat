import FormPasswordInput from "@/components/auth-components/formPassword";
import FormPrimaryButton from "@/components/auth-components/formPrimaryButton";
import SupportText from "@/components/auth-components/supportText";
import Logo from "@/components/common-components/logo";
import {useState} from "react";
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useApi} from "@/api";
import {storage} from "@/storage";
import {router} from "expo-router";

export default function CreatePassword() {
    const [password, setPassword] = useState("");
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const {t} = useTranslation();

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
    const {data, loading, error, execute, reset} = useApi();
    return (
        <SafeAreaView style={ styles.safeArea }>
            <View style={ styles.container }>
                <View style={ styles.content }>
                    <Logo
                        backButton
                    />

                    <SupportText
                        mainText={ t('registerCreatePassword.title') }
                        secondaryText={ t('registerCreatePassword.description') }
                    />

                    <View style={ styles.formContainer }>
                        <FormPasswordInput
                            label={ t('registerCreatePassword.label') }
                            placeholder={ t('registerCreatePassword.placeholder') }
                            showStrengthIndicator
                            hidden={ true }
                            onChangePassword={ handlePasswordChange }
                        />
                    </View>
                </View>

                <View style={ styles.buttonContainer }>
                    <FormPrimaryButton
                        label={ t('registerCreatePassword.continueButton') }
                        onPress={ () => {
                            const email = storage.getString('registrationEmail') || '';
                            execute({
                                method: 'POST',
                                url: '/auth/register',
                                data: {
                                    firstname: "Big Black",
                                    lastname: "Nigga",
                                    phone: "+1234567890",
                                    email, password,
                                },
                            }).then((response) => {
                                const authData = data;

                                // Токены
                                storage.set('access_token', authData.access_token);
                                storage.set('refresh_token', authData.refresh_token);

                                // Данные пользователя - каждое поле отдельно
                                storage.set('user_id', authData.user.id);
                                storage.set('user_email', authData.user.email);
                                storage.set('user_phone', authData.user.phone);
                                storage.set('user_username', authData.user.username);
                                storage.set('user_is_active', authData.user.is_active);

                                router.navigate('/main');
                            }).catch((err) => {
                                console.log(error)
                            });
                            console.log("Form submitted with email:", email);
                            console.log("Password:", password);
                        } }
                        disabled={ !isPasswordValid }
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}