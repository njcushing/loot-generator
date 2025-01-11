import { createContext, useState, useEffect, useMemo } from "react";
import {
    TOptionName,
    themeSetter,
    saveTheme,
    loadTheme,
    TTheme,
    IThemeState,
    defaultState,
} from "./utils/themeHelperFuncs";
import "./index.css";

export const ThemeContext = createContext<IThemeState>(defaultState);

export function Theme({ children }: TTheme) {
    const [theme, setTheme] = useState<TOptionName>(loadTheme().theme);

    useEffect(() => {
        themeSetter(theme);
        saveTheme(theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={useMemo(() => ({ theme, setTheme }), [theme, setTheme])}>
            {children}
        </ThemeContext.Provider>
    );
}
