import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import styles from "./index.module.css";

export type TText = {
    entryKey: (LootItem | LootTable)["key"];
    labelText: string;
    value: string;
    fieldPath: string[];
    disabled?: boolean;
};

export function Text({ entryKey, labelText, value, fieldPath, disabled = false }: TText) {
    const { updateItem, updateEntry } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    return (
        <label className={styles["text-field-label"]} htmlFor={`${entryKey}-${fieldPath.join()}`}>
            {labelText}:{" "}
            <input
                className={styles["text-field-input"]}
                type="text"
                id={`${entryKey}-${fieldPath.join()}`}
                value={value}
                onChange={(e) => {
                    const newValue = e.target.value;
                    const fieldToUpdate = { path: fieldPath, newValue };
                    if (menuType === "items") updateItem(entryKey, [fieldToUpdate]);
                    if (menuType === "active" || menuType === "presets") {
                        updateEntry(entryKey, [fieldToUpdate], menuType);
                    }
                }}
                disabled={disabled}
            ></input>
        </label>
    );
}
