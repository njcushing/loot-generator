import { v4 as uuid } from "uuid";
import { LootItem, LootTable, Preset, Loot, LootTableProps } from "../types";

type RecursiveOptional<T> = {
    [P in keyof T]?: T[P] extends object ? RecursiveOptional<T[P]> : T[P];
};

export const createLootItem = (props: RecursiveOptional<LootItem> = {}): LootItem => ({
    type: "item",
    key: props.key || uuid(),
    props: {
        name: props.props?.name || "",
        sprite: props.props?.sprite,
        custom: props.props?.custom || {},
    },
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

const substitutePresets = (lootTable: LootTable, presets: Preset[]) => {
    const presetsMap = new Map(presets.map((preset) => [preset.key, preset]));

    const search = (table: LootTable) => {
        const mutableTable = table;
        const entryCount = table.props.loot.length;
        for (let i = entryCount - 1; i >= 0; i--) {
            const entry = table.props.loot[i];
            if (entry.type === "preset") {
                const preset = presetsMap.get(entry.id);
                if (!preset) {
                    mutableTable.props.loot.splice(i, 1);
                } else {
                    mutableTable.props.loot[i] = structuredClone(preset);
                }
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

const rollTable = (currentLoot: Loot, workingTable: SummedTable): [Loot, SummedTable] => {
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
            rolledEntry as SummedTable,
        );
    }

    // Rolled entry is an item; append to current loot
    if (rolledEntry.type === "item") {
        // Create new entry
        if (!mutableLoot.has(rolledEntry.key)) {
            mutableLoot.set(rolledEntry.key, {
                ...rolledEntry.props,
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
    presets: Preset[],
    rolls: number = 1,
    appendToExisting: Loot = new Map(),
): Loot => {
    let loot = new Map(appendToExisting);

    let workingTable = structuredClone(lootTable);
    substitutePresets(workingTable, presets);
    workingTable = sumWeights(workingTable);

    for (let i = 0; i < rolls; i++) {
        [loot, workingTable] = rollTable(loot, workingTable as SummedTable);
    }

    return loot;
};
