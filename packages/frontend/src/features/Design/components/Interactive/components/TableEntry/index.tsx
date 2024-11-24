import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootTable } from "@/utils/types";
import { InteractiveContext } from "../..";
import { ToggleButton } from "../ToggleButton";
import { CreateNewEntryButton } from "../CreateNewEntryButton";
import { SaveAsPresetButton } from "../SaveAsPresetButton";
import { DeleteEntryButton } from "../DeleteEntryButton";
import { ItemEntry } from "../ItemEntry";
import { Inputs } from "../../inputs";
import styles from "./index.module.css";

export type TTableEntry = {
    entry: LootTable;
};

export function TableEntry({ entry }: TTableEntry) {
    const { lootGeneratorState } = useContext(LootGeneratorContext);
    const { menuType, menuStates } = useContext(InteractiveContext);

    const { key, props, criteria } = entry;
    const { name } = props;
    const { weight } = criteria;

    const isPreset = useMemo(() => {
        return lootGeneratorState.presetsMap.has(entry.key);
    }, [entry.key, lootGeneratorState.presetsMap]);

    return (
        <li className={styles["table"]} key={key}>
            <div
                className={`${styles["table-entry-bar"]} ${styles[menuType === "active" && isPreset ? "is-preset" : ""]}`}
            >
                <div className={styles["toggle-button-container"]}>
                    <ToggleButton entry={entry} />
                </div>
                <div className={styles["create-new-entry-button-container"]}>
                    <CreateNewEntryButton entry={entry} />
                </div>
                {!isPreset && (
                    <div className={styles["save-as-preset-button-container"]}>
                        <SaveAsPresetButton entry={entry} />
                    </div>
                )}
                <div className={styles["delete-entry-button-container"]}>
                    <DeleteEntryButton entry={entry} />
                </div>
            </div>
            {menuStates.get(key) === "expanded" && (
                <>
                    <div className={styles["table-entry-properties"]}>
                        <Inputs.Text
                            entryKey={key}
                            labelText="Name"
                            defaultValue={name || ""}
                            fieldPath={["props", "name"]}
                        />
                        <Inputs.Numeric
                            entryKey={key}
                            labelText="Weight"
                            defaultValue={weight || 1}
                            fieldPath={["criteria", "weight"]}
                        />
                    </div>
                    <ul className={styles["table-entries"]}>
                        {entry.props.loot.map((subEntry) => {
                            if (subEntry.type === "preset") {
                                const preset = lootGeneratorState.presetsMap.get(subEntry.id);
                                if (!preset) return null;
                                if (preset.type === "item") {
                                    return <ItemEntry entry={preset} key={subEntry.key} />;
                                }
                                if (preset.type === "table") {
                                    return <TableEntry entry={preset} key={subEntry.key} />;
                                }
                            }
                            if (subEntry.type === "item") {
                                return <ItemEntry entry={subEntry} key={subEntry.key} />;
                            }
                            if (subEntry.type === "table") {
                                return <TableEntry entry={subEntry} key={subEntry.key} />;
                            }
                            return null;
                        })}
                    </ul>
                </>
            )}
        </li>
    );
}
