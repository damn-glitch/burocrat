import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type OTPInputProps = {
    length: number;
    value: string;
    onChange: (value: string) => void;
};

export default function OTPInput({ length, value, onChange }: OTPInputProps) {
    const theme = useTheme();
    const [otpValues, setOtpValues] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        const valueArray = value.split('').slice(0, length);
        const newValues = [...Array(length).fill('')]
            .map((_, index) => valueArray[index] || '');

        setOtpValues(newValues);
    }, [value, length]);

    const handleChange = (text: string, index: number) => {
        const newValues = [...otpValues];

        if (text.length > 1) {
            const pastedValues = text.split('').slice(0, length - index);

            for (let i = 0; i < pastedValues.length; i++) {
                if (index + i < length) {
                    newValues[index + i] = pastedValues[i];
                }
            }

            setOtpValues(newValues);
            onChange(newValues.join(''));

            const targetIndex = Math.min(index + pastedValues.length, length - 1);
            inputRefs.current[targetIndex]?.focus();
            return;
        }

        newValues[index] = text;
        setOtpValues(newValues);
        onChange(newValues.join(''));

        if (text && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otpValues[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            gap: 8,
        },
        input: {
            width: 56,
            height: 64,
            borderWidth: 2,
            borderRadius: 16,
            fontSize: 24,
            textAlign: 'center',
            borderColor: theme.colors.black60,
            color: theme.colors.primaryText,
        }
    });

    return (
        <View style={styles.container}>
            {Array(length)
                .fill(0)
                .map((_, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => { inputRefs.current[index] = ref; }}
                        style={[
                            styles.input
                        ]}
                        value={otpValues[index]}
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="numeric"
                        maxLength={1}
                        selectTextOnFocus
                        autoFocus={index === 0}
                    />
                ))}
        </View>
    );
}