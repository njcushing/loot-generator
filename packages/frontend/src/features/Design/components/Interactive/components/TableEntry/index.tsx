import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootTable } from "@/utils/types";
import { v4 as uuid } from "uuid";
import { InteractiveContext } from "../..";
import { EntryToggleBar } from "../EntryToggleBar";
import { CreateNewEntryButton } from "../CreateNewEntryButton";
import { LoadPresetButton } from "../LoadPresetButton";
import { SaveAsPresetButton } from "../SaveAsPresetButton";
import { DeleteButton } from "../DeleteButton";
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
    const { lootGeneratorState } = useContext(LootGeneratorContext);
    const { menuStates } = useContext(InteractiveContext);

    const { key, props, criteria } = entry;
    const { name } = props;
    const { weight } = criteria;

    const disablePropsFields = isPresetEntry || isDescendantOfPresetEntry;
    const disableOtherFields = isDescendantOfPresetEntry;

    return (
        <li className={styles["table"]} key={key}>
            <div
                className={`${styles["table-entry-bar"]} ${styles[isPresetEntry ? "is-preset" : ""]}`}
            >
                <div className={styles["toggle-button-container"]}>
                    <EntryToggleBar entry={entry} />
                </div>
                {!isPresetEntry && !isDescendantOfPresetEntry && (
                    <div className={styles["create-new-entry-button-container"]}>
                        <CreateNewEntryButton entry={entry} />
                    </div>
                )}
                {isPreset && (
                    <div className={styles["load-preset-button-container"]}>
                        <LoadPresetButton entry={entry} />
                    </div>
                )}
                {!isPreset && !isPresetEntry && (
                    <div className={styles["save-as-preset-button-container"]}>
                        <SaveAsPresetButton entry={entry} />
                    </div>
                )}
                {!isActiveBase && !isDescendantOfPresetEntry && (
                    <div className={styles["delete-button-container"]}>
                        <DeleteButton entry={entry} isPreset={isPreset} />
                    </div>
                )}
            </div>
            {menuStates.get(key) === "expanded" && (
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
                                    value={weight || 1}
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
                                if (preset.type === "item") {
                                    return (
                                        <ItemEntry
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
            )}
        </li>
    );
}
