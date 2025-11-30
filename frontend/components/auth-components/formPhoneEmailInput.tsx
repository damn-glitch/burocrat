import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type PhoneEmailInputProps = {
    label: string;
    placeholder: string;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    onChange?: (phone: string, isValid: boolean, inputType: 'email' | 'phone' | 'unknown') => void;
    value?: string;
    isValid?: boolean;
    inputType?: 'email' | 'phone' | 'unknown';
    error?: string;
}

export default function FormPhoneEmailInput({ label, placeholder, keyboardType, onChange, error }: PhoneEmailInputProps) {
    const theme = useTheme();

    const [inputValue, setInputValue] = useState('');
    const [inputType, setInputType] = useState<'email' | 'phone' | 'unknown'>('unknown');

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

    const validateInput = (text: string) => {
        if (text.includes('@')) {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
            setInputType('email');
            return isValid;
        } else {
            const isValid = /^\+?\d{10,15}$/.test(text.replace(/\D/g, ''));
            setInputType('phone');
            return isValid;
        }
    };

    useEffect(() => {
        if (onChange) {
            const isValid = inputValue ? validateInput(inputValue) : false;
            onChange(inputValue, isValid, inputType);
        }
    }, [inputType, inputValue, onChange]);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.secondaryText}
                keyboardType={keyboardType}
                onChangeText={(text) => setInputValue(text)}
            />
        </View>
    );
}