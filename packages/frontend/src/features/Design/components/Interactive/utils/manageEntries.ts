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
    fieldPath: string[],
    value: unknown,
    entry: LootItem | LootTable,
) => {
    let nestedEntry = entry;
    for (let i = 0; i < fieldPath.length; i++) {
        const fieldName = fieldPath[i];
        const field = nestedEntry[fieldName];
        if (i === fieldPath.length - 1) {
            nestedEntry[fieldName] = value;
            return;
        }
        if (typeof field === "object" && field !== null) {
            nestedEntry = field as LootItem | LootTable;
        } else return;
    }
};

export const mutateNestedEntryAndNestedField = (
    key: string,
    fieldPath: string[],
    value: unknown,
    entry: LootItem | LootTable,
) => {
    const nestedEntry = findNestedEntry(key, entry);
    if (!nestedEntry) return;
    mutateNestedField(fieldPath, value, nestedEntry);
};

export const deleteEntry = (key: string, entry: LootTable): boolean => {
    let deleted = false;
    for (let i = 0; i < entry.loot.length; i++) {
        const subEntry = entry.loot[i];
        if (subEntry.key === key) {
            entry.loot.splice(i, 1);
            deleted = true;
        }
        if (!deleted && subEntry.type === "table") deleted = deleteEntry(key, subEntry);
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
