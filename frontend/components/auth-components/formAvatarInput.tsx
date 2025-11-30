import { useTheme } from '@/context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import DefaultAvatarIcon from '@/assets/images/icons/defaultAvatarIcon.svg';
import CameraIcon from '@/assets/images/icons/cameraIcon.svg';

export default function FormAvatarInput() {
    const theme = useTheme();
    const [avatar, setAvatar] = useState<string | null>(null);

    const openPicker = () => {
        Alert.alert(
            'Выберите изображение',
            '',
            [
                { text: 'Камера', onPress: openCamera },
                { text: 'Галерея', onPress: openGallery },
                { text: 'Отмена', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };

    const openGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Необходим доступ к галерее', 'Пожалуйста, предоставьте доступ к галерее в настройках устройства');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setAvatar(result.assets[0].uri);
            }
        } catch (error) {
            console.log('Выбор отменён', error);
        }
    };

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Необходим доступ к камере', 'Пожалуйста, предоставьте доступ к камере в настройках устройства');
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setAvatar(result.assets[0].uri);
            }
        } catch (error) {
            console.log('Камера отменена', error);
        }
    };

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        avatarContainer: {
            width: 104,
            height: 104,
            borderRadius: 60,
            backgroundColor: theme.colors.black10,
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
        },
        avatarImage: {
            width: '100%',
            height: '100%',
        },
        placeholder: {
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
        },
        cameraIconContainer: {
            position: 'absolute',
            bottom: 1,
            right: 1,
            backgroundColor: theme.colors.whiteIcon,
            borderRadius: 50,
            borderWidth: 1,
            borderColor: theme.colors.whiteIconBorder,
            width: 32,
            height: 32,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        cameraIcon: {
            color: 'white',
        }
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={openPicker} activeOpacity={0.8}>
                <View style={styles.avatarContainer}>
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.placeholder}>
                            <DefaultAvatarIcon/>
                        </View>
                    )}
                </View>
                <View style={styles.cameraIconContainer}>
                    <CameraIcon
                        width={16}
                        height={16}
                        stroke={theme.colors.primaryText}
                        strokeWidth={1}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
}