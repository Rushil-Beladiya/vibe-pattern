import { createContext, FC, ReactNode, useContext, useState } from "react";

interface ThemeContextProps {
  isDark: boolean;
  toggleTheme: () => void;
}

type ThemeType = "light" | "dark";

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<ThemeType>("light");

  const toggleTheme = () => {
    try {
      const updatedTheme = activeTheme === "light" ? "dark" : "light";
      setActiveTheme(updatedTheme);
    } catch (e) {
      console.log("Failed to save theme:", e);
    }
  };

  const isDark = activeTheme === "dark";

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
