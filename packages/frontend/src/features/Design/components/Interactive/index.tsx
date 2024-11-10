import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { TableEntry } from "./components/TableEntry";
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

    return (
        <InteractiveContext.Provider
            value={useMemo(() => ({ menuStates, setMenuStates }), [menuStates, setMenuStates])}
        >
            <ul className={styles["interactive"]}>
                {lootGeneratorState.lootTable && (
                    <TableEntry entry={lootGeneratorState.lootTable} />
                )}
            </ul>
        </InteractiveContext.Provider>
    );
}
