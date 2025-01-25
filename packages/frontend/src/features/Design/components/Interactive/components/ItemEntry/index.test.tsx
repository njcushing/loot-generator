import { vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";
import { RecursiveOptional, Items } from "@/utils/types";
import {
    LootGeneratorState,
    ILootGeneratorContext,
    LootGeneratorContext,
} from "@/pages/LootGenerator";
import { TToggleBarButton } from "@/components/buttons/components/ToggleBar";
import { IInteractiveContext, InteractiveContext } from "../..";
import { ITableContext, TableContext } from "../Table";
import { ItemEntry, TItemEntry } from ".";

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

const mockProps: TItemEntry = {
    entry: {
        key: "entry-key",
        type: "item_id",
        id: "apple",
        quantity: { min: 1, max: 1 },
        criteria: { weight: 1 },
    },
};

const mockPropsNoId: TItemEntry = {
    entry: {
        key: "entry-key",
        type: "item_noid",
        quantity: { min: 1, max: 1 },
        criteria: { weight: 1 },

        name: "elderflower",
        value: 10000,
        custom: {},
    },
};

const mockSetTypeOnEntry = vi.fn();
const mockDeleteEntry = vi.fn();
const mockLootGeneratorContextValue: RecursiveOptional<ILootGeneratorContext> = {
    lootGeneratorState: { items: mockItems } as unknown as LootGeneratorState,
    setTypeOnEntry: mockSetTypeOnEntry,
    deleteEntry: mockDeleteEntry,
};

const mockInteractiveContextValue: RecursiveOptional<IInteractiveContext> = {
    menuType: "items",
};

const mockTableContextValue: RecursiveOptional<ITableContext> = {
    pathToRoot: [{ type: "base", id: "base-table-id" }],
};

type renderFuncArgs = {
    LootGeneratorContextOverride?: ILootGeneratorContext;
    InteractiveContextOverride?: IInteractiveContext;
    TableContextOverride?: ITableContext;
    propsOverride?: TItemEntry;
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
    let TableContextValue!: ITableContext;

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
                            TableContextValue = value;
                            return null;
                        }}
                    </TableContext.Consumer>
                    <ItemEntry entry={propsOverride?.entry || mockProps.entry} />
                </TableContext.Provider>
            </InteractiveContext.Provider>
        </LootGeneratorContext.Provider>
    );

    const { rerender } = render(component);

    return {
        rerender,
        LootGeneratorContextValue,
        InteractiveContextValue,
        TableContextValue,
        component,
    };
};

vi.mock("@/components/buttons/components/ToggleBar", () => ({
    ToggleBar: vi.fn(({ name, options, children }) => {
        return (
            <div aria-label="ToggleBar Component">
                <button type="button">{name}</button>
                {options.map((option: TToggleBarButton) => {
                    const { symbol, onClick } = option;
                    return (
                        <button
                            type="button"
                            onClick={() => onClick && onClick()}
                            key={symbol}
                        >{`ToggleBar-Option-${symbol}`}</button>
                    );
                })}
                {children}
            </div>
        );
    }),
}));

vi.mock("@/features/Design/components/Interactive/components/SelectEntry", () => ({
    SelectEntry: vi.fn(({ entryKey, id, disabled }) => {
        return (
            <div aria-label="SelectEntry Component" data-id={id} aria-disabled={disabled}>
                {entryKey}
            </div>
        );
    }),
}));

vi.mock("@/features/Design/components/Interactive/components/EntryFieldsToggleBar", () => ({
    EntryFieldsToggleBar: vi.fn(({ name, onClick, fields, subCategories }) => {
        return (
            <button
                aria-label="EntryFieldsToggleBar Component"
                type="button"
                onClick={() => onClick && onClick()}
            >
                {name}
                {fields}
                {subCategories}
            </button>
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

vi.mock("@/features/Design/components/Interactive/inputs/Numeric", () => ({
    Numeric: vi.fn(({ idOrKey, labelText, value, min, fieldPath, disabled }) => {
        return (
            <label aria-label="Numeric Component" htmlFor={`${idOrKey}-${fieldPath.join()}`}>
                <input
                    type="number"
                    id={`${idOrKey}-${fieldPath.join()}`}
                    aria-label={`Numeric Component-${labelText}`}
                    defaultValue={value}
                    data-min={min}
                    aria-disabled={disabled}
                ></input>
                {labelText}
            </label>
        );
    }),
}));

describe("The ItemEntry component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Should render the ToggleBar component...", () => {
        describe("Which should have its 'name' prop set equal to...", () => {
            test("The 'name' field of the item found in the LootGenerator component's context's 'lootGeneratorState.items' object", () => {
                renderFunc();

                const name = mockItems[mockProps.entry.id || ""].name || "";

                const ToggleBarComponent = screen.getByText(name);
                expect(ToggleBarComponent).toBeInTheDocument();
            });
            test("The 'name' field defined directly on the entry if the item is a 'noid' item", () => {
                renderFunc({ propsOverride: { ...mockPropsNoId } });

                // @ts-expect-error - TypeScript isn't recognising that the LootItem type can have 'name' as a field in some circumstances
                const { name } = mockPropsNoId.entry;

                const ToggleBarComponent = screen.getByText(name);
                expect(ToggleBarComponent).toBeInTheDocument();
            });
            test("'Unnamed Item' if the item has an 'id' but is not found in the LootGenerator component's state", () => {
                renderFunc({
                    propsOverride: {
                        ...mockProps,
                        entry: { ...mockProps.entry, id: "invalid-item" } as TItemEntry["entry"],
                    },
                });

                const ToggleBarComponent = screen.getByText("Unnamed Item");
                expect(ToggleBarComponent).toBeInTheDocument();
            });
            test("'Unnamed Item' if the item is found, but 'name' is undefined", () => {
                renderFunc({
                    propsOverride: {
                        ...mockProps,
                        entry: { ...mockProps.entry, id: "durian" } as TItemEntry["entry"],
                    },
                });

                const ToggleBarComponent = screen.getByText("Unnamed Item");
                expect(ToggleBarComponent).toBeInTheDocument();
            });
        });

        describe("Which should have its 'options' prop set equal to an array including...", () => {
            describe("A 'Delete' option...", () => {
                test("Unless the Interactive component's context's 'menuType' field is equal to 'active' or the ItemEntry is a descendant of an imported table", () => {
                    renderFunc({ InteractiveContextOverride: { menuType: "active" } });

                    const ToggleBarComponentDeleteOption =
                        screen.queryByText("ToggleBar-Option-Delete");
                    expect(ToggleBarComponentDeleteOption).not.toBeInTheDocument();
                });
                test("That, on click, should invoke the LootGenerator component's context's 'deleteEntry' function, passing the root table's 'id' and the item entry's 'key'", async () => {
                    renderFunc();

                    const ToggleBarComponentDeleteOption =
                        screen.getByText("ToggleBar-Option-Delete");
                    expect(ToggleBarComponentDeleteOption).toBeInTheDocument();

                    await userEvent.click(ToggleBarComponentDeleteOption);

                    expect(mockDeleteEntry).toHaveBeenCalledWith(
                        mockTableContextValue.pathToRoot![0]!.id,
                        mockProps.entry.key,
                    );
                });
                test("Unless the Table component's context's 'pathToRoot' field is empty, or the 'id' field in its first entry is not defined", async () => {
                    renderFunc({
                        InteractiveContextOverride: { menuType: "items" },
                        // @ts-expect-error - Disabling type checking for mocking props in unit test
                        TableContextOverride: { pathToRoot: [{ type: "base", id: undefined }] },
                    });

                    const ToggleBarComponentDeleteOption =
                        screen.getByText("ToggleBar-Option-Delete");
                    expect(ToggleBarComponentDeleteOption).toBeInTheDocument();

                    await userEvent.click(ToggleBarComponentDeleteOption);
                    fireEvent.mouseLeave(ToggleBarComponentDeleteOption!);

                    expect(mockDeleteEntry).not.toHaveBeenCalled();
                });
            });

            describe("A 'Swap_Horiz' option...", () => {
                test("Unless the Interactive component's context's 'menuType' field is equal to 'active' or the ItemEntry is a descendant of an imported table", () => {
                    renderFunc({ InteractiveContextOverride: { menuType: "active" } });

                    const ToggleBarComponentSwapHorizOption = screen.queryByText(
                        "ToggleBar-Option-Swap_Horiz",
                    );
                    expect(ToggleBarComponentSwapHorizOption).not.toBeInTheDocument();
                });
                test("That, on click, should invoke the LootGenerator component's context's 'setTypeOnEntry' function, passing the root table's 'id', the item entry's 'key' and 'table'", async () => {
                    renderFunc();

                    const ToggleBarComponentSwapHorizOption = screen.getByText(
                        "ToggleBar-Option-Swap_Horiz",
                    );
                    expect(ToggleBarComponentSwapHorizOption).toBeInTheDocument();

                    await userEvent.click(ToggleBarComponentSwapHorizOption);

                    expect(mockSetTypeOnEntry).toHaveBeenCalledWith(
                        mockTableContextValue.pathToRoot![0]!.id,
                        mockProps.entry.key,
                        "table",
                    );
                });
                test("Unless the Table component's context's 'pathToRoot' field is empty, or the 'id' field in its first entry is not defined", async () => {
                    renderFunc({
                        InteractiveContextOverride: { menuType: "items" },
                        // @ts-expect-error - Disabling type checking for mocking props in unit test
                        TableContextOverride: { pathToRoot: [{ type: "base", id: undefined }] },
                    });

                    const ToggleBarComponentSwapHorizOption = screen.getByText(
                        "ToggleBar-Option-Swap_Horiz",
                    );
                    expect(ToggleBarComponentSwapHorizOption).toBeInTheDocument();

                    await userEvent.click(ToggleBarComponentSwapHorizOption);
                    fireEvent.mouseLeave(ToggleBarComponentSwapHorizOption!);

                    expect(mockSetTypeOnEntry).not.toHaveBeenCalled();
                });
            });
        });

        describe("That should render the SelectEntry component as one of its children...", () => {
            test("And pass the value of the entry's 'key' field to its 'entryKey' prop", () => {
                renderFunc();

                const SelectEntryComponent = screen.getByText(mockProps.entry.key);
                expect(SelectEntryComponent).toBeInTheDocument();

                const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
                expect(ToggleBarComponent).toBeInTheDocument();

                expect(ToggleBarComponent.contains(SelectEntryComponent)).toBeTruthy();
            });
            test("And pass the entry's 'id' to its 'id' prop", () => {
                renderFunc();

                const SelectEntryComponent = screen.getByText(mockProps.entry.key);
                expect(SelectEntryComponent).toBeInTheDocument();

                expect(SelectEntryComponent.getAttribute("data-id")).toBe(mockProps.entry.id);
            });
            test("Unless the item is a 'noid' item, in which case an empty string should be passed to its 'id' prop", () => {
                renderFunc({ propsOverride: { ...mockPropsNoId } });

                const SelectEntryComponent = screen.getByText(mockProps.entry.key);
                expect(SelectEntryComponent).toBeInTheDocument();

                expect(SelectEntryComponent.getAttribute("data-id")).toBe("");
            });
            test("And pass 'true' to its 'disabled' prop if the Interactive component's context's 'menuType' prop is equal to 'active' or the ItemEntry is a descendant of an imported table", () => {
                renderFunc();

                const SelectEntryComponent = screen.getByText(mockProps.entry.key);
                expect(SelectEntryComponent).toBeInTheDocument();

                expect(SelectEntryComponent.getAttribute("aria-disabled")).toBeTruthy();
            });
        });

        describe("That should render an EntryFieldsToggleBar component as one of its children with a 'name' prop equal to 'Item Properties'...", () => {
            test("If the entry is a 'noid' item", () => {
                renderFunc({ propsOverride: { ...mockPropsNoId } });

                const EntryFieldsToggleBarComponent = screen.getByText("Item Properties");
                expect(EntryFieldsToggleBarComponent).toBeInTheDocument();
            });
            test("That should render a Text input component as one of its children for the item entry's 'name' field", async () => {
                renderFunc({ propsOverride: { ...mockPropsNoId } });

                const nameInput = screen.getByRole("textbox", { name: "Text Component-Name" });
                expect(nameInput).toBeInTheDocument();

                const EntryFieldsToggleBarComponent = screen.getByText("Item Properties");
                expect(EntryFieldsToggleBarComponent).toBeInTheDocument();

                expect(EntryFieldsToggleBarComponent.contains(nameInput)).toBeTruthy();
            });
            test("That should render a Numeric input component as one of its children for the item entry's 'value' field", async () => {
                renderFunc({ propsOverride: { ...mockPropsNoId } });

                const valueInput = screen.getByRole("spinbutton", {
                    name: "Numeric Component-Value",
                });
                expect(valueInput).toBeInTheDocument();

                const EntryFieldsToggleBarComponent = screen.getByText("Item Properties");
                expect(EntryFieldsToggleBarComponent).toBeInTheDocument();

                expect(EntryFieldsToggleBarComponent.contains(valueInput)).toBeTruthy();
            });
        });

        describe("That should render an EntryFieldsToggleBar component as one of its children with a 'name' prop equal to 'Quantity'...", () => {
            test("That should render a Numeric input component as one of its children for the item entry's 'quantity.min' field", async () => {
                renderFunc();

                const valueInput = screen.getByRole("spinbutton", {
                    name: "Numeric Component-Min",
                });
                expect(valueInput).toBeInTheDocument();

                const EntryFieldsToggleBarComponent = screen.getByText("Quantity");
                expect(EntryFieldsToggleBarComponent).toBeInTheDocument();

                expect(EntryFieldsToggleBarComponent.contains(valueInput)).toBeTruthy();
            });
            test("That should render a Numeric input component as one of its children for the item entry's 'quantity.max' field", async () => {
                renderFunc();

                const valueInput = screen.getByRole("spinbutton", {
                    name: "Numeric Component-Max",
                });
                expect(valueInput).toBeInTheDocument();

                const EntryFieldsToggleBarComponent = screen.getByText("Quantity");
                expect(EntryFieldsToggleBarComponent).toBeInTheDocument();

                expect(EntryFieldsToggleBarComponent.contains(valueInput)).toBeTruthy();
            });
        });

        describe("That should render an EntryFieldsToggleBar component as one of its children with a 'name' prop equal to 'Criteria'...", () => {
            test("That should render a Numeric input component as one of its children for the item entry's 'weight' field", async () => {
                renderFunc();

                const valueInput = screen.getByRole("spinbutton", {
                    name: "Numeric Component-Weight",
                });
                expect(valueInput).toBeInTheDocument();

                const EntryFieldsToggleBarComponent = screen.getByText("Criteria");
                expect(EntryFieldsToggleBarComponent).toBeInTheDocument();

                expect(EntryFieldsToggleBarComponent.contains(valueInput)).toBeTruthy();
            });
        });
    });
});
