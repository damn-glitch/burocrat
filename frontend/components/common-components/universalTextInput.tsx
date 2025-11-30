import SearchIcon from '@/assets/images/icons/searchIcon.svg';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface UniversalTextInputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: object;
    inputStyle?: object;
    labelStyle?: object;
    errorStyle?: object;
    isSearchInput?: boolean;
}

export default function UniversalTextInput({
    label,
    error,
    containerStyle,
    inputStyle,
    labelStyle,
    errorStyle,
    isSearchInput = false, 
    ...textInputProps
}: UniversalTextInputProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'column',
            gap: 8,
        },
        label: {
            ...textStyles.semiBold,
            color: theme.colors.primaryText,
            fontSize: 16,
        },
        input: {
            ...textStyles.medium,
            fontSize: 16,
            padding: 16,
            backgroundColor: theme.colors.gray100,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.black10,
            color: theme.colors.primaryText,
        },
        error: {
            ...textStyles.regular,
            fontSize: 12,
            color: theme.colors.errorText,
            marginTop: 4,
        },
        inputError: {
            borderColor: theme.colors.errorText,
        },
        searchInputContainer: {
            position: 'relative',
        },
        searchIcon: {
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: [{ translateY: -12 }],
            zIndex: 1,
        },
        searchInput: {
            paddingLeft: 44,
        },
    });

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, labelStyle]}>{label}</Text>
            )}
            
            {isSearchInput ? (
                <View style={styles.searchInputContainer}>
                    <SearchIcon 
                        width={24} 
                        height={24} 
                        fill={theme.colors.black60} 
                        style={styles.searchIcon} 
                    />
                    <TextInput
                        style={[
                            styles.input,
                            styles.searchInput,
                            error && styles.inputError,
                            inputStyle,
                        ]}
                        placeholderTextColor={theme.colors.secondaryText}
                        {...textInputProps}
                    />
                </View>
            ) : (
                <TextInput
                    style={[
                        styles.input,
                        error && styles.inputError,
                        inputStyle,
                    ]}
                    placeholderTextColor={theme.colors.secondaryText}
                    {...textInputProps}
                />
            )}
            
            {error && (
                <Text style={[styles.error, errorStyle]}>{error}</Text>
            )}
        </View>
    );
}