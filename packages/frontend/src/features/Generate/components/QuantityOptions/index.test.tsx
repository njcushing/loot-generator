import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";
import { RecursiveOptional } from "@/utils/types";
import {
    LootGeneratorState,
    ILootGeneratorContext,
    LootGeneratorContext,
} from "@/pages/LootGenerator";
import { QuantityOptions } from ".";

// Mock dependencies
const mockSetLootGeneratorStateProperty = vi.fn();
const mockLootGeneratorContextValue: RecursiveOptional<ILootGeneratorContext> = {
    lootGeneratorState: {
        quantitySelected: 1,
        quantityOptionSelected: 0,
        customQuantity: 50,
    } as unknown as LootGeneratorState,
    setLootGeneratorStateProperty: mockSetLootGeneratorStateProperty,
};

describe("The QuantityOptions component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should render button elements with the following texts: 1, 10, 100, 1000 and Custom", () => {
        render(<QuantityOptions />);

        expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "100" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "1000" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Custom" })).toBeInTheDocument();
    });
    test("That, on click, should set the selected value and index using the 'setLootGeneratorStateProperty' function", () => {
        render(
            <LootGeneratorContext.Provider
                value={mockLootGeneratorContextValue as unknown as ILootGeneratorContext}
            >
                <QuantityOptions />
            </LootGeneratorContext.Provider>,
        );

        const option1Button = screen.getByRole("button", { name: "1" });
        const option10Button = screen.getByRole("button", { name: "10" });
        const option100Button = screen.getByRole("button", { name: "100" });
        const option1000Button = screen.getByRole("button", { name: "1000" });
        const optionCustomButton = screen.getByRole("button", { name: "Custom" });

        fireEvent.click(option1Button);
        expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith("quantitySelected", 1);
        expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith("quantityOptionSelected", 0);
        mockSetLootGeneratorStateProperty.mockRestore();

        fireEvent.click(option10Button);
        expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith("quantitySelected", 10);
        expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith("quantityOptionSelected", 1);
        mockSetLootGeneratorStateProperty.mockRestore();

        fireEvent.click(option100Button);
        expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith("quantitySelected", 100);
        expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith("quantityOptionSelected", 2);
        mockSetLootGeneratorStateProperty.mockRestore();

        fireEvent.click(option1000Button);
        expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith("quantitySelected", 1000);
        expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith("quantityOptionSelected", 3);
        mockSetLootGeneratorStateProperty.mockRestore();

        fireEvent.click(optionCustomButton);
        expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith(
            "quantitySelected",
            mockLootGeneratorContextValue.lootGeneratorState?.customQuantity,
        );
        expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith("quantityOptionSelected", 4);
        fireEvent.mouseLeave(option1Button);
        mockSetLootGeneratorStateProperty.mockRestore();
    });

    test("Should display a numeric input for the custom quantity when the 'Custom' option is selected", () => {
        render(
            <LootGeneratorContext.Provider
                value={
                    {
                        ...mockLootGeneratorContextValue,
                        lootGeneratorState: {
                            ...mockLootGeneratorContextValue.lootGeneratorState,
                            quantitySelected: 50,
                            quantityOptionSelected: 4,
                            customQuantity: 50,
                        },
                    } as unknown as ILootGeneratorContext
                }
            >
                <QuantityOptions />
            </LootGeneratorContext.Provider>,
        );

        const numericInput = screen.getByRole("spinbutton");
        expect(numericInput).toBeInTheDocument();
    });
    test("That, on change, should set the custom value using the 'setLootGeneratorStateProperty' function", async () => {
        render(
            <LootGeneratorContext.Provider
                value={
                    {
                        ...mockLootGeneratorContextValue,
                        lootGeneratorState: {
                            ...mockLootGeneratorContextValue.lootGeneratorState,
                            quantitySelected: 50,
                            quantityOptionSelected: 4,
                            customQuantity: 50,
                        },
                    } as unknown as ILootGeneratorContext
                }
            >
                <QuantityOptions />
            </LootGeneratorContext.Provider>,
        );

        const numericInput = screen.getByRole("spinbutton");
        expect(numericInput).toBeInTheDocument();

        await userEvent.type(numericInput, "0");
        expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith("customQuantity", 500);
    });
    test("And, on change, should clamp the numeric value to a minimum value of 1", async () => {
        render(
            <LootGeneratorContext.Provider
                value={
                    {
                        ...mockLootGeneratorContextValue,
                        lootGeneratorState: {
                            ...mockLootGeneratorContextValue.lootGeneratorState,
                            quantitySelected: 50,
                            quantityOptionSelected: 4,
                            customQuantity: 50,
                        },
                    } as unknown as ILootGeneratorContext
                }
            >
                <QuantityOptions />
            </LootGeneratorContext.Provider>,
        );

        const numericInput = screen.getByRole("spinbutton");
        expect(numericInput).toBeInTheDocument();

        await userEvent.tripleClick(numericInput);
        await userEvent.keyboard("{backspace}"); // Simulate entire input value deletion
        expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith("customQuantity", 1);
    });
});
