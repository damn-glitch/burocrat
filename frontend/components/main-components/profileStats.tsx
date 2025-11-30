import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View, DimensionValue } from 'react-native';

type TaskData = {
    inProgress: number;
    pending: number;
    waiting: number;
    overdue: number;
};

type Props = {
    data: TaskData;
};

const COLORS = {
    inProgress: '#67ABFE',
    pending: '#F7AC3A',
    waiting: '#5CC575',
    overdue: '#EA4C4D',
};

export default function ProfileStats({ data }: Props) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.white100,
            borderRadius: 8,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        title: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        total: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        barContainer: {
            flexDirection: 'row',
            height: 16,
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 8,
        },
        barSegment: {
            height: '100%',
        },
        legendContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        legendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 4,
            width: '48%',
        },
        colorBox: {
            width: 14,
            height: 14,
            borderRadius: 2,
            marginRight: 6,
        },
        legendText: {
            flex: 1,
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        count: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
    });

    const total =
        (data.inProgress || 0) +
        (data.pending || 0) +
        (data.waiting || 0) +
        (data.overdue || 0);

    const getWidth = (count: number): DimensionValue =>
        total > 0 ? `${(count / total) * 100}%` : '0%';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Задачи</Text>
                <Text style={styles.total}>{total}</Text>
            </View>

            <View style={styles.barContainer}>
                <View
                    style={[styles.barSegment, { backgroundColor: COLORS.inProgress, width: getWidth(data.inProgress || 0) }]}
                />
                <View
                    style={[styles.barSegment, { backgroundColor: COLORS.pending, width: getWidth(data.pending || 0) }]}
                />
                <View
                    style={[styles.barSegment, { backgroundColor: COLORS.waiting, width: getWidth(data.waiting || 0) }]}
                />
                <View
                    style={[styles.barSegment, { backgroundColor: COLORS.overdue, width: getWidth(data.overdue || 0) }]}
                />
            </View>

            {/* Легенда */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.colorBox, { backgroundColor: COLORS.inProgress }]} />
                    <Text style={styles.legendText}>В процессе</Text>
                    <Text style={styles.count}>{data.inProgress || 0}</Text>
                </View>

                <View style={styles.legendItem}>
                    <View style={[styles.colorBox, { backgroundColor: COLORS.pending }]} />
                    <Text style={styles.legendText}>В ожидании</Text>
                    <Text style={styles.count}>{data.pending || 0}</Text>
                </View>

                <View style={styles.legendItem}>
                    <View style={[styles.colorBox, { backgroundColor: COLORS.waiting }]} />
                    <Text style={styles.legendText}>В ожидании</Text>
                    <Text style={styles.count}>{data.waiting || 0}</Text>
                </View>

                <View style={styles.legendItem}>
                    <View style={[styles.colorBox, { backgroundColor: COLORS.overdue }]} />
                    <Text style={styles.legendText}>Просрочено</Text>
                    <Text style={styles.count}>{data.overdue || 0}</Text>
                </View>
            </View>
        </View>
    );
}
