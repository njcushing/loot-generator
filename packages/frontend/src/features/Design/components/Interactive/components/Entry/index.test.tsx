import { vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";
import { RecursiveOptional } from "@/utils/types";
import { ILootGeneratorContext, LootGeneratorContext } from "@/pages/LootGenerator";
import { TToggleBarButton } from "@/components/buttons/components/ToggleBar";
import { IInteractiveContext, InteractiveContext } from "../..";
import { ITableContext, TableContext } from "../Table";
import { Entry, TEntry } from ".";

// Mock dependencies
const mockProps: TEntry = {
    entry: { type: "entry", key: "entry-key" },
};

const mockSetTypeOnEntry = vi.fn();
const mockDeleteEntry = vi.fn();
const mockLootGeneratorContextValue: RecursiveOptional<ILootGeneratorContext> = {
    setTypeOnEntry: mockSetTypeOnEntry,
    deleteEntry: mockDeleteEntry,
};

const mockInteractiveContextValue: RecursiveOptional<IInteractiveContext> = {
    menuType: "active",
};

const mockTableContextValue: RecursiveOptional<ITableContext> = {
    pathToRoot: [{ type: "base", id: "base-table-id" }],
};

type renderFuncArgs = {
    LootGeneratorContextOverride?: ILootGeneratorContext;
    InteractiveContextOverride?: IInteractiveContext;
    TableContextOverride?: ITableContext;
    propsOverride?: TEntry;
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
                    <Entry entry={propsOverride?.entry || mockProps.entry} />
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

describe("The Entry component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Should render the ToggleBar component...", () => {
        test("With 'New Entry' being passed to its 'name' prop", () => {
            renderFunc();

            const ToggleBarComponent = screen.getByText("New Entry");
            expect(ToggleBarComponent).toBeInTheDocument();
        });
        describe("With a 'Delete' option being passed to its 'options' prop...", () => {
            test("Unless the Interactive component's context's 'menuType' prop equal to 'active' or the Entry is a descendant of an imported table", () => {
                renderFunc();

                const ToggleBarComponentDeleteOption =
                    screen.queryByText("ToggleBar-Option-Delete");
                expect(ToggleBarComponentDeleteOption).not.toBeInTheDocument();
            });
            test("That, on click, should invoke the LootGenerator component's context's 'deleteEntry' function, passing the root table's 'id' and the entry's 'key'", async () => {
                renderFunc({ InteractiveContextOverride: { menuType: "items" } });

                const ToggleBarComponentDeleteOption = screen.getByText("ToggleBar-Option-Delete");
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

                const ToggleBarComponentDeleteOption = screen.getByText("ToggleBar-Option-Delete");
                expect(ToggleBarComponentDeleteOption).toBeInTheDocument();

                await userEvent.click(ToggleBarComponentDeleteOption);
                fireEvent.mouseLeave(ToggleBarComponentDeleteOption!);

                expect(mockDeleteEntry).not.toHaveBeenCalled();
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
            test("And pass 'null' to its 'id' prop", () => {
                renderFunc();

                const SelectEntryComponent = screen.getByText(mockProps.entry.key);
                expect(SelectEntryComponent).toBeInTheDocument();

                expect(SelectEntryComponent.getAttribute("data-id")).toBeNull();
            });
            test("And pass 'true' to its 'disabled' prop if the Interactive component's context's 'menuType' prop is equal to 'active' or the Entry is a descendant of an imported table", () => {
                renderFunc();

                const SelectEntryComponent = screen.getByText(mockProps.entry.key);
                expect(SelectEntryComponent).toBeInTheDocument();

                expect(SelectEntryComponent.getAttribute("aria-disabled")).toBeTruthy();
            });
        });
        describe("That should render a button with text content 'Table' as one of its children...", () => {
            test("Unless the Interactive component's context's 'menuType' prop equal to 'active' or the Entry is a descendant of an imported table", () => {
                renderFunc();

                const TableButtonChildren = screen.queryAllByText("Table");
                expect(TableButtonChildren).toHaveLength(0);
            });
            test("That, on click, should invoke the LootGenerator component's context's 'setTypeOnEntry' function, passing the root table's 'id', the entry's 'key', and 'table'", async () => {
                renderFunc({ InteractiveContextOverride: { menuType: "items" } });

                const TableButton = screen.getAllByText("Table")[0].parentElement;
                expect(TableButton).toBeInTheDocument();

                await userEvent.click(TableButton!);
                fireEvent.mouseLeave(TableButton!);

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

                const TableButton = screen.getAllByText("Table")[0].parentElement;
                expect(TableButton).toBeInTheDocument();

                await userEvent.click(TableButton!);
                fireEvent.mouseLeave(TableButton!);

                expect(mockSetTypeOnEntry).not.toHaveBeenCalled();
            });
        });
        describe("That should render a button with text content 'Item' as one of its children...", () => {
            test("Unless the Interactive component's context's 'menuType' prop equal to 'active' or the Entry is a descendant of an imported table", () => {
                renderFunc();

                const ItemButtonChildren = screen.queryAllByText("Item");
                expect(ItemButtonChildren).toHaveLength(0);
            });
            test("That, on click, should invoke the LootGenerator component's context's 'setTypeOnEntry' function, passing the root table's 'id', the entry's 'key', and 'item'", async () => {
                renderFunc({ InteractiveContextOverride: { menuType: "items" } });

                const ItemButton = screen.getAllByText("Item")[0].parentElement;
                expect(ItemButton).toBeInTheDocument();

                await userEvent.click(ItemButton!);
                fireEvent.mouseLeave(ItemButton!);

                expect(mockSetTypeOnEntry).toHaveBeenCalledWith(
                    mockTableContextValue.pathToRoot![0]!.id,
                    mockProps.entry.key,
                    "item",
                );
            });
            test("Unless the Table component's context's 'pathToRoot' field is empty, or the 'id' field in its first entry is not defined", async () => {
                renderFunc({
                    InteractiveContextOverride: { menuType: "items" },
                    // @ts-expect-error - Disabling type checking for mocking props in unit test
                    TableContextOverride: { pathToRoot: [{ type: "base", id: undefined }] },
                });

                const ItemButton = screen.getAllByText("Item")[0].parentElement;
                expect(ItemButton).toBeInTheDocument();

                await userEvent.click(ItemButton!);
                fireEvent.mouseLeave(ItemButton!);

                expect(mockSetTypeOnEntry).not.toHaveBeenCalled();
            });
        });
    });
});
