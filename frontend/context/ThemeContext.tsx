import { darkTheme, lightTheme, Theme } from "@/constants/themes";
import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext<Theme>(lightTheme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const theme = lightTheme ;

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};