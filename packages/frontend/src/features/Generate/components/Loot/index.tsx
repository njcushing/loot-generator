import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { sortLoot } from "@/utils/sortLoot/sortLoot";
import styles from "./index.module.css";

export function Loot() {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    return (
        <ul className={styles["loot"]}>
            {[
                ...sortLoot(
                    lootGeneratorState.loot,
                    lootGeneratorState.items,
                    lootGeneratorState.sortOptions,
                ).keys(),
            ].map((key) => {
                const item = lootGeneratorState.items.get(key);
                const quantity = lootGeneratorState.loot.get(key) || 0;
                const name = item ? item.name : key;
                return (
                    item && (
                        <li className={styles["item"]} key={key}>
                            <p className={`${styles["item-name"]} truncate-ellipsis`}>{name}</p>
                            <p className={styles["item-quantity"]}>{quantity}</p>
                        </li>
                    )
                );
            })}
        </ul>
    );
}
