import CloseIcon from '@/assets/images/icons/closeIcon.svg';
import CopyIcon from '@/assets/images/icons/copyIcon.svg';
import InfoIcon from '@/assets/images/icons/infoIcon.svg';
import Dropdown from '@/components/common-components/dropdown';
import Error from '@/components/common-components/error';
import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type Participant = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'Владелец' | 'Исполнитель' | 'Наблюдатель' | 'Администратор';
};

type Role = {
    value: string;
    permissions: string[];
};

type AddParticipantsModalProps = {
    visible: boolean;
    onClose: () => void;
    onAddParticipant?: (email: string, role: string) => void;
    companyParticipants: Participant[];
};

export default function AddParticipantsModal({
    visible,
    onClose,
    onAddParticipant,
    companyParticipants
}: AddParticipantsModalProps) {
    const theme = useTheme();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [participants, setParticipants] = useState(companyParticipants);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>(t('participants.roles.admin'));
    const [isInvited, setIsInvited] = useState(false);
    const [invitedUser, setInvitedUser] = useState<Participant | null>(null);
    const [emailError, setEmailError] = useState<string>('');

    const inputRef = useRef<TextInput>(null);

    const roles: Role[] = [
        { 
            value: t('participants.roles.admin'), 
            permissions: [
                t('participants.permissions.signing'), 
                t('participants.permissions.printing')
            ] 
        },
        { 
            value: t('participants.roles.owner'), 
            permissions: [
                t('participants.permissions.editing'), 
                t('participants.permissions.deleting')
            ] 
        },
        { 
            value: t('participants.roles.executor'), 
            permissions: [
                t('participants.permissions.editing'), 
                t('participants.permissions.commenting')
            ] 
        },
        { 
            value: t('participants.roles.observer'), 
            permissions: [
                t('participants.permissions.viewing')
            ] 
        }
    ];
    
    const rolesList = roles.map(role => role.value);
    const inviteLink = 'https://www.fygna.com/invite/123456';

    const getRolePermissions = (roleName: string): string[] => {
        const role = roles.find(r => r.value === roleName);
        return role ? role.permissions : [];
    };

    useEffect(() => {
        if (!visible) {
            setEmail('');
            setIsTyping(false);
            setIsInvited(false);
            setInvitedUser(null);
            setEmailError('');
        }
    }, [visible]);

    const handleEmailChange = (text: string) => {
        setEmail(text);
        
        if (emailError) {
            setEmailError('');
        }

        if (text.trim().length > 0 && !isTyping && !isInvited) {
            setIsTyping(true);
        } else if (text.trim().length === 0) {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        if (isTyping && inputRef.current) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [isTyping]);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError(t('participants.errors.invalidEmail'));
            return false;
        }
        
        if (participants.some(p => p.email.toLowerCase() === email.toLowerCase())) {
            setEmailError(t('participants.errors.duplicateEmail'));
            return false;
        }
        
        return true;
    };

    const handleSendInvite = () => {
        if (!email) {
            setEmailError(t('participants.errors.emptyEmail'));
            return;
        }

        if (!validateEmail(email)) {
            return;
        }

        const newParticipant: Participant = {
            id: Math.random().toString(),
            name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0].charAt(0)}&background=random`,
            role: selectedRole as any,
        };

        setParticipants([...participants, newParticipant]);

        setIsInvited(true);
        setInvitedUser(newParticipant);
        setIsTyping(false);

        if (onAddParticipant) {
            onAddParticipant(email, selectedRole);
        }
    };

    const handleChangeRole = (participantId: string, newRole: string) => {
        setParticipants(participants.map(p =>
            p.id === participantId ? { ...p, role: newRole as any } : p
        ));
    };

    const handleCopyLink = async () => {
        await Clipboard.setStringAsync(inviteLink);
        Alert.alert('Успешно', 'Ссылка скопирована в буфер обмена');
    };

    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            width: '90%',
            maxWidth: 400,
            maxHeight: '80%',
            backgroundColor: theme.colors.white100,
            borderRadius: 16,
            overflow: 'hidden',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 16,
        },
        headerTitle: {
            ...textStyles.semiBold,
            fontSize: 18,
            color: theme.colors.black100,
        },
        closeButton: {
            padding: 4,
        },
        subheader: {
            ...textStyles.regular,
            fontSize: 14,
            color: theme.colors.secondaryText,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.black10,
            borderStyle: "dashed"
        },
        formContainer: {
            paddingHorizontal: 16,
            paddingVertical: 16,
        },
        formLabel: {
            ...textStyles.regular,
            fontSize: 14,
            color: theme.colors.black100,
            marginBottom: 8,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        input: {
            height: 44,
            borderWidth: 1,
            borderColor: theme.colors.black20,
            borderRadius: 8,
            paddingHorizontal: 12,
            ...textStyles.regular,
            fontSize: 14,
            flex: 1,
            marginRight: 8,
        },
        sendButton: {
            backgroundColor: theme.colors.black100,
            borderRadius: 8,
            height: 44,
            paddingHorizontal: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        sendButtonText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.white100,
        },
        sentStatus: {
            backgroundColor: theme.colors.gray100,
            borderRadius: 8,
            height: 44,
            paddingHorizontal: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        sentStatusText: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.black100,
        },
        roleContainer: {
            marginBottom: 16,
        },
        permissionsContainer: {
            backgroundColor: '#E6F0FF',
            padding: 12,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        infoIcon: {
            marginRight: 8,
            marginTop: 2,
        },
        permissionsContent: {
            flex: 1,
        },
        permissionsTitle: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.black100,
            marginBottom: 4,
        },
        permissionsList: {
            marginLeft: 2,
        },
        permissionItem: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.black80,
            marginBottom: 2,
        },
        // Стили для первого экрана (список участников)
        inputContainer1: {
            flexDirection: 'row',
            padding: 16,
            borderTopWidth: 1,
            borderColor: theme.colors.black10,
            borderStyle: "dashed"
        },
        participantsHeader: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.black100,
            paddingHorizontal: 16,
        },
        participantsList: {
            paddingBottom: 8,
            maxHeight: 200,
        },
        participantItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 16,
        },
        avatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 12,
        },
        participantInfo: {
            flex: 1,
        },
        participantName: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.black100,
        },
        participantEmail: {
            ...textStyles.regular,
            fontSize: 12,
            color: theme.colors.secondaryText,
        },
        roleSelector: {
            minWidth: 120,
            backgroundColor: theme.colors.black5,
            borderRadius: 8,
        },
        linkContainer: {
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: theme.colors.black10,
            borderStyle: "dashed",
            
        },
        linkSection: {
            backgroundColor: theme.colors.black5,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 16,
        },
        linkTitle: {
            ...textStyles.medium,
            fontSize: 14,
            color: theme.colors.primaryText,
            marginBottom: 4,
        },
        linkDescription: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.secondaryText,
            marginBottom: 12,
        },
        linkBox: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        linkText: {
            ...textStyles.regular,
            fontSize: 14,
            color: theme.colors.black60,
            flex: 1,
            marginRight: 8,
            backgroundColor: theme.colors.white100,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 4,
            height: 40,
        },
        copyButton: {
            backgroundColor: theme.colors.white100,
            borderRadius: 4,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            height: 40,
            width: 120,
            justifyContent: 'center',
        },
        copyButtonText: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.black100,
            marginLeft: 4,
        },
        // Стили для третьего экрана (приглашенный пользователь)
        invitedSection: {
            paddingBottom: 16,
        },
        invitedHeader: {
            ...textStyles.medium,
            fontSize: 16,
            color: theme.colors.black100,
            marginBottom: 16,
            paddingHorizontal: 16,

        },
        roleChip: {
            backgroundColor: theme.colors.gray100,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
        },
        roleChipText: {
            ...textStyles.medium,
            fontSize: 12,
            color: theme.colors.black100,
        },
    });

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{t('participants.addModalTitle')}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <CloseIcon width={24} height={24} fill={theme.colors.black60} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subheader}>
                        {t('participants.addDescription')}
                    </Text>

                    {/* Экран 1: Начальное состояние */}
                    {!isTyping && !isInvited && (
                        <>
                            <View style={styles.inputContainer1}>
                                <TextInput
                                    style={[styles.input, emailError ? { borderColor: theme.colors.errorText } : {}]}
                                    placeholder={t('participants.emailPlaceholder')}
                                    value={email}
                                    onChangeText={handleEmailChange}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor={theme.colors.black60}
                                />
                                <TouchableOpacity
                                    style={styles.sendButton}
                                    onPress={handleSendInvite}
                                >
                                    <Text style={styles.sendButtonText}>
                                        {t('participants.sendButton')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            
                            {/* Отображение ошибки */}
                            {emailError ? (
                                <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                                    <Error error={emailError} />
                                </View>
                            ) : null}

                            <Text style={styles.participantsHeader}>
                                {t('participants.companyParticipants')}
                            </Text>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                style={styles.participantsList}>
                                {participants.map((participant) => (
                                    <View key={participant.id} style={styles.participantItem}>
                                        <Image
                                            source={{ uri: participant.avatar }}
                                            style={styles.avatar}
                                        />
                                        <View style={styles.participantInfo}>
                                            <Text style={styles.participantName}>{participant.name}</Text>
                                            <Text style={styles.participantEmail}>{participant.email}</Text>
                                        </View>

                                        <View style={styles.roleSelector}>
                                            <Dropdown
                                                value={participant.role}
                                                items={rolesList}
                                                onChange={(newRole) => handleChangeRole(
                                                    participant.id,
                                                    newRole
                                                )}
                                                width={130}
                                                buttonStyle={{ borderRadius: 8 }}
                                            />
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>

                            <View style={styles.linkContainer}>
                                <View style={styles.linkSection}>
                                    <Text style={styles.linkTitle}>{t('participants.linkTitle')}</Text>
                                    <Text style={styles.linkDescription}>
                                        {t('participants.linkDescription')}
                                    </Text>
                                    <View style={styles.linkBox}>
                                        <Text style={styles.linkText} numberOfLines={1}>
                                            {inviteLink}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.copyButton}
                                            onPress={handleCopyLink}
                                            activeOpacity={0.8}
                                        >
                                            <CopyIcon width={24} height={24} fill={theme.colors.black100} />
                                            <Text style={styles.copyButtonText}>{t('participants.copyButton')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}

                    {/* Экран 2: Выбор роли при вводе email */}
                    {isTyping && (
                        <View style={styles.formContainer}>
                            <Text style={styles.formLabel}>{t('participants.emailLabel')}</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    ref={inputRef}
                                    style={[styles.input, emailError ? { borderColor: theme.colors.errorText } : {}]}
                                    placeholder="Эл. почта"
                                    value={email}
                                    onChangeText={handleEmailChange}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoFocus={true}
                                />
                                <TouchableOpacity
                                    style={styles.sendButton}
                                    onPress={handleSendInvite}
                                >
                                    <Text style={styles.sendButtonText}>Отправить</Text>
                                </TouchableOpacity>
                            </View>
                            
                            {emailError ? (
                                <View style={{ marginBottom: 16 }}>
                                    <Error error={emailError} />
                                </View>
                            ) : null}

                            <Text style={styles.formLabel}>{t('participants.roleLabel')}</Text>
                            <View style={styles.roleContainer}>
                                <Dropdown
                                    value={selectedRole}
                                    items={rolesList}
                                    onChange={setSelectedRole}
                                    width={174}
                                    buttonStyle={{ backgroundColor: theme.colors.white100, borderWidth: 1, borderColor: theme.colors.black60, borderRadius: 8, height: 44, paddingHorizontal: 16 }}
                                />
                            </View>

                            <View style={styles.permissionsContainer}>
                                <InfoIcon width={16} height={16} style={styles.infoIcon} fill="#0760FB" />
                                <View style={styles.permissionsContent}>
                                    <Text style={styles.permissionsTitle}>
                                        {t('participants.permissionsHeader')}
                                    </Text>
                                    <View style={styles.permissionsList}>
                                        {getRolePermissions(selectedRole).map((permission, index) => (
                                            <Text key={index} style={styles.permissionItem}>
                                                • {permission}
                                            </Text>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Экран 3: После приглашения - список приглашенных пользователей */}
                    {isInvited && invitedUser && (
                        <View style={{ flex: 1 }}>
                            <View style={styles.formContainer}>
                                <Text style={styles.formLabel}>{t('participants.emailLabel')}</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={email}
                                        editable={false}
                                    />
                                    <View style={styles.sentStatus}>
                                        <Text style={styles.sentStatusText}>
                                            {t('participants.sentStatus')}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.invitedSection}>
                                <Text style={styles.invitedHeader}>
                                    {t('participants.invitedUserTitle')}
                                </Text>
                                <View style={styles.participantItem}>
                                    <Image
                                        source={{ uri: invitedUser.avatar }}
                                        style={styles.avatar}
                                    />
                                    <View style={styles.participantInfo}>
                                        <Text style={styles.participantName}>{invitedUser.name}</Text>
                                        <Text style={styles.participantEmail}>{invitedUser.email}</Text>
                                    </View>
                                    <View style={styles.roleChip}>
                                        <Text style={styles.roleChipText}>Админ</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}