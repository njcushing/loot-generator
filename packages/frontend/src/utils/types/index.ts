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

export type LootItemProps = { name?: string; sprite?: URL } & CustomFields;
export type LootTableProps = {
    name?: string;
    loot: (LootItem | LootTable | LootPreset)[];
} & CustomFields;

export type LootItem = {
    type: "item";
    key: string;
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
} & GenerationCriteria;

export type Preset = LootTable | LootItem;

export type Item = LootItemProps & { quantity: number; value?: number };
export type Loot = Map<string, Item>;

export type SortCriteria = "name" | "quantity";
export type SortOrder = "ascending" | "descending";
export type SortOptions = Map<SortCriteria, SortOrder>;
