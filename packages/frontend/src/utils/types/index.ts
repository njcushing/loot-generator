export type GenerationCriteria = {
    weight: number;
    rolls?: {
        required?: number;
        maximum?: number;
    };
};

export type ItemInformation = { name?: string; sprite?: URL };
export type LootItem = {
    type: "item";
    key: string;
    information: ItemInformation;
} & GenerationCriteria;
export type LootTable = {
    type: "table";
    key: string;
    name?: string;
    loot: (LootItem | LootTable)[];
} & GenerationCriteria;

export type Item = ItemInformation & { quantity: number; value?: number };
export type Loot = Map<string, Item>;

export type SortCriteria = "name" | "quantity";
export type SortOrder = "ascending" | "descending";
export type SortOptions = Map<SortCriteria, SortOrder>;
