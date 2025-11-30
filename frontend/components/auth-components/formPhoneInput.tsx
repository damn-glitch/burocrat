import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type PhoneInputProps = {
    label: string;
    placeholder: string;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    onChange?: (isValid: boolean) => void;
    value?: string;
    isValid?: boolean;
    error?: string;
}

export default function FormPhoneInput({ label, placeholder, keyboardType, onChange, error }: PhoneInputProps) {
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
            borderColor: theme.colors.secondaryText,
            borderStyle: 'solid',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'left',
            color: theme.colors.primaryText
        }
    });



    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.secondaryText}
                keyboardType={keyboardType}
            />
        </View>
    );
}