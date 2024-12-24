import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { Inputs } from "../../inputs";
import { TableEntry } from "../TableEntry";
import { ItemEntry } from "../ItemEntry";
import styles from "./index.module.css";

export type TTable = {
    id: string;
    isBaseTableEntry?: boolean;
    isDescendantOfBaseTableEntry?: boolean;
    displayMode?: "normal" | "entry" | "entryViewOnly" | "selection";
    onClick?: (optionClicked: "toggle" | "delete" | "edit" | "upload") => unknown;
};

export function Table({
    id,
    isBaseTableEntry = false,
    isDescendantOfBaseTableEntry = false,
    displayMode = "normal",
    onClick,
}: TTable) {
    const { lootGeneratorState, deleteTable, uploadTableToActive } =
        useContext(LootGeneratorContext);

    const table = useMemo(() => lootGeneratorState.tables.get(id), [id, lootGeneratorState.tables]);

    const isBaseTable: boolean = useMemo(() => {
        if (!id) return false;
        return lootGeneratorState.tables.has(id);
    }, [id, lootGeneratorState.tables]);

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (!isBaseTableEntry && !isDescendantOfBaseTableEntry) {
            options.push({
                symbol: "Add_Circle",
            });
        }
        if (isBaseTable) {
            options.push({
                symbol: "Upload",
                onClick: () => {
                    uploadTableToActive(id);
                    if (onClick) onClick("upload");
                },
            });
        }
        if (displayMode === "normal") {
            options.push({
                symbol: "Delete",
                onClick: () => {
                    deleteTable(id);
                    if (onClick) onClick("delete");
                },
                colours: { hover: "rgb(255, 120, 120)", focus: "rgb(255, 83, 83)" },
            });
        }
        if (displayMode === "entry") {
            options.push({
                symbol: "Edit",
                onClick: () => onClick && onClick("edit"),
            });
        }
        return options;
    }, [
        id,
        isBaseTableEntry,
        isDescendantOfBaseTableEntry,
        displayMode,
        onClick,
        deleteTable,
        uploadTableToActive,
        isBaseTable,
    ]);

    if (!table) return null;

    const { name } = table;
    let displayName = name || "Unnamed Table";
    let nameFontStyle = name ? "normal" : "italic";
    if (displayMode === "entry" || displayMode === "entryViewOnly") {
        displayName = "Table Properties";
        nameFontStyle = "normal";
    }

    let colours = {
        normal: "rgb(186, 240, 228)",
        hover: "rgb(157, 224, 210)",
        focus: "rgb(139, 206, 191)",
    };
    if (displayMode === "entry" || displayMode === "entryViewOnly") {
        colours = {
            normal: "rgb(181, 186, 255)",
            hover: "rgb(164, 169, 252)",
            focus: "rgb(155, 161, 252)",
        };
    }

    return (
        <ToggleBar
            name={displayName}
            options={toggleBarOptions}
            onClick={() => onClick && onClick("toggle")}
            style={{
                size: displayMode === "normal" ? "m" : "s",
                colours,
                indicator: displayMode !== "selection" ? "signs" : "none",
                nameFontStyle,
            }}
            key={id}
        >
            <div className={styles["table-fields"]}>
                <Inputs.Text
                    entryKey={id}
                    labelText="Name"
                    value={name || ""}
                    fieldPath={["name"]}
                    disabled={displayMode !== "normal"}
                />
            </div>
            <ul className={styles["table-entries"]}>
                {table.loot.map((entry) => {
                    if (entry.type === "item") {
                        return (
                            <ItemEntry
                                entry={entry}
                                isDescendantOfBaseTableEntry={
                                    isBaseTableEntry || isDescendantOfBaseTableEntry
                                }
                                key={entry.key}
                            />
                        );
                    }
                    if (entry.type === "table") {
                        return (
                            <TableEntry
                                entry={entry}
                                isDescendantOfBaseTableEntry={
                                    isBaseTableEntry || isDescendantOfBaseTableEntry
                                }
                                key={entry.key}
                            />
                        );
                    }
                    return null;
                })}
            </ul>
        </ToggleBar>
    );
}
