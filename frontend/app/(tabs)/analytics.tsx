import CalendarIcon from '@/assets/images/icons/calendarIcon.svg';
import ClockIcon from '@/assets/images/icons/clockIcon.svg';
import DoneIcon from '@/assets/images/icons/doneIcon.svg';
import { default as ClipboardIcon, default as FolderIcon } from '@/assets/images/icons/folderIcon.svg';
import LampIcon from '@/assets/images/icons/lampIcon.svg';
import SearchIcon from '@/assets/images/icons/searchIcon.svg';
import AnalyticCard from '@/components/analytics-components/analyticCard';
import CalendarWithPeriod from '@/components/common-components/calendarWithPeriod';
import Dropdown from '@/components/common-components/dropdown';
import Header from '@/components/common-components/header';
import ModalWindow from '@/components/common-components/modal';
import ProfileStats from '@/components/main-components/profileStats';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Analytics() {
    const theme = useTheme();
    const { t } = useTranslation();
    const router = useRouter();

    // Мок данные для графика задач
    const [tasksData, setTasksData] = useState({
        inProgress: 8,
        waiting: 3,
        pending: 3,
        overdue: 2,
    });

    // Мок данные для аналитических карточек
    const analyticCards = [
        {
            id: '1',
            icon: FolderIcon,
            title: t('analytics.cards.activeProjects'),
            value: 12,
            iconSize: 28,
            iconFillColor: 'transparent',
            strokeWidth: 2,
        },
        {
            id: '2',
            icon: DoneIcon,
            title: t('analytics.cards.tasksOnTime'),
            value: 8,
            iconSize: 28,
        },
        {
            id: '3',
            icon: ClockIcon,
            title: t('analytics.cards.tasksOverdue'),
            value: 2,
            iconSize: 28,
        },
        {
            id: '4',
            icon: LampIcon,
            title: t('analytics.cards.lowStock'),
            value: 5,
            iconSize: 28,
            iconFillColor: theme.colors.black60,
        },
    ];

    const companies = ['Все компании', 'ООО "Ромашка"', 'ИП Иванов', 'АО "Техно"'];
    const [selectedCompany, setSelectedCompany] = useState(companies[0]);

    // Состояния для календаря
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<{ start: string | null; end: string | null }>({
        start: null,
        end: null
    });

    // Форматируем дату в вид DD.MM.YY
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(2);
        return `${day}.${month}.${year}`;
    };

    // Обработчик сохранения периода
    const handleSavePeriod = (period: { start: string | null; end: string | null }) => {
        setSelectedPeriod(period);
        setCalendarVisible(false);
    };

    const GAP = 10;
    const numColumns = 2;

    const analyticRows = [];
    for (let i = 0; i < analyticCards.length; i += numColumns) {
        analyticRows.push(analyticCards.slice(i, i + numColumns));
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: 16,
            paddingBottom: 106
        },
        actionsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
        },
        actionsCompanySelection: {
            width: 160,
        },
        actionsPeriodSelection: {
            borderRadius: 8,
            backgroundColor: theme.colors.white100,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.black10,
            padding: selectedPeriod.start && selectedPeriod.end ? 12 : 16,
            paddingHorizontal: selectedPeriod.start && selectedPeriod.end ? 16 : 16,
            flexDirection: 'row',
            height: 56,
        },
        periodContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        periodTextContainer: {
            marginLeft: 8,
        },
        periodLabel: {
            ...textStyles.regular,
            fontSize: 12,
            color: theme.colors.black60,
        },
        periodValue: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
            marginTop: 2,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingHorizontal: 16,
        },
        modalTitle: {
            ...textStyles.semiBold,
            fontSize: 18,
            color: theme.colors.primaryText,
        },
        closeButton: {
            padding: 8,
        },
        analyticGrid: {
            marginTop: 24,
        },
        analyticRow: {
            flexDirection: 'row',
            marginBottom: GAP,
        },
        analyticCardWrapper: {
            flex: 1,
            marginRight: GAP,
        },
        lastCardInRow: {
            marginRight: 0,
        },
        emptyCardSlot: {
            flex: 1,
            marginRight: GAP,
        },
        calendarContainer: {
            paddingHorizontal: 16,
        },

        button: {
            marginTop: 8,
            backgroundColor: theme.colors.black10,
            borderRadius: 8,
            height: 56,
            justifyContent: 'center',
            alignItems: 'center',

        },
        buttonText: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        analyticsSection: {
            backgroundColor: theme.colors.white100,
            borderRadius: 16,
            paddingVertical: 16,
            marginTop: 24,
        },
        analyticsSectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.black20,
            paddingBottom: 12,
            paddingHorizontal: 16,
        },
        analyticsSectionIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.gray100,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        analyticsSectionTitle: {
            ...textStyles.semiBold,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        analyticsSectionSubtitle: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
        },
    });



    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Header
                title={t('analytics.title')}
                avatarImage="https://randomuser.me/api/portraits/men/22.jpg"
                helpButton
                helpButtonColor={theme.colors.black60}
                helpButtonBGroundColor={theme.colors.white100}
                helpButtonImage={<SearchIcon />}
                helpButtonOnPress={() => router.push('/search' as any)}
            />

            <View style={styles.actionsContainer}>
                <View style={styles.actionsCompanySelection}>
                    <Dropdown
                        value={selectedCompany}
                        items={companies}
                        onChange={setSelectedCompany}
                        width={160}
                        buttonStyle={{
                            backgroundColor: theme.colors.white100,
                            borderWidth: 1,
                            borderColor: theme.colors.black10,
                            borderRadius: 8,
                            height: 56,
                        }}
                        buttonTextStyle={{
                            ...textStyles.bold,
                            fontSize: 16,
                            color: theme.colors.primaryText,
                        }}
                        arrowStyle={{
                            stroke: theme.colors.black100,
                        }}
                        arrowWidth={24}
                        arrowHeight={24}
                    />
                </View>

                <TouchableOpacity
                    style={styles.actionsPeriodSelection}
                    activeOpacity={0.8}
                    onPress={() => setCalendarVisible(true)}
                >
                    {selectedPeriod.start && selectedPeriod.end ? (
                        <View style={styles.periodContainer}>
                            <CalendarIcon width={24} height={24} stroke={theme.colors.black100} />
                            <View style={styles.periodTextContainer}>
                                <Text style={styles.periodLabel}>Выбранный период</Text>
                                <Text style={styles.periodValue}>
                                    {formatDate(selectedPeriod.start)} - {formatDate(selectedPeriod.end)}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <CalendarIcon width={24} height={24} stroke={theme.colors.black100} />
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.analyticGrid}>
                {analyticRows.map((row, rowIndex) => (
                    <View key={`analytic-row-${rowIndex}`} style={styles.analyticRow}>
                        {row.map((card, index) => (
                            <View
                                key={card.id}
                                style={[
                                    styles.analyticCardWrapper,
                                    index === row.length - 1 ? styles.lastCardInRow : null
                                ]}
                            >
                                <AnalyticCard
                                    icon={card.icon}
                                    title={card.title}
                                    value={card.value}
                                    iconSize={card.iconSize}
                                    iconFillColor={card.iconFillColor}
                                    strokeWidth={card.strokeWidth}
                                    style={{}}
                                />
                            </View>
                        ))}
                        {row.length < numColumns && Array(numColumns - row.length).fill(0).map((_, index) => (
                            <View
                                key={`empty-${index}`}
                                style={[
                                    styles.emptyCardSlot,
                                    index === numColumns - row.length - 1 ? styles.lastCardInRow : null
                                ]}
                            />
                        ))}
                    </View>
                ))}
            </View>

            <ModalWindow
                visible={calendarVisible}
                onConfirm={() => {
                    if (selectedPeriod.start && selectedPeriod.end) {
                        setCalendarVisible(false);
                    }
                }}
                onCancel={() => setCalendarVisible(false)}
            >
                <CalendarWithPeriod
                    value={selectedPeriod}
                    onSave={handleSavePeriod}
                    onClose={() => setCalendarVisible(false)}
                />
            </ModalWindow>

            <View style={styles.analyticsSection}>
                <View style={styles.analyticsSectionHeader}>
                    <View style={styles.analyticsSectionIcon}>
                        <ClipboardIcon width={24} height={24} stroke={theme.colors.black100} />
                    </View>
                    <View>
                        <Text style={styles.analyticsSectionTitle}>{t('analytics.tasks.commonTasks')}</Text>
                        <Text style={styles.analyticsSectionSubtitle}>
                            {t('analytics.tasks.distributedByProjects', { count: 6 })}
                        </Text>
                    </View>
                </View>

                <View style={{ paddingHorizontal: 16 }}>
                    <ProfileStats data={tasksData} />
                </View>

                <View style={{ paddingHorizontal: 16 }}>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>{t('analytics.actions.viewTasks')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
