import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootTable, Table as TableTypes } from "@/utils/types";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { TableContext } from "../Table";
import { InteractiveContext } from "../..";
import { SelectEntry } from "../SelectEntry";
import { EntryFieldsToggleBar } from "../EntryFieldsToggleBar";
import { Inputs } from "../../inputs";
import { Entry } from "../Entry";
import { ItemEntry } from "../ItemEntry";
import styles from "./index.module.css";

export type TTableEntry = {
    entry: LootTable;
};

export function TableEntry({ entry }: TTableEntry) {
    const { lootGeneratorState, setTypeOnEntry, deleteEntry, createSubEntry } =
        useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);
    const { pathToRoot } = useContext(TableContext);

    const isImportedTable = lootGeneratorState.tables.has(entry.id || "");
    const isDescendantOfImportedTable =
        pathToRoot.findIndex((pathStep) => pathStep.type === "imported") !== -1;

    const { type, key, id, criteria } = entry;
    const { weight } = criteria;

    const disableTableSelection = menuType === "active" || isDescendantOfImportedTable;
    const disablePropsFields = menuType === "active" || isDescendantOfImportedTable;

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (menuType !== "active" && !isDescendantOfImportedTable) {
            if (!isImportedTable) {
                options.push({
                    symbol: "Add_Circle",
                    onClick: () => {
                        if (pathToRoot[0].id) createSubEntry(pathToRoot[0].id, key);
                    },
                });
            }
            options.push({
                symbol: "Swap_Horiz",
                onClick: () => {
                    if (pathToRoot[0].id) setTypeOnEntry(pathToRoot[0].id, key, "item");
                },
            });
            options.push({
                symbol: "Delete",
                onClick: () => pathToRoot[0].id && deleteEntry(pathToRoot[0].id, key),
                colours: { hover: "rgb(255, 120, 120)", focus: "rgb(255, 83, 83)" },
            });
        }
        return options;
    }, [
        setTypeOnEntry,
        deleteEntry,
        createSubEntry,
        menuType,
        pathToRoot,
        isImportedTable,
        isDescendantOfImportedTable,
        key,
    ]);

    const table: TableTypes | null = useMemo(() => {
        if (!id) return null;
        return lootGeneratorState.tables.get(id) || null;
    }, [id, lootGeneratorState.tables]);

    let name = "Unnamed Table";
    if (type === "table_id" && table?.name) name = table.name;
    if (type === "table_noid" && entry.name) name = entry.name;
    const nameFontStyle = table && table.name ? "normal" : "italic";

    return (
        <li className={styles["table-entry"]} key={key}>
            <ToggleBar
                name={name}
                options={toggleBarOptions}
                style={{
                    size: "s",
                    colours: {
                        normal: "rgb(186, 240, 228)",
                        hover: "rgb(157, 224, 210)",
                        focus: "rgb(139, 206, 191)",
                    },
                    nameFontStyle,
                }}
            >
                <SelectEntry entryKey={key} id={id || ""} disabled={disableTableSelection} />
                <div className={styles["table-entry-fields"]}>
                    {type === "table_noid" && (
                        <EntryFieldsToggleBar
                            name="Table Properties"
                            fields={
                                <Inputs.Text
                                    idOrKey={key}
                                    type="entry"
                                    labelText="Name"
                                    value={entry.name || ""}
                                    fieldPath={["name"]}
                                    disabled={disablePropsFields}
                                />
                            }
                        />
                    )}
                    <EntryFieldsToggleBar
                        name="Criteria"
                        fields={
                            <Inputs.Numeric
                                idOrKey={key}
                                type="entry"
                                labelText="Weight"
                                value={typeof weight === "number" ? weight : 1}
                                fieldPath={["criteria", "weight"]}
                                disabled={disablePropsFields}
                            />
                        }
                    />
                </div>
                {type === "table_noid" && entry.loot.length > 0 ? (
                    <ul className={styles["table-entries"]}>
                        {entry.loot
                            .sort((a, b) => a.type.localeCompare(b.type))
                            .map((ent) => {
                                if (ent.type === "item_id" || ent.type === "item_noid") {
                                    return <ItemEntry entry={ent} key={ent.key} />;
                                }
                                if (ent.type === "table_id" || ent.type === "table_noid") {
                                    return <TableEntry entry={ent} key={ent.key} />;
                                }
                                if (ent.type === "entry") {
                                    return <Entry entry={ent} key={ent.key} />;
                                }
                                return null;
                            })}
                    </ul>
                ) : null}
            </ToggleBar>
        </li>
    );
}
