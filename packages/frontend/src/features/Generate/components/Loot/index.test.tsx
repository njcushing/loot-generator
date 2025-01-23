import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RecursiveOptional, Loot as TLoot } from "@/utils/types";
import {
    LootGeneratorState,
    ILootGeneratorContext,
    LootGeneratorContext,
} from "@/pages/LootGenerator";
import { Loot } from ".";

// Mock dependencies
const mockLoot: TLoot = {
    apple: {
        props: {
            key: "apple-key",
            type: "item_id",
            id: "apple",
            criteria: { weight: 10 },
            quantity: { min: 1, max: 1 },

            name: "Apple",
            value: 10,
            custom: {},
        },
        quantity: 23,
    },
    banana: {
        props: {
            key: "banana-key",
            type: "item_id",
            id: "banana",
            criteria: { weight: 10 },
            quantity: { min: 1, max: 1 },

            name: "Banana",
            value: 100,
            custom: {},
        },
        quantity: 67,
    },
    cherry: {
        props: {
            key: "cherry-key",
            type: "item_id",
            id: "cherry",
            criteria: { weight: 10 },
            quantity: { min: 1, max: 1 },

            name: "Cherry",
            value: 1,
            custom: {},
        },
        quantity: 56,
    },
    durian: {
        props: {
            key: "durian-key",
            type: "item_id",
            id: "durian",
            criteria: { weight: 10 },
            quantity: { min: 1, max: 1 },

            name: undefined,
            value: 1000,
            custom: {},
        },
        quantity: 81,
    },
};

const mockSortOptions: LootGeneratorState["sortOptions"] = {
    selected: "quantity",
    options: [
        {
            name: "name",
            criteria: [
                { name: "order", selected: "descending", values: ["ascending", "descending"] },
            ],
        },
        {
            name: "quantity",
            criteria: [
                { name: "order", selected: "descending", values: ["ascending", "descending"] },
            ],
        },
        {
            name: "value",
            criteria: [
                { name: "order", selected: "ascending", values: ["ascending", "descending"] },
                { name: "summation", selected: "total", values: ["individual", "total"] },
            ],
        },
    ],
};

const mockLootGeneratorContextValue: RecursiveOptional<ILootGeneratorContext> = {
    lootGeneratorState: {
        loot: mockLoot,
        sortOptions: mockSortOptions,
    } as unknown as LootGeneratorState,
};

type renderFuncArgs = {
    LootGeneratorContextOverride?: ILootGeneratorContext;
};
const renderFunc = (args: renderFuncArgs = {}) => {
    const { LootGeneratorContextOverride } = args;

    let LootGeneratorContextValue!: ILootGeneratorContext;

    const component = (
        <LootGeneratorContext.Provider
            value={
                LootGeneratorContextOverride ||
                (mockLootGeneratorContextValue as unknown as ILootGeneratorContext)
            }
        >
            <LootGeneratorContext.Consumer>
                {(value) => {
                    LootGeneratorContextValue = value;
                    return null;
                }}
            </LootGeneratorContext.Consumer>
            <Loot />
        </LootGeneratorContext.Provider>
    );

    const { rerender } = render(component);

    return { rerender, LootGeneratorContextValue, component };
};

vi.mock("@/utils/sortLoot", () => ({
    sortLoot: vi.fn((loot) => new Map([...Object.entries(loot).reverse()])),
}));

describe("The Loot component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Should render an unordered list...", () => {
        test("Containing one list item for each entry in the LootGenerator component's context's 'lootGeneratorState.loot' object", () => {
            renderFunc();

            const unorderedList = screen.getByRole("list");
            expect(unorderedList).toBeInTheDocument();

            const listItems = screen.getAllByRole("listitem");
            expect(listItems).toHaveLength(Object.keys(mockLoot).length);

            listItems.forEach((listItem) => expect(unorderedList.contains(listItem)).toBeTruthy());
        });
        test("Each of which should display a <p> element with text content equal to the loot entry's 'props.name' field, or 'Unnamed Item' if that field is undefined", () => {
            renderFunc();

            expect(screen.getByText("Apple")).toBeInTheDocument();
            expect(screen.getByText("Banana")).toBeInTheDocument();
            expect(screen.getByText("Cherry")).toBeInTheDocument();
            expect(screen.queryByText("Durian")).toBeNull();

            expect(screen.getByText("Unnamed Item")).toBeInTheDocument();
        });
        test("Each of which should display a <p> element with text content equal to the loot entry's 'quantity' field", () => {
            renderFunc();

            Object.values(mockLoot).forEach((entry) => {
                expect(screen.getByText(`${entry.quantity}`)).toBeInTheDocument();
            });
        });
        test("And the list items should be sorted by the 'sortLoot' function", () => {
            renderFunc();

            const listItems = screen.getAllByRole("listitem");
            const mockLootValues = Object.values(mockLoot);

            listItems.reverse().forEach((listItem, i) => {
                const name = screen.getByText(mockLootValues[i].props.name || "Unnamed Item");
                const quantity = screen.getByText(mockLootValues[i].quantity);

                expect(listItem.contains(name)).toBeTruthy();
                expect(listItem.contains(quantity)).toBeTruthy();
            });
        });
    });
});
