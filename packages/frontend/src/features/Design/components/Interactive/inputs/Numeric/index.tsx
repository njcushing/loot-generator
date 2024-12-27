import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { TableContext } from "../../components/Table";
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
    const { updateItem, updateEntry } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);
    const { pathToRoot } = useContext(TableContext);

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
                    if (typeof min === "number") newValue = Math.max(min, newValue);
                    if (typeof max === "number") newValue = Math.min(max, newValue);
                    const fieldToUpdate = { path: fieldPath, newValue };
                    if (menuType === "items") updateItem(entryKey, [fieldToUpdate]);
                    if (menuType === "tables" && pathToRoot[0].id) {
                        updateEntry(pathToRoot[0].id, entryKey, [fieldToUpdate]);
                    }
                }}
                disabled={disabled}
            ></input>
        </label>
    );
}
