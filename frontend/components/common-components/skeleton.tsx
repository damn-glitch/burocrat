import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';


import type { ViewStyle, StyleProp, DimensionValue } from 'react-native';

type SkeletonProps = {
    width?: DimensionValue;
    height?: number;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
};

export default function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        skeleton: {
            backgroundColor: theme.colors.skeleton,
            opacity: 0.6,
        },
    });


    return (
        <View style={[styles.skeleton, { width, height, borderRadius }, style]} />
    );
}

