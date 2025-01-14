import { vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import * as calculateElementSize from "@/utils/calculateElementSize";
import { useResizeObserverElement } from ".";

const observeMock = vi.fn();
const unobserveMock = vi.fn();

let resizeObserverCallback: ResizeObserverCallback;

const resizeObserverMock = vi.fn((callback) => {
    resizeObserverCallback = callback;
    return {
        observe: observeMock,
        unobserve: unobserveMock,
    };
}) as unknown as typeof ResizeObserver;

global.ResizeObserver = resizeObserverMock;

describe("The 'useResizeObserverElement' hook...", () => {
    afterAll(() => {
        vi.restoreAllMocks();
    });

    test("Should observe the provided element and update returned size value on element resize", async () => {
        vi.spyOn(calculateElementSize, "fromResizeObserverEntry").mockReturnValue([100, 50]);

        const mockRef = { current: document.createElement("div") };
        const mockEntry = { contentRect: { width: 100, height: 50 } };

        const { result } = renderHook(() => useResizeObserverElement({ ref: mockRef }));

        await act(async () => {
            resizeObserverCallback(
                [{ contentRect: mockEntry.contentRect }] as ResizeObserverEntry[],
                new ResizeObserver(() => {}),
            );
        });

        expect(result.current[0]).toEqual([100, 50]);
        expect(calculateElementSize.fromResizeObserverEntry).toHaveBeenCalledWith(mockEntry);
    });

    test("Should 'unobserve' the observed element when it is unmounted", () => {
        const mockRef = { current: document.createElement("div") };
        const { unmount } = renderHook(() => useResizeObserverElement({ ref: mockRef }));
        unmount();
        expect(unobserveMock).toHaveBeenCalledWith(mockRef.current);
    });
});
