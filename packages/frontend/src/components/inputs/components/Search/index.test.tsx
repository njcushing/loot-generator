import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";
import { vi } from "vitest";
import { Search } from ".";

describe("The Search component...", () => {
    test("Should render correctly", () => {
        render(<Search />);

        const input = screen.getByRole("searchbox");
        expect(input).toBeInTheDocument();
    });
    test("Should have a value equal to the value of the 'value' prop", () => {
        render(<Search value="test" />);

        const input = screen.getByRole("searchbox");
        expect(input).toBeInTheDocument();
        expect((input as HTMLInputElement).value).toBe("test");
    });
    test("Should, on change, invoke the callback function passed in the 'onChange' prop", async () => {
        const callback = vi.fn();

        render(<Search onChange={callback} />);

        const input = screen.getByRole("searchbox");
        expect(input).toBeInTheDocument();

        await userEvent.type(input, "a");

        expect(callback).toHaveBeenCalledWith("a");
    });
    test("Unless the 'disabled' prop is 'true'", async () => {
        const callback = vi.fn();

        render(<Search onChange={callback} disabled />);

        const input = screen.getByRole("searchbox");
        expect(input).toBeInTheDocument();

        await userEvent.type(input, "a");

        expect(callback).not.toHaveBeenCalledWith("a");
    });
});
