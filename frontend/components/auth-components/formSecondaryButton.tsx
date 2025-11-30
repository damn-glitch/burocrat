import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';

type FormSecondaryButtonProps = {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

export default function FormSecondaryButton({ label, onPress, loading, disabled, icon, iconPosition = "left" }: FormSecondaryButtonProps) {
    const theme = useTheme();
    const styles = StyleSheet.create({
        button: {
            backgroundColor: theme.colors.background,
            height: 48,
            width: '100%',
            borderRadius: 32,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: icon ? 8 : 0,
            borderWidth: 2,
            borderColor: theme.colors.black100,
            borderStyle: 'solid',
        },
        text: {
            ...textStyles.medium,
            color: theme.colors.primaryText,
            fontSize: 16,
            fontWeight: '500',
        },
    });

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading || disabled}
            activeOpacity={0.7}
            style={[styles.button, { opacity: loading || disabled ? 0.5 : 1 }]}
        >
            {icon && iconPosition === 'left' && icon}
            <Text style={styles.text}>
                {loading ? 'Загрузка...' : label}
            </Text>
            {icon && iconPosition === 'right' && icon}
        </TouchableOpacity>
    )

}