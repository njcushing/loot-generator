import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootTable, LootItem, Table, Item } from "@/utils/types";
import { ItemEntry } from "../ItemEntry";
import { TableEntry, TTableEntry } from "../TableEntry";
import styles from "./index.module.css";

export type TLootEntry = {
    entry: LootTable | LootItem | null;
};

export function LootEntry({ entry }: TLootEntry) {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    if (!entry) return null;

    if (entry.type === "item") return <ItemEntry entry={entry} />;
}
