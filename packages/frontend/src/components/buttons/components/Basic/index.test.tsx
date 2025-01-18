import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Basic, TBasic } from ".";

const defaultArgs: TBasic = {
    type: "button",
    text: "Button Text",
    symbol: "",
    label: "button",
    onClickHandler: () => {},
    onMouseEnterHandler: () => {},
    onMouseLeaveHandler: () => {},
    disabled: false,
    allowDefaultEventHandling: false,
};

const renderFunc = (args = defaultArgs) => {
    return render(
        <Basic
            type={args.type}
            text={args.text}
            symbol={args.symbol}
            label={args.label}
            onClickHandler={args.onClickHandler}
            onMouseEnterHandler={args.onMouseEnterHandler}
            onMouseLeaveHandler={args.onMouseLeaveHandler}
            disabled={args.disabled}
            allowDefaultEventHandling={args.allowDefaultEventHandling}
        />,
    );
};

describe("The Basic component...", () => {
    test("Should render correctly", () => {
        renderFunc();
        const button = screen.getByRole("button", { name: "button" });
        expect(button).toBeInTheDocument();
    });
    test("Should have text content equal to the value of the 'text' prop", async () => {
        renderFunc();
        const button = screen.getByRole("button", { name: "button" });
        expect(button.textContent).toBe("Button Text");
    });
    test("Should display a child <p> element with text content equal to the value of the 'symbol' prop", async () => {
        renderFunc({ ...defaultArgs, symbol: "circle" });
        const symbol = screen.getByText("circle");
        expect(symbol).toBeInTheDocument();

        const button = screen.getByRole("button", { name: "button" });
        expect(button.contains(symbol)).toBeTruthy();
    });
    test("Unless the value of the 'symbol' prop is not specified or is an empty string", async () => {
        renderFunc();
        const symbol = screen.queryByText("circle");
        expect(symbol).not.toBeInTheDocument();

        const button = screen.getByRole("button", { name: "button" });
        expect(button.children).toHaveLength(0);
    });
    test("Should, when clicked, invoke the callback function provided in the 'onClickHandler' prop", async () => {
        const callback = vi.fn();

        renderFunc({ ...defaultArgs, onClickHandler: callback });
        const button = screen.getByRole("button", { name: "button" });

        await userEvent.click(button);

        expect(callback).toHaveBeenCalled();
    });
    test("Unless the 'disabled' prop is 'true'", async () => {
        const callback = vi.fn();

        renderFunc({ ...defaultArgs, onClickHandler: callback, disabled: true });
        const button = screen.getByRole("button", { name: "button" });

        await userEvent.click(button);

        expect(callback).not.toHaveBeenCalled();
    });
    test("Should, when the mouse enters it, invoke the callback function provided in the 'onMouseEnterHandler' prop", async () => {
        const callback = vi.fn();

        renderFunc({ ...defaultArgs, onMouseEnterHandler: callback });
        const button = screen.getByRole("button", { name: "button" });

        fireEvent.mouseEnter(button);

        expect(callback).toHaveBeenCalled();
    });
    test("Should, when the mouse leaves it, invoke the callback function provided in the 'onMouseLeaveHandler' prop", async () => {
        const callback = vi.fn();

        renderFunc({ ...defaultArgs, onMouseLeaveHandler: callback });
        const button = screen.getByRole("button", { name: "button" });

        fireEvent.mouseLeave(button);

        expect(callback).toHaveBeenCalled();
    });
});
