import { Stack } from "expo-router"
import { useTheme } from '@/context/ThemeContext';

export default function AuthLayout() {
    const theme = useTheme();

    return (
        <Stack screenOptions={{
            headerShown: false,
            contentStyle: {
                backgroundColor: theme.colors.background,
            },
            animation: 'slide_from_right',
        }}>
            <Stack.Screen name="login" options={{ headerShown: false, title: "Вход", }} />
            <Stack.Screen name="register" options={{ headerShown: false, title: "Регистрация", }} />
            <Stack.Screen name="register/verificationCode" options={{ headerShown: false, title: "Верификация", }} />
            <Stack.Screen name="register/createPassword" options={{ headerShown: false, title: "Создание пароля", }} />

            <Stack.Screen name="forgotPassword" options={{ headerShown: false, title: "Забыли пароль?", }} />
        </Stack>
    );
}