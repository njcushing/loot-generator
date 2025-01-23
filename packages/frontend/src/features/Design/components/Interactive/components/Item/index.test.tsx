import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";
import { RecursiveOptional, Items } from "@/utils/types";
import {
    LootGeneratorState,
    ILootGeneratorContext,
    LootGeneratorContext,
} from "@/pages/LootGenerator";
import { TToggleBarButton } from "@/components/buttons/components/ToggleBar";
import { Item, TItem } from ".";

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

const mockProps: TItem = {
    id: "apple",
    displayMode: "normal",
    onClick: () => {},
};

const mockDeleteItem = vi.fn();
const mockLootGeneratorContextValue: RecursiveOptional<ILootGeneratorContext> = {
    lootGeneratorState: { items: mockItems } as unknown as LootGeneratorState,
    deleteItem: mockDeleteItem,
};

type renderFuncArgs = {
    LootGeneratorContextOverride?: ILootGeneratorContext;
    propsOverride?: TItem;
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
            <Item
                id={propsOverride?.id || mockProps.id}
                displayMode={propsOverride?.displayMode || mockProps.displayMode}
                onClick={propsOverride?.onClick || mockProps.onClick}
            />
        </LootGeneratorContext.Provider>
    );

    const { rerender } = render(component);

    return { rerender, LootGeneratorContextValue, component };
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
                    defaultValue={value}
                    data-min={min}
                    aria-disabled={disabled}
                ></input>
                {labelText}
            </label>
        );
    }),
}));

describe("The Item component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Should render the ToggleBar component...", () => {
        describe("With the value being passed to its 'name' prop...", () => {
            test("Being equal to the item's 'name' field in the LootGenerator component's context's 'lootGeneratorState.items' object if the 'displayMode' prop is equal to either 'normal' or 'selection'", () => {
                renderFunc({ propsOverride: { ...mockProps, displayMode: "selection" } });

                const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
                expect(ToggleBarComponent).toBeInTheDocument();

                const ToggleBarButton = screen.getByText("Apple");
                expect(ToggleBarButton).toBeInTheDocument();
            });
            test("Or 'Unnamed Item' if the item's 'name' field in the LootGenerator component's context's 'lootGeneratorState.items' object is not defined", () => {
                renderFunc({ propsOverride: { ...mockProps, id: "durian" } });

                const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
                expect(ToggleBarComponent).toBeInTheDocument();

                const ToggleBarButton = screen.getByText("Unnamed Item");
                expect(ToggleBarButton).toBeInTheDocument();
            });
            test("Or 'Item Properties' if the 'displayMode' prop is equal to either 'entry' or 'entryViewOnly'", () => {
                renderFunc({ propsOverride: { ...mockProps, displayMode: "entry" } });

                const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
                expect(ToggleBarComponent).toBeInTheDocument();

                const ToggleBarButton = screen.getByText("Item Properties");
                expect(ToggleBarButton).toBeInTheDocument();
            });
        });
        describe("With a 'Delete' option being passed to its 'options' prop...", () => {
            test("If the 'displayMode' prop is equal to 'normal'", () => {
                renderFunc();

                const ToggleBarComponentDeleteOption = screen.getByText("ToggleBar-Option-Delete");
                expect(ToggleBarComponentDeleteOption).toBeInTheDocument();
            });
            test("That, on click, should invoke the LootGenerator component's context's 'deleteItem' function, passing the value of the 'id' prop", async () => {
                renderFunc();

                const ToggleBarComponentDeleteOption = screen.getByText("ToggleBar-Option-Delete");
                expect(ToggleBarComponentDeleteOption).toBeInTheDocument();

                await userEvent.click(ToggleBarComponentDeleteOption);

                expect(mockDeleteItem).toHaveBeenCalledWith(mockProps.id);
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
        describe("With a 'Remove Selection' option being passed to its 'options' prop...", () => {
            test("If the 'displayMode' prop is equal to 'entry'", () => {
                renderFunc({ propsOverride: { ...mockProps, displayMode: "entry" } });

                const RemoveSelectionOption = screen.getByText("ToggleBar-Option-Remove_Selection");
                expect(RemoveSelectionOption).toBeInTheDocument();
            });
            test("That, on click, should invoke the callback function passed to the 'onClick' prop with 'delete' as the argument", async () => {
                const onClickCallback = vi.fn();

                renderFunc({
                    propsOverride: { ...mockProps, displayMode: "entry", onClick: onClickCallback },
                });

                const RemoveSelectionOption = screen.getByText("ToggleBar-Option-Remove_Selection");
                expect(RemoveSelectionOption).toBeInTheDocument();

                await userEvent.click(RemoveSelectionOption);

                expect(onClickCallback).toHaveBeenCalledWith("remove_selection");
            });
        });
        describe("With an 'Edit' option being passed to its 'options' prop...", () => {
            test("If the 'displayMode' prop is equal to 'entry'", () => {
                renderFunc({ propsOverride: { ...mockProps, displayMode: "entry" } });

                const EditOption = screen.getByText("ToggleBar-Option-Edit");
                expect(EditOption).toBeInTheDocument();
            });
            test("That, on click, should invoke the callback function passed to the 'onClick' prop with 'delete' as the argument", async () => {
                const onClickCallback = vi.fn();

                renderFunc({
                    propsOverride: { ...mockProps, displayMode: "entry", onClick: onClickCallback },
                });

                const EditOption = screen.getByText("ToggleBar-Option-Edit");
                expect(EditOption).toBeInTheDocument();

                await userEvent.click(EditOption);

                expect(onClickCallback).toHaveBeenCalledWith("edit");
            });
        });
        test("That, on click, should invoke the callback function passed to the 'onClick' prop with 'toggle' as the argument", async () => {
            const onClickCallback = vi.fn();

            renderFunc({ propsOverride: { ...mockProps, onClick: onClickCallback } });

            const ToggleBarButton = screen.getByText("Apple");
            expect(ToggleBarButton).toBeInTheDocument();

            await userEvent.click(ToggleBarButton);

            expect(onClickCallback).toHaveBeenCalledWith("toggle");
        });
        test("That should render the Text input component as one of its children...", () => {
            renderFunc();

            const TextComponent = screen.getByLabelText("Text Component");
            expect(TextComponent).toBeInTheDocument();

            const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
            expect(ToggleBarComponent).toBeInTheDocument();

            expect(ToggleBarComponent.contains(TextComponent)).toBeTruthy();
        });
        describe("That should render the Numeric input component as one of its children...", () => {
            test("And pass the value of the item's 'value' field to its 'value' prop", () => {
                renderFunc();

                const NumericComponent = screen.getByLabelText("Numeric Component");
                expect(NumericComponent).toBeInTheDocument();

                const ToggleBarComponent = screen.getByLabelText("ToggleBar Component");
                expect(ToggleBarComponent).toBeInTheDocument();

                expect(ToggleBarComponent.contains(NumericComponent)).toBeTruthy();

                expect(NumericComponent.children[0]).toHaveValue(mockItems["apple"].value);
            });
            test("Or pass a value of 1 to its 'value' prop, if the item's 'value' field is not a number", () => {
                renderFunc({ propsOverride: { ...mockProps, id: "cherry" } });

                const NumericComponent = screen.getByLabelText("Numeric Component");
                expect(NumericComponent).toBeInTheDocument();

                expect(NumericComponent.children[0]).toHaveValue(1);
            });
            test("And pass a value of 0 to its 'min' prop", () => {
                renderFunc();

                const NumericComponent = screen.getByLabelText("Numeric Component");
                expect(NumericComponent).toBeInTheDocument();

                expect(NumericComponent.children[0].getAttribute("data-min")).toBe("0");
            });
        });
    });

    test("Should return null if the value passed to the 'id' prop is not a key in the LootGenerator component's context's 'lootGeneratorState.items' object", () => {
        renderFunc({ propsOverride: { ...mockProps, id: "invalid-item" } });

        const ToggleBarComponent = screen.queryByLabelText("ToggleBar Component");
        expect(ToggleBarComponent).toBeNull();
    });
});
