import { useContext, useCallback, useMemo } from "react";
import { LootItem, LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import styles from "./index.module.css";

export type TToggleButton = {
    entry: LootItem | LootTable;
};

export function ToggleButton({ entry }: TToggleButton) {
    const { menuStates, setMenuStates } = useContext(InteractiveContext);
    const menuState = useMemo(
        () => menuStates.get(entry.key) || "collapsed",
        [entry.key, menuStates],
    );

    const toggleMenuState = useCallback(() => {
        setMenuStates((currentMenuStates) => {
            const newMenuStates = new Map(currentMenuStates);
            const currentState = newMenuStates.get(entry.key);
            newMenuStates.set(entry.key, currentState === "collapsed" ? "expanded" : "collapsed");
            return newMenuStates;
        });
    }, [entry.key, setMenuStates]);

    const { type, props } = entry;
    const { name } = props;

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
