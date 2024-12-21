import { useContext, useState, useEffect, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { SortCriteria, SortOrder } from "@/utils/types";
import styles from "./index.module.css";

export function SortOptions() {
    const { lootGeneratorState, setLootGeneratorStateProperty } = useContext(LootGeneratorContext);

    const [sortOptions, setSortOptions] = useState<typeof lootGeneratorState.sortOptions>(
        lootGeneratorState.sortOptions,
    );

    useEffect(() => {
        setLootGeneratorStateProperty("sortOptions", sortOptions);
    }, [setLootGeneratorStateProperty, sortOptions]);

    const createSortOptionField = useCallback(
        (criteria: SortCriteria, label: string) => {
            return (
                <fieldset className={styles["sort-options-fieldset"]}>
                    <label className={styles["sort-option-label"]} htmlFor={`sort-${criteria}`}>
                        <input
                            className={styles["sort-option-input"]}
                            type="checkbox"
                            id={`sort-${criteria}`}
                            checked={lootGeneratorState.sortOptions.has(criteria)}
                            onChange={(e) => {
                                setSortOptions(() => {
                                    if (e.target.checked) return new Map([[criteria, "ascending"]]);
                                    return new Map();
                                });
                            }}
                        />
                        <p className={`${styles["sort-option-label-name"]} truncate-ellipsis`}>
                            {label}
                        </p>
                    </label>
                    {lootGeneratorState.sortOptions.has(criteria) && (
                        <select
                            className={styles["sort-option-select"]}
                            id={`sort-${criteria}-order`}
                            name={`sort-${criteria}-order`}
                            defaultValue={
                                lootGeneratorState.sortOptions.get(criteria) || "ascending"
                            }
                            onChange={(e) => {
                                setSortOptions((currentSortOptions) => {
                                    const opts = new Map(currentSortOptions);
                                    if (opts.has(criteria))
                                        opts.set(criteria, e.target.value as SortOrder);
                                    return opts;
                                });
                            }}
                        >
                            <option
                                className={styles["sort-option-select-option"]}
                                value="ascending"
                            >
                                Ascending
                            </option>
                            <option
                                className={styles["sort-option-select-option"]}
                                value="descending"
                            >
                                Descending
                            </option>
                        </select>
                    )}
                </fieldset>
            );
        },
        [lootGeneratorState.sortOptions],
    );

    return (
        <form className={styles["sort-options"]}>
            {createSortOptionField("name", "Name")}
            {createSortOptionField("quantity", "Quantity")}
            {createSortOptionField("value", "Value")}
        </form>
    );
}
