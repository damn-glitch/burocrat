import EditIcon from '@/assets/images/icons/editIcon.svg';
import MoveIcon from '@/assets/images/icons/moveIcon.svg';
import ShareIcon from '@/assets/images/icons/shareIcon.svg';
import TrashIcon from '@/assets/images/icons/trashIcon.svg';
import { textStyles } from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    GestureResponderEvent,
    LayoutRectangle,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Option = {
    label: string;
    onPress: (event: GestureResponderEvent) => void;
    destructive?: boolean; 
    icon?:  'edit' | 'delete' | 'move' | 'restore' | 'share';
};

type ActionSheetProps = {
    visible: boolean;
    onClose: () => void;
    options: Option[];
    anchorPosition?: { x: number, y: number };
    triggerRef?:
        | React.RefObject<View>
        | React.RefObject<View | null>
        | React.MutableRefObject<View | null>;
}

export default function ActionSheet({
    visible,
    onClose,
    options,
    anchorPosition,
    triggerRef,
}: ActionSheetProps) {
    const theme = useTheme();
    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);
    const [triggerRect, setTriggerRect] = useState<LayoutRectangle | null>(null);

    useEffect(() => {
        if (visible && triggerRef?.current) {
            triggerRef.current.measureInWindow((x, y, width, height) => {
                setTriggerRect({ x, y, width, height });
                calculatePosition({ x, y, width, height });
            });
        }
    }, [visible, triggerRef]);

    const calculatePosition = (rect: LayoutRectangle) => {
        const screenWidth = Dimensions.get('window').width;
        const screenHeight = Dimensions.get('window').height;
        
        const menuWidth = 260;
        const menuHeight = options.length * 60;
        
        let left = rect.x + rect.width - 20;
        if (left + menuWidth > screenWidth) {
            left = Math.max(10, rect.x - menuWidth + 20);
        }
        
        let top = rect.y - (menuHeight / 2) + (rect.height / 2);
        
        if (top < 10) {
            top = 10;
        }
        
        if (top + menuHeight > screenHeight - 10) {
            top = screenHeight - menuHeight - 10;
        }
        
        setMenuPosition({ top, left });
    };

    const getIcon = (iconName?: 'share' | 'edit' | 'delete' | 'move' | 'restore') => {
        switch (iconName) {
            case 'share':
                return <ShareIcon width={24} height={24} stroke={theme.colors.black100} />;
            case 'edit':
                return <EditIcon width={24} height={24} stroke={theme.colors.black100} />;
            case 'delete':
                return <TrashIcon width={24} height={24} fill={theme.colors.errorIcon} />;
            case 'move':
                return <MoveIcon width={24} height={24} stroke={theme.colors.black100} />;
            case 'restore':
                return <EditIcon width={24} height={24} stroke={theme.colors.black100} />;
            default:
                return null;
        }
    };

    const styles = StyleSheet.create({
        backdrop: {
            flex: 1,
            backgroundColor: theme.colors.black20,
        },
        menu: {
            position: 'absolute',
            backgroundColor: theme.colors.white100,
            borderRadius: 8,
            padding: 0,
            shadowColor: theme.colors.black100,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
            overflow: 'hidden',
            width: 260,
        },
        option: {
            flexDirection: 'row',
            alignItems: "center",
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.colors.black60,
        },
        optionText: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.primaryText,
            marginLeft: 12,
        },
        destructiveText: {
            color: theme.colors.errorIcon,
        },
    });

    if (!menuPosition) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
                <View style={[styles.menu, { top: menuPosition.top, left: menuPosition.left }]}>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.option,
                                index === options.length - 1 && { borderBottomWidth: 0 }
                            ]}
                            onPress={(e) => {
                                option.onPress(e);
                                onClose();
                            }}
                            activeOpacity={0.7}
                        >
                            {getIcon(option.icon)}
                            <Text
                                style={[
                                    styles.optionText,
                                    option.destructive && styles.destructiveText,
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

