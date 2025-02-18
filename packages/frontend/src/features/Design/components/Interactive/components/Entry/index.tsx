import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { LootEntry } from "@/utils/types";
import { TableContext } from "../Table";
import { InteractiveContext } from "../..";
import { SelectEntry } from "../SelectEntry";
import styles from "./index.module.css";

export type TEntry = {
    entry: LootEntry;
};

export function Entry({ entry }: TEntry) {
    const { setTypeOnEntry, deleteEntry } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);
    const { pathToRoot } = useContext(TableContext);

    const isDescendantOfImportedTable =
        pathToRoot.findIndex((pathStep) => pathStep.type === "imported") !== -1;

    const { key } = entry;

    const disableItemSelection = menuType === "active" || isDescendantOfImportedTable;

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (menuType !== "active" && !isDescendantOfImportedTable) {
            options.push({
                symbol: "Delete",
                onClick: () => {
                    if (pathToRoot[0].id) deleteEntry(pathToRoot[0].id, key);
                },
                colours: {
                    hover: "var(--background-entrydeleteoption-hover, rgb(255, 120, 120))",
                    focus: "var(--background-entrydeleteoption-focus, rgb(255, 83, 83))",
                },
            });
        }
        return options;
    }, [deleteEntry, menuType, pathToRoot, isDescendantOfImportedTable, key]);

    return (
        <li className={styles["entry"]} key={key}>
            <ToggleBar
                name="New Entry"
                options={toggleBarOptions}
                style={{
                    size: "s",
                    colours: {
                        normal: "var(--background-newentry, rgb(253, 222, 47))",
                        hover: "var(--background-newentry-hover, rgb(240, 208, 31))",
                        focus: "var(--background-newentry-focus, rgb(218, 187, 14))",
                    },
                    nameFontStyle: "italic",
                }}
            >
                <SelectEntry entryKey={key} id={null} disabled={disableItemSelection} />
                {!disableItemSelection ? (
                    <div className={styles["entry-options"]}>
                        <button
                            type="button"
                            className={styles["entry-option"]}
                            onClick={(e) => {
                                if (!pathToRoot[0].id) return;
                                setTypeOnEntry(pathToRoot[0].id, key, "table");
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
                                if (!pathToRoot[0].id) return;
                                setTypeOnEntry(pathToRoot[0].id, key, "item");
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
                ) : null}
            </ToggleBar>
        </li>
    );
}
