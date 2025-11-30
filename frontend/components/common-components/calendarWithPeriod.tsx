import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

type Period = { start: string | null; end: string | null };

type CalendarWithPeriodProps = {
    value: Period;
    onSave: (range: Period) => void;
    onClose: () => void;
}

export default function CalendarWithPeriod({ value, onSave, onClose }: CalendarWithPeriodProps) {
    const { t } = useTranslation();
    const [range, setRange] = useState<Period>(value);
    const [isSingleDay, setIsSingleDay] = useState<boolean>(false);
    const theme = useTheme();

    useEffect(() => {
        LocaleConfig.locales['ru'] = {
            monthNames: [
                t('calendar.months.january'),
                t('calendar.months.february'),
                t('calendar.months.march'),
                t('calendar.months.april'),
                t('calendar.months.may'),
                t('calendar.months.june'),
                t('calendar.months.july'),
                t('calendar.months.august'),
                t('calendar.months.september'),
                t('calendar.months.october'),
                t('calendar.months.november'),
                t('calendar.months.december')
            ],
            monthNamesShort: [
                t('calendar.monthsShort.jan'),
                t('calendar.monthsShort.feb'),
                t('calendar.monthsShort.mar'),
                t('calendar.monthsShort.apr'),
                t('calendar.monthsShort.may'),
                t('calendar.monthsShort.jun'),
                t('calendar.monthsShort.jul'),
                t('calendar.monthsShort.aug'),
                t('calendar.monthsShort.sep'),
                t('calendar.monthsShort.oct'),
                t('calendar.monthsShort.nov'),
                t('calendar.monthsShort.dec')
            ],
            dayNames: [
                t('calendar.days.sunday'),
                t('calendar.days.monday'),
                t('calendar.days.tuesday'),
                t('calendar.days.wednesday'),
                t('calendar.days.thursday'),
                t('calendar.days.friday'),
                t('calendar.days.saturday')
            ],
            dayNamesShort: [
                t('calendar.daysShort.sun'),
                t('calendar.daysShort.mon'),
                t('calendar.daysShort.tue'),
                t('calendar.daysShort.wed'),
                t('calendar.daysShort.thu'),
                t('calendar.daysShort.fri'),
                t('calendar.daysShort.sat')
            ],
            today: t('calendar.today')
        };
        LocaleConfig.defaultLocale = 'ru';
    }, [t]);

    useEffect(() => {
        setRange(value);
        if (value.start && value.end && value.start === value.end) {
            setIsSingleDay(true);
        } else {
            setIsSingleDay(false);
        }
    }, [value]);

    const handleDayPress = (day: { dateString: string }) => {
        if (!range.start || (range.start && range.end)) {
            setRange({ start: day.dateString, end: null });
            setIsSingleDay(false);
        } else if (range.start === day.dateString) {
            setRange({ start: day.dateString, end: day.dateString });
            setIsSingleDay(true);
        } else {
            const startDate = new Date(range.start!);
            const endDate = new Date(day.dateString);
            
            if (startDate.getTime() === endDate.getTime()) {
                setIsSingleDay(true);
            } else {
                if (startDate > endDate) {
                    setRange({ start: day.dateString, end: range.start });
                } else {
                    setRange({ ...range, end: day.dateString });
                }
                setIsSingleDay(false);
            }
        }
    };

    const markedDates: any = {};

    if (range.start && range.end && range.start === range.end) {
        markedDates[range.start] = { 
            selected: true, 
            color: theme.colors.black100, 
            textColor: theme.colors.white100 
        };
    } else {
        if (range.start) {
            markedDates[range.start] = { 
                startingDay: true, 
                color: theme.colors.black100, 
                textColor: theme.colors.white100 
            };
        }

        if (range.start && range.end) {
            markedDates[range.end] = { 
                endingDay: true, 
                color: theme.colors.black100, 
                textColor: theme.colors.white100 
            };

            let start = new Date(range.start);
            let end = new Date(range.end);
            if (start > end) {
                [start, end] = [end, start];
            }
            
            let current = new Date(start);
            current.setDate(current.getDate() + 1);
            
            while (current < end) {
                const d = current.toISOString().split('T')[0];
                if (d !== range.start && d !== range.end) {
                    markedDates[d] = { 
                        color: theme.colors.black10, 
                        textColor: theme.colors.black100 
                    };
                }
                current.setDate(current.getDate() + 1);
            }
        }
    }

    const styles = StyleSheet.create({
        calendarActionsContainer: {
            width: '100%',
            paddingTop: 24,
            paddingHorizontal: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopWidth: 1,
            borderTopColor: theme.colors.black40,
            marginTop: 16,
        },
        calendarActionClearButton: {
            height: 52,
            width: '38%',
            borderRadius: 8,
            backgroundColor: theme.colors.white100,
            borderWidth: 1,
            borderColor: theme.colors.black100,
            justifyContent: 'center',
            alignItems: 'center',
        },
        calendarActionClearButtonText: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.primaryText,
        },
        calendarActionSaveButton: {
            height: 52,
            width: '60%',
            borderRadius: 8,
            backgroundColor: theme.colors.black100,
            justifyContent: 'center',
            alignItems: 'center',
        },
        calendarActionSaveButtonText: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.white100,
        },
    });

    return (
        <>
            <View style={{ width: '100%', height: 370 }}>
                <Calendar
                    markingType={isSingleDay ? "dot" : "period"}
                    markedDates={markedDates}
                    onDayPress={handleDayPress}
                    theme={{
                        textDayFontFamily: 'System',
                        textDayHeaderFontFamily: 'System',
                        textDayHeaderFontWeight: 'bold',
                        textMonthFontFamily: 'System',
                        textMonthFontWeight: 'bold',
                        arrowColor: theme.colors.black100,
                        // Добавляем стиль для круглых выделений при одиночном выборе
                        dotColor: theme.colors.black100,
                        dotStyle: {
                            width: 6,
                            height: 6,
                        },
                        selectedDayBackgroundColor: theme.colors.black100,
                        selectedDayTextColor: theme.colors.white100,
                        todayTextColor: theme.colors.primaryText,
                        monthTextColor: theme.colors.primaryText,
                        dayTextColor: theme.colors.primaryText,
                        textDisabledColor: theme.colors.black40,
                        indicatorColor: theme.colors.primaryText,
                    }}
                    firstDay={1} 
                />
            </View>

            <View style={styles.calendarActionsContainer}>
                <TouchableOpacity
                    style={styles.calendarActionClearButton}
                    onPress={() => {
                        setRange({ start: null, end: null });
                        setIsSingleDay(false);
                        onSave({ start: null, end: null });
                        onClose();
                    }}
                >
                    <Text style={styles.calendarActionClearButtonText}>
                        {t('calendar.actions.clear')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.calendarActionSaveButton}
                    onPress={() => {
                        onSave(range);
                        onClose();
                    }}
                >
                    <Text style={styles.calendarActionSaveButtonText}>
                        {t('calendar.actions.save')}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
}
