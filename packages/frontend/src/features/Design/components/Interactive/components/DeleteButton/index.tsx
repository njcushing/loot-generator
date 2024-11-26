import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import styles from "./index.module.css";

export type TDeleteButton = {
    entry: LootItem | LootTable;
    isPreset?: boolean;
};

export function DeleteButton({ entry, isPreset }: TDeleteButton) {
    const { deleteEntry, deletePreset } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    return (
        <button
            type="button"
            className={`${styles["delete-button"]} material-symbols-sharp`}
            onClick={(e) => {
                if (isPreset) {
                    deletePreset(entry.key);
                } else {
                    deleteEntry(entry.key, menuType);
                }
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
