import { useContext, useState, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { Table as TableTypes, Item as ItemTypes } from "@/utils/types";
import { TabSelector } from "@/components/structural/components/TabSelector";
import { TableContext, Table } from "../Table";
import { Item } from "../Item";
import styles from "./index.module.css";

export type TSelectEntry = {
    entryKey: string;
    id: string | null;
    disabled?: boolean;
};

export function SelectEntry({ entryKey, id, disabled }: TSelectEntry) {
    const { lootGeneratorState, setTableOnEntry, setItemOnEntry } =
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
        if (lootGeneratorState.tables.has(id)) return [lootGeneratorState.tables.get(id)!, "table"];
        if (lootGeneratorState.items.has(id)) return [lootGeneratorState.items.get(id)!, "item"];
        return [null, ""];
    }, [id, lootGeneratorState.tables, lootGeneratorState.items]);

    const properties = useMemo(() => {
        if (type === "item") {
            return (
                <Item
                    id={id!}
                    displayMode={!disabled ? "entry" : "entryViewOnly"}
                    onClick={(optionClicked) => optionClicked === "edit" && setSelectingEntry(true)}
                />
            );
        }
        if (type === "table") {
            return (
                <Table
                    id={id!}
                    displayMode={!disabled ? "entry" : "entryViewOnly"}
                    onClick={(optionClicked) => optionClicked === "edit" && setSelectingEntry(true)}
                />
            );
        }
        return null;
    }, [id, disabled, type]);

    const tableList = useMemo(() => {
        return [...lootGeneratorState.tables.keys()]
            .filter((tableId) => pathToRoot.findIndex((step) => step.id === tableId) === -1)
            .map((tableId) => {
                const selectionTable = lootGeneratorState.tables.get(tableId);
                return selectionTable ? (
                    <Table
                        id={tableId}
                        displayMode="selection"
                        onClick={() => {
                            const success =
                                pathToRoot[0].id &&
                                setTableOnEntry(pathToRoot[0].id, entryKey, tableId);
                            if (success) setSelectingEntry(false);
                        }}
                        key={tableId}
                    />
                ) : null;
            });
    }, [entryKey, lootGeneratorState.tables, setTableOnEntry, pathToRoot]);

    const itemList = useMemo(() => {
        return [...lootGeneratorState.items.keys()].map((itemId) => {
            const selectionItem = lootGeneratorState.items.get(itemId);
            return selectionItem ? (
                <Item
                    id={itemId}
                    displayMode="selection"
                    onClick={() => {
                        const success =
                            pathToRoot[0].id && setItemOnEntry(pathToRoot[0].id, entryKey, itemId);
                        if (success) setSelectingEntry(false);
                    }}
                    key={itemId}
                />
            ) : null;
        });
    }, [entryKey, lootGeneratorState.items, setItemOnEntry, pathToRoot]);

    return (
        <div className={styles["select-entry"]}>
            {entry && !selectingEntry ? (
                properties
            ) : (
                <ToggleBar
                    name={!disabled ? "Please select an entry" : "Cannot select entry"}
                    defaultState={false}
                    options={toggleBarOptions}
                    onClick={() => setSelectingEntry(!selectingEntry)}
                    disabled={disabled}
                    style={{
                        size: "s",
                        colours: {
                            normal: "rgb(181, 186, 255)",
                            hover: "rgb(164, 169, 252)",
                            focus: "rgb(155, 161, 252)",
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
