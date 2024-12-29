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
        const optionSelected = options.get(selected);
        if (!optionSelected) return null;
        const criteria = [...optionSelected.entries()];
        return (
            <>
                <p className={styles["sort-options-title"]}>Sort By:</p>
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
                    {[...options.keys()].map((optionName) => {
                        return (
                            <option
                                className={styles["sort-option-select-option"]}
                                value={optionName}
                                key={`sort-option-${optionName}`}
                            >
                                {optionName}
                            </option>
                        );
                    })}
                </select>
                <div className={styles["sort-option-criteria"]}>
                    {criteria.map((criterion) => {
                        const [criterionName, criterionInformation] = criterion;
                        const { selected: selectedCriterion, values } = criterionInformation;
                        return (
                            <select
                                className={styles["sort-option-select"]}
                                id={`sort-option-${selected}-${criterionName}`}
                                name={`sort-option-${selected}-${criterionName}`}
                                defaultValue={selectedCriterion}
                                onChange={(e) => {
                                    setSortOptions((current) => {
                                        const newOptions = new Map(current.options);
                                        if (!newOptions.has(selected)) return current;
                                        if (!newOptions.get(selected)!.has(criterionName)) {
                                            return current;
                                        }
                                        newOptions.get(selected)!.get(criterionName)!.selected =
                                            e.target.value;
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
