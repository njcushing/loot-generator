import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { act } from "react";
import { Tables as TTables, RecursiveOptional } from "@/utils/types";
import {
    LootGeneratorState,
    ILootGeneratorContext,
    LootGeneratorContext,
} from "@/pages/LootGenerator";
import { Tables } from ".";

// Mock dependencies
const mockTables: TTables = {
    fruits: {
        name: "Fruits",
        loot: [],
        custom: {},
    },
    vegetables: {
        name: "Vegetables",
        loot: [],
        custom: {},
    },
    dairy: {
        name: "Dairy",
        loot: [],
        custom: {},
    },
    carbohydrates: {
        name: "",
        loot: [],
        custom: {},
    },
};

const mockCreateTable = vi.fn();
const mockLootGeneratorContextValue: RecursiveOptional<ILootGeneratorContext> = {
    lootGeneratorState: { tables: mockTables } as unknown as LootGeneratorState,
    createTable: mockCreateTable,
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
            <Tables />
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
vi.mock("@/features/Design/components/Interactive/components/Table", () => ({
    Table: vi.fn(({ id }) => {
        return <div aria-label="Table Component">{id}</div>;
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

describe("The Tables component...", () => {
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

            const TableComponents = screen.getAllByLabelText("Table Component");
            expect(TableComponents).toHaveLength(Object.keys(mockTables).length);
        });
        test("That should be passed an 'id' prop equal to the value of the key of the entry in the 'lootGeneratorState.tables' object", () => {
            renderFunc();

            Object.keys(mockTables).forEach((key) => {
                const TableComponent = screen.getByText(`${key}`);
                expect(TableComponent).toBeInTheDocument();
            });
        });
        test("Unless any part of the 'name' field on the item doesn't match the current value of the Search input component", async () => {
            renderFunc();

            Object.keys(mockTables).forEach((key) => {
                const TableComponent = screen.getByText(`${key}`);
                expect(TableComponent).toBeInTheDocument();
            });

            const SearchComponent = screen.getByLabelText("Input Component");
            expect(SearchComponent).toBeInTheDocument();

            await act(async () => userEvent.type(SearchComponent, "a"));

            expect(screen.queryByText("fruits")).toBeNull();
            expect(screen.getByText("vegetables")).toBeInTheDocument();
            expect(screen.getByText("dairy")).toBeInTheDocument();
            expect(screen.queryByText("carbohydrates")).toBeNull();
        });
        test("Unless the 'lootGeneratorState.tables' object is empty, in which case a help message in a <p> element should be displayed", () => {
            renderFunc({
                LootGeneratorContextOverride: {
                    ...mockLootGeneratorContextValue,
                    lootGeneratorState: {
                        ...mockLootGeneratorContextValue.lootGeneratorState,
                        tables: {},
                    },
                } as ILootGeneratorContext,
            });

            const TableComponent = screen.queryByText("Table Component");
            expect(TableComponent).not.toBeInTheDocument();

            const helpMessage = screen.getByText(
                "Please click the '+' button below to create a new table",
            );
            expect(helpMessage).toBeInTheDocument();
        });
    });

    test("Should render the Option component with a 'symbol' prop equal to 'Add'", () => {
        renderFunc();

        expect(screen.getByLabelText("Option Component")).toBeInTheDocument();
        expect(screen.getByText("Add")).toBeInTheDocument();
    });
    test("That, on click, should invoke the 'createTable' function in the LootGenerator component's context", async () => {
        renderFunc();

        const OptionComponent = screen.getByLabelText("Option Component");
        expect(OptionComponent).toBeInTheDocument();

        await userEvent.click(OptionComponent);

        expect(mockCreateTable).toHaveBeenCalled();
    });
});
