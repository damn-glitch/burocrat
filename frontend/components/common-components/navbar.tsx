import { textStyles } from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const TAB_HEIGHT = 32;

interface TabsNavBarProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function Navbar({ tabs, activeTab, onTabChange }: TabsNavBarProps) {
    const theme = useTheme();

    const [tabsLayout, setTabsLayout] = useState<
        Record<string, { x: number; width: number }>
    >({});

    const activeLayout = tabsLayout[activeTab];

    const styles = StyleSheet.create({
        wrapper: {
            marginTop: 24,
            marginHorizontal: -16,
        },
        row: {
            flexDirection: "row",
            position: "relative",
        },
        tabButton: {
            paddingHorizontal: 16,
            height: TAB_HEIGHT,
            justifyContent: "center",
            alignItems: "center",
        },
        tabText: {
            ...textStyles.semiBold,
            color: theme.colors.black60,
        },
        activeText: {
            color: theme.colors.black100,
        },
        indicator: {
            position: "absolute",
            top: 0,
            height: TAB_HEIGHT,
            borderRadius: 30,
            backgroundColor: theme.colors.white100,
        },
    });

    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 8, gap: 8 }}
            >
                <View style={styles.row}>
                    {activeLayout && (
                        <View
                            style={[
                                styles.indicator,
                                {
                                    left: activeLayout.x,
                                    width: activeLayout.width,
                                },
                            ]}
                        />
                    )}

                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={styles.tabButton}
                            onPress={() => onTabChange(tab)}
                            onLayout={(e) => {
                                const { x, width } = e.nativeEvent.layout;
                                setTabsLayout((prev) => ({
                                    ...prev,
                                    [tab]: { x, width },
                                }));
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeText]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
