import { useContext, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { findNestedEntry, mutateNestedField } from "../../utils/manageEntries";
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
    const { lootGeneratorState, setLootGeneratorStateProperty } = useContext(LootGeneratorContext);

    const editEntry = useCallback(
        (value: unknown) => {
            const copy: LootTable = JSON.parse(JSON.stringify(lootGeneratorState.lootTable));
            const entry = findNestedEntry(entryKey, copy);
            if (!entry) return;
            mutateNestedField(fieldPath, value, entry);
            setLootGeneratorStateProperty("lootTable", copy);
        },
        [entryKey, fieldPath, lootGeneratorState.lootTable, setLootGeneratorStateProperty],
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
                    editEntry(value);
                }}
            ></input>
        </label>
    );
}
