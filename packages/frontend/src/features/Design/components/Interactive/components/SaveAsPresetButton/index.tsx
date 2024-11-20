import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import styles from "./index.module.css";

export type TSaveAsPresetButton = {
    entry: LootItem | LootTable;
};

export function SaveAsPresetButton({ entry }: TSaveAsPresetButton) {
    const { saveEntryAsPreset } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    return (
        <button
            type="button"
            className={`${styles["save-as-preset-button"]} material-symbols-sharp`}
            onClick={(e) => {
                saveEntryAsPreset(entry.key, menuType);
                e.currentTarget.blur();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
        >
            Save
        </button>
    );
}
