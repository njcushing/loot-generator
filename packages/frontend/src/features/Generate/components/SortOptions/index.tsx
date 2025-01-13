import { useContext, useState, useEffect, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import styles from "./index.module.css";

export function SortOptions() {
    const { lootGeneratorState, setLootGeneratorStateProperty } = useContext(LootGeneratorContext);

    const [sortOptions, setSortOptions] = useState<typeof lootGeneratorState.sortOptions>(
        lootGeneratorState.sortOptions,
    );

    useEffect(() => {
        setLootGeneratorStateProperty("sortOptions", sortOptions);
    }, [setLootGeneratorStateProperty, sortOptions]);

    const inputs = useMemo(() => {
        const { selected, options } = sortOptions;
        const optionSelected = options.find((option) => option.name === selected);
        if (!optionSelected) return null;
        const criteria = structuredClone(optionSelected.criteria);
        return (
            <>
                <p className={styles["sort-options-title"]}>Sort By:</p>
                <div className={styles["option-and-criteria-container"]}>
                    <select
                        className={styles["sort-option-select"]}
                        id="sort-options"
                        name="sort-options"
                        defaultValue={sortOptions.selected}
                        onChange={(e) => {
                            setSortOptions((current) => ({ ...current, selected: e.target.value }));
                        }}
                        key="sort-options"
                    >
                        {options.map((option) => {
                            return (
                                <option
                                    className={styles["sort-option-select-option"]}
                                    value={option.name}
                                    key={`sort-option-${option.name}`}
                                >
                                    {option.name}
                                </option>
                            );
                        })}
                    </select>
                    {criteria.map((criterion) => {
                        const {
                            name: criterionName,
                            selected: selectedCriterion,
                            values,
                        } = criterion;
                        return (
                            <select
                                className={styles["sort-option-select"]}
                                id={`sort-option-${selected}-${criterionName}`}
                                name={`sort-option-${selected}-${criterionName}`}
                                defaultValue={selectedCriterion}
                                onChange={(e) => {
                                    setSortOptions((current) => {
                                        const newOptions = structuredClone(current.options);
                                        const optionToUpdate = newOptions.find(
                                            (o) => o.name === selected,
                                        );
                                        if (!optionToUpdate) return current;
                                        const criterionToUpdate = optionToUpdate.criteria.find(
                                            (c) => c.name === criterionName,
                                        );
                                        if (!criterionToUpdate) return current;
                                        criterionToUpdate.selected = e.target.value;
                                        return { ...current, options: newOptions };
                                    });
                                }}
                                key={`sort-option-${selected}-${criterionName}`}
                            >
                                {values.map((value) => {
                                    return (
                                        <option
                                            className={styles["sort-option-select-option"]}
                                            value={value}
                                            key={`sort-option-${selected}-${criterionName}-${value}`}
                                        >
                                            {value}
                                        </option>
                                    );
                                })}
                            </select>
                        );
                    })}
                </div>
            </>
        );
    }, [sortOptions]);

    return <form className={styles["sort-options"]}>{inputs}</form>;
}
