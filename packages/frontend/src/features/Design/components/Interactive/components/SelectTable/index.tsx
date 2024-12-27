import { useContext, useState, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { Table as TableTypes } from "@/utils/types";
import { TableContext, Table } from "../Table";
import styles from "./index.module.css";

export type TSelectTable = {
    entryKey: string;
    id: string | null;
    disabled?: boolean;
};

export function SelectTable({ entryKey, id, disabled }: TSelectTable) {
    const { lootGeneratorState, setTableOnEntry } = useContext(LootGeneratorContext);
    const { pathToRoot } = useContext(TableContext);

    const [selectingTable, setSelectingTable] = useState<boolean>(false);

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (!disabled) {
            options.push({
                symbol: "Edit",
                onClick: () => setSelectingTable(!selectingTable),
            });
        }
        return options;
    }, [disabled, selectingTable]);

    const table: TableTypes | null = useMemo(() => {
        if (!id) return null;
        return lootGeneratorState.tables.get(id) || null;
    }, [id, lootGeneratorState.tables]);

    return (
        <div className={styles["select-table"]}>
            {table && !selectingTable ? (
                <Table
                    id={id!}
                    displayMode={!disabled ? "entry" : "entryViewOnly"}
                    onClick={(optionClicked) => {
                        if (optionClicked === "edit") setSelectingTable(true);
                    }}
                />
            ) : (
                <ToggleBar
                    name={!disabled ? "Please select a table" : "Cannot select table"}
                    defaultState={false}
                    options={toggleBarOptions}
                    onClick={() => setSelectingTable(!selectingTable)}
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
            {!disabled && selectingTable && (
                <ul className={styles["selection-list"]}>
                    {[...lootGeneratorState.tables.keys()]
                        .filter(
                            (tableId) => pathToRoot.findIndex((step) => step.id === tableId) === -1,
                        )
                        .map((tableId) => {
                            const selectionTable = lootGeneratorState.tables.get(tableId);
                            return (
                                selectionTable && (
                                    <Table
                                        id={tableId}
                                        displayMode="selection"
                                        onClick={() => {
                                            const success =
                                                pathToRoot[0].id &&
                                                setTableOnEntry(
                                                    pathToRoot[0].id,
                                                    entryKey,
                                                    tableId,
                                                );
                                            if (success) setSelectingTable(false);
                                        }}
                                        key={tableId}
                                    />
                                )
                            );
                        })}
                </ul>
            )}
        </div>
    );
}
