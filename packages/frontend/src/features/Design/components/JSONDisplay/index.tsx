import { useCallback, useContext, useState, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { v4 as uuid } from "uuid";
import { Option } from "../Option";
import styles from "./index.module.css";

export type TJSONDisplay = {
    hideFields?: string[];
};

export function JSONDisplay({ hideFields }: TJSONDisplay) {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    const [tableIsPopulated, setTableIsPopulated] = useState<boolean>(false);
    const [showingHiddenFields, setShowingHiddenFields] = useState<boolean>(false);

    const hideFieldsSet: Set<string> = useMemo(() => new Set(hideFields), [hideFields]);

    const displayJSONLine = useCallback(
        (obj: object, nestingLevel: number): (JSX.Element | null)[] => {
            const displayKeys = !Array.isArray(obj);
            return Object.keys(obj).flatMap((key, i) => {
                const field = obj[key as keyof typeof obj];
                if (!field) return null;
                if (!showingHiddenFields && hideFieldsSet.has(key)) return null;

                const comma = i < Object.keys(obj).length - 1;

                let [open, close, type, empty, value, content] = ["", "", "", true, null, null];

                if (typeof field === "object") {
                    [open, close, type] = ["{", "}", "object"];
                    [empty, value, content] = [Object.keys(field).length === 0, null, field];
                }

                if (Array.isArray(field)) {
                    [open, close, type] = ["[", "]", "array"];
                    [empty, value, content] = [(field as Array<unknown>).length === 0, null, field];
                }

                if (typeof field === "string") {
                    [open, close, type] = [`"`, `"`, "string"];
                    [empty, value, content] = [(field as string).length === 0, field, null];
                }

                if (typeof field === "number") {
                    [open, close, type] = ["", "", "number"];
                    [empty, value, content] = [false, field, null];
                }

                return (
                    <div className={styles[`json-${type}`]} key={uuid()}>
                        <div className={styles["json-field"]} key={uuid()}>
                            {displayKeys && (
                                <p className={styles["json-field-name"]}>{`${key}:`}&nbsp;</p>
                            )}
                            <p className={styles["json-field-wrapper"]}>
                                {empty ? `${open}${close}` : `${open}`}
                                {empty && comma ? "," : ""}
                            </p>
                            {value && (
                                <>
                                    <p className={styles["json-field-value"]}>
                                        {value || "undefined"}
                                    </p>
                                    <p className={styles["json-field-wrapper"]}>
                                        {close}
                                        {comma ? "," : ""}
                                    </p>
                                </>
                            )}
                        </div>
                        {content && !empty && (
                            <>
                                <div className={styles["nesting-level-container"]}>
                                    {displayJSONLine(content, nestingLevel + 1)}
                                </div>
                                <p className={styles["json-field-wrapper"]}>
                                    {close}
                                    {comma ? "," : ""}
                                </p>
                            </>
                        )}
                    </div>
                );
            });
        },
        [showingHiddenFields, hideFieldsSet],
    );

    const copyJSON = useCallback(() => {
        const { active, tables } = lootGeneratorState;
        const activeTableCopy = structuredClone(tables.get(active || ""));
        if (!activeTableCopy) return;

        const deleteHiddenFields = (entry: object) => {
            const mutableEntry = entry;
            const keys = Object.keys(entry);

            for (let i = keys.length - 1; i >= 0; i--) {
                const key = keys[i] as keyof typeof entry;
                if (hideFieldsSet.has(keys[i])) delete mutableEntry[key];
                if (typeof entry[key] === "object") deleteHiddenFields(entry[key]);
            }
        };

        if (showingHiddenFields) deleteHiddenFields(activeTableCopy);
        navigator.clipboard.writeText(JSON.stringify(activeTableCopy));
    }, [lootGeneratorState, showingHiddenFields, hideFieldsSet]);

    return (
        <div className={styles["json-display"]}>
            <div className={styles["json-display-options"]}>
                <Option
                    symbol={tableIsPopulated ? "Table_Eye" : "Table"}
                    onClick={() => setTableIsPopulated(!tableIsPopulated)}
                />
                <Option
                    symbol={showingHiddenFields ? "Visibility" : "Visibility_Off"}
                    onClick={() => setShowingHiddenFields(!showingHiddenFields)}
                />
                <Option symbol="Content_Copy" onClick={() => copyJSON()} />
            </div>
            <div className={styles["json-text"]}>
                {(() => {
                    const { active, tables } = lootGeneratorState;
                    const activeTable = tables.get(active || "");
                    if (!activeTable) return null;
                    return displayJSONLine(activeTable, 0);
                })()}
            </div>
        </div>
    );
}
