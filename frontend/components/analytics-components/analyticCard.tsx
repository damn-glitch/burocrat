import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { StyleSheet, Text, View } from 'react-native';

type AnalyticCardProps = {
    icon: React.ComponentType<{
        width?: number;
        height?: number;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
    }>;

    title: string;
    iconSize?: number;
    iconStrokeColor?: string;
    iconFillColor?: string;
    strokeWidth?: number;
    style?: object;
    value: number | string;
    trend?: string; 
    trendUp?: boolean;
};

export default function AnalyticCard({ 
    icon: Icon,
    title,
    iconSize = 32,
    iconStrokeColor,
    iconFillColor,
    strokeWidth,
    style,
    value = 0,
    trend,
    trendUp
}: AnalyticCardProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.white100,
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 23,
        },
        iconContainer: {
            marginBottom: 8,
        },
        value: {
            ...textStyles.semiBold,
            fontSize: 20,
            color: theme.colors.primaryText,
            marginBottom: 2,
            paddingHorizontal: 2,
        },
        title: {
            ...textStyles.medium,
            fontSize: 13,
            color: theme.colors.black60,
            paddingHorizontal: 2,
        },
        trendContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
        },
        trendText: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.successText,
        },
        trendDownText: {
            color: theme.colors.errorText, 
        },
        trendIndicator: {
            width: 0,
            height: 0,
            borderLeftWidth: 4,
            borderRightWidth: 4,
            borderBottomWidth: 6,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: theme.colors.successText,
            marginRight: 3,
        },
        trendDownIndicator: {
            transform: [{ rotate: '180deg' }],
            borderBottomColor: theme.colors.errorText,
        }
    });

    return (
        <View style={[styles.container, style]}>
            <View style={styles.iconContainer}>
                <Icon
                    width={iconSize}
                    height={iconSize}
                    fill={iconFillColor}
                    stroke={iconStrokeColor}
                    strokeWidth={strokeWidth || 2}
                />
            </View>

            <Text style={styles.value} numberOfLines={1}>{value}</Text>

            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            
            {/* Отображаем информацию о тренде, если она предоставлена */}
            {trend && (
                <View style={styles.trendContainer}>
                    {/* Отображаем индикатор направления тренда (стрелка) */}
                    <View style={[
                        styles.trendIndicator, 
                        !trendUp && styles.trendDownIndicator
                    ]} />
                    
                    {/* Отображаем текст тренда */}
                    <Text style={[
                        styles.trendText, 
                        !trendUp && styles.trendDownText
                    ]}>
                        {trend}
                    </Text>
                </View>
            )}
        </View>
    );
}