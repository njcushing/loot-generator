import { createLootItem, createLootTable } from "@/utils/generateLoot";
import { LootItem, LootTable } from "@/utils/types";

export const findNestedEntry = (
    key: string,
    entry: LootItem | LootTable,
): LootItem | LootTable | null => {
    if (entry.key === key) {
        return entry;
    }
    if (entry.type === "table") {
        for (let i = 0; i < entry.loot.length; i++) {
            const subEntry = entry.loot[i];
            const nestedEntry = findNestedEntry(key, subEntry);
            if (nestedEntry) return nestedEntry;
        }
    }
    return null;
};

export const mutateNestedField = (
    fieldPaths: string[][],
    value: unknown,
    entry: LootItem | LootTable,
) => {
    for (let i = 0; i < fieldPaths.length; i++) {
        let nestedEntry = entry;
        const fieldPath = fieldPaths[i];
        for (let j = 0; j < fieldPath.length; j++) {
            const fieldName = fieldPath[j];
            const field = nestedEntry[fieldName];
            if (j === fieldPath.length - 1) {
                nestedEntry[fieldName] = value;
                return;
            }
            if (typeof field === "object" && field !== null) {
                nestedEntry = field as LootItem | LootTable;
            } else break;
        }
    }
};

export const mutateNestedEntryAndNestedField = (
    key: string,
    fieldPaths: string[][],
    value: unknown,
    entry: LootItem | LootTable,
) => {
    const nestedEntry = findNestedEntry(key, entry);
    if (!nestedEntry) return;
    mutateNestedField(fieldPaths, value, nestedEntry);
};

export const deleteEntry = (key: string, entry: (LootItem | LootTable)[]): boolean => {
    let deleted = false;
    for (let i = 0; i < entry.length; i++) {
        const subEntry = entry[i];
        if (subEntry.key === key) {
            entry.splice(i, 1);
            deleted = true;
        }
        if (!deleted && subEntry.type === "table") deleted = deleteEntry(key, subEntry.loot);
    }
    return deleted;
};

export const createTableEntry = (key: string, entry: LootTable): boolean => {
    let created = false;
    for (let i = 0; i < entry.loot.length; i++) {
        const subEntry = entry.loot[i];
        if (subEntry.type === "table") {
            if (subEntry.key === key) {
                const newTable = createLootTable();
                subEntry.loot.push(newTable);
                created = true;
            }
            if (!created) created = createTableEntry(key, subEntry);
        }
    }
    return created;
};

export const createItemEntry = (key: string, entry: LootTable): boolean => {
    let created = false;
    for (let i = 0; i < entry.loot.length; i++) {
        const subEntry = entry.loot[i];
        if (subEntry.type === "table") {
            if (subEntry.key === key) {
                const newTable = createLootItem();
                subEntry.loot.push(newTable);
                created = true;
            }
            if (!created) created = createItemEntry(key, subEntry);
        }
    }
    return created;
};
