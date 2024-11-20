import { useContext, useState } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import styles from "./index.module.css";

export type TCreateNewEntryButton = {
    entry: LootTable;
};

export function CreateNewEntryButton({ entry }: TCreateNewEntryButton) {
    const { createSubEntry } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    const [menuOpen, setMenuOpen] = useState<boolean>(false);

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
                            createSubEntry(entry.key, "table", menuType);
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
                            createSubEntry(entry.key, "item", menuType);
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
