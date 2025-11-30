import ArrowLeftIcon from '@/assets/images/icons/arrowLeftIcon.svg';
import DownloadIcon from '@/assets/images/icons/downloadIcon.svg';
import FolderIcon from '@/assets/images/icons/folderIcon.svg';
import SaveIcon from '@/assets/images/icons/saveIcon.svg';
import SearchIcon from '@/assets/images/icons/searchIcon.svg';
import SuccessIcon from '@/assets/images/icons/successIcon.svg';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScan } from './scanContext';

const LOCATION_SUGGESTIONS = [
	'Tleu Agency',
	'Tleu Agency → Burokrat App Design',
	'Tleu Agency → Another Project',
	'Tleu Agency → Новая папка',
];

export default function ScanDetailsScreen() {
	const theme = useTheme();
	const router = useRouter();
	const {
		pages,
		totalSizeMb,
		createdAt,
		fileName,
		setFileName,
		status,
		startSaving,
		completeSave,
		selectedLocation,
		resetSaveState,
	} = useScan();
	const [showLocationPicker, setShowLocationPicker] = useState(false);
	const [searchValue, setSearchValue] = useState('');
	const searchInputRef = useRef<TextInput>(null);

	useEffect(() => {
		if (!pages.length) {
			router.replace('/main/scan');
		}
	}, [pages.length, router]);

	useEffect(() => {
		if (showLocationPicker) {
			const timer = setTimeout(() => searchInputRef.current?.focus(), 80);
			return () => clearTimeout(timer);
		}
	}, [showLocationPicker]);

	const filteredLocations = useMemo(() => {
		if (!searchValue.trim()) return LOCATION_SUGGESTIONS;
		return LOCATION_SUGGESTIONS.filter((item) =>
			item.toLowerCase().includes(searchValue.toLowerCase()),
		);
	}, [searchValue]);

	const handleBack = () => {
		router.back();
	};

	const handleRequestSave = () => {
		resetSaveState();
		if (!showLocationPicker) {
			setShowLocationPicker(true);
		} else {
			searchInputRef.current?.focus();
		}
		setSearchValue('');
	};

	const handleLocationSelect = (location: string) => {
		startSaving();
		setTimeout(() => {
			completeSave(location);
			setSearchValue('');
			setShowLocationPicker(true);
		}, 500);
	};

	const handleDownload = () => {
		startSaving();
		setTimeout(() => {
			completeSave('На устройство');
			setShowLocationPicker(false);
		}, 500);
	};

	const styles = StyleSheet.create({
		root: {
			flex: 1,
		},
		topBar: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 16,
			paddingTop: 8,
			paddingBottom: 16,
		},
		circleButton: {
			width: 48,
			height: 48,
			borderRadius: 24,
			borderWidth: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: theme.colors.white100,
		},
		topBarTitle: {
			...textStyles.semiBold,
			fontSize: 20,
		},
		topBarPlaceholder: {
			width: 48,
		},
		infoCard: {
			borderWidth: 1,
			borderRadius: 20,
			padding: 20,
			marginBottom: 24,
		},
		sectionTitle: {
			...textStyles.semiBold,
			fontSize: 18,
			marginBottom: 16,
		},
		infoRows: {
			gap: 12,
		},
		infoRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		infoLabel: {
			...textStyles.medium,
			fontSize: 14,
		},
		infoValue: {
			...textStyles.semiBold,
			fontSize: 14,
		},
		previewButton: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			marginTop: 20,
			paddingVertical: 14,
			paddingHorizontal: 16,
			borderWidth: 1,
			borderRadius: 12,
		},
		previewButtonText: {
			...textStyles.semiBold,
			fontSize: 16,
		},
		inputBlock: {
			marginBottom: 24,
		},
		inputLabel: {
			...textStyles.medium,
			fontSize: 14,
			marginBottom: 8,
		},
		textInput: {
			...textStyles.medium,
			fontSize: 16,
			borderRadius: 12,
			borderWidth: 1,
			paddingHorizontal: 16,
			paddingVertical: 16,
		},
		actionsTitle: {
			...textStyles.medium,
			fontSize: 14,
			marginBottom: 12,
		},
		actions: {
			gap: 12,
		},
		primaryButton: {
			paddingVertical: 18,
			borderRadius: 16,
		},
		primaryButtonText: {
			...textStyles.semiBold,
			fontSize: 16,
		},
		outlinedButton: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			paddingVertical: 16,
			borderWidth: 1,
			borderRadius: 16,
		},
		outlinedButtonText: {
			...textStyles.semiBold,
			fontSize: 16,
		},
		searchContainer: {
			position: 'relative',
			marginBottom: 12,
		},
		searchIcon: {
			position: 'absolute',
			left: 16,
			top: 18,
		},
		searchInput: {
			paddingLeft: 48,
		},
		locationList: {
			gap: 12,
		},
		locationItem: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			paddingVertical: 16,
			paddingHorizontal: 16,
			borderWidth: 1,
			borderRadius: 16,
		},
		locationText: {
			...textStyles.medium,
			fontSize: 16,
			flex: 1,
		},
		successCard: {
			marginTop: 24,
			padding: 16,
			borderRadius: 16,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
		},
		successIconWrapper: {
			width: 40,
			height: 40,
			borderRadius: 20,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: 'rgba(37, 120, 81, 0.12)',
		},
		successTitle: {
			...textStyles.semiBold,
			fontSize: 16,
			marginBottom: 4,
		},
		successSubtitle: {
			...textStyles.medium,
			fontSize: 14,
		},
	});


	return (
		<SafeAreaView style={[styles.root, { backgroundColor: theme.colors.white100 }]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
			>
				<View style={styles.topBar}>
					<TouchableOpacity
						style={[styles.circleButton, { borderColor: theme.colors.black20 }]}
						onPress={handleBack}
						activeOpacity={0.8}
					>
						<ArrowLeftIcon width={12} height={20} stroke={theme.colors.black100} />
					</TouchableOpacity>
					<Text style={[styles.topBarTitle, { color: theme.colors.primaryText }]}>Результат сканирования</Text>
					<View style={styles.topBarPlaceholder} />
				</View>

				<ScrollView
					contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<View style={[styles.infoCard, { borderColor: theme.colors.black20, backgroundColor: theme.colors.white100 }]}>
						<Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>Результат сканирования</Text>
						<View style={styles.infoRows}>
							<View style={styles.infoRow}>
								<Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>Формат</Text>
								<Text style={[styles.infoValue, { color: theme.colors.primaryText }]}>PDF</Text>
							</View>
							<View style={styles.infoRow}>
								<Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>Размер</Text>
								<Text style={[styles.infoValue, { color: theme.colors.primaryText }]}>{totalSizeMb.toFixed(2)} МБ</Text>
							</View>
							<View style={styles.infoRow}>
								<Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>Страниц</Text>
								<Text style={[styles.infoValue, { color: theme.colors.primaryText }]}>{pages.length}</Text>
							</View>
							<View style={styles.infoRow}>
								<Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>Создан</Text>
								<Text style={[styles.infoValue, { color: theme.colors.primaryText }]}>{createdAt}</Text>
							</View>
						</View>
						<TouchableOpacity style={[styles.previewButton, { borderColor: theme.colors.black20 }]} activeOpacity={0.85}>
							<SaveIcon width={20} height={20} stroke={theme.colors.black100} />
							<Text style={[styles.previewButtonText, { color: theme.colors.primaryText }]}>Предпросмотр PDF</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.inputBlock}>
						<Text style={[styles.inputLabel, { color: theme.colors.secondaryText }]}>Название файла</Text>
						<TextInput
							style={[
								styles.textInput,
								{
									borderColor: theme.colors.black20,
									color: theme.colors.primaryText,
									backgroundColor: theme.colors.white100,
								},
							]}
							placeholder="Название файла"
							placeholderTextColor={theme.colors.secondaryText}
							value={fileName}
							onChangeText={setFileName}
						/>
					</View>

					<Text style={[styles.actionsTitle, { color: theme.colors.secondaryText }]}>Действия</Text>

					<View style={styles.actions}>
						<TouchableOpacity
							style={[
								styles.primaryButton,
								{
									backgroundColor: theme.colors.black100,
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'center',
									gap: 8,
								},
							]}
							onPress={handleRequestSave}
							activeOpacity={0.9}
						>
							<SaveIcon width={20} height={20} stroke={theme.colors.white100} />
							<Text style={[styles.primaryButtonText, { color: theme.colors.white100 }]}>
								{status === 'saving' ? 'Сохранение…' : 'Сохранить'}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.outlinedButton,
								{ borderColor: theme.colors.black100, backgroundColor: theme.colors.white100 },
							]}
							onPress={handleDownload}
							activeOpacity={0.9}
						>
							<DownloadIcon width={20} height={20} stroke={theme.colors.black100} />
							<Text style={[styles.outlinedButtonText, { color: theme.colors.black100 }]}>
								{status === 'saving' ? 'Подготовка…' : 'Скачать файл'}
							</Text>
						</TouchableOpacity>
					</View>

					{(showLocationPicker || status === 'saving') && (
						<>
							<Text style={[styles.inputLabel, { color: theme.colors.secondaryText, marginTop: 24 }]}>
								Сохранить документ в…
							</Text>
							<View style={styles.searchContainer}>
								<SearchIcon width={20} height={20} fill={theme.colors.black60} style={styles.searchIcon} />
								<TextInput
									ref={searchInputRef}
									style={[
										styles.textInput,
										styles.searchInput,
										{
											borderColor: theme.colors.black20,
											color: theme.colors.primaryText,
											backgroundColor: theme.colors.white100,
										},
									]}
									placeholder="Сохранить документ в…"
									placeholderTextColor={theme.colors.secondaryText}
									value={searchValue}
									onChangeText={setSearchValue}
									autoFocus={showLocationPicker}
									returnKeyType="done"
								/>
							</View>
							<View style={styles.locationList}>
								{filteredLocations.map((location) => {
									const isSelected = selectedLocation === location;
									return (
										<TouchableOpacity
											key={location}
											style={[
												styles.locationItem,
												{
													borderColor: isSelected ? theme.colors.black100 : theme.colors.black10,
													backgroundColor: isSelected ? theme.colors.black5 : theme.colors.white100,
												},
											]}
											onPress={() => handleLocationSelect(location)}
											activeOpacity={0.85}
											disabled={status === 'saving'}
										>
											<FolderIcon width={20} height={20} stroke={theme.colors.black100} />
											<Text style={[styles.locationText, { color: theme.colors.primaryText }]} numberOfLines={2}>
												{location}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</>
					)}

					{status === 'saved' && selectedLocation && (
						<View style={[styles.successCard, { backgroundColor: theme.colors.success5 }]}>
							<View style={styles.successIconWrapper}>
								<SuccessIcon width={20} height={20} />
							</View>
							<View style={{ flex: 1 }}>
								<Text style={[styles.successTitle, { color: theme.colors.primaryText }]}>Файл сохранен</Text>
								<Text style={[styles.successSubtitle, { color: theme.colors.secondaryText }]}>
									{selectedLocation}
								</Text>
							</View>
						</View>
					)}
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

