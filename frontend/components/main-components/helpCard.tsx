import { textStyles } from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type HelpCardProps = {
    icon: React.ComponentType<{
        width?: number;
        height?: number;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
    }>;
    title?: string;
    description?: string;
    iconSize?: number;
    iconStrokeColor?: string;
    iconFillColor?: string;
    strokeWidth?: number;
    style?: object; 
    to?: string;
};

export default function HelpCard({
    icon: Icon,
    title,
    description,
    iconSize = 32,
    iconStrokeColor,
    iconFillColor,
    strokeWidth,
    style = {},
    to
}: HelpCardProps) {
    const theme = useTheme();
    const router = useRouter();

    const styles = StyleSheet.create({
        container: {
            paddingHorizontal: 13,
            paddingVertical: 23,
            backgroundColor: theme.colors.white100,
            borderRadius: 16,
            height: 121,
            flex: 1,
        },
        iconContainer: {
            marginBottom: 8,
        },
        title: {
            ...textStyles.semiBold,
            fontSize: 14,
            color: theme.colors.primaryText,
            marginBottom: 4,
        },
        description: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.secondaryText,
        },
    });

    const handlePress = () => {
        if (to) {
            router.push(to as any);
        }
    };

    return (
        <TouchableOpacity 
            style={[styles.container, style]}
            onPress={handlePress}
            activeOpacity={to ? 0.8 : 1}
        >
            <View style={styles.iconContainer}>
                <Icon
                    width={iconSize}
                    height={iconSize}
                    fill={iconFillColor}
                    stroke={iconStrokeColor}
                    strokeWidth={strokeWidth || 2}
                />
            </View>

            {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
            {description && <Text style={styles.description} numberOfLines={2}>{description}</Text>}
        </TouchableOpacity>
    );
}

