import { useContext, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable, LootTableBase } from "@/utils/types";
import styles from "./index.module.css";

export function Interactive() {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    const createItemField = useCallback((entry: LootItem) => {
        return (
            <div className={styles["item"]} key={entry.key}>
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

    const createTableField = useCallback(
        (entry: LootTable | LootTableBase) => {
            return (
                <div className={styles["table"]} key={entry.key}>
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
                        <p className={styles["table-name"]}>{entry.name || "Unnamed Table"}</p>
                    </button>
                    <div className={styles["table-entries"]}>
                        {entry.loot.map((subEntry) => {
                            if (subEntry.type === "item") return createItemField(subEntry);
                            if (subEntry.type === "table") return createTableField(subEntry);
                            return null;
                        })}
                    </div>
                </div>
            );
        },
        [createItemField],
    );

    return (
        <div className={styles["interactive"]}>
            {lootGeneratorState.lootTable && createTableField(lootGeneratorState.lootTable)}
        </div>
    );
}
