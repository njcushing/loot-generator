import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { Item as ItemTypes, LootItem } from "@/utils/types";
import { InteractiveContext } from "../..";
import { SelectItem } from "../SelectItem";
import { EntryFieldsToggleBar } from "../EntryFieldsToggleBar";
import { Inputs } from "../../inputs";
import styles from "./index.module.css";

export type TItemEntry = {
    entry: LootItem;
    isActive?: boolean;
    isDescendantOfPresetEntry?: boolean;
};

export function ItemEntry({
    entry,
    isActive = false,
    isDescendantOfPresetEntry = false,
}: TItemEntry) {
    const { lootGeneratorState, deleteEntry } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);

    const { key, id, quantity, criteria } = entry;
    const { min, max } = quantity;
    const { weight } = criteria;

    const disableItemSelection = isActive || isDescendantOfPresetEntry;
    const disablePropsFields = isActive || isDescendantOfPresetEntry;

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (!isActive) {
            if (!isDescendantOfPresetEntry) {
                options.push({
                    symbol: "Delete",
                    onClick: () => {
                        if (menuType !== "active" && menuType !== "presets") return;
                        deleteEntry(key, menuType);
                    },
                    colours: { hover: "rgb(255, 120, 120)", focus: "rgb(255, 83, 83)" },
                });
            }
        }
        return options;
    }, [isActive, isDescendantOfPresetEntry, deleteEntry, menuType, key]);

    const item: ItemTypes | null = useMemo(() => {
        if (!entry.id) return null;
        return lootGeneratorState.items.get(entry.id) || null;
    }, [entry.id, lootGeneratorState.items]);

    const name = item && item.name ? item.name : "Unnamed Item";
    const nameFontStyle = item && item.name ? "normal" : "italic";

    return (
        <li className={styles["item-entry"]} key={key}>
            <ToggleBar
                name={name}
                options={toggleBarOptions}
                style={{
                    colours: {
                        normal: "rgb(170, 238, 149)",
                        hover: "rgb(151, 226, 128)",
                        focus: "rgb(132, 206, 110)",
                    },
                    nameFontStyle,
                }}
            >
                <SelectItem entryKey={key} id={id} disabled={disableItemSelection} />
                <div className={styles["item-entry-fields"]}>
                    <EntryFieldsToggleBar
                        name="Quantity"
                        fields={
                            <>
                                <Inputs.Numeric
                                    entryKey={key}
                                    labelText="Min"
                                    value={typeof min === "number" ? min : 1}
                                    min={0}
                                    fieldPath={["quantity", "min"]}
                                    disabled={disablePropsFields}
                                />
                                <Inputs.Numeric
                                    entryKey={key}
                                    labelText="Max"
                                    value={typeof max === "number" ? max : 1}
                                    min={0}
                                    fieldPath={["quantity", "max"]}
                                    disabled={disablePropsFields}
                                />
                            </>
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
                                disabled={disablePropsFields}
                            />
                        }
                    />
                </div>
            </ToggleBar>
        </li>
    );
}
