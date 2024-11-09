import { LootItem, LootTable } from "@/utils/types";

export const findNestedEntry = (
    key: string,
    entry: LootItem | LootTable,
): LootItem | LootTable | null => {
    if (entry.key === key) return entry;
    if (entry.type === "table") {
        for (let i = 0; i < entry.loot.length; i++) {
            const subEntry = entry.loot[i];
            if (findNestedEntry(key, subEntry)) return subEntry;
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
        if (typeof field !== "undefined") {
            if (i === fieldPath.length - 1) {
                nestedEntry[fieldName] = value;
                return;
            }
            if (typeof field === "object" && field !== null) {
                nestedEntry = field as LootItem | LootTable;
            }
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
