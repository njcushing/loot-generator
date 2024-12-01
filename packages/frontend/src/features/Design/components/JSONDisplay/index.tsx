import { useCallback, useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { v4 as uuid } from "uuid";
import styles from "./index.module.css";

export type TJSONDisplay = {
    hideFields?: string[];
};

export function JSONDisplay({ hideFields }: TJSONDisplay) {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    const hideFieldsSet: Set<string> = useMemo(() => new Set(hideFields), [hideFields]);

    const displayJSONLine = useCallback(
        (obj: object, nestingLevel: number): (JSX.Element | null)[] => {
            const displayKeys = !Array.isArray(obj);
            return Object.keys(obj).flatMap((key, i) => {
                const field = obj[key as keyof typeof obj];
                if (!field) return null;
                if (hideFieldsSet.has(key)) return null;

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
        [hideFieldsSet],
    );

    return (
        <div className={styles["json-display"]}>
            {displayJSONLine(lootGeneratorState.lootTable, 0)}
        </div>
    );
}
