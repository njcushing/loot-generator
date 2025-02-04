import { vi } from "vitest";
import { fromResizeObserverEntry, fromElement } from ".";

const mockComputedStyle = (
    paddingLeft: number,
    paddingRight: number,
    paddingTop: number,
    paddingBottom: number,
) => {
    vi.spyOn(window, "getComputedStyle").mockImplementation(
        () =>
            ({
                paddingLeft: `${paddingLeft}px`,
                paddingRight: `${paddingRight}px`,
                paddingTop: `${paddingTop}px`,
                paddingBottom: `${paddingBottom}px`,
            }) as CSSStyleDeclaration,
    );
};

describe("The 'fromResizeObserverEntry' function...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should correctly calculate the dimensions of the entry, including padding, in pixels, and return these values in an array", () => {
        mockComputedStyle(10, 10, 5, 5);

        const mockEntry = {
            contentRect: { width: 100, height: 50 },
            target: document.createElement("div"),
        } as unknown as ResizeObserverEntry;

        const result = fromResizeObserverEntry(mockEntry);
        expect(result).toEqual([120, 60]);
    });

    test("Should invoke the provided callback setter function with the calculated dimensions", () => {
        mockComputedStyle(8, 12, 6, 4);

        const mockSetter = vi.fn();

        const mockEntry = {
            contentRect: { width: 200, height: 100 },
            target: document.createElement("div"),
        } as unknown as ResizeObserverEntry;

        fromResizeObserverEntry(mockEntry, mockSetter);
        expect(mockSetter).toHaveBeenCalledWith([220, 110]);
    });
});

describe("The 'fromElement' function...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should correctly calculate the dimensions of the element, including padding, in pixels, and return these values in an array", () => {
        mockComputedStyle(5, 15, 10, 0);

        const mockElement = { clientWidth: 150, clientHeight: 75 } as Element;

        const result = fromElement(mockElement);
        expect(result).toEqual([170, 85]);
    });

    test("Should invoke the provided callback setter function with the calculated dimensions", () => {
        mockComputedStyle(10, 10, 5, 5);

        const mockSetter = vi.fn();

        const mockElement = { clientWidth: 90, clientHeight: 40 } as Element;

        fromElement(mockElement, mockSetter);
        expect(mockSetter).toHaveBeenCalledWith([110, 50]);
    });
});
