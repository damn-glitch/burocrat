import { textStyles } from "@/constants/typography";
import { useTheme } from '@/context/ThemeContext';
import { StyleSheet, View, Text } from "react-native";


type SupportTextProps = {
    mainText?: string;
    secondaryText?: string;
}

export default function SupportText({mainText, secondaryText}: SupportTextProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            marginTop: 24,
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
        },
        title: {
            ...textStyles.bold,
            color: theme.colors.primaryText,
            fontSize: 24,
            textAlign: 'center',
        },
        desc: {
            ...textStyles.medium,
            color: theme.colors.secondaryText,
            fontSize: 16,
            textAlign: 'center',
            letterSpacing: -0.1
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{mainText}</Text>
            <Text style={styles.desc}>{secondaryText}</Text>
        </View>
    );
}