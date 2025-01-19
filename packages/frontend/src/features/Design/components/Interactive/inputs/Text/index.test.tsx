import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";
import { RecursiveOptional } from "@/utils/types";
import { ILootGeneratorContext, LootGeneratorContext } from "@/pages/LootGenerator";
import { ITableContext, TableContext } from "../../components/Table";
import { Text, TText } from ".";

const mockProps: TText = {
    idOrKey: "idValue",
    type: "table",
    labelText: "",
    value: "value",
    fieldPath: ["topLevel", "midLevel"],
    disabled: false,
};

// Mock dependencies
const mockUpdateTable = vi.fn();
const mockUpdateItem = vi.fn();
const mockUpdateEntry = vi.fn();
const mockLootGeneratorContextValue: RecursiveOptional<ILootGeneratorContext> = {
    updateTable: mockUpdateTable,
    updateItem: mockUpdateItem,
    updateEntry: mockUpdateEntry,
};

const mockTableContextValue: RecursiveOptional<ITableContext> = {
    pathToRoot: [{ type: "base", id: "base-table-id" }],
};

type renderFuncArgs = {
    LootGeneratorContextOverride?: ILootGeneratorContext;
    TableContextOverride?: ITableContext;
    propsOverride?: TText;
};
const renderFunc = (args: renderFuncArgs = {}) => {
    const { LootGeneratorContextOverride, TableContextOverride, propsOverride } = args;

    let LootGeneratorContextValue!: ILootGeneratorContext;
    let TableContextValue!: ITableContext;

    const { rerender } = render(
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
            <TableContext.Provider
                value={TableContextOverride || (mockTableContextValue as unknown as ITableContext)}
            >
                <TableContext.Consumer>
                    {(value) => {
                        TableContextValue = value;
                        return null;
                    }}
                </TableContext.Consumer>
                <Text
                    idOrKey={propsOverride?.idOrKey || mockProps.idOrKey}
                    type={propsOverride?.type || mockProps.type}
                    labelText={propsOverride?.labelText || mockProps.labelText}
                    value={propsOverride?.value || mockProps.value}
                    fieldPath={propsOverride?.fieldPath || mockProps.fieldPath}
                    disabled={propsOverride?.disabled || mockProps.disabled}
                />
            </TableContext.Provider>
        </LootGeneratorContext.Provider>,
    );

    return { rerender, LootGeneratorContextValue, TableContextValue };
};

describe("The Text component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should render a text input element", () => {
        renderFunc();

        const inputElement = screen.getByRole("textbox");
        expect(inputElement).toBeInTheDocument();
    });
    test("That has a default value equal to the value of the 'value' prop", () => {
        renderFunc();

        const inputElement = screen.getByRole("textbox");
        expect(inputElement).toBeInTheDocument();
        expect((inputElement as HTMLInputElement).value).toBe(mockProps.value);
    });
    describe("Should, on change...", () => {
        describe("If the 'type' prop is 'table'...", () => {
            test("Invoke the 'updateTable' function from the LootGenerator component's context", async () => {
                renderFunc();

                const inputElement = screen.getByRole("textbox");
                expect(inputElement).toBeInTheDocument();

                await userEvent.type(inputElement, "a");

                expect(mockUpdateTable).toHaveBeenCalled();
            });
            test("Providing the value of the 'idOrKey' prop and current field path with the new value as arguments", async () => {
                renderFunc();

                const inputElement = screen.getByRole("textbox");
                expect(inputElement).toBeInTheDocument();

                await userEvent.type(inputElement, "a");

                const { idOrKey, value, fieldPath } = mockProps;
                expect(mockUpdateTable).toHaveBeenCalledWith(idOrKey, [
                    { newValue: `${value}a`, path: fieldPath },
                ]);
            });
        });
        describe("If the 'type' prop is 'item'...", () => {
            test("Invoke the 'updateItem' function from the LootGenerator component's context", async () => {
                renderFunc({ propsOverride: { ...mockProps, type: "item" } });

                const inputElement = screen.getByRole("textbox");
                expect(inputElement).toBeInTheDocument();

                await userEvent.type(inputElement, "a");

                expect(mockUpdateItem).toHaveBeenCalled();
            });
            test("Providing the value of the 'idOrKey' prop and current field path with the new value as arguments", async () => {
                renderFunc({ propsOverride: { ...mockProps, type: "item" } });

                const inputElement = screen.getByRole("textbox");
                expect(inputElement).toBeInTheDocument();

                await userEvent.type(inputElement, "a");

                const { idOrKey, value, fieldPath } = mockProps;
                expect(mockUpdateItem).toHaveBeenCalledWith(idOrKey, [
                    { newValue: `${value}a`, path: fieldPath },
                ]);
            });
        });
        describe("If the 'type' prop is 'entry'...", () => {
            test("Invoke the 'updateEntry' function from the LootGenerator component's context", async () => {
                renderFunc({ propsOverride: { ...mockProps, type: "entry" } });

                const inputElement = screen.getByRole("textbox");
                expect(inputElement).toBeInTheDocument();

                await userEvent.type(inputElement, "a");

                expect(mockUpdateEntry).toHaveBeenCalled();
            });
            test("Providing the id value of the base table, 'idOrKey' prop and current field path with the new value as arguments", async () => {
                const { TableContextValue } = renderFunc({
                    propsOverride: { ...mockProps, type: "entry" },
                });
                const { pathToRoot } = TableContextValue;

                const inputElement = screen.getByRole("textbox");
                expect(inputElement).toBeInTheDocument();

                await userEvent.type(inputElement, "a");

                const { idOrKey, value, fieldPath } = mockProps;
                expect(mockUpdateEntry).toHaveBeenCalledWith(pathToRoot[0].id, idOrKey, [
                    { newValue: `${value}a`, path: fieldPath },
                ]);
            });
        });
    });
});
