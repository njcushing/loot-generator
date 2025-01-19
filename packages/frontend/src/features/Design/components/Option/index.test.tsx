import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { RecursiveOptional } from "@/utils/types";
import { Option, TOption } from ".";

const defaultArgs: TOption = {
    symbol: "Circle",
    text: "",
    onClick: () => {},
    disabled: false,
};

const renderFunc = (args: RecursiveOptional<TOption> = defaultArgs) => {
    return render(
        <Option
            symbol={args.symbol || defaultArgs.symbol}
            text={args.text || defaultArgs.text}
            onClick={args.onClick || defaultArgs.onClick}
            disabled={args.disabled || defaultArgs.disabled}
        />,
    );
};

describe("The Option component...", () => {
    test("Should render correctly", () => {
        renderFunc();
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
    });
    test("Should display a child <p> element with text content equal to the value of the 'symbol' prop", async () => {
        renderFunc();
        const symbol = screen.getByText("Circle");
        expect(symbol).toBeInTheDocument();

        const button = screen.getByRole("button");
        expect(button.contains(symbol)).toBeTruthy();
    });
    test("Should display a child <p> element with text content equal to the value of the 'text' prop", async () => {
        renderFunc({ text: "Button Text" });
        const symbol = screen.getByText("Button Text");
        expect(symbol).toBeInTheDocument();

        const button = screen.getByRole("button");
        expect(button.contains(symbol)).toBeTruthy();
    });
    test("Unless the value of the 'symbol' prop is not specified or is an empty string", async () => {
        renderFunc();
        const symbol = screen.queryByText("Button Text");
        expect(symbol).not.toBeInTheDocument();

        const button = screen.getByRole("button");
        expect(button.children).toHaveLength(1);
    });
    test("Should, when clicked, invoke the callback function provided in the 'onClick' prop", async () => {
        const callback = vi.fn();

        renderFunc({ onClick: callback });
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();

        await userEvent.click(button);
        fireEvent.mouseLeave(button);

        expect(callback).toHaveBeenCalled();
    });
    test("Unless the 'disabled' prop is 'true'", async () => {
        const callback = vi.fn();

        renderFunc({ onClick: callback, disabled: true });
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();

        await userEvent.click(button);
        fireEvent.mouseLeave(button);

        expect(callback).not.toHaveBeenCalled();
    });
});
