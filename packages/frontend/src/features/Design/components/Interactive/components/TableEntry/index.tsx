import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootTable, Table as TableTypes } from "@/utils/types";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { InteractiveContext } from "../..";
import { SelectTable } from "../SelectTable";
import { EntryFieldsToggleBar } from "../EntryFieldsToggleBar";
import { Inputs } from "../../inputs";
import styles from "./index.module.css";

export type TTableEntry = {
    entry: LootTable;
    isBaseTable?: boolean;
    isBaseTableEntry?: boolean;
    isDescendantOfBaseTableEntry?: boolean;
};

export function TableEntry({
    entry,
    isBaseTable = false,
    isBaseTableEntry = false,
    isDescendantOfBaseTableEntry = false,
}: TTableEntry) {
    const { lootGeneratorState, deleteEntry } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    const { key, id, criteria } = entry;
    const { weight } = criteria;

    const disableTableSelection = menuType === "active" || isDescendantOfBaseTableEntry;
    const disablePropsFields = menuType === "active" || isDescendantOfBaseTableEntry;

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (menuType !== "active") {
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
                    onClick: () => deleteEntry(key),
                    colours: { hover: "rgb(255, 120, 120)", focus: "rgb(255, 83, 83)" },
                });
            }
        }
        return options;
    }, [isBaseTable, isBaseTableEntry, isDescendantOfBaseTableEntry, deleteEntry, menuType, key]);

    const table: TableTypes | null = useMemo(() => {
        if (!id) return null;
        return lootGeneratorState.tables.get(id) || null;
    }, [id, lootGeneratorState.tables]);

    const name = table && table.name ? table.name : "Unnamed Table";
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
                <SelectTable entryKey={key} id={id} disabled={disableTableSelection} />
                <div className={styles["table-entry-fields"]}>
                    <EntryFieldsToggleBar
                        name="Criteria"
                        fields={
                            <Inputs.Numeric
                                entryKey={key}
                                labelText="Weight"
                                value={typeof weight === "number" ? weight : 1}
                                fieldPath={["criteria", "weight"]}
                                disabled={disablePropsFields}
                            />
                        }
                    />
                </div>
            </ToggleBar>
        </li>
    );
}
