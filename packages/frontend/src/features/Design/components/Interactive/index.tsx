import { useContext, useState, useCallback, useEffect } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import { findNestedEntry, mutateNestedField } from "./utils/mutateNestedEntry";
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
    const { lootGeneratorState, setLootGeneratorStateProperty } = useContext(LootGeneratorContext);

    const [menuStates, setMenuStates] = useState<Map<string, "collapsed" | "expanded">>(() => {
        return updateStates(lootGeneratorState.lootTable, new Map(), new Map());
    });
    useEffect(() => {
        setMenuStates((currentMenuStates) => {
            return updateStates(lootGeneratorState.lootTable, currentMenuStates, new Map());
        });
    }, [lootGeneratorState.lootTable]);

    const editEntry = useCallback(
        (key: string, fieldPath: string[], value: unknown) => {
            const copy: LootTable = JSON.parse(JSON.stringify(lootGeneratorState.lootTable));
            const entry = findNestedEntry(key, copy);
            if (!entry) return;
            mutateNestedField(fieldPath, value, entry);
            setLootGeneratorStateProperty("lootTable", copy);
        },
        [lootGeneratorState.lootTable, setLootGeneratorStateProperty],
    );

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

    const createNewEntryButton = useCallback(() => {
        return (
            <button
                type="button"
                className={`${styles["new-entry-button"]} material-symbols-sharp`}
                onClick={(e) => {
                    e.currentTarget.blur();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                }}
            >
                Add_Circle
            </button>
        );
    }, []);

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
            const { key, information, weight } = entry;
            const { name } = information;
            const menuState = menuStates.get(key);
            return (
                <div className={styles["item"]} key={key}>
                    <div className={styles["item-menu-bar"]}>
                        {createToggleButton(key, name, "item")}
                        {createDeleteButton()}
                    </div>
                    {menuState === "expanded" && (
                        <div className={styles["item-menu-properties"]}>
                            <label htmlFor={`${key}-item-name`}>
                                Name:{" "}
                                <input
                                    type="text"
                                    id={`${key}-item-name`}
                                    className={styles["text-input"]}
                                    defaultValue={name || ""}
                                    onChange={(e) => {
                                        editEntry(key, ["information", "name"], e.target.value);
                                    }}
                                ></input>
                            </label>
                            <label htmlFor={`${key}-item-weight`}>
                                Weight:
                                <input
                                    type="number"
                                    id={`${key}-item-weight`}
                                    className={styles["number-input"]}
                                    value={weight || 1}
                                    onChange={(e) => {
                                        editEntry(key, ["weight"], Number(e.target.value));
                                    }}
                                />
                            </label>
                        </div>
                    )}
                </div>
            );
        },
        [menuStates, editEntry, createToggleButton, createDeleteButton],
    );

    const createTableMenu = useCallback(
        (entry: LootTable) => {
            const { key, name, weight } = entry;
            const menuState = menuStates.get(key);
            return (
                <div className={styles["table"]} key={key}>
                    <div className={styles["table-menu-bar"]}>
                        {createToggleButton(key, name, "table")}
                        {createNewEntryButton()}
                        {createDeleteButton()}
                    </div>
                    {menuState === "expanded" && (
                        <>
                            <div className={styles["table-menu-properties"]}>
                                <label htmlFor={`${key}-table-name`}>
                                    Name:{" "}
                                    <input
                                        type="text"
                                        id={`${key}-table-name`}
                                        className={styles["text-input"]}
                                        defaultValue={name || ""}
                                        onChange={(e) => editEntry(key, ["name"], e.target.value)}
                                    ></input>
                                </label>
                                <label htmlFor={`${key}-table-weight`}>
                                    Weight:
                                    <input
                                        type="number"
                                        id={`${key}-table-weight`}
                                        className={styles["number-input"]}
                                        value={weight || 1}
                                        onChange={(e) => {
                                            editEntry(key, ["weight"], Number(e.target.value));
                                        }}
                                    />
                                </label>
                            </div>
                            <div className={styles["table-entries"]}>
                                {entry.loot.map((subEntry) => {
                                    if (subEntry.type === "item") return createItemMenu(subEntry);
                                    if (subEntry.type === "table") return createTableMenu(subEntry);
                                    return null;
                                })}
                            </div>
                        </>
                    )}
                </div>
            );
        },
        [
            menuStates,
            editEntry,
            createToggleButton,
            createNewEntryButton,
            createDeleteButton,
            createItemMenu,
        ],
    );

    return (
        <div className={styles["interactive"]}>
            {lootGeneratorState.lootTable && createTableMenu(lootGeneratorState.lootTable)}
        </div>
    );
}
