import { useContext, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import styles from "./index.module.css";

export type TDeleteEntryButton = {
    entry: LootItem | LootTable;
};

export function DeleteEntryButton({ entry }: TDeleteEntryButton) {
    const { deleteEntry } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    const deleteActiveEntry = useCallback(
        () => deleteEntry(entry.key, menuType),
        [entry, deleteEntry, menuType],
    );

    return (
        <button
            type="button"
            className={`${styles["delete-entry-button"]} material-symbols-sharp`}
            onClick={(e) => {
                deleteActiveEntry();
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
