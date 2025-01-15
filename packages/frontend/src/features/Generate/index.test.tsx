import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RecursiveOptional, Loot } from "@/utils/types";
import {
    ILootGeneratorContext,
    LootGeneratorContext,
    LootGeneratorState,
} from "@/pages/LootGenerator";
import * as gen from "@/utils/generateLoot";
import { Generate } from ".";

// Mock dependencies
const mockLoot: Loot = {
    apple: {
        props: {
            type: "item_id",
            key: "apple-key",
            id: "apple",
            quantity: { min: 1, max: 1 },
            criteria: { weight: 1, rolls: {} },
            name: "Apple",
            value: 5,
            custom: {},
        },
        quantity: 8,
    },
};

const mockSetLootGeneratorStateProperty = vi.fn();
const mockLootGeneratorContextValue: RecursiveOptional<ILootGeneratorContext> = {
    lootGeneratorState: {
        active: "a",
        tables: "b",
        items: "c",
        quantitySelected: "d",
        loot: "e",
    } as unknown as LootGeneratorState,
    setLootGeneratorStateProperty: mockSetLootGeneratorStateProperty,
};

vi.mock("@/utils/generateLoot", () => ({
    generateLoot: vi.fn(() => {}),
}));

vi.mock("@/components/structural/components/TabSelector", () => ({
    TabSelector: vi.fn(({ tabs }) => (
        <div>
            TabSelector Component
            {Object.keys(tabs).map((key) => {
                const tab = tabs[key];
                return tab.content;
            })}
        </div>
    )),
}));
vi.mock("./components/SortOptions", () => ({
    SortOptions: vi.fn(() => <div>SortOptions Component</div>),
}));
vi.mock("./components/Loot", () => ({
    Loot: vi.fn(() => <div>Loot Component</div>),
}));
vi.mock("./components/QuantityOptions", () => ({
    QuantityOptions: vi.fn(() => <div>QuantityOptions Component</div>),
}));

describe("The Generate component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should render the TabSelector component", () => {
        render(<Generate />);

        const TabSelectorComponent = screen.getByText("TabSelector Component");
        expect(TabSelectorComponent).toBeInTheDocument();
    });
    test("With one tab, displaying the SortOptions, Loot and QuantityOptions components", () => {
        render(<Generate />);

        const TabSelectorComponent = screen.getByText("TabSelector Component");
        expect(TabSelectorComponent).toBeInTheDocument();

        const SortOptionsComponent = screen.getByText("SortOptions Component");
        expect(SortOptionsComponent).toBeInTheDocument();

        const LootComponent = screen.getByText("Loot Component");
        expect(LootComponent).toBeInTheDocument();

        const QuantityOptionsComponent = screen.getByText("QuantityOptions Component");
        expect(QuantityOptionsComponent).toBeInTheDocument();
    });

    test("Should render a 'Generate' button", () => {
        render(<Generate />);

        const generateButton = screen.getByRole("button", { name: "Generate" });
        expect(generateButton).toBeInTheDocument();
    });
    test("That, on click, should invoke the 'generateLoot' function", () => {
        const generateLootSpy = vi.spyOn(gen, "generateLoot");

        render(
            <LootGeneratorContext.Provider
                value={mockLootGeneratorContextValue as unknown as ILootGeneratorContext}
            >
                <Generate />
            </LootGeneratorContext.Provider>,
        );

        const generateButton = screen.getByRole("button", { name: "Generate" });
        expect(generateButton).toBeInTheDocument();

        fireEvent.click(generateButton);
        fireEvent.mouseLeave(generateButton);

        expect(generateLootSpy).toHaveBeenCalledWith("a", "b", "c", "d", "e");
    });
    test("And pass the return value to the 'setLootGeneratorStateProperty' function", () => {
        vi.spyOn(gen, "generateLoot").mockImplementationOnce(() => mockLoot);

        render(
            <LootGeneratorContext.Provider
                value={mockLootGeneratorContextValue as unknown as ILootGeneratorContext}
            >
                <Generate />
            </LootGeneratorContext.Provider>,
        );

        const generateButton = screen.getByRole("button", { name: "Generate" });
        expect(generateButton).toBeInTheDocument();

        fireEvent.click(generateButton);
        fireEvent.mouseLeave(generateButton);

        expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith("loot", mockLoot);
    });

    test("Should render a 'Reset' button", () => {
        render(<Generate />);

        const resetButton = screen.getByRole("button", { name: "Reset" });
        expect(resetButton).toBeInTheDocument();
    });
    test("That, on click, should invoke the 'setLootGeneratorStateProperty' function", () => {
        vi.spyOn(gen, "generateLoot").mockImplementationOnce(() => ({}));

        render(
            <LootGeneratorContext.Provider
                value={mockLootGeneratorContextValue as unknown as ILootGeneratorContext}
            >
                <Generate />
            </LootGeneratorContext.Provider>,
        );

        const resetButton = screen.getByRole("button", { name: "Reset" });
        expect(resetButton).toBeInTheDocument();

        fireEvent.click(resetButton);
        fireEvent.mouseLeave(resetButton);

        expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith("loot", {});
    });
});
