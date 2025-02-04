import { LootGeneratorState } from "@/pages/LootGenerator";
import { Table } from "../types";

export const findCompatibleDescendantTables = (
    target: string,
    tables: LootGeneratorState["tables"],
): Set<string> => {
    let incompatibleTables: Set<string> = new Set([target]);

    const scanLootTable = (ancestors: Set<string>, loot: Table["loot"]) => {
        for (let i = 0; i < loot.length; i++) {
            const entry = loot[i];
            const { type } = entry;
            if (type === "table_id") {
                const { id } = entry;
                if (id === target) {
                    incompatibleTables = new Set([...incompatibleTables, ...ancestors]);
                }
                const table = tables[id!];
                scanLootTable(new Set([...ancestors, id!]), table.loot);
            }
            if (type === "table_noid") {
                const { loot: entryLoot } = entry;
                scanLootTable(ancestors, entryLoot);
            }
        }
    };

    [...Object.entries(tables)].forEach((table) => {
        const [key, value] = table;
        if (!incompatibleTables.has(key)) scanLootTable(new Set([key]), value.loot);
    });

    const compatibleTables = new Set(
        [...Object.keys(tables)].filter((tableId) => !incompatibleTables.has(tableId)),
    );

    return compatibleTables;
};
