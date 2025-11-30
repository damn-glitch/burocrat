import BoxIcon from '@/assets/images/icons/boxIcon.svg';
import CalendarIcon from '@/assets/images/icons/calendarIcon.svg';
import ClockIcon from '@/assets/images/icons/clockIcon.svg';
import LampIcon from '@/assets/images/icons/lampIcon.svg';
import NewspaperIcon from '@/assets/images/icons/newspaperIcon.svg';
import SearchIcon from '@/assets/images/icons/searchIcon.svg';
import WarningIcon from '@/assets/images/icons/warningIcon.svg';
import AnalyticCard from '@/components/analytics-components/analyticCard';
import CalendarWithPeriod from '@/components/common-components/calendarWithPeriod';
import Dropdown from '@/components/common-components/dropdown';
import Header from '@/components/common-components/header';
import ModalWindow from '@/components/common-components/modal';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Finances() {
    const theme = useTheme();
    const { t } = useTranslation();
    const router = useRouter();

    const companies = ['Все компании', 'ООО "Ромашка"', 'ИП Иванов', 'АО "Техно"', 'ТОО "Алтын KZ"'];
    const [selectedCompany, setSelectedCompany] = useState(companies[0]);

    const [calendarVisible, setCalendarVisible] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<{ start: string | null; end: string | null }>({
        start: null,
        end: null
    });

    // 💰 Мок-данные бюджета
    const [budgetData, setBudgetData] = useState({
        totalBudget: 3500000,
        remainingBudget: 2100000,
        spentBudget: 1400000,
        months: 4
    });

    // 📊 Мок-данные для круговой диаграммы
    const [expensesData, setExpensesData] = useState([
        {
            name: "Закупка товаров",
            percentage: 35,
            color: "#5CC575"
        },
        {
            name: "Аренда помещений",
            percentage: 20,
            color: "#EA4C4D"
        },
        {
            name: "Зарплата персонала",
            percentage: 30,
            color: "#F7AC3A"
        },
        {
            name: "Маркетинг",
            percentage: 10,
            color: "#4E8BED"
        },
        {
            name: "Логистика",
            percentage: 5,
            color: "#B57EDC"
        }
    ]);

    // 📰 Мок-данные для карточки обновления
    const [updateInfo, setUpdateInfo] = useState({
        date: '15 Октября',
        text: 'Прибыль увеличилась на 18% за сентябрь',
        isNew: true
    });

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(2);
        return `${day}.${month}.${year}`;
    };

    const handleSavePeriod = (period: { start: string | null; end: string | null }) => {
        setSelectedPeriod(period);
        setCalendarVisible(false);
    };

    // 📈 Мок-данные для карточек аналитики
    const financeCards = [
        {
            id: '1',
            icon: BoxIcon,
            title: t('finances.analyticCards.newOrders'),
            value: 312,
            iconSize: 28,
            trend: '+8% с прошлого месяца',
            trendUp: true,
            iconFillColor: 'transparent',
            iconStrokeColor: theme.colors.black100,
        },
        {
            id: '2',
            icon: CalendarIcon,
            title: t('finances.analyticCards.closedOrders'),
            value: 289,
            iconSize: 28,
            trend: '+5% с прошлого месяца',
            trendUp: true,
            iconFillColor: 'transparent',
            iconStrokeColor: theme.colors.black100,
        },
        {
            id: '3',
            icon: ClockIcon,
            title: t('finances.analyticCards.overdueTasks'),
            value: 14,
            iconSize: 28,
            strokeWidth: 2,
            trend: '-3% по сравнению с прошлым месяцем',
            trendUp: false,
        },
        {
            id: '4',
            icon: LampIcon,
            title: t('finances.analyticCards.lowStock'),
            value: 9,
            iconSize: 28,
            trend: '+2% за месяц',
            trendUp: true,
        },
    ];

    const GAP = 10;
    const numColumns = 2;

    const financeRows = [];
    for (let i = 0; i < financeCards.length; i += numColumns) {
        financeRows.push(financeCards.slice(i, i + numColumns));
    }

    const DonutChart = ({ data }: { data: typeof expensesData }) => {
        const SIZE = 120;
        const STROKE_WIDTH = 16;

        const totalPercentage = data.reduce((sum, item) => sum + item.percentage, 0);

        let currentAngle = 0;
        const segments = data.map((item) => {
            const angle = (item.percentage / totalPercentage) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            return { ...item, startAngle, angle };
        });

        return (
            <View style={{ width: SIZE, height: SIZE, position: 'relative' }}>
                {segments.map((segment, index) => (
                    <View
                        key={index}
                        style={{
                            position: 'absolute',
                            width: SIZE,
                            height: SIZE,
                            borderRadius: SIZE / 2,
                            borderWidth: STROKE_WIDTH,
                            borderColor: 'transparent',
                            borderRightColor: segment.angle > 90 && segment.angle <= 180 ? segment.color : 'transparent',
                            borderTopColor: segment.angle > 0 ? segment.color : 'transparent',
                            borderLeftColor: segment.angle > 270 ? segment.color : 'transparent',
                            borderBottomColor: segment.angle > 180 && segment.angle <= 270 ? segment.color : 'transparent',
                            transform: [{ rotate: `${segment.startAngle}deg` }]
                        }}
                    />
                ))}

                <View
                    style={{
                        position: 'absolute',
                        top: STROKE_WIDTH,
                        left: STROKE_WIDTH,
                        width: SIZE - STROKE_WIDTH * 2,
                        height: SIZE - STROKE_WIDTH * 2,
                        borderRadius: (SIZE - STROKE_WIDTH * 2) / 2,
                        backgroundColor: 'white',
                    }}
                />
            </View>
        );
    };

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
        analyticGrid: {
            marginTop: 24,
            marginBottom: 24,
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
        sectionTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.colors.primaryText,
            marginBottom: 12,
        },
        budgetCard: {
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
        },
        budgetLabel: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.black100,
            marginBottom: 4,
        },
        budgetAmount: {
            ...textStyles.bold,
            fontSize: 32,
            color: theme.colors.primaryText,
            marginBottom: 16,
        },
        progressBarContainer: {
            height: 16,
            backgroundColor: theme.colors.black10,
            borderRadius: 8,
            overflow: 'hidden',
        },
        progressBar: {
            height: '100%',
            backgroundColor: theme.colors.successText,
            borderRadius: 8,
        },
        budgetSpent: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.black60,
            marginTop: 16,
        },
        expensesCard: {
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
        },
        expensesContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        legendContainer: {
            flex: 1,
            marginLeft: 32,
            gap: 8,
        },
        legendItem: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        legendMarker: {
            width: 6,
            height: 12,
            marginRight: 8,
        },
        legendText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.secondaryText,
            flex: 1,
        },
        legendPercentage: {
            ...textStyles.semiBold,
            fontSize: 14,
            color: theme.colors.primaryText,
        },
        updateCard: {
            backgroundColor: theme.colors.successIcon,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 20,
            marginTop: 24,
        },
        updateHeader: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        updateIcon: {
            marginRight: 8,
            backgroundColor: theme.colors.white100,
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        updateTitle: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.white100,
        },
        updateDate: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.white80,
            marginTop: 16,
        },
        updateText: {
            ...textStyles.semiBold,
            fontSize: 24,
            color: theme.colors.white100,
            marginTop: 8,
        },
        warningCard: {
            borderWidth: 1,
            borderColor: theme.colors.redWarningBackground,
            borderRadius: 16,
            backgroundColor: theme.colors.white100,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            marginTop: 16,
        },
        warningIconWrap: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.redWarningBackground,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        warningText: {
            ...textStyles.semiBold,
            fontSize: 14,
            color: theme.colors.primaryText,
            flex: 1,
        },
    });

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Header
                title={t('finances.title')}
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
                        placeholder={t('finances.selectCompany')}
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
                                <Text style={styles.periodLabel}>{t('finances.periodLabel')}</Text>
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

            <View style={styles.updateCard}>
                <View style={styles.updateHeader}>
                    <View style={styles.updateIcon}>
                        <NewspaperIcon width={24} height={24} fill={theme.colors.successIcon} />
                    </View>
                    <Text style={styles.updateTitle}>{t('finances.updateTitle')}</Text>
                </View>
                <Text style={styles.updateDate}>{t('finances.updateDate', { date: updateInfo.date })}</Text>
                <Text style={styles.updateText}>{t('finances.updateText', { text: updateInfo.text })}</Text>
            </View>

            <View style={styles.analyticGrid}>
                {financeRows.map((row, rowIndex) => (
                    <View key={`finance-row-${rowIndex}`} style={styles.analyticRow}>
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
                                    strokeWidth={card.strokeWidth}
                                    iconFillColor={card.iconFillColor}
                                    iconStrokeColor={card.iconStrokeColor}
                                    trend={card.trend}
                                    trendUp={card.trendUp}
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

            <Text style={styles.sectionTitle}>{t('finances.budget.title')}</Text>
            <View style={styles.budgetCard}>
                <Text style={styles.budgetLabel}>
                    {t('finances.budget.label', { months: budgetData.months })}
                </Text>
                <Text style={styles.budgetAmount}>₸{budgetData.remainingBudget.toLocaleString()}</Text>

                <View style={styles.progressBarContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            { width: `${(budgetData.spentBudget / budgetData.totalBudget) * 100}%` }
                        ]}
                    />
                </View>

                <Text style={styles.budgetSpent}>
                    {t('finances.budget.spent', { amount: `₸${budgetData.spentBudget.toLocaleString()}` })}
                </Text>
            </View>

            <Text style={styles.sectionTitle}>{t('finances.expenses.title')}</Text>
            <View style={styles.expensesCard}>
                <View style={styles.expensesContent}>
                    <DonutChart data={expensesData} />

                    <View style={styles.legendContainer}>
                        {expensesData.map((item, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendMarker,
                                        { backgroundColor: item.color }
                                    ]}
                                />
                                <Text style={styles.legendText}>
                                    {t(`finances.expenses.legend.${item.name}`)}
                                </Text>
                                <Text style={styles.legendPercentage}>{item.percentage}%</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.warningCard}>
                <View style={styles.warningIconWrap}>
                    <WarningIcon width={24} height={24} fill={theme.colors.redWarningText} />
                </View>
                <Text style={styles.warningText}>
                    {t('finances.warning.logistics')}
                </Text>
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
        </ScrollView>
    );
}
