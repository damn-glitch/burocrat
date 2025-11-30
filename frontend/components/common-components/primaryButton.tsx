import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';

type PrimaryButtonProps = {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

export default function PrimaryButton({ label, onPress, loading, disabled, icon, iconPosition = "left" }: PrimaryButtonProps) {
    const theme = useTheme();
    const styles = StyleSheet.create({
        button: {
            backgroundColor: theme.colors.black100,
            height: 48,
            width: '100%',
            borderRadius: 32,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: icon ? 8 : 0,
        },
        text: {
            ...textStyles.medium,
            color: theme.colors.white100,
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