import { vi } from "vitest";
import "@testing-library/jest-dom";
import { options, themeSetter, loadTheme, saveTheme } from ".";

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

describe("The 'options' function...", () => {
    test("Should return an array of objects containing a string 'name' field and string 'colour' field", () => {
        const themeOptions = options();
        expect(Array.isArray(themeOptions)).toBe(true);
        themeOptions.forEach((option) => {
            expect("name" in option).toBe(true);
            expect(typeof option.name).toBe("string");
            expect("colour" in option).toBe(true);
            expect(typeof option.colour).toBe("string");
        });
    });
});

describe("The 'loadTheme' function...", () => {
    test("Should return the theme value stored in localStorage for this application", () => {
        const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
        getItemSpy.mockReturnValueOnce("light");
        expect(loadTheme()).toStrictEqual({ theme: "light" });
        expect(getItemSpy).toHaveBeenCalled();
    });
    test("With 'default' as a backup when no value is found in localStorage", () => {
        const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
        getItemSpy.mockImplementationOnce(() => null);
        expect(loadTheme()).toStrictEqual({ theme: "default" });
        expect(getItemSpy).toHaveBeenCalled();
    });
    test("And similarly when the value found in localStorage is not present in the object array returned by the 'options' function", () => {
        const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
        getItemSpy.mockImplementationOnce(() => "thisIsNotARealTheme");
        expect(loadTheme()).toStrictEqual({ theme: "default" });
        expect(getItemSpy).toHaveBeenCalled();
    });
});

describe("The 'saveTheme' function...", () => {
    describe("Should invoke the localStorage API's 'setItem' function...", () => {
        test("With an appropriate key, and the theme provided as an argument as the value", () => {
            const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
            saveTheme("light");
            expect(setItemSpy).toHaveBeenCalledWith("myAppPrefix-theme", "light");
        });
        test("With 'default' as a backup when the theme value provided as an argument is not present in the object array returned by the 'options' function", () => {
            const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
            saveTheme("thisIsNotARealTheme");
            expect(setItemSpy).toHaveBeenCalledWith("myAppPrefix-theme", "default");
        });
    });
});

describe("The 'themeSetter' function...", () => {
    test("Should set the 'theme' attribute on the :root DOM element to the value of the argument", () => {
        const root = document.querySelector(":root");
        expect(root).toBeInTheDocument();
        themeSetter("dark");
        expect(root!.getAttribute("theme")).toBe("dark");
        themeSetter("light");
        expect(root!.getAttribute("theme")).toBe("light");
    });
    test("But only if that value is present in the object array returned by the 'options' function", () => {
        const root = document.querySelector(":root");
        expect(root).toBeInTheDocument();
        // @ts-expect-error - Disabling type checking for function parameter in unit test
        themeSetter("thisIsNotARealTheme");
        expect(root!.getAttribute("theme")).not.toBe("thisIsNotARealTheme");
    });
    test("Should, when the argument is 'default', attempt to set the theme based on the browser's prefered colour scheme, with 'light' as a backup", () => {
        const matchMediaSpy = vi.spyOn(window, "matchMedia");
        const root = document.querySelector(":root");
        expect(root).toBeInTheDocument();

        matchMediaSpy.mockReturnValueOnce({ matches: true } as MediaQueryList);
        themeSetter("default");
        expect(root!.getAttribute("theme")).not.toBe("default");
        expect(matchMediaSpy).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
        expect(root!.getAttribute("theme")).toBe("dark");

        matchMediaSpy.mockReturnValueOnce({ matches: false } as MediaQueryList);
        themeSetter("default");
        expect(root!.getAttribute("theme")).not.toBe("default");
        expect(matchMediaSpy).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
        expect(root!.getAttribute("theme")).toBe("light");
    });
});
