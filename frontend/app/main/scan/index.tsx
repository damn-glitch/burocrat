import Header from '@/components/common-components/header';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import {
	Dimensions,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScan } from './scanContext';

export default function ScanCameraScreen() {
	const theme = useTheme();
	const router = useRouter();
	type CameraHandle = React.ComponentRef<typeof CameraView>;

	const { addPage } = useScan();
	const [permission, requestPermission] = useCameraPermissions();
	const cameraRef = useRef<CameraHandle | null>(null);
	const { width } = Dimensions.get('window');
	const frameWidth = width * 0.82;
	const frameAspectRatio = 1.28;


	const styles = StyleSheet.create({
		container: {
			flex: 1,
		},
		cameraContainer: {
			flex: 1,
			position: 'relative',
		},
		overlay: {
			...StyleSheet.absoluteFillObject,
			justifyContent: 'space-between',
		},
		overlayTop: {
			flex: 1,
			backgroundColor: theme.colors.black60,
		},
		overlayMiddle: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			flex: 2,
		},
		overlayBottom: {
			flex: 1.2,
			backgroundColor: theme.colors.black60,
		},
		overlaySide: {
			flex: 1,
			height: '100%',
			backgroundColor: theme.colors.black60,
		},
		frameArea: {
			justifyContent: 'center',
			alignItems: 'center',
		},
		frameBox: {
			width: '100%',
			position: 'relative',
		},
		corner: {
			position: 'absolute',
			width: 54,
			height: 54,
			borderColor: theme.colors.white100,
		},
		
		captionContainer: {
			position: 'absolute',
			bottom: 110,
			left: 24,
			right: 24,
			alignItems: 'center',
			gap: 8,
		},
		captionTitle: {
			...textStyles.semiBold,
			fontSize: 16,
			textAlign: 'center',
		},
		captionText: {
			...textStyles.medium,
			fontSize: 14,
			textAlign: 'center',
		},
		scanButton: {
			position: 'absolute',
			left: 24,
			right: 24,
			bottom: 32,
			paddingVertical: 18,
			borderRadius: 28,
			justifyContent: 'center',
			alignItems: 'center',
		},
		scanButtonText: {
			...textStyles.semiBold,
			fontSize: 16,
		},
		permissionContent: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
			gap: 16,
			paddingHorizontal: 24,
		},
		permissionTitle: {
			...textStyles.semiBold,
			fontSize: 18,
		},
		permissionSubtitle: {
			...textStyles.medium,
			fontSize: 14,
			textAlign: 'center',
		},
	});

	useEffect(() => {
		if (!permission) {
			requestPermission();
		}
	}, [permission, requestPermission]);

	const handleScan = useCallback(async () => {
		if (!cameraRef.current) return;

		try {
			const capture = await cameraRef.current.takePictureAsync({
				skipProcessing: true,
				quality: 1,
			});

			if (!capture) {
				console.warn('Не удалось получить изображение с камеры');
				return;
			}

			const info = await FileSystem.getInfoAsync(capture.uri, { size: true });
			const size = info.exists && typeof info.size === 'number' ? info.size : 0;

			addPage({
				uri: capture.uri,
				size,
				capturedAt: new Date().toISOString(),
			});

			router.push('/main/scan/preview');
		} catch (error) {
			console.warn('Ошибка при сканировании документа', error);
		}
	}, [addPage, router]);

	if (!permission) {
		return null;
	}

	if (!permission.granted) {
		return (
			<SafeAreaView style={[styles.container, { backgroundColor: theme.colors.white100 }]}>
				<Header
					title="Скан"
					backButton
					backButtonColor={theme.colors.black100}
					backButtonBGroundColor={theme.colors.white100}
					backGroundColor={theme.colors.white100}
					titleFontSize={20}
				/>
				<View style={styles.permissionContent}>
					<Text style={[styles.permissionTitle, { color: theme.colors.primaryText }]}>Доступ к камере</Text>
					<Text style={[styles.permissionSubtitle, { color: theme.colors.secondaryText }]}>
						Чтобы отсканировать документ, разрешите доступ к камере.
					</Text>
					<TouchableOpacity
						style={[styles.scanButton, { backgroundColor: theme.colors.black100 }]}
						onPress={requestPermission}
						activeOpacity={0.9}
					>
						<Text style={[styles.scanButtonText, { color: theme.colors.white100 }]}>Разрешить</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.colors.black100 }]}>
			<Header
				title="Скан"
				backButton
				backButtonColor={theme.colors.black100}
				backButtonBGroundColor={theme.colors.white100}
				backGroundColor={theme.colors.white100}
				titleFontSize={20}
			/>
			<View style={styles.cameraContainer}>
				<CameraView
					ref={cameraRef}
					style={StyleSheet.absoluteFill}
					facing="back"
					ratio="4:3"
				/>
				<View pointerEvents="none" style={styles.overlay}>
					<View style={styles.overlayTop} />
					<View style={styles.overlayMiddle}>
						<View style={styles.overlaySide} />
						<View style={[styles.frameArea, { width: frameWidth }]}>
							<View style={[styles.frameBox, { borderRadius: 20, aspectRatio: frameAspectRatio }]}>
							</View>
						</View>
						<View style={styles.overlaySide} />
					</View>
					<View style={styles.overlayBottom} />
				</View>

				<View style={styles.captionContainer}>
					<Text style={[styles.captionTitle, { color: theme.colors.white100 }]}>Пожалуйста убедитесь.</Text>
					<Text style={[styles.captionText, { color: theme.colors.white100 }]}>
						Текст хорошо виден, ничего не перекрывает документ, виден весь документ.
					</Text>
				</View>

				<TouchableOpacity
					style={[styles.scanButton, { backgroundColor: theme.colors.white100 }]}
					onPress={handleScan}
					activeOpacity={0.9}
				>
					<Text style={[styles.scanButtonText, { color: theme.colors.black100 }]}>Сканировать</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

