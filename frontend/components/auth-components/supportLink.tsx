import { Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { Link, router } from 'expo-router';

type SupportLinkProps = {
    label: string;
    url?: string;       // Внешняя ссылка
    to?: string;        // Внутренняя ссылка (напр. роут в приложении)
    onPress?: () => void;
}

export default function SupportLink({ label, url, to, onPress }: SupportLinkProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        link: {
            ...textStyles.medium,
            color: theme.colors.secondaryText,
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'center',
        },
    });

    const handlePress = async () => {
        if (onPress) {
            onPress();
        } else if (url) {
            const supported = await Linking.canOpenURL(url);

            if (supported) {
                await Linking.openURL(url);
            } else {
                console.error(`Cannot open URL: ${url}`);
            }
        } else if (to) {
            router.push(to as any);
        }
    };


    if (to) {
        return (
            <Link href={to as any} asChild>
                <TouchableOpacity
                    accessibilityRole="link"
                    activeOpacity={0.7}
                >
                    <Text style={styles.link}>
                        {label}
                    </Text>
                </TouchableOpacity>
            </Link>
        );
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            accessibilityRole="link"
            activeOpacity={0.7}
        >
            <Text style={styles.link}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}