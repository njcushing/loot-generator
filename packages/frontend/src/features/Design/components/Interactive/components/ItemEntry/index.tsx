import { useContext } from "react";
import { LootItem } from "@/utils/types";
import { InteractiveContext } from "../..";
import { ToggleButton } from "../ToggleButton";
import { SaveAsPresetButton } from "../SaveAsPresetButton";
import { DeleteButton } from "../DeleteButton";
import { EntryFieldsToggleBar } from "../EntryFieldsToggleBar";
import { Inputs } from "../../inputs";
import styles from "./index.module.css";

export type TItemEntry = {
    entry: LootItem;
    isPreset?: boolean;
    isPresetEntry?: boolean;
    isDescendantOfPresetEntry?: boolean;
};

export function ItemEntry({
    entry,
    isPreset = false,
    isPresetEntry = false,
    isDescendantOfPresetEntry = false,
}: TItemEntry) {
    const { menuStates } = useContext(InteractiveContext);

    const { key, props, criteria } = entry;
    const { name, quantity } = props;
    const { min, max } = quantity;
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
                {!isPreset && !isPresetEntry && (
                    <div className={styles["save-as-preset-button-container"]}>
                        <SaveAsPresetButton entry={entry} />
                    </div>
                )}
                {!isDescendantOfPresetEntry && (
                    <div className={styles["delete-button-container"]}>
                        <DeleteButton entry={entry} isPreset={isPreset} />
                    </div>
                )}
            </div>
            {menuStates.get(key) === "expanded" && (
                <div className={styles["item-entry-fields"]}>
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
                        subCategories={
                            <EntryFieldsToggleBar
                                name="Quantity"
                                fields={
                                    <>
                                        <Inputs.Numeric
                                            entryKey={key}
                                            labelText="Min"
                                            value={min || 1}
                                            min={0}
                                            fieldPath={["props", "quantity", "min"]}
                                            disabled={disablePropsFields}
                                        />
                                        <Inputs.Numeric
                                            entryKey={key}
                                            labelText="Max"
                                            value={max || 1}
                                            min={0}
                                            fieldPath={["props", "quantity", "max"]}
                                            disabled={disablePropsFields}
                                        />
                                    </>
                                }
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
            )}
        </li>
    );
}
