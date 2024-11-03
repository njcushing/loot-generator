import { useContext, useState, useEffect, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { SortCriteria, SortOrder } from "@/utils/sortLoot/sortLoot";
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
                <fieldset>
                    <label htmlFor={`sort-${criteria}`}>
                        <input
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
                        {label}
                    </label>
                    {lootGeneratorState.sortOptions.has(criteria) && (
                        <select
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
                            <option value="ascending">Ascending</option>
                            <option value="descending">Descending</option>
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
        </form>
    );
}
