import { View, StyleSheet, TouchableOpacity } from 'react-native';
import PlusIcon from '@/assets/images/icons/plusIcon.svg';
import { useTheme } from '@/context/ThemeContext';

type Props = {
    onPress: () => void;
};

export default function PlusButton({ onPress }: Props) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        addButtonContainer: {
            position: 'absolute',
            right: 16,
            bottom: 100,
            zIndex: 100,
        },
        addButton: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.black100,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    return (
        <View
            style={styles.addButtonContainer}
            pointerEvents="box-none"
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={1}
                style={styles.addButton}
            >
                <PlusIcon fill={theme.colors.white100} />
            </TouchableOpacity>
        </View>
    );
}