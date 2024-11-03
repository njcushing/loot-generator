import { useContext, useEffect, useRef, useState } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { SortOrder } from "@/utils/sortLoot/sortLoot";
import styles from "./index.module.css";

export function SortOptions() {
    const { lootGeneratorState, setLootGeneratorStateProperty } = useContext(LootGeneratorContext);

    const [sortOptions, setSortOptions] = useState<typeof lootGeneratorState.sortOptions>(
        lootGeneratorState.sortOptions,
    );

    useEffect(() => {
        setLootGeneratorStateProperty("sortOptions", sortOptions);
    }, [setLootGeneratorStateProperty, sortOptions]);

    const nameInputRef = useRef<HTMLInputElement>(null);
    const quantityInputRef = useRef<HTMLInputElement>(null);

    return (
        <form className={styles["sort-options"]}>
            <fieldset>
                <label htmlFor="sort-name">
                    <input
                        type="checkbox"
                        id="sort-name"
                        checked={lootGeneratorState.sortOptions.has("name")}
                        onChange={(e) => {
                            setSortOptions((currentSortOptions) => {
                                const opts = new Map(currentSortOptions);
                                if (e.target.checked) {
                                    if (!opts.has("name")) opts.set("name", "ascending");
                                    if (opts.has("quantity")) opts.delete("quantity");
                                } else if (opts.has("name")) opts.delete("name");
                                return opts;
                            });
                        }}
                        ref={nameInputRef}
                    />
                    Name
                </label>
                {lootGeneratorState.sortOptions.has("name") && (
                    <select
                        id="sort-name-direction"
                        name="sort-name-direction"
                        defaultValue={lootGeneratorState.sortOptions.get("name") || "ascending"}
                        onChange={(e) => {
                            setSortOptions((currentSortOptions) => {
                                const opts = new Map(currentSortOptions);
                                if (opts.has("name")) opts.set("name", e.target.value as SortOrder);
                                return opts;
                            });
                        }}
                    >
                        <option value="ascending">Ascending</option>
                        <option value="descending">Descending</option>
                    </select>
                )}
            </fieldset>
            <fieldset>
                <label htmlFor="sort-quantity">
                    <input
                        type="checkbox"
                        id="sort-quantity"
                        checked={lootGeneratorState.sortOptions.has("quantity")}
                        onChange={(e) => {
                            setSortOptions((currentSortOptions) => {
                                const opts = new Map(currentSortOptions);
                                if (e.target.checked) {
                                    if (!opts.has("quantity")) opts.set("quantity", "ascending");
                                    if (opts.has("name")) opts.delete("name");
                                } else if (opts.has("quantity")) opts.delete("quantity");
                                return opts;
                            });
                        }}
                        ref={quantityInputRef}
                    />
                    Quantity
                </label>
                {lootGeneratorState.sortOptions.has("quantity") && (
                    <select
                        id="sort-quantity-direction"
                        name="sort-quantity-direction"
                        defaultValue={lootGeneratorState.sortOptions.get("quantity") || "ascending"}
                        onChange={(e) => {
                            setSortOptions((currentSortOptions) => {
                                const opts = new Map(currentSortOptions);
                                if (opts.has("quantity")) {
                                    opts.set("quantity", e.target.value as SortOrder);
                                }
                                return opts;
                            });
                        }}
                    >
                        <option value="ascending">Ascending</option>
                        <option value="descending">Descending</option>
                    </select>
                )}
            </fieldset>
        </form>
    );
}
