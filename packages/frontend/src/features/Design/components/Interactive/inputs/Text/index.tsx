import { useContext, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { findNestedEntry, mutateNestedField } from "../../utils/manageEntries";
import "./index.module.css";

export type TText = {
    entryKey: (LootItem | LootTable)["key"];
    labelText: string;
    defaultValue: string;
    fieldPath: string[];
};

export function Text({ entryKey, labelText, defaultValue, fieldPath }: TText) {
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
                type="text"
                id={`${entryKey}-${fieldPath.join()}`}
                defaultValue={defaultValue}
                onChange={(e) => editEntry(e.target.value)}
            ></input>
        </label>
    );
}
