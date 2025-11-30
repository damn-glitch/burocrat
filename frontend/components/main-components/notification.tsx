import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type NotificationProps = {
	type?: string;
	avatar?: string;
	user?: string;
	text: string;
	project?: string;
	company?: string;
	createdAt?: string;
	isRequest?: boolean;
	onAccept?: () => void;
	onDecline?: () => void;
	onPress?: () => void;
}

export default function Notification({
	type,
	avatar,
	user,
	text,
	project,
	company,
	createdAt,
	isRequest,
	onAccept,
	onDecline,
	onPress,
}: NotificationProps) {
	const theme = useTheme();

	const styles = StyleSheet.create({
		container: {
			flexDirection: 'row',
			alignItems: 'center',
			padding: 16,
			backgroundColor: isRequest ? theme.colors.whiteIconBorder : theme.colors.white100,
		},
		textContainer: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			alignItems: 'center',
			marginBottom: 2
		},
		avatar: {
			width: 56,
			height: 56,
			borderRadius: 56,
			marginRight: 16,
			backgroundColor: theme.colors.whiteIcon,
		},
		content: {
			flex: 1,
		},
		user: {
			...textStyles.medium,
			fontSize: 16,
			color: theme.colors.black100,
		},
		text: {
			...textStyles.medium,
			fontSize: 16,
			color: theme.colors.black60,
		},
		project: {
			...textStyles.semiBold,
			fontSize: 16,
			color: theme.colors.blue,
		},
		actions: {
			flexDirection: 'row',
			marginTop: 8,
			gap: 8,
			justifyContent: "center",
			alignItems: 'center',
			width: '100%',
		},
		button: {
			borderRadius: 8,
			height: 56
		},
		accept: {
			flex: 1,
			backgroundColor: theme.colors.blue,
			justifyContent: "center",
			alignItems: 'center',
		},
		decline: {
			flex: 1,
			backgroundColor: theme.colors.white100,
			justifyContent: "center",
			alignItems: 'center',
			borderWidth: 1,
			borderColor: theme.colors.black20,
		},
		declineButtonText: {
			...textStyles.medium,
			fontSize: 16,
			color: theme.colors.black100,
		},
		acceptButtonText: {
			...textStyles.medium,
			fontSize: 16,
			color: theme.colors.white100,
		},
		meta: {
			...textStyles.medium,
			fontSize: 14,
			color: theme.colors.black60,
			marginTop: 2,
		},
	});

	return (
		<TouchableOpacity
			style={styles.container}
			activeOpacity={isRequest ? 1 : 0.7}
			onPress={!isRequest ? onPress : undefined}
		>
			{avatar && <Image source={{ uri: avatar }} style={styles.avatar} />}
			<View style={styles.content}>

				<View style={styles.textContainer}>
					{user && <Text style={styles.user}>{user} </Text>}
					<Text style={styles.text}>{text} </Text>
					{project && <Text style={styles.project}>{project}</Text>}
				</View>

				{(createdAt || company) && (
					<Text style={styles.meta}>
						{createdAt ? `${createdAt}` : ''}
						{createdAt && company ? ' · ' : ''}
						{company ? `${company}` : ''}
					</Text>
				)}

				{isRequest && (
					<View style={styles.actions}>
						<TouchableOpacity style={[styles.button, styles.decline]} onPress={onDecline} activeOpacity={0.7}>
							<Text style={styles.declineButtonText}>Отклонить</Text>
						</TouchableOpacity>

						<TouchableOpacity style={[styles.button, styles.accept]} onPress={onAccept} activeOpacity={0.7}>
							<Text style={styles.acceptButtonText}>Принять</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>
		</TouchableOpacity>
	);
}