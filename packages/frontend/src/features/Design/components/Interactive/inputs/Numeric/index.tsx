import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { TableContext } from "../../components/Table";
import styles from "./index.module.css";

export type TNumeric = {
    idOrKey: (LootItem | LootTable)["key"];
    type: "table" | "item" | "entry";
    labelText: string;
    value: number;
    min?: number;
    max?: number;
    fieldPath: string[];
    disabled?: boolean;
};

export function Numeric({
    idOrKey,
    type,
    labelText,
    value,
    min,
    max,
    fieldPath,
    disabled = false,
}: TNumeric) {
    const { updateTable, updateItem, updateEntry } = useContext(LootGeneratorContext);
    const { pathToRoot } = useContext(TableContext);

    return (
        <label className={styles["numeric-field-label"]} htmlFor={`${idOrKey}-${fieldPath.join()}`}>
            {labelText}:{" "}
            <input
                className={styles["numeric-field-input"]}
                type="number"
                id={`${idOrKey}-${fieldPath.join()}`}
                value={value}
                onChange={(e) => {
                    let newValue = Number(e.target.value);
                    if (typeof min === "number") newValue = Math.max(min, newValue);
                    if (typeof max === "number") newValue = Math.min(max, newValue);
                    const fieldToUpdate = { path: fieldPath, newValue };
                    if (type === "table") updateTable(idOrKey, [fieldToUpdate]);
                    if (type === "item") updateItem(idOrKey, [fieldToUpdate]);
                    if (type === "entry" && pathToRoot[0].id) {
                        updateEntry(pathToRoot[0].id, idOrKey, [fieldToUpdate]);
                    }
                }}
                disabled={disabled}
            ></input>
        </label>
    );
}
