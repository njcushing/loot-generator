import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RecursiveOptional } from "@/utils/types";
import {
    LootGeneratorState,
    ILootGeneratorContext,
    LootGeneratorContext,
} from "@/pages/LootGenerator";
import { act } from "react";
import { SortOptions } from ".";

const mockSortOptions: LootGeneratorState["sortOptions"] = {
    selected: "value",
    options: [
        {
            name: "name",
            criteria: [
                { name: "order", selected: "descending", values: ["ascending", "descending"] },
            ],
        },
        {
            name: "quantity",
            criteria: [
                { name: "order", selected: "descending", values: ["ascending", "descending"] },
            ],
        },
        {
            name: "value",
            criteria: [
                { name: "order", selected: "ascending", values: ["ascending", "descending"] },
                { name: "summation", selected: "total", values: ["individual", "total"] },
            ],
        },
    ],
};

const mockSetLootGeneratorStateProperty = vi.fn();
const mockLootGeneratorContextValue: RecursiveOptional<ILootGeneratorContext> = {
    lootGeneratorState: {
        sortOptions: mockSortOptions,
    } as unknown as LootGeneratorState,
    setLootGeneratorStateProperty: mockSetLootGeneratorStateProperty,
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
            <SortOptions />
        </LootGeneratorContext.Provider>
    );

    const { rerender } = render(component);

    return { rerender, LootGeneratorContextValue, component };
};

describe("The SortOptions component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should render a <p> element with text content equal to 'Sort By:'", () => {
        renderFunc();

        const text = screen.getByText("Sort By:");
        expect(text).toBeInTheDocument();
    });

    describe("Should render a <select> element...", () => {
        test("That renders an <option> for each option in the LootGenerator component's context's 'sortOptions.options' array", () => {
            renderFunc();

            const select = screen.getByRole("combobox", { name: "sort-options" });

            mockSortOptions.options.forEach((opt) => {
                const { name } = opt;
                const option = screen.getByRole("option", { name });
                expect(option).toBeInTheDocument();
                expect(select.contains(option)).toBeTruthy();
            });
        });
        test("Unless the selected option is not found in the LootGenerator component's context's 'sortOptions.options' array", () => {
            renderFunc({
                LootGeneratorContextOverride: {
                    ...mockLootGeneratorContextValue,
                    lootGeneratorState: {
                        ...mockLootGeneratorContextValue.lootGeneratorState,
                        sortOptions: { ...mockSortOptions, selected: "invalid-sort-option" },
                    } as unknown as LootGeneratorState,
                } as unknown as ILootGeneratorContext,
            });

            const select = screen.queryByRole("combobox", { name: "sort-options" });
            expect(select).toBeNull();
        });
        test("That, on change, should invoke the LootGenerator component's context's 'setLootGeneratorStateProperty' function", async () => {
            renderFunc();

            const select = screen.getByRole("combobox", { name: "sort-options" });

            await act(async () => fireEvent.change(select, { target: { value: "name" } }));

            expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith("sortOptions", {
                ...mockSortOptions,
                selected: "name",
            });
        });
    });

    describe("Should render additional <select> elements...", () => {
        test("For each criterion in the selected option's 'criteria' array", () => {
            renderFunc();

            const { selected, options } = mockSortOptions;
            const optionSelected = options.find((option) => option.name === selected);
            if (!optionSelected) {
                throw new Error("Selected option not found in mockSortOptions array");
            }

            const { name: optionName, criteria } = optionSelected;

            criteria.forEach((crt) => {
                const { name: criterionName } = crt;
                const criterionSelect = screen.getByRole("combobox", {
                    name: `sort-option-${optionName}-${criterionName}`,
                });
                expect(criterionSelect).toBeInTheDocument();
            });
        });
        test("That each render an <option> for each entry in that criterion's 'values' array", () => {
            renderFunc();

            const { selected, options } = mockSortOptions;
            const optionSelected = options.find((option) => option.name === selected);
            if (!optionSelected) {
                throw new Error("Selected option not found in mockSortOptions array");
            }

            const { name: optionName, criteria } = optionSelected;

            criteria.forEach((crt) => {
                const { name: criterionName, values } = crt;
                const criterion = screen.getByRole("combobox", {
                    name: `sort-option-${optionName}-${criterionName}`,
                });
                expect(criterion).toBeInTheDocument();

                values.forEach((val) => {
                    const option = screen.getByRole("option", { name: val });
                    expect(option).toBeInTheDocument();
                    expect(criterion.contains(option)).toBeTruthy();
                });
            });
        });
        test("That, on change, should invoke the LootGenerator component's context's 'setLootGeneratorStateProperty' function", async () => {
            renderFunc();

            const { selected, options } = mockSortOptions;
            const optionSelected = options.find((option) => option.name === selected);
            if (!optionSelected) {
                throw new Error("Selected option not found in mockSortOptions array");
            }

            const { name: optionName, criteria } = optionSelected;
            if (criteria.length === 0) throw new Error("Selected option has no criteria");

            const { name: criterionName, values } = criteria[0];
            const criterionSelect = screen.getByRole("combobox", {
                name: `sort-option-${optionName}-${criterionName}`,
            });
            expect(criterionSelect).toBeInTheDocument();

            // Replacing 'value' sort option's 'selected' field with 'descending'
            await act(async () =>
                fireEvent.change(criterionSelect, { target: { value: values[1] } }),
            );
            const newOptions = structuredClone(mockSortOptions.options);
            const optionToUpdate = newOptions.find((o) => o.name === selected);
            const criterionToUpdate = optionToUpdate!.criteria.find(
                (c) => c.name === criterionName,
            );
            criterionToUpdate!.selected = values[1]!;
            const newSortOptions = { ...mockSortOptions, options: newOptions };

            expect(mockSetLootGeneratorStateProperty).toHaveBeenCalledWith(
                "sortOptions",
                newSortOptions,
            );
        });
    });
});
