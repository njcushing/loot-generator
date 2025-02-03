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
import { TToggleBarButton } from "@/components/buttons/components/ToggleBar";
import * as Item from "@/features/Design/components/Interactive/components/Item";
import * as Table from "@/features/Design/components/Interactive/components/Table";
import { v4 as uuid } from "uuid";
import { act } from "react";
import { SelectEntry, TSelectEntry } from ".";

// Mock dependencies
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
        // @ts-expect-error - Disabling type checking for mocking props in unit tests
        value: undefined,
        custom: {},
    },
};

const mockTables: Tables = {
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
};

const mockProps: TSelectEntry = {
    entryKey: "entry-key",
    id: null,
    disabled: false,
};

const mockSetIdOnEntry = vi.fn(() => true);
const mockRemoveIdFromEntry = vi.fn(() => true);
const mockLootGeneratorContextValue: RecursiveOptional<ILootGeneratorContext> = {
    lootGeneratorState: { tables: mockTables, items: mockItems } as unknown as LootGeneratorState,
    setIdOnEntry: mockSetIdOnEntry,
    removeIdFromEntry: mockRemoveIdFromEntry,
};

const mockTableContextValue: RecursiveOptional<Table.ITableContext> = {
    pathToRoot: [{ type: "base", id: "base-table-id" }],
};

type renderFuncArgs = {
    LootGeneratorContextOverride?: ILootGeneratorContext;
    TableContextOverride?: Table.ITableContext;
    propsOverride?: TSelectEntry;
};
const renderFunc = (args: renderFuncArgs = {}) => {
    const { LootGeneratorContextOverride, TableContextOverride, propsOverride } = args;

    let LootGeneratorContextValue!: ILootGeneratorContext;
    let TableContextValue!: Table.ITableContext;

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
            <Table.TableContext.Provider
                value={
                    TableContextOverride ||
                    (mockTableContextValue as unknown as Table.ITableContext)
                }
            >
                <Table.TableContext.Consumer>
                    {(value) => {
                        TableContextValue = value;
                        return null;
                    }}
                </Table.TableContext.Consumer>
                <SelectEntry
                    entryKey={propsOverride?.entryKey || mockProps.entryKey}
                    id={propsOverride?.id || mockProps.id}
                    disabled={propsOverride?.disabled || mockProps.disabled}
                ></SelectEntry>
            </Table.TableContext.Provider>
        </LootGeneratorContext.Provider>
    );

    const { rerender } = render(component);

    return {
        rerender,
        LootGeneratorContextValue,
        TableContextValue,
        component,
    };
};

vi.mock("@/components/buttons/components/ToggleBar", () => ({
    ToggleBar: vi.fn(({ name, options, onClick, children, disabled }) => {
        return (
            <div aria-label="ToggleBar Component">
                <button type="button" onClick={() => onClick && onClick()} disabled={disabled}>
                    {name}
                </button>
                {options.map((option: TToggleBarButton) => {
                    const { symbol } = option;
                    return (
                        <button
                            type="button"
                            onClick={() => option.onClick && option.onClick()}
                            key={symbol}
                        >{`ToggleBar-Option-${symbol}`}</button>
                    );
                })}
                {children}
            </div>
        );
    }),
}));

vi.mock("@/features/Design/components/Interactive/components/Item", () => ({
    Item: vi.fn(({ id, displayMode, onClick }) => {
        return (
            <button
                aria-label="Item Component"
                type="button"
                data-display-mode={displayMode}
                onClick={() => onClick && onClick()}
            >
                {id}
            </button>
        );
    }),
}));

vi.mock("@/utils/findCompatibleDescendantTables", () => ({
    findCompatibleDescendantTables: vi.fn(() => new Set([...Object.keys(mockTables)])),
}));

vi.mock("@/components/structural/components/TabSelector", () => ({
    TabSelector: vi.fn(({ tabs }) => (
        <div>
            TabSelector Component
            {Object.keys(tabs).map((key) => {
                const tab = tabs[key];
                const { name, content } = tab;
                return (
                    <div aria-label={`TabSelector-tab-${name}`} key={uuid()}>
                        {content}
                    </div>
                );
            })}
        </div>
    )),
}));

describe("The SelectEntry component...", () => {
    beforeEach(() => {
        vi.spyOn(Table, "Table").mockImplementation(
            vi.fn(({ id, displayMode, onClick }) => {
                return (
                    <button
                        aria-label="Table Component"
                        type="button"
                        data-display-mode={displayMode}
                        // @ts-expect-error - Disabling type checking for mocking props in unit test
                        onClick={() => onClick && onClick()}
                    >
                        {id}
                    </button>
                );
            }),
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Should, if the 'id' prop is 'null' (or the specified table or item is not found), or the internal 'selectingEntry' state is 'false'...", () => {
        describe("Render the ToggleBar component...", () => {
            describe("With the value being passed to its 'name' prop...", () => {
                test("With a 'name' prop equal to 'Select an entry' if the 'disabled' prop is 'false'", async () => {
                    renderFunc({ propsOverride: { ...mockProps, id: "invalid item or table" } });

                    const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
                    expect(ToggleBarComponent).toBeInTheDocument();

                    const ToggleBarButton = screen.getByRole("button", { name: "Select an entry" });
                    expect(ToggleBarButton).toBeInTheDocument();
                });
                test("With a 'name' prop equal to 'Cannot select entry' if the 'disabled' prop is 'true'", async () => {
                    renderFunc({ propsOverride: { ...mockProps, disabled: true } });

                    const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
                    expect(ToggleBarComponent).toBeInTheDocument();

                    const ToggleBarButton = screen.getByRole("button", {
                        name: "Cannot select entry",
                    });
                    expect(ToggleBarButton).toBeInTheDocument();
                });
            });

            describe("Which should have its 'options' prop set equal to an array including...", () => {
                describe("An 'Edit' option...", () => {
                    test("Unless the 'disabled' prop is 'true'", async () => {
                        renderFunc({ propsOverride: { ...mockProps, disabled: true } });

                        const EditOption = screen.queryByText("ToggleBar-Option-Edit");
                        expect(EditOption).toBeNull();
                    });
                    test("That, on click, should invert the 'selectingEntry' internal state boolean value", async () => {
                        renderFunc();

                        const EditOption = screen.getByText("ToggleBar-Option-Edit");
                        expect(EditOption).toBeInTheDocument();

                        // A TabSelector component will be rendered when the 'disabled' prop is false and 'selectingEntry' is true

                        expect(screen.queryByText("TabSelector Component")).toBeNull();

                        await act(async () => userEvent.click(EditOption));

                        expect(screen.getByText("TabSelector Component")).toBeInTheDocument();

                        await act(async () => userEvent.click(EditOption));

                        expect(screen.queryByText("TabSelector Component")).toBeNull();
                    });
                });
            });

            test("That, on click, should invert the 'selectingEntry' internal state boolean value", async () => {
                renderFunc();

                const ToggleBarButton = screen.getByRole("button", { name: "Select an entry" });
                expect(ToggleBarButton).toBeInTheDocument();

                // A TabSelector component will be rendered when the 'disabled' prop is false and 'selectingEntry' is true

                expect(screen.queryByText("TabSelector Component")).toBeNull();

                await act(async () => userEvent.click(ToggleBarButton));

                expect(screen.getByText("TabSelector Component")).toBeInTheDocument();

                await act(async () => userEvent.click(ToggleBarButton));

                expect(screen.queryByText("TabSelector Component")).toBeNull();
            });

            test("That should have its 'disabled' prop set to the same value as the SelectEntry component's 'disabled' prop", async () => {
                renderFunc({ propsOverride: { ...mockProps, disabled: true } });

                const ToggleBarButton = screen.getByRole("button", { name: "Cannot select entry" });
                expect(ToggleBarButton).toBeInTheDocument();

                expect(screen.queryByText("TabSelector Component")).toBeNull();

                await act(async () => userEvent.click(ToggleBarButton));

                expect(screen.queryByText("TabSelector Component")).toBeNull();
            });
        });
    });

    describe("Should, if the 'id' prop is 'null', the 'disabled' prop is 'false', and the internal 'selectingEntry' state is 'true'...", () => {
        describe("Render the TabSelector component...", () => {
            describe("With one tab called 'Tables' that contains a TableEntry component for each entry returned by the 'findCompatibleDescendantTables' function...", () => {
                test("Unless the length of the nearest ancestor Table component's context's 'pathToRoot' field has a length of 0", async () => {
                    renderFunc({
                        TableContextOverride: { ...mockTableContextValue, pathToRoot: [] },
                    });

                    const ToggleBarButton = screen.getByRole("button", { name: "Select an entry" });
                    expect(ToggleBarButton).toBeInTheDocument();

                    expect(screen.queryByText("TabSelector Component")).toBeNull();

                    await act(async () => userEvent.click(ToggleBarButton));

                    expect(screen.getByText("TabSelector Component")).toBeInTheDocument();

                    const TablesTab = screen.getByLabelText("TabSelector-tab-Tables");
                    expect(TablesTab).toBeInTheDocument();

                    Object.keys(mockTables).forEach((tableId) => {
                        const TableEntry = screen.queryByText(tableId);
                        expect(TableEntry).toBeNull();
                    });
                });
                test("Unless the final entry of the nearest ancestor Table component's context's 'pathToRoot' field has an 'id' field with a falsy value", async () => {
                    renderFunc({
                        TableContextOverride: {
                            ...mockTableContextValue,
                            pathToRoot: [{ type: "base", id: null }],
                        },
                    });

                    const ToggleBarButton = screen.getByRole("button", { name: "Select an entry" });
                    expect(ToggleBarButton).toBeInTheDocument();

                    expect(screen.queryByText("TabSelector Component")).toBeNull();

                    await act(async () => userEvent.click(ToggleBarButton));

                    expect(screen.getByText("TabSelector Component")).toBeInTheDocument();

                    const TablesTab = screen.getByLabelText("TabSelector-tab-Tables");
                    expect(TablesTab).toBeInTheDocument();

                    Object.keys(mockTables).forEach((tableId) => {
                        const TableEntry = screen.queryByText(tableId);
                        expect(TableEntry).toBeNull();
                    });
                });
                test("Each with an 'id' prop equal to the table's 'id' and 'displayMode' prop equal to 'selection'", async () => {
                    renderFunc();

                    const ToggleBarButton = screen.getByRole("button", { name: "Select an entry" });
                    expect(ToggleBarButton).toBeInTheDocument();

                    expect(screen.queryByText("TabSelector Component")).toBeNull();

                    await act(async () => userEvent.click(ToggleBarButton));

                    expect(screen.getByText("TabSelector Component")).toBeInTheDocument();

                    const TablesTab = screen.getByLabelText("TabSelector-tab-Tables");
                    expect(TablesTab).toBeInTheDocument();

                    Object.keys(mockTables).forEach((tableId) => {
                        const TableEntry = screen.getByText(tableId);
                        expect(TableEntry).toBeInTheDocument();
                        expect(TablesTab.contains(TableEntry)).toBeTruthy();
                        expect(TableEntry.getAttribute("data-display-mode")).toBe("selection");
                    });
                });
                test("That, on click, should invoke the LootGenerator component's context's 'setIdOnEntry' function, passing the root table's 'id', the entry's 'key', and the table's 'id'", async () => {
                    renderFunc();

                    const ToggleBarButton = screen.getByRole("button", { name: "Select an entry" });
                    expect(ToggleBarButton).toBeInTheDocument();

                    await act(async () => userEvent.click(ToggleBarButton));

                    const tableId = Object.keys(mockTables)[0];

                    const TableEntry = screen.getByText(tableId);
                    expect(TableEntry).toBeInTheDocument();

                    await act(async () => userEvent.click(TableEntry));

                    expect(mockSetIdOnEntry).toHaveBeenCalledWith(
                        mockTableContextValue.pathToRoot![0]!.id,
                        mockProps.entryKey,
                        tableId,
                    );
                });
                test("That, on click, should invert the 'selectingEntry' internal state boolean value", async () => {
                    renderFunc();

                    const ToggleBarButton = screen.getByRole("button", { name: "Select an entry" });
                    expect(ToggleBarButton).toBeInTheDocument();

                    await act(async () => userEvent.click(ToggleBarButton));

                    const tableId = Object.keys(mockTables)[0];

                    const TableEntry = screen.getByText(tableId);
                    expect(TableEntry).toBeInTheDocument();

                    expect(screen.getByText("TabSelector Component")).toBeInTheDocument();

                    await act(async () => userEvent.click(TableEntry));

                    expect(screen.queryByText("TabSelector Component")).toBeNull();
                });
            });

            describe("With one tab called 'Items' that contains an ItemEntry component for each entry in the LootGenerator component's context's 'lootGeneratorState.items' object...", () => {
                test("Each with an 'id' prop equal to the item's 'id' and 'displayMode' prop equal to 'selection'", async () => {
                    renderFunc();

                    const ToggleBarButton = screen.getByRole("button", { name: "Select an entry" });
                    expect(ToggleBarButton).toBeInTheDocument();

                    expect(screen.queryByText("TabSelector Component")).toBeNull();

                    await act(async () => userEvent.click(ToggleBarButton));

                    expect(screen.getByText("TabSelector Component")).toBeInTheDocument();

                    const ItemsTab = screen.getByLabelText("TabSelector-tab-Items");
                    expect(ItemsTab).toBeInTheDocument();

                    Object.keys(mockItems).forEach((itemId) => {
                        const ItemEntry = screen.getByText(itemId);
                        expect(ItemEntry).toBeInTheDocument();
                        expect(ItemsTab.contains(ItemEntry)).toBeTruthy();
                        expect(ItemEntry.getAttribute("data-display-mode")).toBe("selection");
                    });
                });
                test("That, on click, should invoke the LootGenerator component's context's 'setIdOnEntry' function, passing the root table's 'id', the entry's 'key', and the item's 'id'", async () => {
                    renderFunc();

                    const ToggleBarButton = screen.getByRole("button", { name: "Select an entry" });
                    expect(ToggleBarButton).toBeInTheDocument();

                    await act(async () => userEvent.click(ToggleBarButton));

                    const itemId = Object.keys(mockItems)[0];

                    const ItemEntry = screen.getByText(itemId);
                    expect(ItemEntry).toBeInTheDocument();

                    await act(async () => userEvent.click(ItemEntry));

                    expect(mockSetIdOnEntry).toHaveBeenCalledWith(
                        mockTableContextValue.pathToRoot![0]!.id,
                        mockProps.entryKey,
                        itemId,
                    );
                });
                test("That, on click, should invert the 'selectingEntry' internal state boolean value", async () => {
                    renderFunc();

                    const ToggleBarButton = screen.getByRole("button", { name: "Select an entry" });
                    expect(ToggleBarButton).toBeInTheDocument();

                    await act(async () => userEvent.click(ToggleBarButton));

                    const itemId = Object.keys(mockItems)[0];

                    const ItemEntry = screen.getByText(itemId);
                    expect(ItemEntry).toBeInTheDocument();

                    expect(screen.getByText("TabSelector Component")).toBeInTheDocument();

                    await act(async () => userEvent.click(ItemEntry));

                    expect(screen.queryByText("TabSelector Component")).toBeNull();
                });
            });
        });
    });

    describe("Should, if the 'id' prop results in a table or item being found, and the internal 'selectingEntry' state is 'false'...", () => {
        describe("If the entry found is a table...", () => {
            test("Render the Table component", () => {
                renderFunc({ propsOverride: { ...mockProps, id: "fruits" } });

                const TableComponent = screen.getByLabelText("Table Component");
                expect(TableComponent).toBeInTheDocument();
                expect(TableComponent.textContent).toBe("fruits");
                expect(TableComponent.getAttribute("data-display-mode")).toBe("entry");
            });
            test("With a 'displayMode' prop equal to 'entry' if the 'disabled' prop is 'false'", () => {
                renderFunc({ propsOverride: { ...mockProps, id: "fruits" } });

                const TableComponent = screen.getByLabelText("Table Component");
                expect(TableComponent).toBeInTheDocument();
                expect(TableComponent.getAttribute("data-display-mode")).toBe("entry");
            });
            test("With a 'displayMode' prop equal to 'entryViewOnly' if the 'disabled' prop is 'true'", () => {
                renderFunc({ propsOverride: { ...mockProps, id: "fruits", disabled: true } });

                const TableComponent = screen.getByLabelText("Table Component");
                expect(TableComponent).toBeInTheDocument();
                expect(TableComponent.getAttribute("data-display-mode")).toBe("entryViewOnly");
            });
            test("That, on click, if the argument is 'remove_selection' should invoke the LootGenerator component's context's 'removeIdFromEntry' function, passing the root table's 'id' and the entry's 'key'", async () => {
                vi.spyOn(Table, "Table").mockImplementationOnce(
                    vi.fn(({ id, displayMode, onClick }) => {
                        return (
                            <button
                                aria-label="Table Component"
                                type="button"
                                data-display-mode={displayMode}
                                onClick={() => onClick && onClick("remove_selection")}
                            >
                                {id}
                            </button>
                        );
                    }),
                );

                renderFunc({ propsOverride: { ...mockProps, id: "fruits" } });

                const TableComponent = screen.getByLabelText("Table Component");
                expect(TableComponent).toBeInTheDocument();
                expect(TableComponent.getAttribute("data-display-mode")).toBe("entry");

                await act(async () => userEvent.click(TableComponent));

                expect(mockRemoveIdFromEntry).toHaveBeenCalledWith(
                    mockTableContextValue.pathToRoot![0]!.id,
                    mockProps.entryKey,
                );
            });
            test("Unless the first entry in the nearest ancestor Table component's context's 'pathToRoot' array has an 'id' field equal to 'null'", async () => {
                vi.spyOn(Table, "Table").mockImplementationOnce(
                    vi.fn(({ id, displayMode, onClick }) => {
                        return (
                            <button
                                aria-label="Table Component"
                                type="button"
                                data-display-mode={displayMode}
                                onClick={() => onClick && onClick("remove_selection")}
                            >
                                {id}
                            </button>
                        );
                    }),
                );

                renderFunc({
                    TableContextOverride: {
                        ...mockTableContextValue,
                        pathToRoot: [{ type: "base", id: null }],
                    },
                    propsOverride: { ...mockProps, id: "fruits" },
                });

                const TableComponent = screen.getByLabelText("Table Component");
                expect(TableComponent).toBeInTheDocument();
                expect(TableComponent.getAttribute("data-display-mode")).toBe("entry");

                await act(async () => userEvent.click(TableComponent));

                expect(mockRemoveIdFromEntry).not.toHaveBeenCalled();
            });
            test("That, on click, if the argument is 'edit' should invert the 'selectingEntry' internal state boolean value", async () => {
                vi.spyOn(Table, "Table").mockImplementationOnce(
                    vi.fn(({ id, displayMode, onClick }) => {
                        return (
                            <button
                                aria-label="Table Component"
                                type="button"
                                data-display-mode={displayMode}
                                onClick={() => onClick && onClick("edit")}
                            >
                                {id}
                            </button>
                        );
                    }),
                );

                renderFunc({ propsOverride: { ...mockProps, id: "fruits" } });

                const TableComponent = screen.getByLabelText("Table Component");
                expect(TableComponent).toBeInTheDocument();
                expect(TableComponent.getAttribute("data-display-mode")).toBe("entry");

                expect(screen.queryByText("TabSelector Component")).toBeNull();

                await act(async () => userEvent.click(TableComponent));

                expect(screen.getByText("TabSelector Component")).toBeInTheDocument();
            });
        });

        describe("If the entry found is an item...", () => {
            test("Render the Item component", () => {
                renderFunc({ propsOverride: { ...mockProps, id: "apple" } });

                const ItemComponent = screen.getByLabelText("Item Component");
                expect(ItemComponent).toBeInTheDocument();
                expect(ItemComponent.textContent).toBe("apple");
                expect(ItemComponent.getAttribute("data-display-mode")).toBe("entry");
            });
            test("With a 'displayMode' prop equal to 'entry' if the 'disabled' prop is 'false'", () => {
                renderFunc({ propsOverride: { ...mockProps, id: "apple" } });

                const ItemComponent = screen.getByLabelText("Item Component");
                expect(ItemComponent).toBeInTheDocument();
                expect(ItemComponent.getAttribute("data-display-mode")).toBe("entry");
            });
            test("With a 'displayMode' prop equal to 'entryViewOnly' if the 'disabled' prop is 'true'", () => {
                renderFunc({ propsOverride: { ...mockProps, id: "apple", disabled: true } });

                const ItemComponent = screen.getByLabelText("Item Component");
                expect(ItemComponent).toBeInTheDocument();
                expect(ItemComponent.getAttribute("data-display-mode")).toBe("entryViewOnly");
            });
            test("That, on click, if the argument is 'remove_selection' should invoke the LootGenerator component's context's 'removeIdFromEntry' function, passing the root table's 'id' and the entry's 'key'", async () => {
                vi.spyOn(Item, "Item").mockImplementationOnce(
                    vi.fn(({ id, displayMode, onClick }) => {
                        return (
                            <button
                                aria-label="Item Component"
                                type="button"
                                data-display-mode={displayMode}
                                onClick={() => onClick && onClick("remove_selection")}
                            >
                                {id}
                            </button>
                        );
                    }),
                );

                renderFunc({ propsOverride: { ...mockProps, id: "apple" } });

                const ItemComponent = screen.getByLabelText("Item Component");
                expect(ItemComponent).toBeInTheDocument();
                expect(ItemComponent.getAttribute("data-display-mode")).toBe("entry");

                await act(async () => userEvent.click(ItemComponent));

                expect(mockRemoveIdFromEntry).toHaveBeenCalledWith(
                    mockTableContextValue.pathToRoot![0]!.id,
                    mockProps.entryKey,
                );
            });
            test("Unless the first entry in the nearest ancestor Table component's context's 'pathToRoot' array has an 'id' field equal to 'null'", async () => {
                vi.spyOn(Item, "Item").mockImplementationOnce(
                    vi.fn(({ id, displayMode, onClick }) => {
                        return (
                            <button
                                aria-label="Item Component"
                                type="button"
                                data-display-mode={displayMode}
                                onClick={() => onClick && onClick("remove_selection")}
                            >
                                {id}
                            </button>
                        );
                    }),
                );

                renderFunc({
                    TableContextOverride: {
                        ...mockTableContextValue,
                        pathToRoot: [{ type: "base", id: null }],
                    },
                    propsOverride: { ...mockProps, id: "apple" },
                });

                const ItemComponent = screen.getByLabelText("Item Component");
                expect(ItemComponent).toBeInTheDocument();
                expect(ItemComponent.getAttribute("data-display-mode")).toBe("entry");

                await act(async () => userEvent.click(ItemComponent));

                expect(mockRemoveIdFromEntry).not.toHaveBeenCalled();
            });
            test("That, on click, if the argument is 'edit' should invert the 'selectingEntry' internal state boolean value", async () => {
                vi.spyOn(Item, "Item").mockImplementationOnce(
                    vi.fn(({ id, displayMode, onClick }) => {
                        return (
                            <button
                                aria-label="Item Component"
                                type="button"
                                data-display-mode={displayMode}
                                onClick={() => onClick && onClick("edit")}
                            >
                                {id}
                            </button>
                        );
                    }),
                );

                renderFunc({ propsOverride: { ...mockProps, id: "apple" } });

                const ItemComponent = screen.getByLabelText("Item Component");
                expect(ItemComponent).toBeInTheDocument();
                expect(ItemComponent.getAttribute("data-display-mode")).toBe("entry");

                expect(screen.queryByText("TabSelector Component")).toBeNull();

                await act(async () => userEvent.click(ItemComponent));

                expect(screen.getByText("TabSelector Component")).toBeInTheDocument();
            });
        });
    });
});
