import { useContext, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import "./index.module.css";

export type TText = {
    entryKey: (LootItem | LootTable)["key"];
    labelText: string;
    defaultValue: string;
    fieldPath: string[];
};

export function Text({ entryKey, labelText, defaultValue, fieldPath }: TText) {
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
                type="text"
                id={`${entryKey}-${fieldPath.join()}`}
                defaultValue={defaultValue}
                onChange={(e) => {
                    const { value } = e.target;
                    editEntryField(value);
                }}
            ></input>
        </label>
    );
}
