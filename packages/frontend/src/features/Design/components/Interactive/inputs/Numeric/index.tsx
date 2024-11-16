import { useContext, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import "./index.module.css";

export type TNumeric = {
    entryKey: (LootItem | LootTable)["key"];
    labelText: string;
    defaultValue: number;
    min?: number;
    max?: number;
    fieldPath: string[];
};

export function Numeric({ entryKey, labelText, defaultValue, min, max, fieldPath }: TNumeric) {
    const {
        lootGeneratorState,
        setLootGeneratorStateProperty,
        findNestedEntry,
        mutateNestedField,
    } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    const editActiveEntry = useCallback(
        (value: unknown) => {
            const copy: LootTable = JSON.parse(JSON.stringify(lootGeneratorState.lootTable));
            const entry = findNestedEntry(entryKey, copy.loot);
            if (!entry) return;
            mutateNestedField([fieldPath], value, entry);
            setLootGeneratorStateProperty("lootTable", copy);
        },
        [
            entryKey,
            fieldPath,
            lootGeneratorState.lootTable,
            findNestedEntry,
            mutateNestedField,
            setLootGeneratorStateProperty,
        ],
    );

    const editPresetEntry = useCallback(
        (value: unknown) => {
            const copy: (LootItem | LootTable)[] = JSON.parse(
                JSON.stringify(lootGeneratorState.presets),
            );
            const entry = findNestedEntry(entryKey, copy);
            if (!entry) return;
            mutateNestedField([fieldPath], value, entry);
            setLootGeneratorStateProperty("presets", copy);
        },
        [
            entryKey,
            fieldPath,
            lootGeneratorState.presets,
            findNestedEntry,
            mutateNestedField,
            setLootGeneratorStateProperty,
        ],
    );

    return (
        <label htmlFor={`${entryKey}-${fieldPath.join()}`}>
            {labelText}:{" "}
            <input
                type="number"
                id={`${entryKey}-${fieldPath.join()}`}
                defaultValue={defaultValue}
                onChange={(e) => {
                    let value = Number(e.target.value);
                    if (min) value = Math.max(min, value);
                    if (max) value = Math.min(max, value);
                    if (menuType === "active") editActiveEntry(value);
                    if (menuType === "presets") editPresetEntry(value);
                }}
            ></input>
        </label>
    );
}
