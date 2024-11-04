import { useContext, useState, useCallback, useEffect } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import styles from "./index.module.css";

type MenuStates = Map<string, "collapsed" | "expanded">;

const updateStates = (
    entry: LootTable | LootItem,
    previousStates: MenuStates,
    newStates: MenuStates,
): MenuStates => {
    let mutableNewStates = new Map(newStates);

    const defaultState = entry.type === "item" ? "collapsed" : "expanded";
    mutableNewStates.set(
        entry.key,
        !previousStates.has(entry.key) ? defaultState : previousStates.get(entry.key)!,
    );

    if (entry.type === "table") {
        [...entry.loot.keys()].forEach((key) => {
            const subEntry = entry.loot[key];
            mutableNewStates = updateStates(subEntry, previousStates, mutableNewStates);
        });
    }

    return mutableNewStates;
};

export function Interactive() {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    const [menuStates, setMenuStates] = useState<Map<string, "collapsed" | "expanded">>(() => {
        return updateStates(lootGeneratorState.lootTable, new Map(), new Map());
    });
    useEffect(() => {
        setMenuStates((currentMenuStates) => {
            return updateStates(lootGeneratorState.lootTable, currentMenuStates, new Map());
        });
    }, [lootGeneratorState.lootTable]);

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
        (entry: LootTable) => {
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
