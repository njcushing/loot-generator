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

    const toggleMenuState = useCallback((key: string) => {
        setMenuStates((currentMenuStates) => {
            const newMenuStates = new Map(currentMenuStates);
            const currentState = newMenuStates.get(key);
            newMenuStates.set(key, currentState === "collapsed" ? "expanded" : "collapsed");
            return newMenuStates;
        });
    }, []);

    const createToggleButton = useCallback(
        (
            key: string,
            name: LootItem["information"]["name"] | LootTable["name"],
            type: LootItem["type"] | LootTable["type"],
        ) => {
            const menuState = menuStates.get(key);
            return (
                <button
                    type="button"
                    className={styles["expand-collapse-button"]}
                    onClick={(e) => {
                        toggleMenuState(key);
                        e.currentTarget.blur();
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.blur();
                    }}
                >
                    <p className={styles["symbol"]}>{menuState === "collapsed" ? "+" : "-"}</p>
                    <p
                        className={`${styles["name"]} ${styles[!name ? "unnamed" : ""]} truncate-ellipsis`}
                    >
                        {name || (type === "item" ? "Unnamed Item" : "Unnamed Table")}
                    </p>
                </button>
            );
        },
        [menuStates, toggleMenuState],
    );

    const createDeleteButton = useCallback(() => {
        return (
            <button
                type="button"
                className={`${styles["delete-menu-item-button"]} material-symbols-sharp`}
                onClick={(e) => {
                    e.currentTarget.blur();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                }}
            >
                Delete
            </button>
        );
    }, []);

    const createItemMenu = useCallback(
        (entry: LootItem) => {
            const { key, information } = entry;
            const { name } = information;
            return (
                <div className={styles["item"]} key={key}>
                    <div className={styles["item-menu-bar"]}>
                        {createToggleButton(key, name, "item")}
                        {createDeleteButton()}
                    </div>
                </div>
            );
        },
        [createToggleButton, createDeleteButton],
    );

    const createTableMenu = useCallback(
        (entry: LootTable) => {
            const { key, name } = entry;
            const menuState = menuStates.get(key);
            return (
                <div className={styles["table"]} key={key}>
                    <div className={styles["table-menu-bar"]}>
                        {createToggleButton(key, name, "table")}
                        {createDeleteButton()}
                    </div>
                    {menuState === "expanded" && (
                        <div className={styles["table-entries"]}>
                            {entry.loot.map((subEntry) => {
                                if (subEntry.type === "item") return createItemMenu(subEntry);
                                if (subEntry.type === "table") return createTableMenu(subEntry);
                                return null;
                            })}
                        </div>
                    )}
                </div>
            );
        },
        [menuStates, createItemMenu, createToggleButton, createDeleteButton],
    );

    return (
        <div className={styles["interactive"]}>
            {lootGeneratorState.lootTable && createTableMenu(lootGeneratorState.lootTable)}
        </div>
    );
}
