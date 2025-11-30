import PencilDrawIcon from '@/assets/images/icons/pencilDrawIcon.svg';
import SaveIcon from '@/assets/images/icons/saveIcon.svg';
import UploadImageIcon from '@/assets/images/icons/uploadImageIcon.svg';
import FileIcon from '@/components/common-components/fileIcons';
import Header from '@/components/common-components/header';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DocumentItemDetails() {
    const theme = useTheme();
    const [signatureModalVisible, setSignatureModalVisible] = useState(false);
    const [stampModalVisible, setStampModalVisible] = useState(false);
    const [signatureImage, setSignatureImage] = useState<string | null>(null);
    const [stampImage, setStampImage] = useState<string | null>(null);

    // Моковые данные документа для примера
    const documentData = {
        name: 'Пример договора.pdf',
        extension: 'pdf',
        company: 'Tleu Agency',
        project: 'Бюрократ',
        createdDate: '01.10.2025',
        updatedDate: '25.10.2025',
        hasSignature: false,
        hasStamp: false
    };

    const pickImage = async (forSignature: boolean) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                if (forSignature) {
                    setSignatureImage(result.assets[0].uri);
                } else {
                    setStampImage(result.assets[0].uri);
                }
            }
        } catch (error) {
            console.error('Ошибка при выборе изображения:', error);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.white100,
        },
        content: {
            flex: 1,
            paddingBottom: 24,
        },
        header: {
            paddingHorizontal: 16,
        },
        documentTitleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 16,
            paddingHorizontal: 16,
            marginBottom: 16,
        },
        iconContainer: {
            marginRight: 12,
        },
        documentTitle: {
            ...textStyles.semiBold,
            fontSize: 20,
            color: theme.colors.primaryText,
            flex: 1,
        },
        infoContainer: {
            marginHorizontal: 16,
            backgroundColor: theme.colors.white100,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.colors.black20,
            marginBottom: 16,
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        infoLabel: {
            ...textStyles.regular,
            fontSize: 16,
            color: theme.colors.secondaryText,
        },
        infoValue: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.primaryText,
            textAlign: 'right',
        },
        previewButton: {
            backgroundColor: theme.colors.white100,
            borderWidth: 1,
            borderColor: theme.colors.black20,
            borderRadius: 8,
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 16,
            marginBottom: 24,
        },
        previewButtonText: {
            ...textStyles.semiBold,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        sectionTitle: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
            marginHorizontal: 16,
            marginBottom: 16,
        },
        itemContainer: {
            marginHorizontal: 16,
            backgroundColor: theme.colors.white100,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.black20,
            padding: 16,
            flexDirection: 'column',
            marginBottom: 8,
        },
        itemLabel: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        itemStatus: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.primaryText,
            backgroundColor: theme.colors.black5,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 4,
        },
        separateAddButton: {
            backgroundColor: theme.colors.white100,
            borderWidth: 1,
            borderColor: theme.colors.black20,
            borderRadius: 8,
            padding: 8,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 8,
        },
        separateAddButtonText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        bottomActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderColor: theme.colors.black40,
            paddingBottom: 16,
            backgroundColor: theme.colors.white100,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.white100,
            borderWidth: 1,
            borderColor: theme.colors.black100,
            borderRadius: 8,
            padding: 12,
            flex: 1,
            marginHorizontal: 4,
        },
        actionButtonText: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.primaryText,
            marginLeft: 10,
        },
        signButton: {
            backgroundColor: theme.colors.black100,
        },
        signButtonText: {
            color: theme.colors.white100,
        },

        // Стили для модальных окон
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            width: '90%',
            maxWidth: 400,
            backgroundColor: theme.colors.white100,
            borderRadius: 16,
            overflow: 'hidden',
        },
        modalHeader: {
            alignItems: 'center',
            paddingVertical: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.black10,
        },
        modalTitle: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
            marginTop: 8,
        },
        uploadContainer: {
            margin: 20,
            marginBottom: 0,
            borderWidth: 1,
            borderStyle: 'dashed' as any,
            borderColor: theme.colors.black20,
            borderRadius: 8,
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        uploadText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
            textAlign: 'center',
            marginVertical: 12,
        },
        chooseFileButton: {
            backgroundColor: theme.colors.white100,
            borderWidth: 1,
            borderColor: theme.colors.black20,
            borderRadius: 8,
            paddingVertical: 4,
            paddingHorizontal: 16,
        },
        buttonText: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.primaryText,
        },
        modalFooter: {
            flexDirection: 'row',
            padding: 16,
        },
        cancelButton: {
            flex: 1,
            backgroundColor: theme.colors.white100,
            borderWidth: 1,
            borderColor: theme.colors.black20,
            borderRadius: 8,
            paddingVertical: 8,
            alignItems: 'center',
            marginRight: 8,
        },
        cancelButtonText:{
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        saveButton: {
            flex: 1,
            backgroundColor: theme.colors.black100,
            borderRadius: 8,
            paddingVertical: 8,
            alignItems: 'center',
            marginLeft: 8,
        },
        saveButtonText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.white100,
        },
        signatureImage: {
            width: '100%',
            height: 100,
            resizeMode: 'contain',
        },
        signatureContainer: {
            marginHorizontal: 16,
            backgroundColor: theme.colors.white100,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.black20,
            padding: 16,
            marginBottom: 16,
        },
        signatureHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        signatureTitle: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        statusAdded: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.white100,
            backgroundColor: theme.colors.successText,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 4,
        },
        signatureImageContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 8,
        },
        signaturePreview: {
            width: '100%',
            height: 80,
            resizeMode: 'contain',
        },
        editButton: {
            backgroundColor: theme.colors.white100,
            borderWidth: 1,
            borderColor: theme.colors.black20,
            borderRadius: 8,
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 8,
        },
        editButtonText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
    });

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Header
                        title="Детали документа"
                        titleFontSize={16}
                        backButton
                        backButtonColor={theme.colors.black60}
                        backButtonBGroundColor={theme.colors.gray100}
                    />
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 64 }}
                >
                    <View style={styles.documentTitleContainer}>
                        <View style={styles.iconContainer}>
                            <FileIcon extension={documentData.extension} />
                        </View>
                        <Text style={styles.documentTitle}>{documentData.name}</Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Компания</Text>
                            <Text style={styles.infoValue}>{documentData.company}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Проект</Text>
                            <Text style={styles.infoValue}>{documentData.project}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Создан</Text>
                            <Text style={styles.infoValue}>{documentData.createdDate}</Text>
                        </View>
                        <View style={[styles.infoRow, { marginBottom: 0 }]}>
                            <Text style={styles.infoLabel}>Обновлен</Text>
                            <Text style={styles.infoValue}>{documentData.updatedDate}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.previewButton}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.previewButtonText}>Предпросмотр PDF</Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>Подпись и печать</Text>

                    {/* Контейнер для всего блока подписи и печати */}
                    <View style={styles.signatureContainer}>
                        {/* Блок с подписью */}
                        <View>
                            <View style={styles.signatureHeader}>
                                <Text style={styles.signatureTitle}>Подпись</Text>

                                {signatureImage ? (
                                    <Text style={styles.statusAdded}>Добавлена</Text>
                                ) : (
                                    <Text style={styles.itemStatus}>Не добавлена</Text>
                                )}
                            </View>

                            {signatureImage ? (
                                <>
                                    <View style={styles.signatureImageContainer}>
                                        <Image
                                            source={{ uri: signatureImage }}
                                            style={styles.signaturePreview}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={styles.editButton}
                                        activeOpacity={0.8}
                                        onPress={() => setSignatureModalVisible(true)}
                                    >
                                        <Text style={styles.editButtonText}>Изменить подпись</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <TouchableOpacity
                                    style={styles.separateAddButton}
                                    activeOpacity={0.8}
                                    onPress={() => setSignatureModalVisible(true)}
                                >
                                    <Text style={styles.separateAddButtonText}>Добавить подпись</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={styles.signatureContainer}>
                        <View style={styles.signatureHeader}>
                            <Text style={styles.signatureTitle}>Печать</Text>

                            {stampImage ? (
                                <Text style={styles.statusAdded}>Добавлена</Text>
                            ) : (
                                <Text style={styles.itemStatus}>Не добавлена</Text>
                            )}
                        </View>

                        {stampImage ? (
                            <>
                                <View style={styles.signatureImageContainer}>
                                    <Image
                                        source={{ uri: stampImage }}
                                        style={styles.signaturePreview}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    activeOpacity={0.8}
                                    onPress={() => setStampModalVisible(true)}
                                >
                                    <Text style={styles.editButtonText}>Изменить печать</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={styles.separateAddButton}
                                activeOpacity={0.8}
                                onPress={() => setStampModalVisible(true)}
                            >
                                <Text style={styles.separateAddButtonText}>Добавить печать</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>

                <View style={styles.bottomActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        activeOpacity={0.8}
                    >
                        <SaveIcon width={22} height={22} stroke={theme.colors.black100} />
                        <Text style={styles.actionButtonText}>Сохранить</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.signButton]}
                        activeOpacity={0.8}
                    >
                        <PencilDrawIcon width={22} height={22} stroke={theme.colors.white100} />
                        <Text style={[styles.actionButtonText, styles.signButtonText]}>Подписать</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Модальное окно для добавления подписи */}
            <Modal
                visible={signatureModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSignatureModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setSignatureModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.modalContainer}>
                                <View style={styles.modalHeader}>
                                    <PencilDrawIcon width={22} height={22} stroke={theme.colors.black100} />
                                    <Text style={styles.modalTitle}>Добавить подпись</Text>
                                </View>

                                {!signatureImage ? (
                                    <View style={styles.uploadContainer}>
                                        <UploadImageIcon width={24} height={24} fill={theme.colors.black60} />
                                        <Text style={styles.uploadText}>Загрузите изображение вашей подписи</Text>
                                        <TouchableOpacity
                                            style={styles.chooseFileButton}
                                            onPress={() => pickImage(true)}
                                        >
                                            <Text style={styles.buttonText}>Выбрать файл</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.uploadContainer}>
                                        <Image source={{ uri: signatureImage }} style={styles.signatureImage} />
                                        <TouchableOpacity
                                            style={styles.chooseFileButton}
                                            onPress={() => pickImage(true)}
                                        >
                                            <Text style={styles.buttonText}>Изменить</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <View style={styles.modalFooter}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => setSignatureModalVisible(false)}
                                    >
                                        <Text style={styles.cancelButtonText}>Отмена</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={() => {
                                            setSignatureModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.saveButtonText}>Сохранить</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Модальное окно для добавления печати */}
            <Modal
                visible={stampModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setStampModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setStampModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.modalContainer}>
                                <View style={styles.modalHeader}>
                                    <PencilDrawIcon width={22} height={22} stroke={theme.colors.black100} />
                                    <Text style={styles.modalTitle}>Добавить печать</Text>
                                </View>

                                {!stampImage ? (
                                    <View style={styles.uploadContainer}>
                                        <UploadImageIcon width={24} height={24} fill={theme.colors.black60} />
                                        <Text style={styles.uploadText}>Загрузите изображение вашей печати</Text>
                                        <TouchableOpacity
                                            style={styles.chooseFileButton}
                                            onPress={() => pickImage(false)}
                                        >
                                            <Text style={styles.buttonText}>Выбрать файл</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.uploadContainer}>
                                        <Image source={{ uri: stampImage }} style={styles.signatureImage} />
                                        <TouchableOpacity
                                            style={styles.chooseFileButton}
                                            onPress={() => pickImage(false)}
                                        >
                                            <Text style={styles.buttonText}>Изменить</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <View style={styles.modalFooter}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => setStampModalVisible(false)}
                                    >
                                        <Text style={styles.cancelButtonText}>Отмена</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={() => {
                                            // Здесь логика сохранения печати
                                            setStampModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.saveButtonText}>Сохранить</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}