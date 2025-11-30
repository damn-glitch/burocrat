import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import ErrorIcon from '@/assets/images/icons/errorIcon.svg';


type ErrorProps = {
    error: string;
    hidden?: boolean;
};

export default function Error({ error, hidden }: ErrorProps) {
    const theme = useTheme();
    if (hidden || !error) {
        return null;
    }

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.errorbackground,
            padding: 16,
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
        },
        text: {
            ...textStyles.medium,
            color: theme.colors.errorText,
            fontSize: 14,
            fontWeight: '500',
        },
    });

    return (
        <View style={styles.container}>
            <ErrorIcon
                width={20}
                height={20}
                stroke={theme.colors.errorText}
                strokeWidth={0.01}
            />
            <Text style={styles.text}>{error}</Text>
        </View>
    );
}