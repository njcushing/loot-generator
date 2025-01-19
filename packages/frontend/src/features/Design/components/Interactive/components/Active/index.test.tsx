import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RecursiveOptional } from "@/utils/types";
import {
    LootGeneratorState,
    ILootGeneratorContext,
    LootGeneratorContext,
} from "@/pages/LootGenerator";
import { Active } from ".";

// Mock dependencies
const mockTables: ILootGeneratorContext["lootGeneratorState"]["tables"] = {
    mockTable: {
        name: "",
        loot: [
            {
                key: "loot-item-1-key",
                quantity: { min: 1, max: 1 },
                criteria: { weight: 1, rolls: {} },
                type: "item_id",
                id: "loot-item-1-id",
            },
        ],
        custom: {},
    },
};

const mockDeleteActive = vi.fn();
const mockLootGeneratorContextValue: RecursiveOptional<ILootGeneratorContext> = {
    lootGeneratorState: {
        active: "mockTable",
        tables: mockTables,
    } as unknown as LootGeneratorState,
    deleteActive: mockDeleteActive,
};

vi.mock("@/features/Design/components/Interactive/components/Table", () => ({
    Table: vi.fn(({ id, onClick }) => {
        return (
            <button type="button" aria-label={`${id}`} onClick={() => onClick("delete")}>
                Table Component
            </button>
        );
    }),
}));

describe("The Active component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Should display a Table component if the 'active' field in the LootGenerator component state is not 'null'", () => {
        render(
            <LootGeneratorContext.Provider
                value={mockLootGeneratorContextValue as unknown as ILootGeneratorContext}
            >
                <Active />
            </LootGeneratorContext.Provider>,
        );

        const TableComponent = screen.getByText("Table Component");
        expect(TableComponent).toBeInTheDocument();
    });
    test("That should be passed the value of the LootGenerator's 'active' field in its 'id' prop", () => {
        render(
            <LootGeneratorContext.Provider
                value={mockLootGeneratorContextValue as unknown as ILootGeneratorContext}
            >
                <Active />
            </LootGeneratorContext.Provider>,
        );

        const { active } = mockLootGeneratorContextValue.lootGeneratorState!;
        const TableComponent = screen.getByLabelText(active!);
        expect(TableComponent).toBeInTheDocument();
    });
    test("And should, on click, if the argument passed to the callback function is 'delete', invoke the 'deleteActive' function", () => {
        render(
            <LootGeneratorContext.Provider
                value={mockLootGeneratorContextValue as unknown as ILootGeneratorContext}
            >
                <Active />
            </LootGeneratorContext.Provider>,
        );

        const { active } = mockLootGeneratorContextValue.lootGeneratorState!;
        const TableComponent = screen.getByLabelText(active!);
        expect(TableComponent).toBeInTheDocument();

        fireEvent.click(TableComponent);

        expect(mockDeleteActive).toHaveBeenCalledTimes(1);
    });

    test("Should display a help message in a <p> element if the 'active' field in the LootGenerator component state is 'null'", () => {
        render(
            <LootGeneratorContext.Provider
                value={
                    {
                        ...mockLootGeneratorContextValue,
                        lootGeneratorState: {
                            ...mockLootGeneratorContextValue.lootGeneratorState,
                            active: null,
                        },
                    } as unknown as ILootGeneratorContext
                }
            >
                <Active />
            </LootGeneratorContext.Provider>,
        );

        const TableComponent = screen.queryByText("Table Component");
        expect(TableComponent).not.toBeInTheDocument();

        const helpMessage = screen.getByText(
            "Please upload a table from the 'Tables' tab to start generating",
        );
        expect(helpMessage).toBeInTheDocument();
    });
});
