import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import styles from "./index.module.css";

export function SortOptions() {
    const { lootGeneratorState, setLootGeneratorStateProperty } = useContext(LootGeneratorContext);
    const { sortOptions } = lootGeneratorState;

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
                        aria-label="sort-options"
                        defaultValue={sortOptions.selected}
                        onChange={(e) => {
                            const newSortOptions = { ...sortOptions, selected: e.target.value };
                            setLootGeneratorStateProperty("sortOptions", newSortOptions);
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
                                aria-label={`sort-option-${selected}-${criterionName}`}
                                defaultValue={selectedCriterion}
                                onChange={(e) => {
                                    const newOptions = structuredClone(sortOptions.options);
                                    const optionToUpdate = newOptions.find(
                                        (o) => o.name === selected,
                                    );
                                    const criterionToUpdate = optionToUpdate!.criteria.find(
                                        (c) => c.name === criterionName,
                                    );
                                    criterionToUpdate!.selected = e.target.value;
                                    const newSortOptions = { ...sortOptions, options: newOptions };
                                    setLootGeneratorStateProperty("sortOptions", newSortOptions);
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
    }, [sortOptions, setLootGeneratorStateProperty]);

    return <form className={styles["sort-options"]}>{inputs}</form>;
}
