import { PopulatedLootItem } from "../generateLoot";

/* eslint-disable no-use-before-define */

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

export type LootEntry = {
    type: "entry";
    key: string;
};
export type LootItem = {
    key: string;
} & GenerationQuantity &
    GenerationCriteria &
    ({ type: "item_id"; id: string | null } | ({ type: "item_noid"; id?: never } & Item));
export type LootTable = {
    key: string;
} & GenerationCriteria &
    ({ type: "table_id"; id: string | null } | ({ type: "table_noid"; id?: never } & Table));

export type CustomFields = { custom: { [key: string]: unknown } };

export type Item = {
    name?: string;
    sprite?: URL;
    value: number;
} & CustomFields;
export type Items = Map<string, Item>;

export type Table = {
    name?: string;
    loot: (LootEntry | LootItem | LootTable)[];
} & CustomFields;
export type Tables = Map<string, Table>;

export type Loot = { [key: string]: { props: PopulatedLootItem; quantity: number } };

export type SortCriteria = Map<string, { selected: string; values: string[] }>;
export type SortOptions = Map<string, SortCriteria>;

/* eslint-enable no-use-before-define */
