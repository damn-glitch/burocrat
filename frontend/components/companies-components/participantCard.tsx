import { textStyles } from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import React, { useState } from "react";
import { Image, StyleSheet, Text, View, } from "react-native";
import Dropdown from "@/components/common-components/dropdown";
interface ParticipantCardProps {
    name: string;
    avatar: string;
    role: string;
    availableRoles?: string[];
    onRoleChange?: (newRole: string) => void;
}

export default function ParticipantCard({
    name,
    avatar,
    role,
    availableRoles = ["Админ", "Участник", "Наблюдатель"],
    onRoleChange,
}: ParticipantCardProps) {
    const theme = useTheme();
    const [selectedRole, setSelectedRole] = useState<string>(role);

    const styles = StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 16,
            padding: 16,
            backgroundColor: theme.colors.white100,
            height: 80,
        },
        avatar: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.black10,
        },
        info: {
            flex: 1,
            flexDirection: "row",
            gap: 16,
            alignItems: "center",
        },
        name: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.info}>
                <Image source={{ uri: avatar }} style={styles.avatar} />
                <Text style={styles.name}>{name}</Text>
            </View>

            <Dropdown
                value={selectedRole}
                items={availableRoles}
                onChange={(v) => {
                    setSelectedRole(v);
                    onRoleChange?.(v);
                }}
                width={130}
            />
        </View>
    );
}
