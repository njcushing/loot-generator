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

type PopulatedTable = Omit<LootTable, "id"> & { props: Table };
type PopulatedItem = Omit<LootItem, "id"> & { props: Item };

const createPopulatedTable = (table: Table, lootTable: LootTable): PopulatedTable => {
    return {
        type: "table",
        key: lootTable.key || uuid(),
        props: createTable(table),
        criteria: {
            weight: lootTable.criteria?.weight || 0,
            rolls: lootTable.criteria?.rolls || {},
        },
    };
};

const createPopulatedItem = (item: Item, lootItem: LootItem): PopulatedItem => {
    return {
        type: "item",
        key: lootItem.key || uuid(),
        props: createItem(item),
        criteria: {
            weight: lootItem.criteria?.weight || 0,
            rolls: lootItem.criteria?.rolls || {},
        },
        quantity: {
            min: lootItem.quantity?.min || 1,
            max: lootItem.quantity?.max || 1,
        },
    };
};

const populateTable = (active: Table, tables: Tables, items: Items): PopulatedTable => {
    const populatedTable: PopulatedTable = createPopulatedTable();

    const search = (currentActive: Table, currentPopulated: PopulatedTable) => {
        const mutableTable = currentTable;
        const entryCount = currentTable.props.loot.length;

        for (let i = entryCount - 1; i >= 0; i--) {
            const entry = currentTable.props.loot[i];

            if (entry.type === "item") {
                const item = items.get(entry.id || "");
                if (!item) mutableTable.props.loot.splice(i, 1);
            }

            if (entry.type === "table") {
                search(mutableTable.props.loot[i] as LootTable);
            }
        }
    };

    search(active);

    return populatedTable;
};

type SummedTable = LootTable & { totalWeight: number };

const sumWeights = <K extends LootTable>(active: K): K & { totalWeight: number } => {
    const mutableLootTable = { ...active, totalWeight: 0 };
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
    active: LootTable | null,
    tables: LootTables,
    items: Items,
    rolls: number = 1,
    appendToExisting: Loot = new Map(),
): Loot => {
    let loot = new Map(appendToExisting);

    if (!active || !tables || !items) return loot;

    let workingTable = structuredClone(active);
    populateTable(workingTable, tables, items);
    workingTable = sumWeights(workingTable);

    for (let i = 0; i < rolls; i++) {
        [loot, workingTable] = rollTable(loot, workingTable as SummedTable);
    }

    return loot;
};
