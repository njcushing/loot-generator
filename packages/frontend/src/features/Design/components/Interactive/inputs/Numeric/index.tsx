import { useContext, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import "./index.module.css";

export type TNumeric = {
    entryKey: (LootItem | LootTable)["key"];
    labelText: string;
    value: number;
    min?: number;
    max?: number;
    fieldPath: string[];
    disabled?: boolean;
};

export function Numeric({
    entryKey,
    labelText,
    value,
    min,
    max,
    fieldPath,
    disabled = false,
}: TNumeric) {
    const { mutateEntryField } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    const editEntryField = useCallback(
        (newValue: unknown) => mutateEntryField(entryKey, [fieldPath], newValue, menuType),
        [entryKey, fieldPath, mutateEntryField, menuType],
    );

    return (
        <label htmlFor={`${entryKey}-${fieldPath.join()}`}>
            {labelText}:{" "}
            <input
                type="number"
                id={`${entryKey}-${fieldPath.join()}`}
                value={value}
                onChange={(e) => {
                    let newValue = Number(e.target.value);
                    if (min) newValue = Math.max(min, newValue);
                    if (max) newValue = Math.min(max, newValue);
                    editEntryField(newValue);
                }}
                disabled={disabled}
            ></input>
        </label>
    );
}
