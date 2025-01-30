import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";
import { RecursiveOptional, Items, Tables } from "@/utils/types";
import {
    LootGeneratorState,
    ILootGeneratorContext,
    LootGeneratorContext,
} from "@/pages/LootGenerator";
import { act } from "react";
import { JSONDisplay, TJSONDisplay } from ".";

// Mock dependencies
const mockWriteText = vi.fn((text) => text);

Object.defineProperty(navigator, "clipboard", {
    value: {
        writeText: mockWriteText,
    },
});

const mockItems: Items = {
    apple: {
        name: "Apple",
        value: 10,
        custom: {},
    },
    banana: {
        name: "Banana",
        value: 100,
        custom: {},
    },
    cherry: {
        name: "Cherry",
        value: 1000,
        custom: {},
    },
};

const mockTables: Tables = {
    fruits: {
        name: "Fruits",
        loot: [
            {
                key: "entry-loot-item-key",
                type: "item_id",
                id: "apple",
                // @ts-expect-error - Disabling type checking for mocking props in unit test
                quantity: { min: undefined, max: 1 },
                criteria: { weight: 1 },
            },
            {
                key: "entry-loot-item-key",
                type: "item_id",
                id: "banana",
                quantity: { min: 1, max: 1 },
                criteria: { weight: 1 },
            },
            {
                key: "entry-loot-item-key",
                type: "item_id",
                id: "cherry",
                quantity: { min: 1, max: 1 },
                criteria: { weight: 1 },
            },
            {
                key: "entry-loot-table-key",
                type: "table_id",
                id: "vegetables",
                criteria: { weight: 1 },
            },
            {
                key: "entry-loot-entry",
                type: "entry",
            },
        ],
        custom: {},
    },
    vegetables: {
        name: "Vegetables",
        loot: [],
        custom: {},
    },
};

const mockProps: TJSONDisplay = {
    hideFields: [],
};

const mockLootGeneratorContextValue: RecursiveOptional<ILootGeneratorContext> = {
    lootGeneratorState: {
        active: "fruits",
        tables: mockTables,
        items: mockItems,
    } as unknown as LootGeneratorState,
};

type renderFuncArgs = {
    LootGeneratorContextOverride?: ILootGeneratorContext;
    propsOverride?: TJSONDisplay;
};
const renderFunc = (args: renderFuncArgs = {}) => {
    const { LootGeneratorContextOverride, propsOverride } = args;

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
            <JSONDisplay
                hideFields={propsOverride?.hideFields || mockProps.hideFields}
            ></JSONDisplay>
        </LootGeneratorContext.Provider>
    );

    const { rerender } = render(component);

    return {
        rerender,
        LootGeneratorContextValue,
        component,
    };
};

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

describe("The JSONDisplay component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Should render three Option components...", () => {
        describe("Including a 'populate entries' button...", () => {
            test("With text content equal to 'Table' by default", () => {
                renderFunc();

                const populateTablesButton = screen.getByText("Table");
                expect(populateTablesButton).toBeInTheDocument();
            });
            test("That, on click, should invert the internal 'entriesArePopulated' boolean state value, resulting in the text content being 'Table_Eye'", async () => {
                renderFunc();

                expect(screen.getByText("Table")).toBeInTheDocument();
                expect(screen.queryByText("Table_Eye")).toBeNull();

                await act(() => userEvent.click(screen.getByText("Table")));

                expect(screen.queryByText("Table")).toBeNull();
                expect(screen.getByText("Table_Eye")).toBeInTheDocument();

                await act(() => userEvent.click(screen.getByText("Table_Eye")));

                expect(screen.getByText("Table")).toBeInTheDocument();
                expect(screen.queryByText("Table_Eye")).toBeNull();
            });
        });

        describe("Including a 'visibility' button...", () => {
            test("With text content equal to 'Visibility_Off' by default", () => {
                renderFunc();

                const visibilityButton = screen.getByText("Visibility_Off");
                expect(visibilityButton).toBeInTheDocument();
            });
            test("That, on click, should invert the internal 'showingHiddenFields' boolean state value, resulting in the text content being 'Visibility'", async () => {
                renderFunc();

                expect(screen.getByText("Visibility_Off")).toBeInTheDocument();
                expect(screen.queryByText("Visibility")).toBeNull();

                await act(() => userEvent.click(screen.getByText("Visibility_Off")));

                expect(screen.queryByText("Visibility_Off")).toBeNull();
                expect(screen.getByText("Visibility")).toBeInTheDocument();

                await act(() => userEvent.click(screen.getByText("Visibility")));

                expect(screen.getByText("Visibility_Off")).toBeInTheDocument();
                expect(screen.queryByText("Visibility")).toBeNull();
            });
        });

        describe("Including a 'copy JSON' button...", () => {
            test("With text content equal to 'Content_Copy'", () => {
                renderFunc();

                const copyJSONButton = screen.getByText("Content_Copy");
                expect(copyJSONButton).toBeInTheDocument();
            });

            describe("That, on click, should copy stringified JSON to the clipboard...", () => {
                test("Unless the LootGenerator component's context's 'lootGeneratorState.active' field has a value of 'null'", async () => {
                    renderFunc({
                        LootGeneratorContextOverride: {
                            ...mockLootGeneratorContextValue,
                            lootGeneratorState: {
                                ...mockLootGeneratorContextValue.lootGeneratorState,
                                active: null,
                            } as unknown as LootGeneratorState,
                        } as unknown as ILootGeneratorContext,
                    });

                    const copyJSONButton = screen.getByText("Content_Copy");
                    expect(copyJSONButton).toBeInTheDocument();

                    expect(mockWriteText).not.toHaveBeenCalled();

                    await act(() => userEvent.click(screen.getByText("Content_Copy")));

                    expect(mockWriteText).not.toHaveBeenCalled();
                });
                test("Unless the LootGenerator component's context's 'lootGeneratorState.active' field is not found in the 'lootGeneratorState.tables' object", async () => {
                    renderFunc({
                        LootGeneratorContextOverride: {
                            ...mockLootGeneratorContextValue,
                            lootGeneratorState: {
                                ...mockLootGeneratorContextValue.lootGeneratorState,
                                active: "invalid-table-id",
                            } as unknown as LootGeneratorState,
                        } as unknown as ILootGeneratorContext,
                    });

                    const copyJSONButton = screen.getByText("Content_Copy");
                    expect(copyJSONButton).toBeInTheDocument();

                    expect(mockWriteText).not.toHaveBeenCalled();

                    await act(() => userEvent.click(screen.getByText("Content_Copy")));

                    expect(mockWriteText).not.toHaveBeenCalled();
                });
                test("Representing the active table and its loot items and tables (recursively, but not populated where imported), excluding 'entry' type entries and fields with undefined values", async () => {
                    renderFunc();

                    const copyJSONButton = screen.getByText("Content_Copy");
                    expect(copyJSONButton).toBeInTheDocument();

                    expect(mockWriteText).not.toHaveBeenCalled();

                    await act(() => userEvent.click(screen.getByText("Content_Copy")));

                    expect(mockWriteText).toHaveBeenCalledWith(
                        `{"name":"Fruits","loot":[{"key":"entry-loot-item-key","type":"item_id","id":"apple","quantity":{"max":1},"criteria":{"weight":1}},{"key":"entry-loot-item-key","type":"item_id","id":"banana","quantity":{"min":1,"max":1},"criteria":{"weight":1}},{"key":"entry-loot-item-key","type":"item_id","id":"cherry","quantity":{"min":1,"max":1},"criteria":{"weight":1}},{"key":"entry-loot-table-key","type":"table_id","id":"vegetables","criteria":{"weight":1}}],"custom":{}}`,
                    );
                });
                test("And should recursively populate imported tables' loot items and tables if the internal 'entriesArePopulated' boolean state value is 'true'", async () => {
                    renderFunc();

                    const copyJSONButton = screen.getByText("Content_Copy");
                    expect(copyJSONButton).toBeInTheDocument();

                    expect(mockWriteText).not.toHaveBeenCalled();

                    const populateTablesButton = screen.getByText("Table");
                    await act(() => userEvent.click(populateTablesButton));

                    await act(() => userEvent.click(screen.getByText("Content_Copy")));

                    expect(mockWriteText).toHaveBeenCalledWith(
                        `{"name":"Fruits","loot":[{"key":"entry-loot-item-key","type":"item_id","id":"apple","quantity":{"max":1},"criteria":{"weight":1},"name":"Apple","value":10,"custom":{}},{"key":"entry-loot-item-key","type":"item_id","id":"banana","quantity":{"min":1,"max":1},"criteria":{"weight":1},"name":"Banana","value":100,"custom":{}},{"key":"entry-loot-item-key","type":"item_id","id":"cherry","quantity":{"min":1,"max":1},"criteria":{"weight":1},"name":"Cherry","value":1000,"custom":{}},{"key":"entry-loot-table-key","type":"table_id","id":"vegetables","criteria":{"weight":1},"name":"Vegetables","loot":[],"custom":{}}],"custom":{}}`,
                    );
                });
                test("Recursively searching through the active table structure and excluding fields specified in the 'hideFields' prop from all objects", async () => {
                    renderFunc({ propsOverride: { ...mockProps, hideFields: ["key"] } });

                    const copyJSONButton = screen.getByText("Content_Copy");
                    expect(copyJSONButton).toBeInTheDocument();

                    expect(mockWriteText).not.toHaveBeenCalled();

                    await act(() => userEvent.click(screen.getByText("Content_Copy")));

                    expect(mockWriteText).toHaveBeenCalledWith(
                        `{"name":"Fruits","loot":[{"type":"item_id","id":"apple","quantity":{"max":1},"criteria":{"weight":1}},{"type":"item_id","id":"banana","quantity":{"min":1,"max":1},"criteria":{"weight":1}},{"type":"item_id","id":"cherry","quantity":{"min":1,"max":1},"criteria":{"weight":1}},{"type":"table_id","id":"vegetables","criteria":{"weight":1}}],"custom":{}}`,
                    );
                });
                test("Unless the internal 'showingHiddenFields' boolean state value is 'true'", async () => {
                    renderFunc({ propsOverride: { ...mockProps, hideFields: ["key"] } });

                    const copyJSONButton = screen.getByText("Content_Copy");
                    expect(copyJSONButton).toBeInTheDocument();

                    expect(mockWriteText).not.toHaveBeenCalled();

                    const visibilityButton = screen.getByText("Visibility_Off");
                    await act(() => userEvent.click(visibilityButton));

                    await act(() => userEvent.click(screen.getByText("Content_Copy")));

                    expect(mockWriteText).toHaveBeenCalledWith(
                        `{"name":"Fruits","loot":[{"key":"entry-loot-item-key","type":"item_id","id":"apple","quantity":{"max":1},"criteria":{"weight":1}},{"key":"entry-loot-item-key","type":"item_id","id":"banana","quantity":{"min":1,"max":1},"criteria":{"weight":1}},{"key":"entry-loot-item-key","type":"item_id","id":"cherry","quantity":{"min":1,"max":1},"criteria":{"weight":1}},{"key":"entry-loot-table-key","type":"table_id","id":"vegetables","criteria":{"weight":1}}],"custom":{}}`,
                    );
                });
            });
        });
    });
});
