import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ArrowRightIcon from '@/assets/images/icons/arrowRightIcon.svg';
import { textStyles } from "@/constants/typography";
import { useTheme } from '@/context/ThemeContext';
import { Link } from "expo-router";


import type { LinkProps } from 'expo-router';

type ProfileSettingOptionProps = {
    title: string;
    icon: React.ReactNode;
    to: LinkProps['href'];
};

export default function ProfileSettingOption({ title, icon, to }: ProfileSettingOptionProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            height: 56,
            backgroundColor: theme.colors.white100,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        optionContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        iconContainer: {
            marginRight: 12,
        },
        titleText: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
    });

    return (
        <Link href={to} asChild>
            <TouchableOpacity style={styles.container} activeOpacity={0.7}>
                <View style={styles.optionContent}>
                    <View style={styles.iconContainer}>
                        {icon}
                    </View>
                    <Text style={styles.titleText}>{title}</Text>
                </View>
                <ArrowRightIcon width={24} height={16} fill={theme.colors.black60} />
            </TouchableOpacity>
        </Link>
    );
}