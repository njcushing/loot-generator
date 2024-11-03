export type GenerationCriteria = {
    weight: number;
    rolls?: {
        required?: number;
        maximum?: number;
    };
};

export type ItemInformation = { name?: string; sprite?: URL };
export type LootItem = { information: ItemInformation } & GenerationCriteria;
export type LootTable = { loot: (LootItem | LootTable)[] } & GenerationCriteria;
export type LootTableBase = Omit<LootTable, "weight" | "rolls">;

export type Item = ItemInformation & { quantity: number; value?: number };
export type Loot = Map<string, Item>;

export type SortCriteria = "name" | "quantity";
export type SortOrder = "ascending" | "descending";
export type SortOptions = Map<SortCriteria, SortOrder>;
