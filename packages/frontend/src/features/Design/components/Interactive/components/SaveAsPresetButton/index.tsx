import { useContext, useCallback } from "react";
import { LootGeneratorContext, LootGeneratorState } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { createPreset } from "@/utils/generateLoot";
import styles from "./index.module.css";

export type TSaveAsPresetButton = {
    entry: LootItem | LootTable;
};

export function SaveAsPresetButton({ entry }: TSaveAsPresetButton) {
    const { lootGeneratorState, setLootGeneratorStateProperty } = useContext(LootGeneratorContext);

    const saveEntryAsPreset = useCallback(() => {
        const copy: LootGeneratorState["presets"] = new Map(
            JSON.parse(JSON.stringify(Array.from(lootGeneratorState.presets))),
        );
        const { key, preset } = createPreset(entry);
        if (preset) copy.set(key, preset);
        setLootGeneratorStateProperty("presets", copy);
    }, [entry, lootGeneratorState.presets, setLootGeneratorStateProperty]);

    return (
        <button
            type="button"
            className={`${styles["save-as-preset-button"]} material-symbols-sharp`}
            onClick={(e) => {
                saveEntryAsPreset();
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
