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
        let contextValue: themeHelperFuncs.IThemeState;

        beforeEach(async () => {
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
        });

        test("Including the current theme", async () => {
            expect(contextValue).toBeDefined();
            expect(contextValue.theme).toBeDefined();
        });

        test("Including a setter function for updating the theme", async () => {
            const { setTheme } = contextValue;

            await act(async () => {
                setTheme("dark");
            });

            expect(contextValue.theme).toBe("dark");
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
