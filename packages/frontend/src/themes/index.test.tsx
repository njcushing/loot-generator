import { vi } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { act } from "react";
import { ThemeContext, Theme } from ".";
import * as themeHelperFuncs from "./utils/themeHelperFuncs";

// Mock dependencies
vi.stubEnv("LOCALSTORAGE_PREFIX", "myAppPrefix");

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

const renderFunc = () => {
    let ThemeContextValue!: themeHelperFuncs.IThemeState;

    const component = (
        <Theme>
            <ThemeContext.Consumer>
                {(value) => {
                    ThemeContextValue = value;
                    return null;
                }}
            </ThemeContext.Consumer>
        </Theme>
    );

    const { rerender } = render(component);

    const getContextValue = () => ({
        ThemeContextValue,
    });

    return {
        rerender,
        getContextValue,
    };
};

vi.mock("./utils/themeHelperFuncs", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual || {}),
        themeSetter: vi.fn(() => {}),
        loadTheme: vi.fn(() => ({ theme: "default" })),
        saveTheme: vi.fn(() => {}),
    };
});

describe("The Theme component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Should pass context to its descendant components...", () => {
        test("Including the current theme", async () => {
            const { getContextValue } = renderFunc();
            const { ThemeContextValue } = getContextValue();

            expect(ThemeContextValue).toBeDefined();
            expect(ThemeContextValue.theme).toBeDefined();
        });

        test("Including a setter function for updating the theme", async () => {
            const { getContextValue } = renderFunc();
            const { ThemeContextValue } = getContextValue();
            const { setTheme } = ThemeContextValue;

            await act(async () => {
                setTheme("dark");
            });

            expect(getContextValue().ThemeContextValue.theme).toBe("dark");
        });

        describe("Which, when consumed by a component other than the Theme component, should contain the same context...", () => {
            test("But any functions within the context should do nothing when invoked, and should exit gracefully", async () => {
                let ThemeContextValue!: themeHelperFuncs.IThemeState;

                render(
                    <div>
                        <ThemeContext.Consumer>
                            {(value) => {
                                ThemeContextValue = value;
                                return null;
                            }}
                        </ThemeContext.Consumer>
                    </div>,
                );

                expect(ThemeContextValue).toBeDefined();

                const { theme, setTheme } = ThemeContextValue;

                expect(theme).toBeDefined();
                expect(() => setTheme("default")).not.toThrow();
            });
        });
    });

    test("Should initialise the 'theme' state value to the return value of the 'loadTheme' helper function", () => {
        const loadThemeSpy = vi.spyOn(themeHelperFuncs, "loadTheme");
        // @ts-expect-error - Disabling type checking for function parameters in unit test
        loadThemeSpy.mockImplementationOnce(() => ({ theme: "testTheme" }));

        let contextValue: themeHelperFuncs.IThemeState;

        render(
            <Theme>
                <ThemeContext.Consumer>
                    {(value) => {
                        contextValue = value;
                        return null;
                    }}
                </ThemeContext.Consumer>
            </Theme>,
        );

        expect(contextValue!.theme).toBe("testTheme");
    });

    test("Should invoke the 'themeSetter' helper function whenever the 'theme' state value is mutated, passing the new value as the argument", async () => {
        const themeSetterSpy = vi.spyOn(themeHelperFuncs, "themeSetter");

        let contextValue: themeHelperFuncs.IThemeState;

        render(
            <Theme>
                <ThemeContext.Consumer>
                    {(value) => {
                        contextValue = value;
                        return null;
                    }}
                </ThemeContext.Consumer>
            </Theme>,
        );

        const { setTheme } = contextValue!;

        await act(async () => {
            setTheme("dark");
        });

        // First call after initialisation, second after mutating the state value
        expect(themeSetterSpy).toHaveBeenCalledTimes(2);
        expect(themeSetterSpy).toHaveBeenCalledWith("default");
        expect(themeSetterSpy).toHaveBeenCalledWith("dark");
    });

    test("Should invoke the 'saveTheme' helper function whenever the 'theme' state value is mutated, passing the new value as the argument", async () => {
        const saveThemeSpy = vi.spyOn(themeHelperFuncs, "saveTheme");

        let contextValue: themeHelperFuncs.IThemeState;

        render(
            <Theme>
                <ThemeContext.Consumer>
                    {(value) => {
                        contextValue = value;
                        return null;
                    }}
                </ThemeContext.Consumer>
            </Theme>,
        );

        const { setTheme } = contextValue!;

        await act(async () => {
            setTheme("dark");
        });

        // First call after initialisation, second after mutating the state value
        expect(saveThemeSpy).toHaveBeenCalledTimes(2);
        expect(saveThemeSpy).toHaveBeenCalledWith("default");
        expect(saveThemeSpy).toHaveBeenCalledWith("dark");
    });
});
