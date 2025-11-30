import ArrowLeftIcon from '@/assets/images/icons/arrowLeftIcon.svg';
import { textStyles } from "@/constants/typography";
import { useTheme } from '@/context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type HeaderProps = {
    title?: string;
    titleFontSize?: number;

    backButton?: boolean;
    onBackPress?: () => void;
    backButtonColor?: string;
    backButtonBGroundColor?: string;

    backGroundColor?: string;

    helpButton?: boolean;
    helpButtonImage?: React.ReactNode;
    helpButtonColor?: string;
    helpButtonImageSize?: number;
    helpButtonBGroundColor?: string;
    helpButtonOnPress?: () => void;

    avatarImage?: string;
}

export default function Header({
    title,
    titleFontSize,
    backButton,
    onBackPress,
    backButtonColor,
    backButtonBGroundColor,
    backGroundColor,
    helpButton,
    helpButtonImage,
    helpButtonColor,
    helpButtonBGroundColor,
    helpButtonImageSize,
    helpButtonOnPress,
    avatarImage
}: HeaderProps) {
    const theme = useTheme();
    const navigation = useNavigation();
    const router = useRouter();


    const styles = StyleSheet.create({
        container: {
            backgroundColor: backGroundColor || 'transparent',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 16,
            position: 'relative',
        },
        backButtonContainer: {
            backgroundColor: backButtonBGroundColor || 'transparent',
            width: 48,
            height: 48,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            borderRadius: 48,
        },
        title: {
            ...textStyles.semiBold,
            fontSize: titleFontSize || 18,
            position: backButton ? 'absolute' : 'relative',
            left: 0,
            right: 0,
            textAlign: backButton ? 'center' : 'left',
            flex: 1,
        },
        helpButtonContainer: {
            backgroundColor: helpButtonBGroundColor || 'transparent',
            width: 48,
            height: 48,
            borderRadius: 48,
            justifyContent: 'center',
            alignItems: 'center',
        },
        avatarImage: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.black60,
        },
        buttonContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        }
    });

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
            return;
        }

        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {backButton && (
                <TouchableOpacity
                    style={styles.backButtonContainer}
                    activeOpacity={0.8}
                    onPress={handleBack}
                >
                    <ArrowLeftIcon width={10} height={16} stroke={backButtonColor || theme.colors.white100} />
                </TouchableOpacity>
            )}

            {title && <Text style={styles.title}>{title}</Text>}

            <View style={styles.buttonContainer}>
                {helpButton && (
                    <TouchableOpacity
                        style={styles.helpButtonContainer}
                        onPress={helpButtonOnPress}
                        activeOpacity={0.8}
                    >
                        {helpButtonImage}
                    </TouchableOpacity>
                )}

                {avatarImage ? (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => router.push('/main/profile' as any)}
                    >
                        <Image
                            source={typeof avatarImage === 'string' ? { uri: avatarImage } : avatarImage}
                            style={styles.avatarImage}
                        />
                    </TouchableOpacity>
                ) : (
                    <View></View>
                )}
            </View>
        </View>
    );
}
