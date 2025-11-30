import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type EmailInputProps = {
    label: string;
    placeholder: string;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    onChange?: (value: string, isValid: boolean) => void;
    value?: string;
    isValid?: boolean;
    error?: string;
}

export default function FormEmailInput({ label, placeholder, keyboardType, onChange, error, value }: EmailInputProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            display: 'flex',
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
            borderColor: theme.colors.black60,
            borderStyle: 'solid',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'left',
            color: theme.colors.primaryText,
        },
        errorText: {
            ...textStyles.medium,
            color: theme.colors.errorText,
            fontSize: 12,
            marginTop: 4,
        }
    });

    const handleChange = (text: string) => {
        if (onChange) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValid = emailRegex.test(text);
            onChange(text, isValid);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.secondaryText}
                keyboardType={keyboardType || "email-address"}
                value={value}
                onChangeText={handleChange}
                autoCapitalize="none"
                autoCorrect={false}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}