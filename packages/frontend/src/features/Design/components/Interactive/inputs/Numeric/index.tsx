import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import styles from "./index.module.css";

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
    const { updateItem, mutateEntryField } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    return (
        <label
            className={styles["numeric-field-label"]}
            htmlFor={`${entryKey}-${fieldPath.join()}`}
        >
            {labelText}:{" "}
            <input
                className={styles["numeric-field-input"]}
                type="number"
                id={`${entryKey}-${fieldPath.join()}`}
                value={value}
                onChange={(e) => {
                    let newValue = Number(e.target.value);
                    if (min) newValue = Math.max(min, newValue);
                    if (max) newValue = Math.min(max, newValue);
                    if (menuType === "items") updateItem(entryKey, [fieldPath], newValue);
                    if (menuType === "active" || menuType === "presets") {
                        mutateEntryField(entryKey, [fieldPath], newValue, menuType);
                    }
                }}
                disabled={disabled}
            ></input>
        </label>
    );
}
