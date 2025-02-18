import { useContext, useState, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { Table as TableTypes, Item as ItemTypes } from "@/utils/types";
import { TabSelector } from "@/components/structural/components/TabSelector";
import { findCompatibleDescendantTables } from "@/utils/findCompatibleDescendantTables";
import { TableContext, Table } from "../Table";
import { Item } from "../Item";
import styles from "./index.module.css";

export type TSelectEntry = {
    entryKey: string;
    id: string | null;
    disabled?: boolean;
};

export function SelectEntry({ entryKey, id, disabled }: TSelectEntry) {
    const { lootGeneratorState, setIdOnEntry, removeIdFromEntry } =
        useContext(LootGeneratorContext);
    const { pathToRoot } = useContext(TableContext);

    const [selectingEntry, setSelectingEntry] = useState<boolean>(false);

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (!disabled) {
            options.push({
                symbol: "Edit",
                onClick: () => setSelectingEntry(!selectingEntry),
            });
        }
        return options;
    }, [disabled, selectingEntry]);

    const [entry, type]: [TableTypes | ItemTypes | null, "table" | "item" | ""] = useMemo(() => {
        if (!id) return [null, ""];
        if (lootGeneratorState.tables[id]) return [lootGeneratorState.tables[id]!, "table"];
        if (lootGeneratorState.items[id]) return [lootGeneratorState.items[id], "item"];
        return [null, ""];
    }, [id, lootGeneratorState.tables, lootGeneratorState.items]);

    const properties = useMemo(() => {
        if (type === "item") {
            return (
                <Item
                    id={id!}
                    displayMode={!disabled ? "entry" : "entryViewOnly"}
                    onClick={(optionClicked) => {
                        if (optionClicked === "remove_selection") {
                            if (pathToRoot[0].id === null) return;
                            removeIdFromEntry(pathToRoot[0].id, entryKey);
                        }
                        if (optionClicked === "edit") setSelectingEntry(true);
                    }}
                />
            );
        }
        if (type === "table") {
            return (
                <Table
                    id={id!}
                    displayMode={!disabled ? "entry" : "entryViewOnly"}
                    onClick={(optionClicked) => {
                        if (optionClicked === "remove_selection") {
                            if (pathToRoot[0].id === null) return;
                            removeIdFromEntry(pathToRoot[0].id, entryKey);
                        }
                        if (optionClicked === "edit") setSelectingEntry(true);
                    }}
                />
            );
        }
        return null;
    }, [entryKey, id, disabled, removeIdFromEntry, pathToRoot, type]);

    const tableList = useMemo(() => {
        if (pathToRoot.length === 0) return null;
        if (!pathToRoot[pathToRoot.length - 1].id) return null;
        const compatibleTables = findCompatibleDescendantTables(
            pathToRoot[pathToRoot.length - 1].id!,
            lootGeneratorState.tables,
        );
        return [...compatibleTables.keys()].map((tableId) => {
            return (
                <Table
                    id={tableId}
                    displayMode="selection"
                    onClick={() => {
                        const success =
                            pathToRoot[0].id && setIdOnEntry(pathToRoot[0].id, entryKey, tableId);
                        if (success) setSelectingEntry(false);
                    }}
                    key={tableId}
                />
            );
        });
    }, [entryKey, lootGeneratorState.tables, setIdOnEntry, pathToRoot]);

    const itemList = useMemo(() => {
        return [...Object.keys(lootGeneratorState.items)].map((itemId) => {
            return (
                <Item
                    id={itemId}
                    displayMode="selection"
                    onClick={() => {
                        const success =
                            pathToRoot[0].id && setIdOnEntry(pathToRoot[0].id, entryKey, itemId);
                        if (success) setSelectingEntry(false);
                    }}
                    key={itemId}
                />
            );
        });
    }, [entryKey, lootGeneratorState.items, setIdOnEntry, pathToRoot]);

    return (
        <div className={styles["select-entry"]}>
            {entry && !selectingEntry ? (
                properties
            ) : (
                <ToggleBar
                    name={!disabled ? "Select an entry" : "Cannot select entry"}
                    defaultState={false}
                    options={toggleBarOptions}
                    onClick={() => setSelectingEntry(!selectingEntry)}
                    disabled={disabled}
                    style={{
                        size: "s",
                        colours: {
                            normal: "var(--background-selectentry, rgb(181, 186, 255))",
                            hover: "var(--background-selectentry-hover, rgb(164, 169, 252))",
                            focus: "var(--background-selectentry-focus, rgb(155, 161, 252))",
                        },
                        indicator: "none",
                        nameFontStyle: "italic",
                    }}
                />
            )}
            {!disabled && selectingEntry && (
                <div className={styles["selection-list"]}>
                    <TabSelector
                        tabs={{
                            tables: {
                                name: "Tables",
                                content: tableList,
                                position: "left",
                            },
                            items: {
                                name: "Items",
                                content: itemList,
                                position: "left",
                            },
                        }}
                        style={{ size: "s" }}
                    />
                </div>
            )}
        </div>
    );
}
