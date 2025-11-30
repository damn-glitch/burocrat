import Dropdown from '@/components/common-components/dropdown';
import Header from '@/components/common-components/header';
import PrimaryButton from '@/components/common-components/primaryButton';
import UniversalTextInput from '@/components/common-components/universalTextInput';
import CompanyCard from '@/components/companies-components/companyCard';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApi } from '@/api';

export default function CreateCompany() {
    const theme = useTheme();
    const { t } = useTranslation();
    const router = useRouter();
    const [selectedColor, setSelectedColor] = useState('#1E3A8A');
    const [legalForms, setLegalForms] = useState<any[]>([]);
    const [industries, setIndustries] = useState<any[]>([]);
    const [selectedLegalForm, setSelectedLegalForm] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [description, setDescription] = useState('');

    const { execute } = useApi();
    useEffect(() => {
        fetchLegalForms();
        fetchIndustries();
    }, []);

    const fetchLegalForms = async () => {
        const response = await execute({
            method: 'GET',
            url: '/dictionary/legal-form', // твой endpoint
        });

        // Предполагаем, что response.data содержит массив компаний
        console.log(response);
        if (response) {
            setLegalForms(response);
        }
    };

    const fetchIndustries = async () => {
        const response = await execute({
            method: 'GET',
            url: `/dictionary/industry`, // твой endpoint
        });

        // Предполагаем, что response.data содержит массив компаний
        console.log(response);
        if (response) {
            setIndustries(response);
        }
    };

    const getTodayDate = () => {
        const today = new Date();
        const day = today.getDate().toString().padStart(2, '0');
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const year = today.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const colors = ['#1E3A8A', '#059669', '#6B7280', '#8B5CF6', '#BE185D', '#374151', '#D1D5DB', '#F59E0B', '#EF4444'];

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.white100,
            paddingHorizontal: 16,
        },
        mainTitle: {
            ...textStyles.semiBold,
            fontSize: 24,
            color: theme.colors.black100,
            marginTop: 24,
        },
        colorsContainer: {
            marginTop: 16,
        },
        colorLabel: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
            marginBottom: 12,
        },
        colorsScrollContainer: {
            paddingVertical: 8,
        },
        colorCircle: {
            width: 40,
            height: 40,
            borderRadius: 40,
            marginRight: 12,
            borderColor: 'transparent',
        },
        selectedColorCircle: {
            borderColor: theme.colors.black40,
            borderWidth: 4,
            elevation: 2,
        },
        dropdownButton: {
            minHeight: 54,
            borderRadius: 8,
            backgroundColor: theme.colors.gray100,
            borderWidth: 1,
            borderColor: theme.colors.black10,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        dropdownText: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
    });

    const renderColorCircle = (color: string, index: number) => (
        <TouchableOpacity
            key={color}
            style={[
                styles.colorCircle,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColorCircle,
            ]}
            onPress={() => setSelectedColor(color)}
            activeOpacity={0.8}
        />
    );

    const renderPreviewCard = () => (
        <CompanyCard
            id="preview"
            title={companyName || t('companies.edit.companyName')}
            userRole={t('companies.roles.owner')}
            creationDate={getTodayDate()}
            settingButton={false}
            backgroundColor={selectedColor}
        />
    );

    const handleSave = () => {
        console.log('Создание компании:', {
            name: companyName,
            description,
            color: selectedColor,
            legalForm: selectedLegalForm,
            industry: selectedIndustry,
        });
        createCompanyRequest()
        router.back();
    };

    const createCompanyRequest = async () => {
        const response = await execute({
            method: 'POST',
            url: `/company`, // твой endpoint
            data: {
                name: companyName,
                description: description,
                color: selectedColor,
                country_code: "KZ",
                industry_code: selectedIndustry,
                legal_form_code: selectedLegalForm
            }
        });

        // Предполагаем, что response.data содержит массив компаний
        console.log(response);
        if (response) {
            setIndustries(response);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Header
                    title={t('companies.create.title')}
                    titleFontSize={16}
                    backButton
                    backButtonColor={theme.colors.black60}
                    backButtonBGroundColor={theme.colors.gray100}
                />
                <Text style={styles.mainTitle}>{t('companies.create.title')}</Text>

                <View style={{ marginTop: 24 }}>{renderPreviewCard()}</View>

                <UniversalTextInput
                    label={t('companies.edit.companyName')}
                    placeholder={t('companies.edit.companyNamePlaceholder')}
                    containerStyle={{ marginTop: 24 }}
                    value={companyName}
                    onChangeText={setCompanyName}
                />

                <View style={styles.colorsContainer}>
                    <Text style={styles.colorLabel}>{t('companies.edit.color')}</Text>
                    <View style={{ marginHorizontal: -16, paddingVertical: 4 }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 16 }}
                        >
                            {colors.map(renderColorCircle)}
                        </ScrollView>
                    </View>
                </View>

                <Text style={styles.mainTitle}>{t('companies.edit.detailsTitle')}</Text>

                <UniversalTextInput
                    label={t('companies.edit.description')}
                    placeholder={t('companies.edit.descriptionPlaceholder')}
                    containerStyle={{ marginTop: 16 }}
                    numberOfLines={4}
                    multiline
                    inputStyle={{ minHeight: 80, textAlignVertical: 'top' }}
                    value={description}
                    onChangeText={setDescription}
                />

                <View style={{ marginTop: 16 }}>
                    <Text style={styles.colorLabel}>{t('companies.edit.legalForm')}</Text>
                    <Dropdown
                        value={selectedLegalForm}
                        placeholder={t('companies.edit.legalFormPlaceholder')}
                        items={legalForms}
                        onChange={setSelectedLegalForm}
                        width="100%"
                        buttonStyle={styles.dropdownButton}
                        buttonTextStyle={styles.dropdownText}
                        arrowWidth={24}
                        arrowHeight={24}
                    />
                </View>

                <View style={{ marginTop: 16 }}>
                    <Text style={styles.colorLabel}>{t('companies.edit.industry')}</Text>
                    <Dropdown
                        value={selectedIndustry}
                        placeholder={t('companies.edit.industryPlaceholder')}
                        items={industries}
                        onChange={setSelectedIndustry}
                        width="100%"
                        buttonStyle={styles.dropdownButton}
                        buttonTextStyle={[styles.dropdownText]}
                        arrowWidth={24}
                        arrowHeight={24}
                    />
                </View>

                <View style={{ marginVertical: 40 }}>
                    <PrimaryButton label={t('companies.create.createButton')} onPress={handleSave} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
