import { useContext, useState, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootTable } from "@/utils/types";
import { createItemEntry, createTableEntry } from "../../utils/manageEntries";
import styles from "./index.module.css";

export type TCreateNewEntryButton = {
    entry: LootTable;
};

export function CreateNewEntryButton({ entry }: TCreateNewEntryButton) {
    const { lootGeneratorState, setLootGeneratorStateProperty } = useContext(LootGeneratorContext);

    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const createNewTable = useCallback(() => {
        const { key } = entry;
        const copy: LootTable = JSON.parse(JSON.stringify(lootGeneratorState.lootTable));
        createTableEntry(key, copy);
        setLootGeneratorStateProperty("lootTable", copy);
    }, [entry, lootGeneratorState.lootTable, setLootGeneratorStateProperty]);

    const createNewItem = useCallback(() => {
        const { key } = entry;
        const copy: LootTable = JSON.parse(JSON.stringify(lootGeneratorState.lootTable));
        createItemEntry(key, copy);
        setLootGeneratorStateProperty("lootTable", copy);
    }, [entry, lootGeneratorState.lootTable, setLootGeneratorStateProperty]);

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
                            createNewTable();
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
                            createNewItem();
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
