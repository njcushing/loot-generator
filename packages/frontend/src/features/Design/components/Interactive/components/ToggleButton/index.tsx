import { LootItem, LootTable } from "@/utils/types";
import { MenuStates } from "../../utils/manageMenuStates";
import styles from "./index.module.css";

export type TToggleButton = {
    menuState: MenuStates extends Map<unknown, infer I> ? I : never;
    name: LootItem["information"]["name"] | LootTable["name"];
    type: LootItem["type"] | LootTable["type"];
    toggleMenuState: () => unknown;
};

export function ToggleButton({ menuState, name, type, toggleMenuState }: TToggleButton) {
    return (
        <button
            type="button"
            className={styles["toggle-button"]}
            onClick={(e) => {
                if (toggleMenuState) toggleMenuState();
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
