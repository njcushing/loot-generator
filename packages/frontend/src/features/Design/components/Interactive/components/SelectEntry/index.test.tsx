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

vi.mock("@/components/structural/components/TabSelector", () => ({
    TabSelector: vi.fn(({ tabs }) => (
        <div>
            TabSelector Component
            {Object.keys(tabs).map((key) => {
                const tab = tabs[key];
                return <div key={uuid()}>{tab.content}</div>;
            })}
        </div>
    )),
}));

describe("The SelectEntry component...", () => {
    beforeAll(() => {
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
        describe("Render the ToggleBar component...", async () => {
            describe("With the value being passed to its 'name' prop...", () => {
                test("With a 'name' prop equal to 'Select an entry' if the 'disabled' prop is 'false'", async () => {
                    renderFunc();

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
});
