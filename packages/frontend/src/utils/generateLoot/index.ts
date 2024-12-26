import { v4 as uuid } from "uuid";
import { LootItem, LootTable, Item, Items, Table, Tables, Loot } from "../types";
import { randomRange } from "../randomRange";

type RecursiveOptional<T> = {
    [P in keyof T]?: T[P] extends object ? RecursiveOptional<T[P]> : T[P];
};

export const createTable = (props: RecursiveOptional<Table> = {}): Table => ({
    name: props.name || "",
    loot: (props.loot as Table["loot"]) || [],
    custom: props.custom || {},
});

export const createLootTable = (props: RecursiveOptional<LootTable> = {}): LootTable => ({
    type: "table",
    key: props.key || uuid(),
    id: props.id || null,
    criteria: {
        weight: props.criteria?.weight || 0,
        rolls: props.criteria?.rolls || {},
    },
});

export const createItem = (props: RecursiveOptional<Item> = {}): Item => ({
    name: props.name || "",
    sprite: props.sprite,
    value: props.value || 1,
    custom: props.custom || {},
});

export const createLootItem = (props: RecursiveOptional<LootItem> = {}): LootItem => ({
    type: "item",
    key: props.key || uuid(),
    id: props.id || null,
    criteria: {
        weight: props.criteria?.weight || 0,
        rolls: props.criteria?.rolls || {},
    },
    quantity: {
        min: props.quantity?.min || 1,
        max: props.quantity?.max || 1,
    },
});

type PopulatedLootItem = LootItem & Item;
type PopulatedLootTable = LootTable &
    Omit<Table, "loot"> & { loot: (PopulatedLootTable | PopulatedLootItem)[] };
type PopulatedTable = Omit<Table, "loot"> & { loot: (PopulatedLootTable | PopulatedLootItem)[] };

const populateTable = (active: Table, tables: Tables, items: Items): PopulatedTable => {
    const populatedTable: PopulatedTable = { ...createTable(active), loot: [] };

    const populate = (searching: Table, populating: PopulatedTable | PopulatedLootTable) => {
        const entryCount = searching.loot.length;

        for (let i = entryCount - 1; i >= 0; i--) {
            const entry = searching.loot[i];

            const { loot } = populating;

            if (entry.type === "item") {
                const item = structuredClone(items.get(entry.id || ""));
                if (item) {
                    const popItem: PopulatedLootItem = { ...entry, ...item };
                    loot.push(popItem);
                }
            }

            if (entry.type === "table") {
                const table = structuredClone(tables.get(entry.id || ""));
                if (table) {
                    const popTable: PopulatedLootTable = { ...entry, ...table, loot: [] };
                    loot.push(popTable);
                    populate(table, popTable);
                }
            }
        }
    };

    populate(active, populatedTable);

    return populatedTable;
};

type SummedLootTable = PopulatedLootTable & { totalLootWeight: number };
type SummedTable = PopulatedTable & { loot: (SummedLootTable | PopulatedLootItem)[] } & {
    totalLootWeight: number;
};

const sumWeights = (populatedTable: PopulatedTable): SummedTable => {
    const summedTable: SummedTable = { ...populatedTable, totalLootWeight: 0, loot: [] };

    const sum = (
        searching: PopulatedTable | PopulatedLootTable,
        summing: SummedTable | SummedLootTable,
    ) => {
        const mutableSumming = summing;
        searching.loot.forEach((entry) => {
            mutableSumming.totalLootWeight += entry.criteria.weight;
            if (entry.type === "table") {
                const summedSubTable: SummedLootTable = { ...entry, totalLootWeight: 0, loot: [] };
                sum(entry, summedSubTable);
                mutableSumming.loot.push(summedSubTable);
            } else {
                mutableSumming.loot.push(entry);
            }
        });
    };

    sum(populatedTable, summedTable);

    return summedTable;
};

const rollTable = (currentLoot: Loot, summedTable: SummedTable): [Loot, SummedTable] => {
    let mutableLoot = new Map(currentLoot);
    const mutableSummedTable = { ...summedTable };

    // Roll a random entry in the table based on weighting of each entry
    const totalEntries = mutableSummedTable.loot.length;
    let weight = Math.random() * mutableSummedTable.totalLootWeight;
    let rolledEntry = null;
    let i = 0;
    while (weight >= 0 && i < totalEntries) {
        weight -= mutableSummedTable.loot[i].criteria.weight;
        if (weight < 0) rolledEntry = mutableSummedTable.loot[i];
        i += 1;
    }

    // No entry found, return existing loot and table
    if (rolledEntry === null) return [mutableLoot, mutableSummedTable];

    // Rolled entry is another loot table; roll it instead
    if (rolledEntry.type === "table") {
        [mutableLoot, rolledEntry as SummedTable] = rollTable(
            mutableLoot,
            rolledEntry as SummedTable,
        );
    }

    // Rolled entry is an item; append to current loot
    if (rolledEntry.type === "item") {
        if (rolledEntry.id) {
            // Create new entry
            if (!mutableLoot.has(rolledEntry.id)) mutableLoot.set(rolledEntry.id, 0);
            // Increment quantity of existing entry
            const { min, max } = rolledEntry.quantity;
            const currentQuantity = mutableLoot.get(rolledEntry.id)!;
            mutableLoot.set(rolledEntry.id, currentQuantity + randomRange(min, max, true));
        }
    }

    return [mutableLoot, mutableSummedTable];
};

export const generateLoot = (
    active: string | null,
    tables: Tables,
    items: Items,
    rolls: number = 1,
    appendToExisting: Loot = new Map(),
): Loot => {
    let loot = new Map(appendToExisting);

    if (!active || !tables || !items) return loot;

    const activeTable = tables.get(active);
    if (!activeTable) return loot;
    const workingTable = structuredClone(activeTable);
    const populatedTable = populateTable(workingTable, tables, items) as PopulatedTable;
    let summedTable = sumWeights(populatedTable) as SummedTable;

    for (let i = 0; i < rolls; i++) {
        [loot, summedTable] = rollTable(loot, summedTable);
    }

    return loot;
};
