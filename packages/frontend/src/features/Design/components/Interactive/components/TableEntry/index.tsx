import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootTable } from "@/utils/types";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { ItemEntry } from "../ItemEntry";
import { EntryFieldsToggleBar } from "../EntryFieldsToggleBar";
import { Inputs } from "../../inputs";
import styles from "./index.module.css";

export type TTableEntry = {
    entry: LootTable;
    isActive?: boolean;
    isBaseTable?: boolean;
    isBaseTableEntry?: boolean;
    isDescendantOfBaseTableEntry?: boolean;
};

export function TableEntry({
    entry,
    isActive = false,
    isBaseTable = false,
    isBaseTableEntry = false,
    isDescendantOfBaseTableEntry = false,
}: TTableEntry) {
    const { deleteTable, deleteEntry } = useContext(LootGeneratorContext);

    const { key, props, criteria } = entry;
    const { name } = props;
    const { weight } = criteria;

    const disablePropsFields = isActive || isBaseTableEntry || isDescendantOfBaseTableEntry;
    const disableOtherFields = isActive || isDescendantOfBaseTableEntry;

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (!isActive) {
            if (!isBaseTableEntry && !isDescendantOfBaseTableEntry) {
                options.push({
                    symbol: "Add_Circle",
                });
            }
            if (isBaseTable) {
                options.push({
                    symbol: "Upload",
                });
            }
            if (!isDescendantOfBaseTableEntry) {
                options.push({
                    symbol: "Delete",
                    onClick: () => {
                        if (isBaseTable) {
                            deleteTable(key);
                        } else {
                            deleteEntry(key);
                        }
                    },
                    colours: { hover: "rgb(255, 120, 120)", focus: "rgb(255, 83, 83)" },
                });
            }
        }
        return options;
    }, [
        key,
        isActive,
        isBaseTable,
        isBaseTableEntry,
        isDescendantOfBaseTableEntry,
        deleteTable,
        deleteEntry,
    ]);

    const toggleBarColours = {
        normal: !isActive && isBaseTableEntry ? "rgb(241, 197, 114)" : "rgb(186, 240, 228)",
        hover: !isActive && isBaseTableEntry ? "rgb(236, 185, 89)" : "rgb(157, 224, 210)",
        focus: !isActive && isBaseTableEntry ? "rgb(226, 170, 66)" : "rgb(139, 206, 191)",
    };

    return (
        <li className={styles["table-entry"]} key={key}>
            <ToggleBar
                name={name || "Unnamed Table"}
                options={toggleBarOptions}
                style={{
                    colours: toggleBarColours,
                    nameFontStyle: name ? "normal" : "italic",
                }}
            >
                <>
                    <div className={styles["table-entry-fields"]}>
                        <EntryFieldsToggleBar
                            name="Props"
                            fields={
                                <Inputs.Text
                                    entryKey={key}
                                    labelText="Name"
                                    value={name || ""}
                                    fieldPath={["props", "name"]}
                                    disabled={disablePropsFields}
                                />
                            }
                        />
                        <EntryFieldsToggleBar
                            name="Criteria"
                            fields={
                                <Inputs.Numeric
                                    entryKey={key}
                                    labelText="Weight"
                                    value={typeof weight === "number" ? weight : 1}
                                    fieldPath={["criteria", "weight"]}
                                    disabled={disableOtherFields}
                                />
                            }
                        />
                    </div>
                    <ul className={styles["table-entries"]}>
                        {entry.props.loot.map((subEntry) => {
                            if (subEntry.type === "item") {
                                return (
                                    <ItemEntry
                                        entry={subEntry}
                                        isActive={isActive}
                                        isDescendantOfBaseTableEntry={
                                            isBaseTableEntry || isDescendantOfBaseTableEntry
                                        }
                                        key={subEntry.key}
                                    />
                                );
                            }
                            if (subEntry.type === "table") {
                                return (
                                    <TableEntry
                                        entry={subEntry}
                                        isActive={isActive}
                                        isDescendantOfBaseTableEntry={
                                            isBaseTableEntry || isDescendantOfBaseTableEntry
                                        }
                                        key={subEntry.key}
                                    />
                                );
                            }
                            return null;
                        })}
                    </ul>
                </>
            </ToggleBar>
        </li>
    );
}
