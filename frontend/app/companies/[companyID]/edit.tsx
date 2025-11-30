import Dropdown from '@/components/common-components/dropdown';
import Header from '@/components/common-components/header';
import PrimaryButton from '@/components/common-components/primaryButton';
import Skeleton from '@/components/common-components/skeleton';
import UniversalTextInput from '@/components/common-components/universalTextInput';
import CompanyCard from '@/components/companies-components/companyCard';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const mockCompanies = [
    {
        id: '1',
        name: 'Компания 1',
        description: 'Описание компании 1',
        color: '#1E3A8A',
        legalForm: 'ООО',
        industry: 'IT и разработка',
        creationDate: '01.01.2024',
        userRole: 'Владелец',
    },
    {
        id: '2',
        name: 'Компания 2',
        description: 'Описание компании 2',
        color: '#059669',
        legalForm: 'АО',
        industry: 'Финансы',
        creationDate: '15.02.2024',
        userRole: 'Админ',
    },
    {
        id: '3',
        name: 'Компания 3',
        description: 'Описание компании 3',
        color: '#8B5CF6',
        legalForm: 'ИП',
        industry: 'Услуги',
        creationDate: '10.03.2024',
        userRole: 'Пользователь',
    },
];

export default function EditCompany() {
    const theme = useTheme();
    const { t } = useTranslation();
    const { companyID } = useLocalSearchParams<{ companyID: string }>();
    const id = companyID;
    const router = useRouter();
    
    const [selectedColor, setSelectedColor] = useState('#1E3A8A');
    const [selectedLegalForm, setSelectedLegalForm] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [description, setDescription] = useState('');
    const [creationDate, setCreationDate] = useState('');
    const [userRole, setUserRole] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const company = mockCompanies.find(c => c.id === id);
            
            if (company) {
                setCompanyName(company.name);
                setDescription(company.description);
                setSelectedColor(company.color);
                setSelectedLegalForm(company.legalForm);
                setSelectedIndustry(company.industry);
                setCreationDate(company.creationDate);
                setUserRole(company.userRole);
            }
            
            setIsLoading(false);
        }
    }, [id]);

    const colors = [
        '#1E3A8A',
        '#059669',
        '#6B7280',
        '#8B5CF6',
        '#BE185D',
        '#374151',
        '#D1D5DB',
        '#F59E0B',
        '#EF4444',
    ];

    const legalForms = [
        t('companies.edit.legalForms.LLC'),
        t('companies.edit.legalForms.JSC'),
        t('companies.edit.legalForms.SP'),
        t('companies.edit.legalForms.CJSC'),
        t('companies.edit.legalForms.PJSC')
    ];
    
    const industries = [
        t('companies.edit.industries.IT'),
        t('companies.edit.industries.manufacturing'),
        t('companies.edit.industries.trade'),
        t('companies.edit.industries.construction'),
        t('companies.edit.industries.finance'),
        t('companies.edit.industries.education'),
        t('companies.edit.industries.medicine'),
        t('companies.edit.industries.transport'),
        t('companies.edit.industries.agriculture'),
        t('companies.edit.industries.services'),
        t('companies.edit.industries.other')
    ];

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
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        dropdownText: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        skeletonContainer: {
            paddingTop: 16,
        },
        skeletonRow: {
            flexDirection: 'row',
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
            id={id || "preview"}
            title={companyName || t('companies.edit.companyName')}
            userRole={userRole || t('companies.roles.owner')}
            creationDate={creationDate || "01.01.2025"}
            settingButton={false}
            backgroundColor={selectedColor}
        />
    );

    const handleSave = () => {
        console.log('Сохранение изменений компании:', {
            id,
            name: companyName,
            description,
            color: selectedColor,
            legalForm: selectedLegalForm,
            industry: selectedIndustry,
        });
        
        router.back();
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <Header
                title={t('companies.edit.title')}
                titleFontSize={16}
                backButton
                backButtonColor={theme.colors.black60}
                backButtonBGroundColor={theme.colors.gray100}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <View style={styles.skeletonContainer}>
                        <Skeleton width="70%" height={32} style={{ marginBottom: 24 }} />
                        
                        <Skeleton width="100%" height={120} style={{ marginBottom: 24, borderRadius: 12 }} />
                        
                        <Skeleton width="50%" height={20} style={{ marginBottom: 8 }} />
                        <Skeleton width="100%" height={54} style={{ marginBottom: 24, borderRadius: 8 }} />
                        
                        <Skeleton width="20%" height={20} style={{ marginBottom: 12 }} />
                        <View style={styles.skeletonRow}>
                            {[1, 2, 3, 4, 5].map((_, index) => (
                                <Skeleton 
                                    key={index}
                                    width={40} 
                                    height={40} 
                                    style={{ 
                                        marginRight: 12,
                                        borderRadius: 20,
                                    }} 
                                />
                            ))}
                        </View>
                        
                        <Skeleton width="70%" height={32} style={{ marginTop: 24, marginBottom: 24 }} />
                        
                        <Skeleton width="40%" height={20} style={{ marginBottom: 8 }} />
                        <Skeleton width="100%" height={120} style={{ marginBottom: 24, borderRadius: 8 }} />
                        
                        <Skeleton width="50%" height={20} style={{ marginBottom: 8 }} />
                        <Skeleton width="100%" height={54} style={{ marginBottom: 24, borderRadius: 8 }} />
                        
                        <Skeleton width="30%" height={20} style={{ marginBottom: 8 }} />
                        <Skeleton width="100%" height={54} style={{ marginBottom: 40, borderRadius: 8 }} />
                        
                        <Skeleton width="100%" height={54} style={{ borderRadius: 12 }} />
                    </View>
                ) : (
                    <>
                        <Text style={styles.mainTitle}>{t('companies.edit.title')}</Text>

                        <View style={{ marginTop: 24 }}>
                            {renderPreviewCard()}
                        </View>

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
                                buttonTextStyle={styles.dropdownText}
                                arrowWidth={24}
                                arrowHeight={24}
                            />
                        </View>

                        <View style={{ marginVertical: 40 }}>
                            <PrimaryButton
                                label={t('companies.edit.saveButton')}
                                onPress={handleSave}
                            />
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}