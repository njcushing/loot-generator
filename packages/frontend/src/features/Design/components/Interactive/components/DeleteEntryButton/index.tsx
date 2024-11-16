import { useContext, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import { deleteEntry } from "../../utils/manageEntries";
import styles from "./index.module.css";

export type TDeleteEntryButton = {
    entry: LootItem | LootTable;
};

export function DeleteEntryButton({ entry }: TDeleteEntryButton) {
    const { lootGeneratorState, setLootGeneratorStateProperty } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    const deleteActiveEntry = useCallback(() => {
        const { key } = entry;
        const copy: LootTable = JSON.parse(JSON.stringify(lootGeneratorState.lootTable));
        deleteEntry(key, copy.loot);
        setLootGeneratorStateProperty("lootTable", copy);
    }, [entry, lootGeneratorState.lootTable, setLootGeneratorStateProperty]);

    const deletePresetEntry = useCallback(() => {
        const { key } = entry;
        const copy: (LootItem | LootTable)[] = JSON.parse(
            JSON.stringify(lootGeneratorState.presets),
        );
        deleteEntry(key, copy);
        setLootGeneratorStateProperty("presets", copy);
    }, [entry, lootGeneratorState.presets, setLootGeneratorStateProperty]);

    return (
        <button
            type="button"
            className={`${styles["delete-entry-button"]} material-symbols-sharp`}
            onClick={(e) => {
                if (menuType === "active") deleteActiveEntry();
                if (menuType === "presets") deletePresetEntry();
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
