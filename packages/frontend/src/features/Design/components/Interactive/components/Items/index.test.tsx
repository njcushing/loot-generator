import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";
import { act } from "react";
import { Items as TItems, RecursiveOptional } from "@/utils/types";
import {
    LootGeneratorState,
    ILootGeneratorContext,
    LootGeneratorContext,
} from "@/pages/LootGenerator";
import { Items } from ".";

// Mock dependencies
const mockItems: TItems = {
    apple: {
        name: "Apple",
        value: 1,
        custom: {},
    },
    banana: {
        name: "Banana",
        value: 1,
        custom: {},
    },
    cherry: {
        name: "Cherry",
        value: 1,
        custom: {},
    },
    durian: {
        name: "",
        value: 1,
        custom: {},
    },
};

const mockCreateItem = vi.fn();
const mockLootGeneratorContextValue: RecursiveOptional<ILootGeneratorContext> = {
    lootGeneratorState: { items: mockItems } as unknown as LootGeneratorState,
    createItem: mockCreateItem,
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
            <Items />
        </LootGeneratorContext.Provider>
    );

    const { rerender, unmount } = render(component);

    return { rerender, unmount, component, LootGeneratorContextValue };
};

vi.mock("@/components/inputs/components/Search", () => ({
    Search: vi.fn(({ value, onChange }) => {
        return (
            <input
                aria-label="Input Component"
                type="text"
                defaultValue={value}
                onChange={(e) => onChange && onChange(e.currentTarget.value)}
            ></input>
        );
    }),
}));
vi.mock("@/features/Design/components/Interactive/components/Item", () => ({
    Item: vi.fn(({ id }) => {
        return <div aria-label="Item Component">{id}</div>;
    }),
}));
vi.mock("@/features/Design/components/Option", () => ({
    Option: vi.fn(({ symbol, onClick }) => {
        return (
            <button
                aria-label="Option Component"
                type="button"
                onClick={() => onClick && onClick()}
            >
                {symbol}
            </button>
        );
    }),
}));

describe("The Numeric component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should render the Search input component", () => {
        renderFunc();

        const SearchComponent = screen.getByLabelText("Input Component");
        expect(SearchComponent).toBeInTheDocument();
    });

    describe("Should, for each item in the 'lootGeneratorState.items' object in the LootGenerator component's context...", () => {
        test("Render one Item component", () => {
            renderFunc();

            const ItemComponents = screen.getAllByLabelText("Item Component");
            expect(ItemComponents).toHaveLength(4);
        });
        test("That should be passed an 'id' prop equal to the value of the key of the entry in the 'lootGeneratorState.items' object", () => {
            renderFunc();

            Object.keys(mockItems).forEach((key) => {
                const ItemComponent = screen.getByText(`${key}`);
                expect(ItemComponent).toBeInTheDocument();
            });
        });
        test("Unless any part of the 'name' field on the item doesn't match the current value of the Search input component", async () => {
            renderFunc();

            Object.keys(mockItems).forEach((key) => {
                const ItemComponent = screen.getByText(`${key}`);
                expect(ItemComponent).toBeInTheDocument();
            });

            const SearchComponent = screen.getByLabelText("Input Component");
            expect(SearchComponent).toBeInTheDocument();

            await act(async () => userEvent.type(SearchComponent, "a"));

            expect(screen.getByText("apple")).toBeInTheDocument();
            expect(screen.getByText("banana")).toBeInTheDocument();
            expect(screen.queryByText("cherry")).toBeNull();
            expect(screen.queryByText("durian")).toBeNull();
        });
        test("Unless the 'lootGeneratorState.items' object is empty, in which case a help message in a <p> element should be displayed", () => {
            renderFunc({
                LootGeneratorContextOverride: {
                    ...mockLootGeneratorContextValue,
                    lootGeneratorState: {
                        ...mockLootGeneratorContextValue.lootGeneratorState,
                        items: {},
                    },
                } as ILootGeneratorContext,
            });

            const TableComponent = screen.queryByText("Table Component");
            expect(TableComponent).not.toBeInTheDocument();

            const helpMessage = screen.getByText(
                "Please click the '+' button below to create a new item",
            );
            expect(helpMessage).toBeInTheDocument();
        });
    });

    test("Should render the Option component with a 'symbol' prop equal to 'Add'", () => {
        renderFunc();

        expect(screen.getByLabelText("Option Component")).toBeInTheDocument();
        expect(screen.getByText("Add")).toBeInTheDocument();
    });
    test("That, on click, should invoke the 'createItem' function in the LootGenerator component's context", async () => {
        renderFunc();

        const OptionComponent = screen.getByLabelText("Option Component");
        expect(OptionComponent).toBeInTheDocument();

        await userEvent.click(OptionComponent);

        expect(mockCreateItem).toHaveBeenCalled();
    });
});
