import { v4 as uuid } from "uuid";
import { LootItem, LootTable, LootTableBase, Loot } from "../types";

export const createLootItem = (props: Omit<LootItem, "type" | "key">): LootItem => ({
    ...props,
    type: "item",
    key: uuid(),
});
export const createLootTable = (props: Omit<LootTable, "type" | "key">): LootTable => ({
    ...props,
    type: "table",
    key: uuid(),
});
export const createLootTableBase = (props: Omit<LootTableBase, "type" | "key">): LootTableBase => ({
    ...props,
    key: "base",
});

type Table = LootTable | LootTableBase;
type SummedTable = Table & { totalWeight: number };

const sumWeights = <K extends Table>(lootTable: K): K & { totalWeight: number } => {
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
    lootTableBase: LootTableBase,
    rolls: number = 1,
    appendToExisting: Loot = new Map(),
): Loot => {
    let loot = new Map(appendToExisting);

    let summedTable = sumWeights(lootTableBase);

    for (let i = 0; i < rolls; i++) [loot, summedTable] = rollTable(loot, summedTable);

    return loot;
};
