import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { TableContext } from "../../components/Table";
import styles from "./index.module.css";

export type TText = {
    idOrKey: (LootItem | LootTable)["key"];
    type: "table" | "item" | "entry";
    labelText: string;
    value: string;
    fieldPath: string[];
    disabled?: boolean;
};

export function Text({ idOrKey, type, labelText, value, fieldPath, disabled = false }: TText) {
    const { updateTable, updateItem, updateEntry } = useContext(LootGeneratorContext);
    const { pathToRoot } = useContext(TableContext);

    return (
        <label className={styles["text-field-label"]} htmlFor={`${idOrKey}-${fieldPath.join()}`}>
            {labelText}:{" "}
            <input
                className={styles["text-field-input"]}
                type="text"
                id={`${idOrKey}-${fieldPath.join()}`}
                value={value}
                onChange={(e) => {
                    const newValue = e.target.value;
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
