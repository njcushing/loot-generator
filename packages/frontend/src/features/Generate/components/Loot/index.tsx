import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { sortLoot } from "@/utils/sortLoot";
import styles from "./index.module.css";

export function Loot() {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    return (
        <ul className={styles["loot"]}>
            {[...sortLoot(lootGeneratorState.loot, lootGeneratorState.sortOptions).keys()].map(
                (key) => {
                    const { props, quantity } = lootGeneratorState.loot[key]!;
                    const { name } = props;
                    return (
                        <li className={styles["item"]} key={key}>
                            <p
                                className={`${styles["item-name"]} truncate-ellipsis`}
                                style={{ fontStyle: name ? "normal" : "italic" }}
                            >
                                {name || "Unnamed Item"}
                            </p>
                            <p className={styles["item-quantity"]}>{quantity}</p>
                        </li>
                    );
                },
            )}
        </ul>
    );
}
