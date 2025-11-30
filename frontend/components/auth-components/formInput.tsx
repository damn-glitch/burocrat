import { textStyles } from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import { StyleSheet, TextInput, View, Text } from "react-native";

type InputProps = {
    label: string;
    placeholder: string;
    keyboardType?: "default";
    onChange?: (isValid: boolean) => void;
    value?: string;
    isValid?: boolean;
}

export const FormInput = ({ label, placeholder, keyboardType = "default", onChange }: InputProps) => {
    const theme = useTheme();


    const styles = StyleSheet.create({
        container: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
        },
        label: {
            ...textStyles.medium,
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'left',
            color: theme.colors.primaryText,
        },
        input: {
            ...textStyles.medium,
            borderWidth: 1,
            borderColor: theme.colors.black60,
            borderStyle: 'solid',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'left',
            color: theme.colors.primaryText,
        }
    });


    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                keyboardType={keyboardType}
                placeholderTextColor={theme.colors.secondaryText}
                onChangeText={(text) => {
                    const isValid = text.length > 0;
                    if (onChange) {
                        onChange(isValid);
                    }
                }}
            />
        </View>
    )
}