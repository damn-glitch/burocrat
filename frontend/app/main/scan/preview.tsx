import ArrowLeftIcon from '@/assets/images/icons/arrowLeftIcon.svg';
import DeleteIcon from '@/assets/images/icons/deleteIcon.svg';
import PlusIcon from '@/assets/images/icons/plusIcon.svg';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import {
	Dimensions,
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScannedPage, useScan } from './scanContext';

export default function ScanPreviewScreen() {
	const theme = useTheme();
	const router = useRouter();
	const { pages, removePage, currentIndex, setCurrentIndex } = useScan();
	const listRef = useRef<FlatList<ScannedPage>>(null);
	const { width } = Dimensions.get('window');

	useEffect(() => {
		if (!pages.length) {
			router.replace('/main/scan');
		}
	}, [pages.length, router]);

	useEffect(() => {
		if (listRef.current && currentIndex < pages.length) {
			listRef.current.scrollToIndex({ index: currentIndex, animated: false });
		}
	}, [currentIndex, pages.length]);

	const handleAddPage = useCallback(() => {
		router.push('/main/scan');
	}, [router]);

	const handleDelete = useCallback(
		(index: number) => {
			removePage(index);
		},
		[removePage],
	);

	const handleDone = useCallback(() => {
		router.push('/main/scan/details');
	}, [router]);

	const handleBack = useCallback(() => {
		router.back();
	}, [router]);

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			paddingBottom: 24,
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
		topBarCenter: {
			alignItems: 'center',
		},
		topBarTitle: {
			...textStyles.semiBold,
			fontSize: 20,
		},
		topBarSubtitle: {
			...textStyles.medium,
			fontSize: 14,
			marginTop: 4,
		},
		topBarPlaceholder: {
			width: 48,
		},
		pageWrapper: {
			flex: 1,
			paddingHorizontal: 32,
			justifyContent: 'center',
			alignItems: 'center',
		},
		page: {
			width: '100%',
			height: '100%',
			borderRadius: 20,
		},
		deleteButton: {
			position: 'absolute',
			top: 40,
			right: 40,
			width: 44,
			height: 44,
			borderRadius: 22,
			justifyContent: 'center',
			alignItems: 'center',
		},
		actions: {
			paddingHorizontal: 16,
			gap: 12,
		},
		secondaryButton: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			paddingVertical: 16,
			borderWidth: 1,
			borderRadius: 16,
			backgroundColor: theme.colors.white100,
		},
		secondaryButtonText: {
			...textStyles.semiBold,
			fontSize: 16,
		},
		primaryButton: {
			paddingVertical: 18,
			borderRadius: 16,
			alignItems: 'center',
			justifyContent: 'center',
		},
		primaryButtonText: {
			...textStyles.semiBold,
			fontSize: 16,
		},
	});

	const renderTopBar = () => (
		<View style={styles.topBar}>
			<TouchableOpacity
				style={[styles.circleButton, { borderColor: theme.colors.black20 }]}
				onPress={handleBack}
				activeOpacity={0.8}
			>
				<ArrowLeftIcon width={12} height={20} stroke={theme.colors.black100} />
			</TouchableOpacity>
			<View style={styles.topBarCenter}>
				<Text style={[styles.topBarTitle, { color: theme.colors.primaryText }]}>Предпросмотр</Text>
				<Text style={[styles.topBarSubtitle, { color: theme.colors.secondaryText }]}>
					{pages.length ? `${currentIndex + 1}/${pages.length}` : '0/0'}
				</Text>
			</View>
			<View style={styles.topBarPlaceholder} />
		</View>
	);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.colors.white100 }]}>
			{renderTopBar()}

			<FlatList
				ref={listRef}
				data={pages}
				keyExtractor={(item) => item.uri}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				style={{ flexGrow: 0, flex: 1 }}
				renderItem={({ item, index }) => (
					<View style={[styles.pageWrapper, { width }]}>
						<Image source={{ uri: item.uri }} style={styles.page} resizeMode="cover" />
						<TouchableOpacity
							style={[styles.deleteButton, { backgroundColor: theme.colors.black100 }]}
							onPress={() => handleDelete(index)}
							activeOpacity={0.85}
						>
							<DeleteIcon width={18} height={18} stroke={theme.colors.white100} />
						</TouchableOpacity>
					</View>
				)}
				onMomentumScrollEnd={(event) => {
					const index = Math.round(event.nativeEvent.contentOffset.x / width);
					setCurrentIndex(index);
				}}
				contentContainerStyle={{ alignItems: 'center' }}
			/>

			<View style={styles.actions}>
				<TouchableOpacity
					style={[styles.secondaryButton, { borderColor: theme.colors.black20 }]}
					onPress={handleAddPage}
					activeOpacity={0.85}
				>
					<PlusIcon width={18} height={18} stroke={theme.colors.black100} />
					<Text style={[styles.secondaryButtonText, { color: theme.colors.primaryText }]}>Добавить страницу</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.primaryButton, { backgroundColor: theme.colors.black100 }]}
					onPress={handleDone}
					activeOpacity={0.9}
				>
					<Text style={[styles.primaryButtonText, { color: theme.colors.white100 }]}>Готово</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}


