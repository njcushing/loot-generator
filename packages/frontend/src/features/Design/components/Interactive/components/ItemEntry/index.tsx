import { useContext } from "react";
import { LootItem } from "@/utils/types";
import { InteractiveContext } from "../..";
import { ToggleButton } from "../ToggleButton";
import { SaveAsPresetButton } from "../SaveAsPresetButton";
import { DeleteEntryButton } from "../DeleteEntryButton";
import { Inputs } from "../../inputs";
import styles from "./index.module.css";

export type TItemEntry = {
    entry: LootItem;
    isPresetEntry?: boolean;
    isDescendantOfPresetEntry?: boolean;
};

export function ItemEntry({
    entry,
    isPresetEntry = false,
    isDescendantOfPresetEntry = false,
}: TItemEntry) {
    const { menuStates } = useContext(InteractiveContext);

    const { key, props, criteria } = entry;
    const { name } = props;
    const { weight } = criteria;

    const disablePropsFields = isPresetEntry || isDescendantOfPresetEntry;
    const disableOtherFields = isDescendantOfPresetEntry;

    return (
        <li className={styles["item"]} key={key}>
            <div
                className={`${styles["item-entry-bar"]} ${styles[isPresetEntry ? "is-preset" : ""]}`}
            >
                <div className={styles["toggle-button-container"]}>
                    <ToggleButton entry={entry} />
                </div>
                {!isPresetEntry && (
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
                        disabled={disablePropsFields}
                    />
                    <Inputs.Numeric
                        entryKey={key}
                        labelText="Weight"
                        defaultValue={weight || 1}
                        fieldPath={["criteria", "weight"]}
                        disabled={disableOtherFields}
                    />
                </div>
            )}
        </li>
    );
}
