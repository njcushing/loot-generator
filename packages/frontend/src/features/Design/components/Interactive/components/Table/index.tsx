import { createContext, useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { InteractiveContext } from "../..";
import { Inputs } from "../../inputs";
import { TableEntry } from "../TableEntry";
import { ItemEntry } from "../ItemEntry";
import { Entry } from "../Entry";
import styles from "./index.module.css";

interface TableContext {
    pathToRoot: { type: "base" | "imported"; id: string | null }[];
}

const defaultTableContext: TableContext = {
    pathToRoot: [],
};

export const TableContext = createContext<TableContext>(defaultTableContext);

export type TTable = {
    id: string;
    displayMode?: "normal" | "entry" | "entryViewOnly" | "selection";
    onClick?: (optionClicked: "toggle" | "delete" | "edit" | "upload" | "add") => unknown;
};

export function Table({ id, displayMode = "normal", onClick }: TTable) {
    const { lootGeneratorState, deleteTable, uploadTableToActive, createSubEntry } =
        useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);
    const { pathToRoot } = useContext(TableContext);

    const updatedPathToRoot = Array.from(pathToRoot);
    updatedPathToRoot.push({
        type: displayMode === "normal" ? "base" : "imported",
        id,
    });

    const table = useMemo(() => lootGeneratorState.tables.get(id), [id, lootGeneratorState.tables]);

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (menuType !== "active") {
            if (displayMode === "normal") {
                options.push({
                    symbol: "Add_Circle",
                    onClick: () => {
                        createSubEntry(id);
                        if (onClick) onClick("add");
                    },
                });
                options.push({
                    symbol: "Upload",
                    onClick: () => {
                        uploadTableToActive(id);
                        if (onClick) onClick("upload");
                    },
                });
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
        }
        return options;
    }, [id, displayMode, onClick, deleteTable, uploadTableToActive, createSubEntry, menuType]);

    const name = table?.name;
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
        <TableContext.Provider
            value={useMemo(
                () => ({
                    pathToRoot: updatedPathToRoot,
                }),
                [updatedPathToRoot],
            )}
        >
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
                        idOrKey={id}
                        type="table"
                        labelText="Name"
                        value={name || ""}
                        fieldPath={["name"]}
                        disabled={displayMode !== "normal"}
                    />
                </div>
                <ul className={styles["table-entries"]}>
                    {table &&
                        table.loot.map((entry) => {
                            if (entry.type === "item") {
                                return <ItemEntry entry={entry} key={entry.key} />;
                            }
                            if (entry.type === "table") {
                                return <TableEntry entry={entry} key={entry.key} />;
                            }
                            if (entry.type === "entry") {
                                return <Entry entry={entry} key={entry.key} />;
                            }
                            return null;
                        })}
                </ul>
            </ToggleBar>
        </TableContext.Provider>
    );
}
