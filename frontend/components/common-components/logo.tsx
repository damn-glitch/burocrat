import { textStyles } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Text, TouchableOpacity, View } from "react-native";
import ArrowLeftIcon from '@/assets/images/icons/arrowLeftIcon.svg';

type LogoProps = {
    backButton?: boolean;
}

export default function Logo({ backButton }: LogoProps) {
    const theme = useTheme();
    const navigation = useNavigation();

    return (
        <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
            {backButton && (
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        backgroundColor: theme.colors.black100,
                        position: 'absolute',
                        left: 0,
                        top: 8,
                        padding: 4,
                        borderRadius: 50,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                    }}
                    accessibilityLabel="Назад"
                    activeOpacity={0.8}
                >

                    <ArrowLeftIcon width={8} height={16} stroke={theme.colors.white100} />

                </TouchableOpacity>
            )}
            <Text style={{ color: theme.colors.primaryText, ...textStyles.bold, fontSize: 32 }}>burocrat</Text>
        </View>
    );
}