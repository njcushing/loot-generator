import { useContext, useState, useCallback, useEffect } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem, LootTable } from "@/utils/types";
import * as manageMenuStates from "./utils/manageMenuStates";
import styles from "./index.module.css";
import { ToggleButton } from "./components/ToggleButton";
import { Inputs } from "./inputs";

export function Interactive() {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    const [menuStates, setMenuStates] = useState<Map<string, "collapsed" | "expanded">>(() => {
        return manageMenuStates.update(lootGeneratorState.lootTable, new Map(), new Map());
    });
    useEffect(() => {
        setMenuStates((currentMenuStates) => {
            return manageMenuStates.update(
                lootGeneratorState.lootTable,
                currentMenuStates,
                new Map(),
            );
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
            if (typeof menuState === "undefined") return null;
            return (
                <div className={styles["toggle-button-container"]}>
                    <ToggleButton
                        menuState={menuState}
                        name={name}
                        type={type}
                        toggleMenuState={() => {
                            toggleMenuState(key);
                        }}
                    />
                </div>
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
                            <Inputs.Text
                                entryKey={key}
                                labelText="Name"
                                defaultValue={name || ""}
                                fieldPath={["information", "name"]}
                            />
                            <Inputs.Numeric
                                entryKey={key}
                                labelText="Name"
                                defaultValue={weight || 1}
                                fieldPath={["weight"]}
                            />
                        </div>
                    )}
                </div>
            );
        },
        [menuStates, createToggleButton, createDeleteButton],
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
                                <Inputs.Text
                                    entryKey={key}
                                    labelText="Name"
                                    defaultValue={name || ""}
                                    fieldPath={["name"]}
                                />
                                <Inputs.Numeric
                                    entryKey={key}
                                    labelText="Name"
                                    defaultValue={weight || 1}
                                    fieldPath={["weight"]}
                                />
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
        [menuStates, createToggleButton, createNewEntryButton, createDeleteButton, createItemMenu],
    );

    return (
        <div className={styles["interactive"]}>
            {lootGeneratorState.lootTable && createTableMenu(lootGeneratorState.lootTable)}
        </div>
    );
}
