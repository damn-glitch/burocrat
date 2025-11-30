
import { textStyles } from '@/constants/typography';
import { useTheme } from "@/context/ThemeContext";
import { Link } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type SectionHeaderProps = {
    title?: string;
    linkText?: string;
    to: string;
}

export default function SectionHeader({ title, linkText, to }: SectionHeaderProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        title: {
            ...textStyles.medium,
            color: theme.colors.primaryText,
            fontSize: 20,
            fontWeight: '500',
        },
        link: {
            ...textStyles.medium,
            color: theme.colors.secondaryText,
            fontSize: 14,
            fontWeight: '500',
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity>
                <Link href={to as any} style={styles.link}>{linkText}</Link>
            </TouchableOpacity>
        </View>
    );
};



