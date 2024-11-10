import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootTable } from "@/utils/types";
import { ItemEntry } from "./components/ItemEntry";
import { ToggleButton } from "./components/ToggleButton";
import { Inputs } from "./inputs";
import { CreateNewEntryButton } from "./components/CreateNewEntryButton";
import { SaveAsPresetButton } from "./components/SaveAsPresetButton";
import { DeleteEntryButton } from "./components/DeleteEntryButton";
import * as manageMenuStates from "./utils/manageMenuStates";
import styles from "./index.module.css";

interface InteractiveContext {
    menuStates: manageMenuStates.MenuStates;
    setMenuStates: React.Dispatch<React.SetStateAction<manageMenuStates.MenuStates>>;
}

const defaultInteractiveContext: InteractiveContext = {
    menuStates: new Map(),
    setMenuStates: () => {},
};

export const InteractiveContext = createContext<InteractiveContext>(defaultInteractiveContext);

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

    const createTableMenu = useCallback(
        (entry: LootTable) => {
            const { key, name, weight } = entry;
            const menuState = menuStates.get(key);
            return (
                <div className={styles["table"]} key={key}>
                    <div className={styles["table-menu-bar"]}>
                        <div className={styles["toggle-button-container"]}>
                            <ToggleButton entry={entry} />
                        </div>
                        <div className={styles["create-new-entry-button-container"]}>
                            <CreateNewEntryButton />
                        </div>
                        <div className={styles["save-as-preset-button-container"]}>
                            <SaveAsPresetButton />
                        </div>
                        <div className={styles["delete-entry-button-container"]}>
                            <DeleteEntryButton />
                        </div>
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
                                    labelText="Weight"
                                    defaultValue={weight || 1}
                                    fieldPath={["weight"]}
                                />
                            </div>
                            <ul className={styles["table-entries"]}>
                                {entry.loot.map((subEntry) => {
                                    if (subEntry.type === "item") {
                                        return <ItemEntry entry={subEntry} key={subEntry.key} />;
                                    }
                                    if (subEntry.type === "table") return createTableMenu(subEntry);
                                    return null;
                                })}
                            </ul>
                        </>
                    )}
                </div>
            );
        },
        [menuStates],
    );

    return (
        <InteractiveContext.Provider
            value={useMemo(() => ({ menuStates, setMenuStates }), [menuStates, setMenuStates])}
        >
            <div className={styles["interactive"]}>
                {lootGeneratorState.lootTable && createTableMenu(lootGeneratorState.lootTable)}
            </div>
        </InteractiveContext.Provider>
    );
}
