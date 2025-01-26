import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";
import { RecursiveOptional, Items, Tables, LootItem } from "@/utils/types";
import {
    LootGeneratorState,
    ILootGeneratorContext,
    LootGeneratorContext,
} from "@/pages/LootGenerator";
import { TToggleBarButton } from "@/components/buttons/components/ToggleBar";
import { IInteractiveContext, InteractiveContext } from "../..";
import { ITableContext, TableContext, Table, TTable } from ".";

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
    durian: {
        name: undefined,
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
                quantity: { min: 1, max: 1 },
                criteria: { weight: 1 },
            },
            {
                key: "entry-loot-table-key",
                type: "table_id",
                id: "vegetables",
                criteria: { weight: 1 },
            },
            { key: "entry-loot-entry-key", type: "entry" },
        ],
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

const mockProps: TTable = {
    id: "fruits",
    displayMode: "normal",
    onClick: () => {},
};

const mockDeleteTable = vi.fn();
const mockUploadTableToActive = vi.fn();
const mockCreateEntry = vi.fn();
const mockLootGeneratorContextValue: RecursiveOptional<ILootGeneratorContext> = {
    lootGeneratorState: { tables: mockTables, items: mockItems } as unknown as LootGeneratorState,
    deleteTable: mockDeleteTable,
    uploadTableToActive: mockUploadTableToActive,
    createEntry: mockCreateEntry,
};

const mockInteractiveContextValue: RecursiveOptional<IInteractiveContext> = {
    menuType: "tables",
};

const mockTableContextValue: RecursiveOptional<ITableContext> = {
    pathToRoot: [{ type: "base", id: "base-table-id" }],
};

type renderFuncArgs = {
    LootGeneratorContextOverride?: ILootGeneratorContext;
    InteractiveContextOverride?: IInteractiveContext;
    TableContextOverride?: ITableContext;
    propsOverride?: TTable;
};
const renderFunc = (args: renderFuncArgs = {}) => {
    const {
        LootGeneratorContextOverride,
        InteractiveContextOverride,
        TableContextOverride,
        propsOverride,
    } = args;

    let LootGeneratorContextValue!: ILootGeneratorContext;
    let InteractiveContextValue!: IInteractiveContext;
    let TableAncestorContextValue!: ITableContext;
    let TableDescendantContextValue!: ITableContext;

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
            <InteractiveContext.Provider
                value={
                    InteractiveContextOverride ||
                    (mockInteractiveContextValue as unknown as IInteractiveContext)
                }
            >
                <InteractiveContext.Consumer>
                    {(value) => {
                        InteractiveContextValue = value;
                        return null;
                    }}
                </InteractiveContext.Consumer>
                <TableContext.Provider
                    value={
                        TableContextOverride || (mockTableContextValue as unknown as ITableContext)
                    }
                >
                    <TableContext.Consumer>
                        {(value) => {
                            TableAncestorContextValue = value;
                            return null;
                        }}
                    </TableContext.Consumer>
                    <Table
                        id={propsOverride?.id || mockProps.id}
                        displayMode={propsOverride?.displayMode || mockProps.displayMode}
                        onClick={propsOverride?.onClick || mockProps.onClick}
                    >
                        <TableContext.Consumer>
                            {(value) => {
                                TableDescendantContextValue = value;
                                return null;
                            }}
                        </TableContext.Consumer>
                    </Table>
                </TableContext.Provider>
            </InteractiveContext.Provider>
        </LootGeneratorContext.Provider>
    );

    const { rerender } = render(component);

    return {
        rerender,
        LootGeneratorContextValue,
        InteractiveContextValue,
        TableAncestorContextValue,
        TableDescendantContextValue,
        component,
    };
};

vi.mock("@/components/buttons/components/ToggleBar", () => ({
    ToggleBar: vi.fn(({ name, options, onClick, children }) => {
        return (
            <div aria-label="ToggleBar Component">
                <button type="button" onClick={() => onClick && onClick()}>
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

vi.mock("@/features/Design/components/Interactive/inputs/Text", () => ({
    Text: vi.fn(({ idOrKey, labelText, value, fieldPath, disabled }) => {
        return (
            <label aria-label="Text Component" htmlFor={`${idOrKey}-${fieldPath.join()}`}>
                <input
                    type="text"
                    id={`${idOrKey}-${fieldPath.join()}`}
                    aria-label={`Text Component-${labelText}`}
                    defaultValue={value}
                    aria-disabled={disabled}
                ></input>
                {labelText}
            </label>
        );
    }),
}));

vi.mock("@/features/Design/components/Interactive/components/ItemEntry", () => ({
    ItemEntry: vi.fn(({ entry }) => <div aria-label="ItemEntry Component">{entry.key}</div>),
}));

vi.mock("@/features/Design/components/Interactive/components/TableEntry", () => ({
    TableEntry: vi.fn(({ entry }) => <div aria-label="TableEntry Component">{entry.key}</div>),
}));

vi.mock("@/features/Design/components/Interactive/components/Entry", () => ({
    Entry: vi.fn(({ entry }) => <div aria-label="Entry Component">{entry.key}</div>),
}));

describe("The Table component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Should pass context to its descendant components...", () => {
        describe("Including the 'pathToRoot' array, which should take the 'pathToRoot' array from the nearest Table component ancestor (if applicable), and push a new object to the array...", async () => {
            test("With a 'type' field equal to 'base' and an 'id' field equal to the table's id, if the 'displayMode' prop has a value of 'normal'", async () => {
                const { TableDescendantContextValue } = renderFunc();

                expect(TableDescendantContextValue).toBeDefined();

                const { pathToRoot } = TableDescendantContextValue;
                expect(pathToRoot).toBeDefined();

                expect(pathToRoot).toStrictEqual(
                    mockTableContextValue.pathToRoot!.concat({ type: "base", id: mockProps.id }),
                );
            });
            test("With a 'type' field equal to 'imported' and an 'id' field equal to the table's id, if the 'displayMode' prop does not have a value of 'normal'", async () => {
                const { TableDescendantContextValue } = renderFunc({
                    propsOverride: { ...mockProps, displayMode: "entry" },
                });

                expect(TableDescendantContextValue).toBeDefined();

                const { pathToRoot } = TableDescendantContextValue;
                expect(pathToRoot).toBeDefined();

                expect(pathToRoot).toStrictEqual(
                    mockTableContextValue.pathToRoot!.concat({
                        type: "imported",
                        id: mockProps.id,
                    }),
                );
            });
        });
    });

    describe("Should render the ToggleBar component...", () => {
        describe("With the value being passed to its 'name' prop...", () => {
            test("Being equal to the table's 'name' field in the LootGenerator component's context's 'lootGeneratorState.tables' object if the 'displayMode' prop is equal to either 'normal' or 'selection'", () => {
                renderFunc({ propsOverride: { ...mockProps, displayMode: "selection" } });

                const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
                expect(ToggleBarComponent).toBeInTheDocument();

                const ToggleBarButton = screen.getByText("Fruits");
                expect(ToggleBarButton).toBeInTheDocument();
            });
            test("Or 'Unnamed Table' if the table's 'name' field in the LootGenerator component's context's 'lootGeneratorState.tables' object is not defined", () => {
                renderFunc({ propsOverride: { ...mockProps, id: "durian" } });

                const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
                expect(ToggleBarComponent).toBeInTheDocument();

                const ToggleBarButton = screen.getByText("Unnamed Table");
                expect(ToggleBarButton).toBeInTheDocument();
            });
            test("Or 'Table Properties' if the 'displayMode' prop is equal to either 'entry' or 'entryViewOnly'", () => {
                renderFunc({ propsOverride: { ...mockProps, displayMode: "entry" } });

                const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
                expect(ToggleBarComponent).toBeInTheDocument();

                const ToggleBarButton = screen.getByText("Table Properties");
                expect(ToggleBarButton).toBeInTheDocument();
            });
        });

        describe("Which should have its 'options' prop set equal to an array including...", () => {
            describe("An 'Add_Circle' option...", () => {
                test("If the Interactive component's context's 'menuType' prop is not equal to 'active' and the 'displayMode' prop is equal to 'normal'", () => {
                    renderFunc();

                    const AddCircleOption = screen.getByText("ToggleBar-Option-Add_Circle");
                    expect(AddCircleOption).toBeInTheDocument();
                });
                test("That, on click, should invoke the LootGenerator component's context's 'createEntry' function, passing the value of the 'id' prop", async () => {
                    renderFunc();

                    const AddCircleOption = screen.getByText("ToggleBar-Option-Add_Circle");
                    expect(AddCircleOption).toBeInTheDocument();

                    await userEvent.click(AddCircleOption);

                    expect(mockCreateEntry).toHaveBeenCalledWith(mockProps.id);
                });
                test("That, on click, should invoke the callback function passed to the 'onClick' prop with 'add' as the argument", async () => {
                    const onClickCallback = vi.fn();

                    renderFunc({ propsOverride: { ...mockProps, onClick: onClickCallback } });

                    const AddCircleOption = screen.getByText("ToggleBar-Option-Add_Circle");
                    expect(AddCircleOption).toBeInTheDocument();

                    await userEvent.click(AddCircleOption);

                    expect(onClickCallback).toHaveBeenCalledWith("add");
                });
            });

            describe("An 'Upload' option...", () => {
                test("If the Interactive component's context's 'menuType' prop is not equal to 'active' and the 'displayMode' prop is equal to 'normal'", () => {
                    renderFunc();

                    const UploadOption = screen.getByText("ToggleBar-Option-Upload");
                    expect(UploadOption).toBeInTheDocument();
                });
                test("That, on click, should invoke the LootGenerator component's context's 'uploadTableToActive' function, passing the value of the 'id' prop", async () => {
                    renderFunc();

                    const UploadOption = screen.getByText("ToggleBar-Option-Upload");
                    expect(UploadOption).toBeInTheDocument();

                    await userEvent.click(UploadOption);

                    expect(mockUploadTableToActive).toHaveBeenCalledWith(mockProps.id);
                });
                test("That, on click, should invoke the callback function passed to the 'onClick' prop with 'upload' as the argument", async () => {
                    const onClickCallback = vi.fn();

                    renderFunc({ propsOverride: { ...mockProps, onClick: onClickCallback } });

                    const UploadOption = screen.getByText("ToggleBar-Option-Upload");
                    expect(UploadOption).toBeInTheDocument();

                    await userEvent.click(UploadOption);

                    expect(onClickCallback).toHaveBeenCalledWith("upload");
                });
            });

            describe("A 'Delete' option...", () => {
                test("If the Interactive component's context's 'menuType' prop is not equal to 'active' and the 'displayMode' prop is equal to 'normal'", () => {
                    renderFunc();

                    const DeleteOption = screen.getByText("ToggleBar-Option-Delete");
                    expect(DeleteOption).toBeInTheDocument();
                });
                test("That, on click, should invoke the LootGenerator component's context's 'deleteTable' function, passing the value of the 'id' prop", async () => {
                    renderFunc();

                    const DeleteOption = screen.getByText("ToggleBar-Option-Delete");
                    expect(DeleteOption).toBeInTheDocument();

                    await userEvent.click(DeleteOption);

                    expect(mockDeleteTable).toHaveBeenCalledWith(mockProps.id);
                });
                test("That, on click, should invoke the callback function passed to the 'onClick' prop with 'delete' as the argument", async () => {
                    const onClickCallback = vi.fn();

                    renderFunc({ propsOverride: { ...mockProps, onClick: onClickCallback } });

                    const DeleteOption = screen.getByText("ToggleBar-Option-Delete");
                    expect(DeleteOption).toBeInTheDocument();

                    await userEvent.click(DeleteOption);

                    expect(onClickCallback).toHaveBeenCalledWith("delete");
                });
            });

            describe("A 'Remove_Selection' option...", () => {
                test("If the Interactive component's context's 'menuType' prop is not equal to 'active' and the 'displayMode' prop is equal to 'entry'", () => {
                    renderFunc({ propsOverride: { ...mockProps, displayMode: "entry" } });

                    const RemoveSelectionOption = screen.getByText(
                        "ToggleBar-Option-Remove_Selection",
                    );
                    expect(RemoveSelectionOption).toBeInTheDocument();
                });
                test("That, on click, should invoke the callback function passed to the 'onClick' prop with 'remove_selection' as the argument", async () => {
                    const onClickCallback = vi.fn();

                    renderFunc({
                        propsOverride: {
                            ...mockProps,
                            displayMode: "entry",
                            onClick: onClickCallback,
                        },
                    });

                    const RemoveSelectionOption = screen.getByText(
                        "ToggleBar-Option-Remove_Selection",
                    );
                    expect(RemoveSelectionOption).toBeInTheDocument();

                    await userEvent.click(RemoveSelectionOption);

                    expect(onClickCallback).toHaveBeenCalledWith("remove_selection");
                });
            });

            describe("An 'Edit' option...", () => {
                test("If the Interactive component's context's 'menuType' prop is not equal to 'active' and the 'displayMode' prop is equal to 'entry'", () => {
                    renderFunc({ propsOverride: { ...mockProps, displayMode: "entry" } });

                    const EditOption = screen.getByText("ToggleBar-Option-Edit");
                    expect(EditOption).toBeInTheDocument();
                });
                test("That, on click, should invoke the callback function passed to the 'onClick' prop with 'edit' as the argument", async () => {
                    const onClickCallback = vi.fn();

                    renderFunc({
                        propsOverride: {
                            ...mockProps,
                            displayMode: "entry",
                            onClick: onClickCallback,
                        },
                    });

                    const EditOption = screen.getByText("ToggleBar-Option-Edit");
                    expect(EditOption).toBeInTheDocument();

                    await userEvent.click(EditOption);

                    expect(onClickCallback).toHaveBeenCalledWith("edit");
                });
            });
        });

        test("That, on click, should invoke the callback function passed to the 'onClick' prop with 'toggle' as the argument", async () => {
            const onClickCallback = vi.fn();

            renderFunc({ propsOverride: { ...mockProps, onClick: onClickCallback } });

            const ToggleBarButton = screen.getByText("Fruits");
            expect(ToggleBarButton).toBeInTheDocument();

            await userEvent.click(ToggleBarButton);

            expect(onClickCallback).toHaveBeenCalledWith("toggle");
        });
        test("That should render a Text input component as one of its children for the table entry's 'name' field", async () => {
            renderFunc();

            const valueInput = screen.getByRole("textbox", { name: "Text Component-Name" });
            expect(valueInput).toBeInTheDocument();
        });

        describe("That should, for each entry in the table's 'loot' array...", () => {
            test("Render an ItemEntry component if the entry is a LootItem", () => {
                renderFunc();

                const ItemEntryComponent = screen.getByText("entry-loot-item-key");
                expect(ItemEntryComponent).toBeInTheDocument();
            });
            test("Render a TableEntry component if the entry is a LootTable", () => {
                renderFunc();

                const TableEntryComponent = screen.getByText("entry-loot-table-key");
                expect(TableEntryComponent).toBeInTheDocument();
            });
            test("Render an Entry component if the entry is a LootEntry", () => {
                renderFunc();

                const EntryComponent = screen.getByText("entry-loot-entry-key");
                expect(EntryComponent).toBeInTheDocument();
            });
            test("Skip rendering the entry if its 'type' does not match one of the following: 'item_id', 'item_noid', 'table_id', 'table_noid', 'entry'", () => {
                const adjustedMockTables = structuredClone(mockTables);
                const item = adjustedMockTables["fruits"].loot.find(
                    (entry) => (entry as LootItem).id === "apple",
                );
                if (!item) {
                    throw new Error("Could not find 'apple' item in 'fruits' loot array");
                }
                // @ts-expect-error - Disabling type checking for mocking props in unit test
                (item as LootItem).type = "";

                renderFunc({
                    LootGeneratorContextOverride: {
                        ...mockLootGeneratorContextValue,
                        lootGeneratorState: {
                            ...mockLootGeneratorContextValue.lootGeneratorState,
                            tables: adjustedMockTables,
                        } as unknown as LootGeneratorState,
                    } as unknown as ILootGeneratorContext,
                });

                const ItemEntryComponent = screen.queryByText("entry-loot-item-key");
                expect(ItemEntryComponent).toBeNull();
            });
        });
    });
});
