import { vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";
import { PopUpModal, TPopUpModal } from ".";

const mockProps: TPopUpModal = {
    text: "text",
    timer: {
        duration: 1000,
    },
    onClose: () => {},
};

// Mock dependencies
type renderFuncArgs = {
    propsOverride?: TPopUpModal;
};
const renderFunc = (args: renderFuncArgs = {}) => {
    const { propsOverride } = args;

    const component = (
        <PopUpModal
            text={propsOverride?.text || mockProps.text}
            timer={propsOverride?.timer || mockProps.timer}
            onClose={propsOverride?.onClose || mockProps.onClose}
        />
    );

    const { rerender, unmount } = render(component);

    return { rerender, unmount, component };
};

describe("The PopUpModal component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should render a <p> element with display text equal to the value of the 'text' prop", () => {
        renderFunc();

        const textElement = screen.getByText(mockProps.text);
        expect(textElement).toBeInTheDocument();
    });
    test("Should render a button element with the display text 'Close'", () => {
        renderFunc();

        const closeButton = screen.getByRole("button", { name: "Close" });
        expect(closeButton).toBeInTheDocument();
    });
    test("That, on click, should invoke the callback function provided in the 'onClose' prop", async () => {
        const callback = vi.fn();

        renderFunc({ propsOverride: { ...mockProps, onClose: callback } });

        const closeButton = screen.getByRole("button", { name: "Close" });
        expect(closeButton).toBeInTheDocument();

        expect(callback).not.toHaveBeenCalled();

        await userEvent.click(closeButton);
        fireEvent.mouseLeave(closeButton);

        expect(callback).toHaveBeenCalled();
    });
    test("Should, after the time specified in the 'timer' prop's 'duration' field has elapsed, invoke the 'timer' prop's 'callback' field function", () => {
        vi.useFakeTimers();

        const callback = vi.fn();

        renderFunc({ propsOverride: { ...mockProps, timer: { ...mockProps.timer, callback } } });

        expect(callback).not.toHaveBeenCalled();

        vi.runAllTimers();

        expect(callback).toHaveBeenCalled();
    });
    test("Unless the 'timer' prop's 'callback' field is undefined, in which case the timeout should still operate gracefully", () => {
        vi.useFakeTimers();

        renderFunc();

        vi.runAllTimers();
    });
    test("Should clear the existing timeout if the 'timer' prop changes", () => {
        const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

        const { rerender } = renderFunc();
        clearTimeoutSpy.mockClear();
        rerender(
            <PopUpModal
                text={mockProps.text}
                timer={{ ...mockProps.timer, duration: mockProps.timer!.duration! + 1 }}
                onClose={mockProps.onClose}
            />,
        );

        expect(clearTimeoutSpy).toHaveBeenCalledTimes(2); // Also called on unmount
    });
    test("Should clear the existing timeout if the component is unmounted", () => {
        const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

        const { unmount } = renderFunc();
        clearTimeoutSpy.mockClear();
        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    });
});
