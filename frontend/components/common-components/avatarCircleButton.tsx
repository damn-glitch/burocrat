import { useTheme } from "@/context/ThemeContext";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";

type AvatarCircleButtonProps = {
    imageUri?: string | null;
    size?: number;
    to?: string;
    onPress?: () => void;
    disabled?: boolean;
};

export default function AvatarCircleButton({ imageUri, size = 48, to, onPress, disabled }: AvatarCircleButtonProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            width: size,
            height: size,
            borderRadius: 100,
            overflow: 'hidden',
            backgroundColor: theme.colors.white40,
        },
        image: {
            width: "100%",
            height: "100%",
        }
    })

    const content = (
        <View style={styles.container}>
            {imageUri && (
                <Image
                    source={{ uri: imageUri }}
                    style={styles.image}
                    resizeMode="cover"
                />
            )}
        </View>
    );

    if (to && !disabled) {
        return <Link href={to as any}>{content}</Link>;
    }

    if (onPress && !disabled) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {content}
            </TouchableOpacity>
        );
    }


    return content;
}