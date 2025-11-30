import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';

type DividerWithTextProps = {
    text: string;
};

export default function DividerWithText({ text }: DividerWithTextProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 16,
        },
        line: {
            flex: 1,
            height: 1,
            backgroundColor: theme.colors.black10,
        },
        text: {
            ...textStyles.medium,
            marginHorizontal: 12,
            color: theme.colors.black80,
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'center',
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.line} />
            <Text style={styles.text}>{text}</Text>
            <View style={styles.line} />
        </View>
    );
}


