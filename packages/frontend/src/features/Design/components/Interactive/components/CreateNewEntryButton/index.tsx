import { useContext, useState, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import { createItemEntry, createTableEntry } from "../../utils/manageEntries";
import styles from "./index.module.css";

export type TCreateNewEntryButton = {
    entry: LootTable;
};

export function CreateNewEntryButton({ entry }: TCreateNewEntryButton) {
    const { lootGeneratorState, setLootGeneratorStateProperty } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const createNewLootEntry = useCallback(
        (type: LootItem["type"] | LootTable["type"]) => {
            const { key } = entry;
            if (menuType === "active") {
                const copy: LootTable = JSON.parse(JSON.stringify(lootGeneratorState.lootTable));
                if (type === "table") createTableEntry(key, copy.loot);
                if (type === "item") createItemEntry(key, copy.loot);
                setLootGeneratorStateProperty("lootTable", copy);
            }
            if (menuType === "presets") {
                const copy = JSON.parse(JSON.stringify(lootGeneratorState.presets));
                if (type === "table") createTableEntry(key, copy);
                if (type === "item") createItemEntry(key, copy);
                setLootGeneratorStateProperty("presets", copy);
            }
        },
        [
            entry,
            lootGeneratorState.lootTable,
            lootGeneratorState.presets,
            setLootGeneratorStateProperty,
            menuType,
        ],
    );

    return (
        <div className={`${styles["create-new-entry-button-wrapper"]} material-symbols-sharp`}>
            <button
                type="button"
                className={`${styles["create-new-entry-button"]} material-symbols-sharp`}
                onClick={(e) => {
                    setMenuOpen(!menuOpen);
                    e.currentTarget.blur();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                }}
            >
                Add_Circle
            </button>
            {menuOpen && (
                <div className={styles["creation-menu"]}>
                    <button
                        type="button"
                        className={styles["create-new-table-button"]}
                        onClick={(e) => {
                            createNewLootEntry("table");
                            setMenuOpen(!menuOpen);
                            e.currentTarget.blur();
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.blur();
                        }}
                    >
                        Create New Table
                    </button>
                    <button
                        type="button"
                        className={styles["create-new-item-button"]}
                        onClick={(e) => {
                            createNewLootEntry("item");
                            setMenuOpen(!menuOpen);
                            e.currentTarget.blur();
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.blur();
                        }}
                    >
                        Create New Item
                    </button>
                    <button
                        type="button"
                        className={styles["add-preset-button"]}
                        onClick={(e) => {
                            setMenuOpen(!menuOpen);
                            e.currentTarget.blur();
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.blur();
                        }}
                    >
                        Add Preset
                    </button>
                </div>
            )}
        </div>
    );
}
