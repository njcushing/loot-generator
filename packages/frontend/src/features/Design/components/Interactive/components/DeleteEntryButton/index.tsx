import { useContext, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { deleteEntry } from "../../utils/manageEntries";
import styles from "./index.module.css";

export type TDeleteEntryButton = {
    entry: LootItem | LootTable;
};

export function DeleteEntryButton({ entry }: TDeleteEntryButton) {
    const { lootGeneratorState, setLootGeneratorStateProperty } = useContext(LootGeneratorContext);

    const deleteEntryAndSetNewTable = useCallback(() => {
        const { key } = entry;
        const copy: LootTable = JSON.parse(JSON.stringify(lootGeneratorState.lootTable));
        deleteEntry(key, copy);
        setLootGeneratorStateProperty("lootTable", copy);
    }, [entry, lootGeneratorState.lootTable, setLootGeneratorStateProperty]);

    return (
        <button
            type="button"
            className={`${styles["delete-entry-button"]} material-symbols-sharp`}
            onClick={(e) => {
                deleteEntryAndSetNewTable();
                e.currentTarget.blur();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
        >
            Delete
        </button>
    );
}
