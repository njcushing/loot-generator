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

export type CustomFields = { custom: { [key: string]: unknown } };

export type LootItemProps = { name?: string; sprite?: URL } & GenerationQuantity & CustomFields;
export type LootTableProps = {
    name?: string;
    loot: (LootItem | LootTable | LootPreset)[];
} & CustomFields;

export type LootItem = {
    type: "item";
    key: string;
    id: string | null;
    props: LootItemProps;
} & GenerationCriteria;
export type LootTable = {
    type: "table";
    key: string;
    props: LootTableProps;
} & GenerationCriteria;
export type LootPreset = {
    type: "preset";
    key: string;
    id: string;
} & GenerationCriteria;

export type Preset = LootTable | LootItem;

export type Loot = Map<string, number>;

export type SortCriteria = "name" | "quantity";
export type SortOrder = "ascending" | "descending";
export type SortOptions = Map<SortCriteria, SortOrder>;
