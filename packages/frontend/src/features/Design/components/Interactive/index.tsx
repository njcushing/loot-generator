import { useContext, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem } from "@/utils/types";
import { v4 as uuid } from "uuid";
import styles from "./index.module.css";

export function Interactive() {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    const createItemField = useCallback((entry: LootItem) => {
        return (
            <div className={styles["item"]} key={uuid()}>
                <button
                    type="button"
                    className={styles["expand-collapse-button"]}
                    onClick={(e) => {
                        e.currentTarget.blur();
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.blur();
                    }}
                >
                    <p className={styles["symbol"]}>+</p>
                    <p className={styles["item-name"]}>
                        {entry.information.name || "Unnamed Item"}
                    </p>
                </button>
            </div>
        );
    }, []);

    return (
        <div className={styles["interactive"]}>
            {lootGeneratorState.lootTable.loot.map((entry) => {
                if (entry.type === "item") return createItemField(entry);
                return null;
            })}
        </div>
    );
}
