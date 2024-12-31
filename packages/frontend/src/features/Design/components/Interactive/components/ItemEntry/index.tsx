import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { Item as ItemTypes, LootItem } from "@/utils/types";
import { TableContext } from "../Table";
import { InteractiveContext } from "../..";
import { SelectEntry } from "../SelectEntry";
import { EntryFieldsToggleBar } from "../EntryFieldsToggleBar";
import { Inputs } from "../../inputs";
import styles from "./index.module.css";

export type TItemEntry = {
    entry: LootItem;
};

export function ItemEntry({ entry }: TItemEntry) {
    const { lootGeneratorState, setTypeOnEntry, deleteEntry } = useContext(LootGeneratorContext);
    const { menuType } = useContext(InteractiveContext);
    const { pathToRoot } = useContext(TableContext);

    const isDescendantOfImportedTable =
        pathToRoot.findIndex((pathStep) => pathStep.type === "imported") !== -1;

    const { type, key, id, quantity, criteria } = entry;
    const { min, max } = quantity;
    const { weight } = criteria;

    const disableItemSelection = menuType === "active" || isDescendantOfImportedTable;
    const disablePropsFields = menuType === "active" || isDescendantOfImportedTable;

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (menuType !== "active" && !isDescendantOfImportedTable) {
            options.push({
                symbol: "Swap_Horiz",
                onClick: () => {
                    if (pathToRoot[0].id) setTypeOnEntry(pathToRoot[0].id, key, "table");
                },
            });
            options.push({
                symbol: "Delete",
                onClick: () => {
                    if (pathToRoot[0].id) deleteEntry(pathToRoot[0].id, key);
                },
                colours: { hover: "rgb(255, 120, 120)", focus: "rgb(255, 83, 83)" },
            });
        }
        return options;
    }, [setTypeOnEntry, deleteEntry, menuType, pathToRoot, isDescendantOfImportedTable, key]);

    const item: ItemTypes | null = useMemo(() => {
        if (!id) return null;
        return lootGeneratorState.items.get(id) || null;
    }, [id, lootGeneratorState.items]);

    const name = item && item.name ? item.name : "Unnamed Item";
    const nameFontStyle = item && item.name ? "normal" : "italic";

    return (
        <li className={styles["item-entry"]} key={key}>
            <ToggleBar
                name={name}
                options={toggleBarOptions}
                style={{
                    size: "s",
                    colours: {
                        normal: "rgb(170, 238, 149)",
                        hover: "rgb(151, 226, 128)",
                        focus: "rgb(132, 206, 110)",
                    },
                    nameFontStyle,
                }}
            >
                <SelectEntry entryKey={key} id={id || ""} disabled={disableItemSelection} />
                <div className={styles["item-entry-fields"]}>
                    {type === "item_noid" && (
                        <EntryFieldsToggleBar
                            name="Item Properties"
                            fields={
                                <>
                                    <Inputs.Text
                                        idOrKey={key}
                                        type="item"
                                        labelText="Name"
                                        value={entry.name || ""}
                                        fieldPath={["name"]}
                                        disabled={disablePropsFields}
                                    />
                                    <Inputs.Numeric
                                        idOrKey={key}
                                        type="item"
                                        labelText="Value"
                                        value={typeof entry.value === "number" ? entry.value : 1}
                                        min={0}
                                        fieldPath={["value"]}
                                        disabled={disablePropsFields}
                                    />
                                </>
                            }
                        />
                    )}
                    <EntryFieldsToggleBar
                        name="Quantity"
                        fields={
                            <>
                                <Inputs.Numeric
                                    idOrKey={key}
                                    type="entry"
                                    labelText="Min"
                                    value={typeof min === "number" ? min : 1}
                                    min={0}
                                    fieldPath={["quantity", "min"]}
                                    disabled={disablePropsFields}
                                />
                                <Inputs.Numeric
                                    idOrKey={key}
                                    type="entry"
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
                                idOrKey={key}
                                type="entry"
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
