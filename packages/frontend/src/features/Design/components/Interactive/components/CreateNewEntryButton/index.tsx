import { useContext, useState, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import styles from "./index.module.css";

export type TCreateNewEntryButton = {
    entry: LootTable;
};

export function CreateNewEntryButton({ entry }: TCreateNewEntryButton) {
    const { createSubEntry } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const createNewEntry = useCallback(
        (type: LootItem["type"] | LootTable["type"]) => {
            const { key } = entry;
            createSubEntry(key, type, menuType);
        },
        [entry, createSubEntry, menuType],
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
                            createNewEntry("table");
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
                            createNewEntry("item");
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
