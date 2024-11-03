import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { sortLoot } from "@/utils/sortLoot/sortLoot";
import styles from "./index.module.css";

export function Loot() {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    return (
        <ul className={styles["loot"]}>
            {[...sortLoot(lootGeneratorState.loot, lootGeneratorState.sortOptions).keys()].map(
                (key, i) => {
                    const item = lootGeneratorState.loot.get(key);
                    return (
                        item && (
                            <li
                                className={`${styles["item"]} ${styles[i % 2 === 0 ? "even" : "odd"]}`}
                                key={key}
                            >
                                <p className={`${styles["item-name"]} truncate-ellipsis`}>
                                    {item.name || key}
                                </p>
                                <p className={styles["item-quantity"]}>{item.quantity}</p>
                            </li>
                        )
                    );
                },
            )}
        </ul>
    );
}
