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
    disabled?: boolean;
};

export function Numeric({
    entryKey,
    labelText,
    defaultValue,
    min,
    max,
    fieldPath,
    disabled = false,
}: TNumeric) {
    const { mutateEntryField } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    const editEntryField = useCallback(
        (value: unknown) => mutateEntryField(entryKey, [fieldPath], value, menuType),
        [entryKey, fieldPath, mutateEntryField, menuType],
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
                    editEntryField(value);
                }}
                disabled={disabled}
            ></input>
        </label>
    );
}
