import EyeIcon from '@/assets/images/icons/eye.svg';
import EyeOffIcon from '@/assets/images/icons/eyeOff.svg';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type PasswordStrength = 'очень слабый' | 'слабый' | 'средний' | 'надежный';

type PasswordRequirement = {
    id: string;
    label: string;
    regex: RegExp;
    isMet: boolean;
};

type PasswordInputProps = {
    label: string;
    placeholder: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    hidden?: boolean;
    onChangePassword?: (password: string, isValid: boolean) => void;
    error?: string;
    showStrengthIndicator?: boolean;
};

export default function FormPasswordInput({
    label,
    placeholder,
    keyboardType,
    hidden,
    error,
    onChangePassword,
    showStrengthIndicator = false,
}: PasswordInputProps) {
    const requirementsCountNeededForValidPassword = 1;
    const theme = useTheme();

    const [isPasswordVisible, setIsPasswordVisible] = useState(!hidden);
    const [password, setPassword] = useState('');
    const [hasText, setHasText] = useState(false);
    const [cyrillicSpaceError, setCyrillicSpaceError] = useState<string | null>(null);

    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('очень слабый');
    const [requirements, setRequirements] = useState<PasswordRequirement[]>([
        { id: 'length', label: 'Не менее 8 символов', regex: /.{8,}/, isMet: false },
        { id: 'uppercase', label: 'Хотя бы одну заглавную букву', regex: /[A-ZА-Я]/, isMet: false },
        { id: 'lowercase', label: 'Хотя бы одну строчную букву', regex: /[a-zа-я]/, isMet: false },
        { id: 'digit', label: 'Хотя бы одну цифру', regex: /[0-9]/, isMet: false },
        { id: 'special', label: 'Хотя бы один специальный символ (@#$%^&*)', regex: /[!@#$%^&*(),.?":{}|<>]/, isMet: false },
    ]);

    const animatedStrength = useRef(new Animated.Value(0)).current;

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 'надежный':
                return theme.colors.successText;
            case 'средний':
                return theme.colors.warningText;
            case 'слабый':
                return theme.colors.orangeWarningText;
            case 'очень слабый':
                return theme.colors.errorText;
            default:
                return theme.colors.secondaryText;
        }
    };

    useEffect(() => {
        const hasCyrillic = /[а-яА-ЯёЁ]/.test(password);
        const hasSpaces = /\s/.test(password);

        if (password) {
            if (hasCyrillic && hasSpaces) {
                setCyrillicSpaceError('Пароль не должен содержать кириллицу и пробелы');
            } else if (hasCyrillic) {
                setCyrillicSpaceError('Пароль не должен содержать кириллицу');
            } else if (hasSpaces) {
                setCyrillicSpaceError('Пароль не должен содержать пробелы');
            } else {
                setCyrillicSpaceError(null);
            }
        } else {
            setCyrillicSpaceError(null);
        }

        setRequirements((currentRequirements) => {
            const updatedRequirements = currentRequirements.map((req) => ({
                ...req,
                isMet: req.regex.test(password),
            }));

            const metRequirementsCount = updatedRequirements.filter((req) => req.isMet).length;

            if (metRequirementsCount === 5) {
                setPasswordStrength('надежный');
            } else if (metRequirementsCount >= 3) {
                setPasswordStrength('средний');
            } else if (metRequirementsCount >= 2) {
                setPasswordStrength('слабый');
            } else {
                setPasswordStrength('очень слабый');
            }

            return updatedRequirements;
        });
    }, [password]);

    useEffect(() => {
        const hasCyrillic = /[а-яА-ЯёЁ]/.test(password);
        const hasSpaces = /\s/.test(password);

        const metRequirementsCount = requirements.filter((r) => r.isMet).length;

        const isValid =
            metRequirementsCount >= requirementsCountNeededForValidPassword &&
            !hasCyrillic &&
            !hasSpaces;

        if (onChangePassword) {
            onChangePassword(password, isValid);
        }
    }, [requirements, password, onChangePassword]);

    useEffect(() => {
        let toValue = 0;

        switch (passwordStrength) {
            case 'очень слабый':
                toValue = 0.25;
                break;
            case 'слабый':
                toValue = 0.5;
                break;
            case 'средний':
                toValue = 0.75;
                break;
            case 'надежный':
                toValue = 1;
                break;
        }

        Animated.timing(animatedStrength, {
            toValue,
            duration: 100,
            useNativeDriver: false,
        }).start();
    }, [passwordStrength]);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        setHasText(text.length > 0);
    };

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            flexDirection: 'column',
            gap: 8,
        },
        label: {
            ...textStyles.medium,
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'left',
            color: theme.colors.primaryText,
        },
        input: {
            ...textStyles.medium,
            borderWidth: 1,
            borderColor: theme.colors.secondaryText,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            fontWeight: '500',
            paddingRight: 48,
            color: theme.colors.primaryText,
        },
        inputContainer: {
            position: 'relative',
            width: '100%',
        },
        iconContainer: {
            position: 'absolute',
            right: 16,
            height: '100%',
            justifyContent: 'center',
        },
        errorContainer: {
            marginTop: 4,
        },
        errorText: {
            color: theme.colors.errorText,
            ...textStyles.medium,
            fontSize: 14,
            textAlign: 'left',
        },
        strengthLabel: {
            fontSize: 14,
            color: theme.colors.secondaryText,
        },
        strengthTextContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
        },
        strengthBarContainer: {
            height: 10,
            backgroundColor: theme.colors.black10,
            borderRadius: 16,
            overflow: 'hidden',
        },
        strengthBar: {
            height: '100%',
            borderRadius: 16,
        },
        strengthText: {
            fontSize: 14,
            textAlign: 'right',
            marginTop: 4,
            fontWeight: '500',
        },
        requirementsContainer: {
            marginTop: 8,
        },
        requirementItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        requirementText: {
            fontSize: 14,
            color: theme.colors.secondaryText,
            marginLeft: 8,
        },
        iconSuccess: {
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: theme.colors.successText,
            alignItems: 'center',
            justifyContent: 'center',
        },
        iconError: {
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: theme.colors.errorText,
            alignItems: 'center',
            justifyContent: 'center',
        },
        iconSuccessInner: {
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        iconErrorInner: {
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        requirementslabel: {
            fontSize: 14,
            color: theme.colors.secondaryText,
            marginBottom: 4,
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholderTextColor={theme.colors.secondaryText}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    secureTextEntry={!isPasswordVisible}
                    onChangeText={handlePasswordChange}
                />

                {hasText && (
                    <TouchableOpacity
                        style={styles.iconContainer}
                        onPress={togglePasswordVisibility}
                        activeOpacity={0.7}
                    >
                        {isPasswordVisible ? (
                            <EyeOffIcon width={24} height={24} stroke={theme.colors.primaryText} strokeWidth={1} />
                        ) : (
                            <EyeIcon width={24} height={24} stroke={theme.colors.primaryText} strokeWidth={0.01} />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.errorContainer}>
                {cyrillicSpaceError && <Text style={styles.errorText}>{cyrillicSpaceError}</Text>}
                {!cyrillicSpaceError && error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {showStrengthIndicator && hasText && (
                <>
                    <View>
                        <View style={styles.strengthTextContainer}>
                            <Text style={styles.strengthLabel}>Надежность пароля</Text>
                            <Text style={styles.strengthText}>
                                {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                            </Text>
                        </View>

                        <View style={styles.strengthBarContainer}>
                            <Animated.View
                                style={[
                                    styles.strengthBar,
                                    {
                                        width: animatedStrength.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0%', '100%'],
                                        }),
                                        backgroundColor: getStrengthColor(),
                                    },
                                ]}
                            />
                        </View>
                    </View>

                    <View style={styles.requirementsContainer}>
                        <Text style={styles.requirementslabel}>Пароль должен содержать:</Text>
                        {requirements.map((req) => (
                            <View key={req.id} style={styles.requirementItem}>
                                {req.isMet ? (
                                    <View style={styles.iconSuccess}>
                                        <Text style={styles.iconSuccessInner}>✓</Text>
                                    </View>
                                ) : (
                                    <View style={styles.iconError}>
                                        <Text style={styles.iconErrorInner}>!</Text>
                                    </View>
                                )}
                                <Text style={styles.requirementText}>{req.label}</Text>
                            </View>
                        ))}
                    </View>
                </>
            )}
        </View>
    );
}
