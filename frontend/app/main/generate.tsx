import GenerateMagicIcon from '@/assets/images/icons/generateMagicIcon.svg';
import InfoIcon from '@/assets/images/icons/infoIcon.svg';
import InvoiceIcon from '@/assets/images/icons/invoiceIcon.svg';
import PencilIcon from '@/assets/images/icons/pencilIcon.svg';
import PlusIcon from '@/assets/images/icons/plusIcon.svg';
import TrashIcon from '@/assets/images/icons/trashIcon.svg';
import Dropdown from '@/components/common-components/dropdown';
import Header from '@/components/common-components/header';
import UniversalTextInput from '@/components/common-components/universalTextInput';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Generate() {
    const theme = useTheme();
    const { t } = useTranslation();
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [aiPrompt, setAiPrompt] = useState('');

    // Шаблоны документов
    const templateOptions = ['Накладная', 'Счет-фактура', 'Договор', 'Акт выполненных работ'];

    // Опции для недавних генераций
    const recentGenerationOptions = [
        {
            id: 'invoice',
            name: 'Накладная',
            description: 'Предмет, сроки...',
            icon: <InvoiceIcon width={24} height={24} fill={theme.colors.black60} />
        },
        {
            id: 'text',
            name: 'Составить текст',
            description: 'Договор, счёт, акт...',
            icon: <PencilIcon width={22} height={22} fill={theme.colors.black60} />
        },
        {
            id: 'contract',
            name: 'Составить договор',
            description: 'Договор, НДА...',
            icon: <PencilIcon width={22} height={22} fill={theme.colors.black60} />
        }
    ];

    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: '',
        date: '',
        company: '',
        bin: '',
        items: [{
            name: '',
            unit: '',
            quantity: '',
            price: ''
        }],
        responsible: '',
        responsibleBIN: ''
    });

    const handleAddItem = () => {
        setInvoiceData({
            ...invoiceData,
            items: [...invoiceData.items, {
                name: '',
                unit: '',
                quantity: '',
                price: ''
            }]
        });
    };

    // Обработчик изменения выбранного шаблона
    const handleTemplateChange = (template: string) => {
        setSelectedTemplate(template === 'Накладная' ? 'invoice' : null);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.white100,
        },
        contentContainer: {
            paddingHorizontal: 16,
            paddingBottom: 40,
        },
        header: {
            paddingHorizontal: 16,
        },
        title: {
            ...textStyles.semiBold,
            fontSize: 24,
            color: theme.colors.primaryText,
            marginBottom: 4,
            marginTop: 16,
        },
        subtitle: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
            lineHeight: 20,
        },
        sectionTitle: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
            marginBottom: 16,
            marginTop: 24,
        },
        recentItemsScrollContainer: {
            marginHorizontal: -16,
            paddingLeft: 16,
        },
        documentTypeItem: {
            alignItems: 'flex-start',
            width: 160,
            height: 122,
            backgroundColor: theme.colors.white100,
            borderRadius: 15,
            marginRight: 10,
            borderWidth: 2,
            borderColor: theme.colors.gray100,
            paddingHorizontal: 12,
            paddingVertical: 24,
        },
        documentTypeIcon: {
            width: 24,
            height: 24,
            marginBottom: 12,
        },
        documentTypeName: {
            ...textStyles.semiBold,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        documentTypeDesc: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
            marginTop: 4,
        },
        aiInputContainer: {
            backgroundColor: theme.colors.gray100,
            borderRadius: 8,
            padding: 16,
            marginBottom: 8,
        },
        aiInput: {
            ...textStyles.regular,
            fontSize: 14,
            color: theme.colors.black100,
            minHeight: 60,
        },
        aiHintContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.white100,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.blue40,
            height: 92,
            marginTop: 8,
        },
        aiIcon: {
            width: 48,
            height: 48,
            backgroundColor: theme.colors.blue40,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        aiHintText: {
            ...textStyles.semiBold,
            fontSize: 14,
            color: theme.colors.primaryText,
            flex: 1,
        },
        generateButton: {
            backgroundColor: theme.colors.black100,
            borderRadius: 32,
            padding: 16,
            marginTop: 24,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
        },
        generateButtonText: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.white100,
        },
        formContainer: {
            marginTop: 8,
        },
        formGroup: {
            marginBottom: 16,
            marginTop: 8,
        },
        formLabel: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.black80,
            marginBottom: 8,
        },
        formInputRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 16,
        },
        addItemButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.white100,
            borderWidth: 1,
            borderColor: theme.colors.black100,
            borderRadius: 8,
            padding: 8,
            paddingHorizontal: 12,
            alignSelf: 'flex-start',
        },
        addItemText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.black100,
            marginLeft: 8,
        },
        input: {
            borderWidth: 1,
            borderColor: theme.colors.gray100,
        },
        itemsContainer: {
            marginTop: 16,
        },
        itemsHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        itemsHeaderText: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        addButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.black100,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            height: 40,
            width: 130,
        },
        addButtonText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.white100,
            marginLeft: 8,
        },
        itemCard: {
            borderWidth: 1,
            borderColor: theme.colors.black20,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
        },
        itemCardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        itemCardLabel: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.black100,
            marginBottom: 8,
        },
        itemInputsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 12,
        },
        itemInputColumn: {
            width: '48%',
        },
        noMarginInput: {
            marginBottom: 0,
        },
    });

    const isInvoiceFilled = selectedTemplate !== 'invoice' || (
        invoiceData.invoiceNumber &&
        invoiceData.date &&
        invoiceData.company &&
        invoiceData.bin &&
        invoiceData.items.every(item =>
            item.name && item.unit && item.quantity && item.price
        ) &&
        invoiceData.responsible &&
        invoiceData.responsibleBIN
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Header
                    title="Генерация"
                    titleFontSize={16}
                    backButton
                    backButtonColor={theme.colors.black60}
                    backButtonBGroundColor={theme.colors.gray100}
                />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>Генерация документов</Text>
                <Text style={styles.subtitle}>Создавайте счета, накладные, налоговые формы и другие документы в пару кликов.</Text>

                {/* Недавние генерации */}
                <Text style={styles.sectionTitle}>Недавние генерации</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.recentItemsScrollContainer}
                    contentContainerStyle={{ paddingRight: 16 }}
                >
                    {recentGenerationOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={styles.documentTypeItem}
                            onPress={() => setSelectedTemplate(option.id === 'invoice' ? 'invoice' : null)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.documentTypeIcon}>
                                {option.icon}
                            </View>
                            <Text style={styles.documentTypeName}>{option.name}</Text>
                            <Text style={styles.documentTypeDesc}>{option.description}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Генерация с помощью ИИ */}
                <Text style={styles.sectionTitle}>Генерация с помощью ИИ</Text>
                <UniversalTextInput
                    placeholder="Введите описание или запрос"
                    placeholderTextColor={theme.colors.black60}
                    multiline
                    value={aiPrompt}
                    onChangeText={setAiPrompt}
                    inputStyle={{
                        ...styles.aiInput,
                        backgroundColor: theme.colors.gray100,
                        padding: 16,
                        ...textStyles.medium,
                    }}
                />

                <View style={styles.aiHintContainer}>
                    <View style={styles.aiIcon}>
                        <InfoIcon width={24} height={24} fill={theme.colors.blue} />
                    </View>
                    <Text style={styles.aiHintText}>
                        Вы можете полностью сгенерировать документ по запросу или дополнить им уже заполненную форму.
                    </Text>
                </View>

                {/* Шаблон документа*/}
                <Text style={styles.sectionTitle}>Шаблон документа</Text>
                <Dropdown
                    value={selectedTemplate === 'invoice' ? 'Накладная' : null}
                    items={templateOptions}
                    onChange={handleTemplateChange}
                    width="100%"
                    buttonStyle={{
                        backgroundColor: theme.colors.gray100,
                        borderRadius: 8,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: theme.colors.black10,
                        ...textStyles.medium,
                    }}
                    buttonTextStyle={{
                        color: theme.colors.black80,
                        ...textStyles.medium,
                        fontSize: 16,
                    }}
                    placeholder="Выберите шаблон документа"
                />

                {/* Форма для накладной - показывается только если выбран шаблон */}
                {selectedTemplate === 'invoice' && (
                    <View style={styles.formContainer}>
                        <View style={styles.formInputRow}>
                            <View style={styles.itemInputColumn}>
                                <UniversalTextInput
                                    label="Номер накладной"
                                    value={invoiceData.invoiceNumber}
                                    onChangeText={(text) => setInvoiceData({ ...invoiceData, invoiceNumber: text })}
                                    placeholder="000000"
                                />
                            </View>
                            <View style={styles.itemInputColumn}>
                                <UniversalTextInput
                                    label="Дата составления"
                                    value={invoiceData.date}
                                    onChangeText={(text) => setInvoiceData({ ...invoiceData, date: text })}
                                    placeholder="04.04.2024"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <UniversalTextInput
                                label="Поставщик - название компании"
                                value={invoiceData.company}
                                onChangeText={(text) => setInvoiceData({ ...invoiceData, company: text })}
                                placeholder="ТОО 'Компания'"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <UniversalTextInput
                                label="Поставщик - БИН/ИИН"
                                value={invoiceData.bin}
                                onChangeText={(text) => setInvoiceData({ ...invoiceData, bin: text })}
                                placeholder="000000000000"
                            />
                        </View>

                        {/* Обновленный блок товаров/услуг */}
                        <View style={styles.itemsContainer}>
                            <View style={styles.itemsHeader}>
                                <Text style={styles.itemsHeaderText}>Товары / услуги</Text>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={handleAddItem}
                                >
                                    <PlusIcon width={24} height={24} fill={theme.colors.white100} />
                                    <Text style={styles.addButtonText}>Добавить</Text>
                                </TouchableOpacity>
                            </View>

                            {invoiceData.items.map((item, index) => (
                                <View key={index} style={styles.itemCard}>
                                    <View style={styles.itemCardHeader}>
                                        <Text style={{ ...styles.itemCardLabel, marginBottom: 0 }}>Описание</Text>
                                        <TouchableOpacity
                                            onPress={() => {
                                                const newItems = invoiceData.items.filter((_, i) => i !== index);
                                                setInvoiceData({
                                                    ...invoiceData, items: newItems.length ? newItems : [{
                                                        name: '',
                                                        unit: '',
                                                        quantity: '',
                                                        price: ''
                                                    }]
                                                });
                                            }}
                                        >
                                            <TrashIcon width={24} height={24} fill={theme.colors.black100} />
                                        </TouchableOpacity>
                                    </View>

                                    <UniversalTextInput
                                        value={item.name}
                                        onChangeText={(text) => {
                                            const newItems = [...invoiceData.items];
                                            newItems[index].name = text;
                                            setInvoiceData({ ...invoiceData, items: newItems });
                                        }}
                                        containerStyle={styles.noMarginInput}
                                        placeholder="Введите описание товара или услуги"
                                    />

                                    <View style={styles.itemInputsRow}>
                                        <View style={styles.itemInputColumn}>
                                            <Text style={styles.itemCardLabel}>Ед. изм.</Text>
                                            <UniversalTextInput
                                                value={item.unit}
                                                onChangeText={(text) => {
                                                    const newItems = [...invoiceData.items];
                                                    newItems[index].unit = text;
                                                    setInvoiceData({ ...invoiceData, items: newItems });
                                                }}
                                                containerStyle={styles.noMarginInput}
                                                placeholder="шт / кг / л / и т.д."
                                            />
                                        </View>
                                        <View style={styles.itemInputColumn}>
                                            <Text style={styles.itemCardLabel}>Кол-во</Text>
                                            <UniversalTextInput
                                                value={item.quantity}
                                                onChangeText={(text) => {
                                                    const newItems = [...invoiceData.items];
                                                    newItems[index].quantity = text;
                                                    setInvoiceData({ ...invoiceData, items: newItems });
                                                }}
                                                keyboardType="numeric"
                                                containerStyle={styles.noMarginInput}
                                                placeholder="00000"
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.itemInputsRow}>
                                        <View style={styles.itemInputColumn}>
                                            <Text style={styles.itemCardLabel}>Цена за ед., ₸</Text>
                                            <UniversalTextInput
                                                value={item.price}
                                                onChangeText={(text) => {
                                                    const newItems = [...invoiceData.items];
                                                    newItems[index].price = text;
                                                    setInvoiceData({ ...invoiceData, items: newItems });
                                                }}
                                                keyboardType="numeric"
                                                containerStyle={styles.noMarginInput}
                                                placeholder="00000"
                                            />
                                        </View>
                                        <View style={styles.itemInputColumn}>
                                            <Text style={styles.itemCardLabel}>Сумма, ₸</Text>
                                            <UniversalTextInput
                                                value={(() => {
                                                    const qty = parseFloat(item.quantity) || 0;
                                                    const price = parseFloat(item.price) || 0;
                                                    const sum = qty * price;
                                                    return isNaN(sum) ? '0' : sum.toString();
                                                })()}
                                                editable={false}
                                                containerStyle={styles.noMarginInput}
                                                placeholder="0"
                                            />
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>


                        <View style={styles.formGroup}>
                            <UniversalTextInput
                                label="Ответственный от поставщика"
                                value={invoiceData.responsible}
                                onChangeText={(text) => setInvoiceData({ ...invoiceData, responsible: text })}
                                placeholder='Ответственный ФИО'
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <UniversalTextInput
                                label="Ответственный от получателя"
                                value={invoiceData.responsibleBIN}
                                onChangeText={(text) => setInvoiceData({ ...invoiceData, responsibleBIN: text })}
                                placeholder='Ответственный ФИО'
                            />
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={[
                        styles.generateButton,
                        !isInvoiceFilled && { opacity: 0.5 }
                    ]}
                    activeOpacity={isInvoiceFilled ? 0.9 : 1}
                    disabled={!isInvoiceFilled}
                >
                    <GenerateMagicIcon width={24} height={24} fill={theme.colors.white100} />

                    <Text style={styles.generateButtonText}>
                        Сгенерировать
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}