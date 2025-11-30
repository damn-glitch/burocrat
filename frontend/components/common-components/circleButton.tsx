import { useTheme } from "@/context/ThemeContext";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Link } from "expo-router";
import React from "react";


type CircleButtonProps = {
    svg: React.ComponentType<{
        width?: number;
        height?: number;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
    }>;
    size?: number;
    iconSize?: number;
    iconStrokeColor?: string;
    iconFillColor?: string;
    strokeWidth?: number;
    badgeCount?: number;
    to?: string;
    onPress?: () => void;
    disabled?: boolean;
};

export default function CircleButton({ svg, size = 48, iconSize, iconStrokeColor, iconFillColor, badgeCount = 0, strokeWidth, to, onPress, disabled }: CircleButtonProps) {
    const theme = useTheme();
    const SvgIcon = svg;

    const styles = StyleSheet.create({
        container: {
            width: size,
            height: size,
            borderRadius: 100,
            backgroundColor: theme.colors.white100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },

        badge: {
            position: 'absolute',
            top: 0,
            right: 0,
            minWidth: size * 0.35,
            height: size * 0.35,
            borderRadius: size * 0.175,
            backgroundColor: theme.colors.orangeWarningText,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
        },
        badgeText: {
            color: 'white',
            fontSize: size * 0.2,
            fontWeight: 'bold',
        }
    });

    const content = (
        <View style={styles.container}>
            <SvgIcon
                width={iconSize}
                height={iconSize}
                fill={iconFillColor || theme.colors.black80}
                stroke={iconStrokeColor || theme.colors.black80}
                strokeWidth={strokeWidth || 2}
            />

            {badgeCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {badgeCount > 99 ? '99+' : badgeCount}
                    </Text>
                </View>
            )}
        </View>
    );

    if (to && !disabled) {
        return <Link href={to as any}>{content}</Link>;
    }

    if (onPress && !disabled) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
}