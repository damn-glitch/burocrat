import Svg, { Path, Rect } from 'react-native-svg';

export default function FileIcon({ extension }: { extension?: string }) {
    const ext = extension?.toLowerCase() ?? '';

    if (['png', 'jpg', 'jpeg', 'svg'].includes(ext)) {
        return (
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Rect x="2" y="2" width="20" height="20" rx="4" stroke="#4AA3F0" strokeWidth="2" />
                <Path d="M7 15L10 12L13 15L17 11" stroke="#4AA3F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M7 9H7.01" stroke="#4AA3F0" strokeWidth="2" strokeLinecap="round" />
            </Svg>
        );
    }

    if (ext === 'pdf') {
        return (
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Rect x="2" y="2" width="20" height="20" rx="4" stroke="#E63946" strokeWidth="2" />
                <Path d="M8 8H16M8 12H16M8 16H12" stroke="#E63946" strokeWidth="2" strokeLinecap="round" />
            </Svg>
        );
    }

    if (['doc', 'docx'].includes(ext)) {
        return (
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Rect x="2" y="2" width="20" height="20" rx="4" stroke="#4287FF" strokeWidth="2" />
                <Path d="M7 8H17V10H7V8ZM7 12H17V14H7V12ZM7 16H13V18H7V16Z" fill="#4287FF" />
            </Svg>
        );
    }

    return (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Rect x="2" y="2" width="20" height="20" rx="4" stroke="#999" strokeWidth="2" />
            <Path d="M8 8H16V16H8V8Z" stroke="#999" strokeWidth="2" />
        </Svg>
    );
};
