export interface ThemeColors {
  background: string;
  primaryText: string;
  secondaryText: string;
  errorText: string;
  errorIcon: string;
  errorbackground: string;
  successText: string;
  successIcon: string;
  warningText: string;
  warningIcon: string;
  orangeWarningText: string;
  orangeWarningIcon: string;
  redWarningText: string;
  redWarningBackground: string;

  warning15: string;
  success5: string;

  blue: string;
  blue40: string;

  black100: string;
  black80: string;
  black60: string;
  black40: string;
  black20: string;
  black10: string;
  black5: string;

  white100: string;
  white80: string;
  white60: string;
  white40: string;
  whiteIcon: string;
  whiteIconBorder: string;

  gray100: string;
  gray80: string;
  gray60: string;
  gray40: string;
  gray20: string;
  gray10: string;
  gray5: string;

  skeleton: string;
}

export interface Theme {
  mode: "light" | "dark";
  colors: ThemeColors;
}

const lightTheme: Theme = {
  mode: "light",
  colors: {
    background: "#f1f3f2",
    primaryText: "#000000",
    secondaryText: "rgba(0, 0, 0, 0.6)",
    errorText: "#D70015",
    errorIcon: "#D70015",
    errorbackground: "rgba(255, 59, 48, 0.2)",
    successText: "#257851",
    successIcon: "#257851",
    warningText: "#FFD60A",
    warningIcon: "#FFD60A",
    orangeWarningText: "#FF9F0A",
    orangeWarningIcon: "#FF9F0A",
    redWarningText: "#F82215",
    redWarningBackground: "#F8221566",

    warning15: 'rgba(245, 158, 11, 0.15)',
    success5: "rgba(37, 120, 81, 0.1)",

    blue: "#0760FB",
    blue40: "rgba(7, 96, 251, 0.4)",

    // Вариации черного
    black100: "#000000",
    black80: "#0C0C0C",
    black60: "rgba(0, 0, 0, 0.6)",
    black40: "rgba(0, 0, 0, 0.4)",
    black20: "rgba(0, 0, 0, 0.2)",
    black10: "rgba(0, 0, 0, 0.1)",
    black5: "rgba(0, 0, 0, 0.05)",

    // Вариации белого
    white100: "#FFFFFF",
    white80: "rgba(255, 255, 255, 0.8)",
    white60: "rgba(255, 255, 255, 0.6)",
    white40: "rgba(255, 255, 255, 0.4)",
    whiteIcon: "#E4E8E6",
    whiteIconBorder: "#F1F3F2",

    gray100: "#F1F3F2",
    gray80: "#E4E8E6",
    gray60: "#CED4DA",
    gray40: "#A6B1B4",
    gray20: "#6C757D",
    gray10: "#495057",
    gray5: "#343A40",

    skeleton: "#b6b6b6ff",
  },
};

const darkTheme: Theme = {
  mode: "dark",
  colors: {
    background: "#121212",
    primaryText: "#FFFFFF",
    secondaryText: "rgba(255, 255, 255, 0.7)",
    errorText: "#D70015",
    errorIcon: "#D70015",
    errorbackground: "rgba(255, 59, 48, 0.4)",
    successText: "#257851",
    successIcon: "#257851",
    warningText: "#FFD60A",
    warningIcon: "#FFD60A",
    orangeWarningText: "#FF9F0A",
    orangeWarningIcon: "#FF9F0A",
    redWarningText: "#F82215",
    redWarningBackground: "#F8221566",

    warning15: 'rgba(245, 158, 11, 0.1)', 
    success5: "rgba(37, 120, 81, 0.1)",

    blue: "#0760FB",
    blue40: "rgba(7, 96, 251, 0.4)",

    black100: "#121212",
    black80: "#1E1E1E",
    black60: "#2C2C2C",
    black40: "#383838",
    black20: "#484848",
    black10: "#666666",
    black5: "#888888",

    white100: "#FFFFFF",
    white80: "rgba(255, 255, 255, 0.8)",
    white60: "rgba(255, 255, 255, 0.6)",
    white40: "rgba(255, 255, 255, 0.4)",
    whiteIcon: "#e4e8e6",
    whiteIconBorder: "##F1F3F2",

    gray100: "#F1F3F2",
    gray80: "#E4E8E6",
    gray60: "#CED4DA",
    gray40: "#A6B1B4",
    gray20: "#6C757D",
    gray10: "#495057",
    gray5: "#343A40",

    skeleton: "#b6b6b6ff",
  },
};

export { darkTheme, lightTheme };
