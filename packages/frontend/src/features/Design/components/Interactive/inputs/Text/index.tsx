import { useContext, useCallback } from "react";
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
    const { mutateEntryField } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    const editEntryField = useCallback(
        (newValue: unknown) => mutateEntryField(entryKey, [fieldPath], newValue, menuType),
        [entryKey, fieldPath, mutateEntryField, menuType],
    );

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
                    editEntryField(newValue);
                }}
                disabled={disabled}
            ></input>
        </label>
    );
}
