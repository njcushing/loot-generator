import { useContext, useCallback, useMemo } from "react";
import { LootItem, LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import styles from "./index.module.css";

export type TToggleButton = {
    entryKey: (LootItem | LootTable)["key"];
    name: LootItem["information"]["name"] | LootTable["name"];
    type: LootItem["type"] | LootTable["type"];
};

export function ToggleButton({ entryKey, name, type }: TToggleButton) {
    const { menuStates, setMenuStates } = useContext(InteractiveContext);
    const menuState = useMemo(
        () => menuStates.get(entryKey) || "collapsed",
        [entryKey, menuStates],
    );

    const toggleMenuState = useCallback(() => {
        setMenuStates((currentMenuStates) => {
            const newMenuStates = new Map(currentMenuStates);
            const currentState = newMenuStates.get(entryKey);
            newMenuStates.set(entryKey, currentState === "collapsed" ? "expanded" : "collapsed");
            return newMenuStates;
        });
    }, [entryKey, setMenuStates]);

    return (
        <button
            type="button"
            className={styles["toggle-button"]}
            onClick={(e) => {
                toggleMenuState();
                e.currentTarget.blur();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
        >
            <p className={styles["symbol"]}>{menuState === "collapsed" ? "+" : "-"}</p>
            <p className={`${styles["name"]} ${styles[!name ? "unnamed" : ""]} truncate-ellipsis`}>
                {name || (type === "item" ? "Unnamed Item" : "Unnamed Table")}
            </p>
        </button>
    );
}
