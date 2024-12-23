export type GenerationQuantity = {
    quantity: {
        min: number;
        max: number;
    };
};
export type GenerationCriteria = {
    criteria: {
        weight: number;
        rolls?: {
            required?: number;
            maximum?: number;
        };
    };
};

export type LootItem = {
    type: "item";
    key: string;
    id: string | null;
} & GenerationQuantity &
    GenerationCriteria;
export type LootTable = {
    type: "table";
    key: string;
    id: string | null;
} & GenerationCriteria;

export type CustomFields = { custom: { [key: string]: unknown } };

export type Item = {
    name?: string;
    sprite?: URL;
    value: number;
} & CustomFields;
export type Items = Map<string, Item>;

export type Table = {
    name?: string;
    loot: (LootItem | LootTable)[];
} & CustomFields;
export type Tables = Map<string, Table>;

export type LootTables = Map<string, LootTable>;

export type Loot = Map<string, number>;

export type SortCriteria = "name" | "quantity" | "value";
export type SortOrder = "ascending" | "descending";
export type SortOptions = Map<SortCriteria, SortOrder>;
