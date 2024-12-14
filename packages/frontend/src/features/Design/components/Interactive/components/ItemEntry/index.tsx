import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { LootItem } from "@/utils/types";
import { InteractiveContext } from "../..";
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
    const { deleteEntry, saveEntryAsPreset, deletePreset } = useContext(LootGeneratorContext);
    const { menuStates, setMenuStates, menuType } = useContext(InteractiveContext);

    const { key, props, criteria } = entry;
    const { name, quantity } = props;
    const { min, max } = quantity;
    const { weight } = criteria;

    const disablePropsFields = isPresetEntry || isDescendantOfPresetEntry;
    const disableOtherFields = isDescendantOfPresetEntry;

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (!isPreset && !isPresetEntry) {
            options.push({
                symbol: "Save",
                onClick: () => saveEntryAsPreset(key, menuType),
            });
        }
        if (!isDescendantOfPresetEntry) {
            options.push({
                symbol: "Delete",
                onClick: () => {
                    if (isPreset) {
                        deletePreset(key);
                    } else {
                        deleteEntry(key, menuType);
                    }
                },
                colours: { hover: "rgb(255, 120, 120)", focus: "rgb(255, 83, 83)" },
            });
        }
        return options;
    }, [
        key,
        isPreset,
        isPresetEntry,
        isDescendantOfPresetEntry,
        menuType,
        deleteEntry,
        saveEntryAsPreset,
        deletePreset,
    ]);

    return (
        <li className={styles["item-entry"]} key={key}>
            <ToggleBar
                name={name || "Unnamed Item"}
                defaultState={menuStates.get(key) === "expanded"}
                options={toggleBarOptions}
                onClick={() => {
                    setMenuStates((currentMenuStates) => {
                        const newMenuStates = new Map(currentMenuStates);
                        const currentState = newMenuStates.get(entry.key);
                        newMenuStates.set(
                            entry.key,
                            currentState === "expanded" ? "collapsed" : "expanded",
                        );
                        return newMenuStates;
                    });
                }}
                style={{
                    colours: {
                        normal: isPresetEntry ? "rgb(241, 197, 114)" : "rgb(170, 238, 149)",
                        hover: isPresetEntry ? "rgb(236, 185, 89)" : "rgb(151, 226, 128)",
                        focus: isPresetEntry ? "rgb(226, 170, 66)" : "rgb(132, 206, 110)",
                    },
                    nameFontStyle: name ? "normal" : "italic",
                }}
            >
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
            </ToggleBar>
        </li>
    );
}
