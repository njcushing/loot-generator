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
                const displayTrailingComma = i < Object.keys(obj).length - 1;

                if (Array.isArray(field)) {
                    if ((field as Array<unknown>).length === 0) {
                        return (
                            <div className={styles["json-array"]} key={uuid()}>
                                <div className={styles["json-field"]} key={uuid()}>
                                    {displayKeys && (
                                        <p className={styles["json-field-name"]}>{`${key}: `}</p>
                                    )}
                                    <p className={styles["json-field-value"]}>
                                        []{displayTrailingComma ? "," : ""}
                                    </p>
                                </div>
                            </div>
                        );
                    }
                    return (
                        <div className={styles["json-array"]} key={uuid()}>
                            <div className={styles["json-field"]} key={uuid()}>
                                {displayKeys && (
                                    <p className={styles["json-field-name"]}>{`${key}: `}</p>
                                )}
                                <p className={styles["json-field-value"]}>[</p>
                            </div>
                            <div className={styles["nesting-level-container"]}>
                                {displayJSONLine(field, nestingLevel + 1)}
                            </div>
                            <p className={styles["json-field-value"]}>
                                ]{displayTrailingComma ? "," : ""}
                            </p>
                        </div>
                    );
                }

                if (typeof field === "object") {
                    if (Object.keys(field).length === 0) {
                        return (
                            <div className={styles["json-object"]} key={uuid()}>
                                <div className={styles["json-field"]} key={uuid()}>
                                    {displayKeys && (
                                        <p className={styles["json-field-name"]}>{`${key}: `}</p>
                                    )}
                                    <p
                                        className={styles["json-field-value"]}
                                    >{`{}${displayTrailingComma ? "," : ""}`}</p>
                                </div>
                            </div>
                        );
                    }
                    return (
                        <div className={styles["json-object"]} key={uuid()}>
                            <div className={styles["json-field"]} key={uuid()}>
                                {displayKeys && (
                                    <p className={styles["json-field-name"]}>{`${key}: `}</p>
                                )}
                                <p className={styles["json-field-value"]}>{"{"}</p>
                            </div>
                            <div className={styles["nesting-level-container"]}>
                                {displayJSONLine(field, nestingLevel + 1)}
                            </div>
                            <p
                                className={styles["json-field-value"]}
                            >{`}${displayTrailingComma ? "," : ""}`}</p>
                        </div>
                    );
                }

                if (typeof field === "string") {
                    return (
                        <div className={styles["json-field"]} key={uuid()}>
                            <p className={styles["json-field-name"]}>{`${key}: `}</p>
                            <p className={styles["json-field-value"]}>
                                {`"${field}"` || "undefined"}
                                {displayTrailingComma ? "," : ""}
                            </p>
                        </div>
                    );
                }

                return (
                    <div className={styles["json-field"]} key={uuid()}>
                        <p className={styles["json-field-name"]}>{`${key}: `}</p>
                        <p className={styles["json-field-value"]}>
                            {field || "undefined"}
                            {displayTrailingComma ? "," : ""}
                        </p>
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
