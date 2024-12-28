import { useContext } from "react";
import { ToggleBar } from "@/components/buttons/components/ToggleBar";
import { v4 as uuid } from "uuid";
import { LootEntry } from "@/utils/types";
import { TableContext } from "../Table";
import { InteractiveContext } from "../..";
import { SelectEntry } from "../SelectEntry";
import styles from "./index.module.css";

export type TEntry = {
    entry: LootEntry;
};

export function Entry({ entry }: TEntry) {
    const { menuType } = useContext(InteractiveContext);
    const { pathToRoot } = useContext(TableContext);

    const isDescendantOfImportedTable =
        pathToRoot.findIndex((pathStep) => pathStep.type === "imported") !== -1;

    const { key } = entry;

    const disableItemSelection = menuType === "active" || isDescendantOfImportedTable;

    return (
        <li className={styles["entry"]} key={uuid()}>
            <ToggleBar
                name="New Entry"
                style={{
                    size: "s",
                    colours: {
                        normal: "rgb(253, 222, 47)",
                        hover: "rgb(240, 208, 31)",
                        focus: "rgb(218, 187, 14)",
                    },
                    nameFontStyle: "italic",
                }}
            >
                <SelectEntry entryKey={key} id={null} disabled={disableItemSelection} />
                <div className={styles["entry-options"]}>
                    <button
                        type="button"
                        className={styles["entry-option"]}
                        onClick={(e) => {
                            e.currentTarget.blur();
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.blur();
                        }}
                    >
                        <p
                            className={`${styles["symbol"]} material-symbols-sharp`}
                            style={{ fontSize: "1.2rem" }}
                        >
                            Table
                        </p>
                        <p className="truncate-ellipsis">Table</p>
                    </button>
                    <button
                        type="button"
                        className={styles["entry-option"]}
                        onClick={(e) => {
                            e.currentTarget.blur();
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.blur();
                        }}
                    >
                        <p
                            className={`${styles["symbol"]} material-symbols-sharp`}
                            style={{ fontSize: "1.2rem" }}
                        >
                            Nutrition
                        </p>
                        <p className="truncate-ellipsis">Item</p>
                    </button>
                </div>
            </ToggleBar>
        </li>
    );
}
