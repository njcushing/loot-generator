import { useContext, useState, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { Item as ItemTypes, LootItem } from "@/utils/types";
import { InteractiveContext } from "../..";
import { Item } from "../Item";
import { SelectItem } from "../SelectItem";
import { EntryFieldsToggleBar } from "../EntryFieldsToggleBar";
import { Inputs } from "../../inputs";
import styles from "./index.module.css";

export type TItemEntry = {
    entry: LootItem;
    isDescendantOfPresetEntry?: boolean;
};

export function ItemEntry({ entry, isDescendantOfPresetEntry = false }: TItemEntry) {
    const { lootGeneratorState, setItemOnEntry, deleteEntry } = useContext(LootGeneratorContext);
    const { menuStates, setMenuStates, menuType } = useContext(InteractiveContext);

    const [selectingItem, setSelectingItem] = useState<boolean>(false);

    const { key, id, quantity, criteria } = entry;
    const { min, max } = quantity;
    const { weight } = criteria;

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
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
        return options;
    }, [key, isDescendantOfPresetEntry, menuType, deleteEntry]);

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
                        normal: "rgb(170, 238, 149)",
                        hover: "rgb(151, 226, 128)",
                        focus: "rgb(132, 206, 110)",
                    },
                    nameFontStyle,
                }}
            >
                <div className={styles["item-container"]}>
                    {item ? (
                        <Item id={id!} displayingWithinEntry />
                    ) : (
                        <SelectItem onClick={() => setSelectingItem(!selectingItem)} />
                    )}
                    {selectingItem && (
                        <ul className={styles["selection-items"]}>
                            {[...lootGeneratorState.items.keys()].map((itemId) => {
                                const selectionItem = lootGeneratorState.items.get(itemId);
                                return (
                                    selectionItem && (
                                        <Item
                                            id={itemId}
                                            displayingWithinSelection
                                            onClick={() => {
                                                if (
                                                    menuType === "active" ||
                                                    menuType === "presets"
                                                ) {
                                                    setItemOnEntry(key, itemId, menuType);
                                                }
                                            }}
                                            key={itemId}
                                        />
                                    )
                                );
                            })}
                        </ul>
                    )}
                </div>
                <div className={styles["item-entry-fields"]}>
                    <EntryFieldsToggleBar
                        name="Quantity"
                        fields={
                            <>
                                <Inputs.Numeric
                                    entryKey={key}
                                    labelText="Min"
                                    value={min || 1}
                                    min={0}
                                    fieldPath={["quantity", "min"]}
                                    disabled={isDescendantOfPresetEntry}
                                />
                                <Inputs.Numeric
                                    entryKey={key}
                                    labelText="Max"
                                    value={max || 1}
                                    min={0}
                                    fieldPath={["quantity", "max"]}
                                    disabled={isDescendantOfPresetEntry}
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
                                value={weight || 1}
                                fieldPath={["criteria", "weight"]}
                                disabled={isDescendantOfPresetEntry}
                            />
                        }
                    />
                </div>
            </ToggleBar>
        </li>
    );
}
