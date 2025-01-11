export const options = () =>
    [
        { name: "default", colour: "#d5ebec" },
        { name: "light", colour: "#fff" },
        { name: "dark", colour: "#242424" },
    ] as const;

export type TOptionName = ReturnType<typeof options>[number]["name"];

export const themeSetter = (theme: TOptionName) => {
    let mutableTheme = options()
        .map((option) => option.name as TOptionName)
        .includes(theme)
        ? theme
        : "default";
    if (mutableTheme === "default") {
        const prefersDarkColorScheme = window.matchMedia("(prefers-color-scheme: dark)");
        mutableTheme = prefersDarkColorScheme.matches ? "dark" : "light";
    }
    const root = document.querySelector(":root");
    if (root !== null) root.setAttribute("theme", mutableTheme);
};

export const saveTheme = (theme: string) => {
    if (
        options()
            .map((option) => option.name as string)
            .includes(theme)
    ) {
        localStorage.setItem(`${import.meta.env.LOCALSTORAGE_PREFIX}-theme`, theme);
    } else {
        localStorage.setItem(`${import.meta.env.LOCALSTORAGE_PREFIX}-theme`, defaultState.theme);
    }
};

export const loadTheme = (): {
    theme: TOptionName;
} => {
    let theme =
        localStorage.getItem(`${import.meta.env.LOCALSTORAGE_PREFIX}-theme`) || defaultState.theme;
    if (
        !options()
            .map((option) => option.name as string)
            .includes(theme)
    ) {
        theme = defaultState.theme;
    }
    return {
        theme: theme as TOptionName,
    };
};

export type TTheme = {
    children: React.ReactNode;
};

export interface IThemeState {
    theme: string;
    setTheme: React.Dispatch<React.SetStateAction<TOptionName>>;
}

export const defaultState: IThemeState = {
    theme: "default",
    setTheme: () => {},
};
