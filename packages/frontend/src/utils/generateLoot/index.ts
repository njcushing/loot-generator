import { v4 as uuid } from "uuid";
import {
    Item,
    Items,
    LootItem,
    LootTable,
    LootPreset,
    Preset,
    Loot,
    LootTableProps,
} from "../types";
// import { randomRange } from "../randomRange";

type RecursiveOptional<T> = {
    [P in keyof T]?: T[P] extends object ? RecursiveOptional<T[P]> : T[P];
};

export const createItem = (props: RecursiveOptional<Item> = {}): Item => ({
    name: props.name || "",
    sprite: props.sprite,
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
});

export const createLootTable = (props: RecursiveOptional<LootTable> = {}): LootTable => ({
    type: "table",
    key: props.key || uuid(),
    props: {
        name: props.props?.name || "",
        loot: (props.props?.loot as LootTableProps["loot"]) || [],
        custom: props.props?.custom || {},
    },
    criteria: {
        weight: props.criteria?.weight || 0,
        rolls: props.criteria?.rolls || {},
    },
});

export const createLootPresetFromEntry = (
    props: RecursiveOptional<LootItem | LootTable> = {},
): LootPreset => ({
    type: "preset",
    key: uuid(),
    id: props.key || uuid(),
    criteria: {
        weight: props.criteria?.weight || 0,
        rolls: props.criteria?.rolls || {},
    },
});

const substituteEntries = (lootTable: LootTable, items: Items, presets: Preset[]) => {
    const presetsMap = new Map(presets.map((preset) => [preset.key, preset]));

    const search = (table: LootTable) => {
        const mutableTable = table;
        const entryCount = table.props.loot.length;
        for (let i = entryCount - 1; i >= 0; i--) {
            const entry = table.props.loot[i];
            if (entry.type === "item") {
                const item = entry.id !== null ? items.get(entry.id) : null;
                if (!item) mutableTable.props.loot.splice(i, 1);
            }
            if (entry.type === "preset") {
                const preset = presetsMap.get(entry.id);
                if (!preset) {
                    mutableTable.props.loot.splice(i, 1);
                } else if (preset.type === "table") {
                    mutableTable.props.loot[i] = createLootTable({
                        ...mutableTable.props.loot[i],
                        props: structuredClone(preset.props),
                    } as unknown as LootTable);
                    search(mutableTable.props.loot[i] as LootTable);
                } else mutableTable.props.loot.splice(i, 1);
            }
            if (entry.type === "table") search(entry as LootTable);
        }
    };

    search(lootTable);
};

type SummedTable = LootTable & { totalWeight: number };

const sumWeights = <K extends LootTable>(lootTable: K): K & { totalWeight: number } => {
    const mutableLootTable = { ...lootTable, totalWeight: 0 };
    mutableLootTable.props.loot.forEach((entry, i) => {
        mutableLootTable.totalWeight += entry.criteria.weight;
        if (entry.type === "table") {
            mutableLootTable.props.loot[i] = sumWeights(
                mutableLootTable.props.loot[i] as LootTable,
            );
        }
    });
    return mutableLootTable;
};

const rollTable = (
    currentLoot: Loot,
    items: Items,
    workingTable: SummedTable,
): [Loot, SummedTable] => {
    let mutableLoot = new Map(currentLoot);
    const mutableSummedTable = { ...workingTable };

    // Roll a random entry in the table based on weighting of each entry
    const totalEntries = mutableSummedTable.props.loot.length;
    let weight = Math.random() * mutableSummedTable.totalWeight;
    let rolledEntry = null;
    let i = 0;
    while (weight >= 0 && i < totalEntries) {
        weight -= mutableSummedTable.props.loot[i].criteria.weight;
        if (weight < 0) rolledEntry = mutableSummedTable.props.loot[i];
        i += 1;
    }

    // No entry found, return existing loot and table
    if (rolledEntry === null) return [mutableLoot, mutableSummedTable];

    // Rolled entry is another loot table; roll it instead
    if (rolledEntry.type === "table") {
        [mutableLoot, rolledEntry as SummedTable] = rollTable(
            mutableLoot,
            items,
            rolledEntry as SummedTable,
        );
    }

    // Rolled entry is an item; append to current loot
    if (rolledEntry.type === "item" && rolledEntry.id !== null) {
        const item = items.get(rolledEntry.id);
        if (item) {
            // Create new entry
            if (!mutableLoot.has(rolledEntry.id)) mutableLoot.set(rolledEntry.id, 0);
            // Increment quantity of existing entry
            // const { min, max } = rolledEntry.props.quantity;
            const currentQuantity = mutableLoot.get(rolledEntry.id)!;
            // mutableLoot.set(rolledEntry.id, currentQuantity + randomRange(min, max, true));
            mutableLoot.set(rolledEntry.id, currentQuantity + 1);
        }
    }

    return [mutableLoot, mutableSummedTable];
};

export const generateLoot = (
    lootTable: LootTable,
    items: Items,
    presets: Preset[],
    rolls: number = 1,
    appendToExisting: Loot = new Map(),
): Loot => {
    let loot = new Map(appendToExisting);

    let workingTable = JSON.parse(JSON.stringify(lootTable));
    substituteEntries(workingTable, items, presets);
    workingTable = sumWeights(workingTable);

    for (let i = 0; i < rolls; i++) {
        [loot, workingTable] = rollTable(loot, items, workingTable as SummedTable);
    }

    return loot;
};
