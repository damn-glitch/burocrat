import ArrowDownIcon from '@/assets/images/icons/arrowDownIcon.svg';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    DimensionValue,
    Easing,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

type DropdownProps = {
    value: string | null;
    items: {
        id: number;
        name: string;
        code: string;
        description?: string;
    }[];
    onChange: (v: string) => void;
    width?: DimensionValue;
    buttonStyle?: object;
    buttonTextStyle?: object;
    arrowStyle?: object;
    arrowWidth?: number;
    arrowHeight?: number;
    renderButtonContent?: () => React.ReactNode;
    placeholder?: string;
};

export default function Dropdown({
    value,
    items = [],
    onChange,
    width = 130,
    buttonStyle,
    buttonTextStyle,
    arrowStyle,
    arrowWidth = 20,
    arrowHeight = 20,
    renderButtonContent,
    placeholder = 'Выберите',
}: DropdownProps) {
    const theme = useTheme();
    const { width: screenW, height: screenH } = useWindowDimensions();

    const anchorRef = useRef<View>(null);
    const [open, setOpen] = useState(false);
    const [anchor, setAnchor] = useState<{ x: number; y: number; w: number; h: number }>({
        x: 0,
        y: 0,
        w: typeof width === 'number' ? width : 130,
        h: 0,
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const itemHeight = 40;
    const maxHeight = 200;

    const dropdownHeight = useMemo(() => {
        const wanted = items.length * itemHeight;
        return Math.min(wanted, maxHeight);
    }, [items.length]);

    const computePlacement = useMemo(() => {
        const margin = 8;
        const spaceBelow = screenH - (anchor.y + anchor.h);
        const openUp = spaceBelow < dropdownHeight + margin;

        const top = openUp ? Math.max(8, anchor.y - dropdownHeight - margin) : anchor.y + anchor.h + margin;
        const left = Math.min(anchor.x, Math.max(0, screenW - anchor.w - 8));

        return { top, left, openUp };
    }, [anchor, dropdownHeight, screenH, screenW]);

    const measureAnchor = useCallback(() => {
        anchorRef.current?.measureInWindow?.((x: number, y: number, w: number, h: number) => {
            setAnchor({ x, y, w: Math.max(w, typeof width === 'number' ? width : 130), h });
        });
    }, [width]);

    useEffect(() => {
        if (open) {
            const id = setTimeout(measureAnchor, 0);
            return () => clearTimeout(id);
        }
    }, [open, measureAnchor]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: open ? 1 : 0,
            duration: 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [open]);

    const styles = StyleSheet.create({
        root: { width },
        button: {
            minHeight: 32,
            borderRadius: 8,
            backgroundColor: theme.colors.gray100,
            paddingHorizontal: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        buttonText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        modalBackdrop: {
            flex: 1,
            backgroundColor: 'transparent',
        },
        dropdown: {
            position: 'absolute',
            width: anchor.w || width,
            maxHeight,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.black10,
            backgroundColor: theme.colors.white100,
            shadowColor: theme.colors.black100,
            shadowOpacity: 0.15,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
            overflow: 'hidden',
        },
        item: {
            height: itemHeight,
            paddingHorizontal: 12,
            justifyContent: 'center',
        },
        itemText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        separator: {
            height: 1,
            backgroundColor: theme.colors.black10,
            opacity: 0.5,
        },
        placeholder: { opacity: 0.6 },
        arrow: { marginLeft: 8 },
    });

    return (
        <View ref={anchorRef} collapsable={false} style={styles.root}>
            <Pressable
                onPress={() => setOpen(prev => !prev)} // меняем на toggle
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, styles.button, buttonStyle]}
            >
                {renderButtonContent ? (
                    renderButtonContent()
                ) : (
                    <Text style={[styles.buttonText, !value && styles.placeholder, buttonTextStyle]} numberOfLines={1}>
                        {items.find(it => it.code === value)?.name || placeholder}
                    </Text>
                )}
                <ArrowDownIcon
                    width={arrowWidth}
                    height={arrowHeight}
                    fill={theme.colors.black100}
                    style={arrowStyle}
                    rotation={open ? 180 : 0}
                />
            </Pressable>

            <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
                <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)}>
                    <View style={styles.modalBackdrop} />
                </Pressable>

                <Animated.View
                    pointerEvents="box-none"
                    style={[
                        styles.dropdown,
                        {
                            top: computePlacement.top,
                            left: computePlacement.left,
                            height: dropdownHeight,
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {items.map((it, idx) => (
                            <View key={it.code}>
                                <Pressable
                                    onPress={() => {
                                        onChange(it.code);
                                        setOpen(false);
                                    }}
                                    style={({ pressed }) => [
                                        { backgroundColor: pressed ? theme.colors.gray100 : 'transparent' },
                                        styles.item,
                                    ]}
                                >
                                    <Text style={styles.itemText}>{it.name}</Text>
                                </Pressable>
                                {idx < items.length - 1 && <View style={styles.separator} />}
                            </View>
                        ))}
                    </ScrollView>
                </Animated.View>
            </Modal>
        </View>
    );
}
