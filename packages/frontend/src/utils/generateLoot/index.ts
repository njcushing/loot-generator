import { v4 as uuid } from "uuid";
import { LootItem, LootTable, Loot } from "../types";

type RecursiveOptional<T> = {
    [P in keyof T]?: T[P] extends object ? RecursiveOptional<T[P]> : T[P];
};

export const createLootItem = (props: RecursiveOptional<LootItem> = {}): LootItem => ({
    type: "item",
    key: props.key || uuid(),
    information: {
        name: props.information?.name || "",
        sprite: props.information?.sprite,
    },
    weight: props.weight || 0,
    rolls: props.rolls || {},
    custom: props.custom || {},
});

export const createLootTable = (props: RecursiveOptional<LootTable> = {}): LootTable => ({
    type: "table",
    key: props.key || uuid(),
    name: props.name || "",
    loot: (props.loot as LootTable["loot"]) || [],
    weight: props.weight || 0,
    rolls: props.rolls || {},
    custom: props.custom || {},
});

type SummedTable = LootTable & { totalWeight: number };

const sumWeights = <K extends LootTable>(lootTable: K): K & { totalWeight: number } => {
    const mutableLootTable = { ...lootTable, totalWeight: 0 };
    mutableLootTable.loot.forEach((entry, i) => {
        mutableLootTable.totalWeight += entry.weight;
        if (entry.type === "table") {
            mutableLootTable.loot[i] = sumWeights(mutableLootTable.loot[i] as LootTable);
        }
    });
    return mutableLootTable;
};

const rollTable = (currentLoot: Loot, summedTable: SummedTable): [Loot, SummedTable] => {
    let mutableLoot = new Map(currentLoot);
    const mutableSummedTable = { ...summedTable };

    // Roll a random entry in the table based on weighting of each entry
    const totalEntries = mutableSummedTable.loot.length;
    let weight = Math.random() * mutableSummedTable.totalWeight;
    let rolledEntry = null;
    let i = 0;
    while (weight >= 0 && i < totalEntries) {
        weight -= mutableSummedTable.loot[i].weight;
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
        // Create new entry
        if (!mutableLoot.has(rolledEntry.key)) {
            mutableLoot.set(rolledEntry.key, {
                ...rolledEntry.information,
                quantity: 0,
            });
        }
        // Increment quantity of existing entry
        mutableLoot.get(rolledEntry.key)!.quantity += 1;
    }

    return [mutableLoot, mutableSummedTable];
};

export const generateLoot = (
    lootTable: LootTable,
    rolls: number = 1,
    appendToExisting: Loot = new Map(),
): Loot => {
    let loot = new Map(appendToExisting);

    let summedTable = sumWeights(lootTable);

    for (let i = 0; i < rolls; i++) [loot, summedTable] = rollTable(loot, summedTable);

    return loot;
};
