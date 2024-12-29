import { useContext, useState, useEffect, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { SortCriterion } from "@/utils/types";
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
        (entry: [string, SortCriterion]) => {
            const [name, criteria] = entry;
            return (
                <fieldset className={styles["sort-options-fieldset"]} key={`sort-${name}`}>
                    <label className={styles["sort-option-label"]} htmlFor={`sort-${name}`}>
                        <input
                            className={styles["sort-option-input"]}
                            type="checkbox"
                            id={`sort-${name}`}
                            checked={lootGeneratorState.sortOptions.selected === name}
                            onChange={() => {
                                setSortOptions((current) => ({ ...current, selected: name }));
                            }}
                        />
                        <p className={`${styles["sort-option-label-name"]} truncate-ellipsis`}>
                            {name}
                        </p>
                    </label>
                    {lootGeneratorState.sortOptions.selected === name &&
                        [...criteria.entries()].map((criterion) => {
                            const [criterionName, criterionInformation] = criterion;
                            const { selected, values } = criterionInformation;
                            return (
                                <select
                                    className={styles["sort-option-select"]}
                                    id={`sort-${name}-${criterionName}`}
                                    name={`sort-${name}-${criterionName}`}
                                    defaultValue={selected}
                                    onChange={(e) => {
                                        setSortOptions((current) => {
                                            const options = new Map(current.options);
                                            if (!options.has(name)) return current;
                                            if (!options.get(name)!.has(criterionName)) {
                                                return current;
                                            }
                                            options.get(name)!.get(criterionName)!.selected =
                                                e.target.value;
                                            return { ...current, options };
                                        });
                                    }}
                                    key={`sort-option-${name}-${criterionName}`}
                                >
                                    {values.map((value) => {
                                        return (
                                            <option
                                                className={styles["sort-option-select-option"]}
                                                value={value}
                                                key={`sort-option-${name}-${criterionName}-${value}`}
                                            >
                                                {value}
                                            </option>
                                        );
                                    })}
                                </select>
                            );
                        })}
                </fieldset>
            );
        },
        [lootGeneratorState.sortOptions],
    );

    return (
        <form className={styles["sort-options"]}>
            {[...sortOptions.options.entries()].map((entry) => createSortOptionField(entry))}
        </form>
    );
}
