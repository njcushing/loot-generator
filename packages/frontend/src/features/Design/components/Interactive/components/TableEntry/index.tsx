import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootTable } from "@/utils/types";
import { v4 as uuid } from "uuid";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { InteractiveContext } from "../..";
import { ItemEntry } from "../ItemEntry";
import { EntryFieldsToggleBar } from "../EntryFieldsToggleBar";
import { Inputs } from "../../inputs";
import styles from "./index.module.css";

export type TTableEntry = {
    entry: LootTable;
    isActiveBase?: boolean;
    isPreset?: boolean;
    isPresetEntry?: boolean;
    isDescendantOfPresetEntry?: boolean;
};

export function TableEntry({
    entry,
    isActiveBase = false,
    isPreset = false,
    isPresetEntry = false,
    isDescendantOfPresetEntry = false,
}: TTableEntry) {
    const { lootGeneratorState, deleteEntry, saveEntryAsPreset, deletePreset } =
        useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    const { key, props, criteria } = entry;
    const { name } = props;
    const { weight } = criteria;

    const disablePropsFields = isPresetEntry || isDescendantOfPresetEntry;
    const disableOtherFields = isDescendantOfPresetEntry;

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (!isPresetEntry && !isDescendantOfPresetEntry) {
            options.push({
                symbol: "Add_Circle",
            });
        }
        if (isPreset) {
            options.push({
                symbol: "Upload",
            });
        }
        if (!isPreset && !isPresetEntry) {
            options.push({
                symbol: "Save",
                onClick: () => {
                    if (menuType !== "active" && menuType !== "presets") return;
                    saveEntryAsPreset(key, menuType);
                },
            });
        }
        if (!isActiveBase && !isDescendantOfPresetEntry) {
            options.push({
                symbol: "Delete",
                onClick: () => {
                    if (isPreset) {
                        deletePreset(key);
                    } else {
                        if (menuType !== "active" && menuType !== "presets") return;
                        deleteEntry(key, menuType);
                    }
                },
                colours: { hover: "rgb(255, 120, 120)", focus: "rgb(255, 83, 83)" },
            });
        }
        return options;
    }, [
        key,
        isActiveBase,
        isPreset,
        isPresetEntry,
        isDescendantOfPresetEntry,
        menuType,
        deleteEntry,
        saveEntryAsPreset,
        deletePreset,
    ]);

    return (
        <li className={styles["table-entry"]} key={key}>
            <ToggleBar
                name={name || "Unnamed Table"}
                options={toggleBarOptions}
                style={{
                    colours: {
                        normal: isPresetEntry ? "rgb(241, 197, 114)" : "rgb(186, 240, 228)",
                        hover: isPresetEntry ? "rgb(236, 185, 89)" : "rgb(157, 224, 210)",
                        focus: isPresetEntry ? "rgb(226, 170, 66)" : "rgb(139, 206, 191)",
                    },
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
                            /*
                             * Doing this here to give all entries that are descendants of presets
                             * a unique key that won't match any entries in the LootGenerator
                             * component's 'lootTable' or 'presets' state values. These entries are
                             * informational only; they are part of presets and thus should not be
                             * mutable outside of the top-level preset itself in the 'Presets' tab.
                             */
                            const subEntryKey = isDescendantOfPresetEntry ? uuid() : subEntry.key;

                            if (subEntry.type === "preset") {
                                const preset = lootGeneratorState.presetsMap.get(subEntry.id);
                                if (!preset) return null;
                                if (preset.type === "table") {
                                    return (
                                        <TableEntry
                                            entry={{
                                                ...subEntry,
                                                type: preset.type,
                                                props: preset.props,
                                            }}
                                            isPresetEntry
                                            isDescendantOfPresetEntry={
                                                isPresetEntry || isDescendantOfPresetEntry
                                            }
                                            key={subEntry.key}
                                        />
                                    );
                                }
                            }
                            if (subEntry.type === "item") {
                                return (
                                    <ItemEntry
                                        entry={{ ...subEntry, key: subEntryKey }}
                                        isDescendantOfPresetEntry={
                                            isPresetEntry || isDescendantOfPresetEntry
                                        }
                                        key={subEntry.key}
                                    />
                                );
                            }
                            if (subEntry.type === "table") {
                                return (
                                    <TableEntry
                                        entry={{ ...subEntry, key: subEntryKey }}
                                        isDescendantOfPresetEntry={
                                            isPresetEntry || isDescendantOfPresetEntry
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
