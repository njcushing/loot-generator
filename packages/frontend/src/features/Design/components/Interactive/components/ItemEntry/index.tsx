import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { LootItem } from "@/utils/types";
import { InteractiveContext } from "../..";
import { ToggleButton } from "../ToggleButton";
import { SaveAsPresetButton } from "../SaveAsPresetButton";
import { DeleteEntryButton } from "../DeleteEntryButton";
import { Inputs } from "../../inputs";
import styles from "./index.module.css";

export type TItemEntry = {
    entry: LootItem;
};

export function ItemEntry({ entry }: TItemEntry) {
    const { lootGeneratorState } = useContext(LootGeneratorContext);
    const { menuType, menuStates } = useContext(InteractiveContext);

    const { key, props, criteria } = entry;
    const { name } = props;
    const { weight } = criteria;

    const isPreset = useMemo(() => {
        return lootGeneratorState.presetsMap.has(entry.key);
    }, [entry.key, lootGeneratorState.presetsMap]);

    return (
        <li className={styles["item"]} key={key}>
            <div
                className={`${styles["item-entry-bar"]} ${styles[menuType === "active" && isPreset ? "is-preset" : ""]}`}
            >
                <div className={styles["toggle-button-container"]}>
                    <ToggleButton entry={entry} />
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
                <div className={styles["item-entry-properties"]}>
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
            )}
        </li>
    );
}
