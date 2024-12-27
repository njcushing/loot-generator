import { useContext, useState, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { Item as ItemTypes } from "@/utils/types";
import { TableContext } from "../Table";
import { Item } from "../Item";
import styles from "./index.module.css";

export type TSelectItem = {
    entryKey: string;
    id: string | null;
    disabled?: boolean;
};

export function SelectItem({ entryKey, id, disabled }: TSelectItem) {
    const { lootGeneratorState, setItemOnEntry } = useContext(LootGeneratorContext);
    const { pathToRoot } = useContext(TableContext);

    const [selectingItem, setSelectingItem] = useState<boolean>(false);

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (!disabled) {
            options.push({
                symbol: "Edit",
                onClick: () => setSelectingItem(!selectingItem),
            });
        }
        return options;
    }, [disabled, selectingItem]);

    const item: ItemTypes | null = useMemo(() => {
        if (!id) return null;
        return lootGeneratorState.items.get(id) || null;
    }, [id, lootGeneratorState.items]);

    return (
        <div className={styles["select-item"]}>
            {item && !selectingItem ? (
                <Item
                    id={id!}
                    displayMode={!disabled ? "entry" : "entryViewOnly"}
                    onClick={(optionClicked) => {
                        if (optionClicked === "edit") setSelectingItem(true);
                    }}
                />
            ) : (
                <ToggleBar
                    name={!disabled ? "Please select an item" : "Cannot select item"}
                    defaultState={false}
                    options={toggleBarOptions}
                    onClick={() => setSelectingItem(!selectingItem)}
                    disabled={disabled}
                    style={{
                        size: "s",
                        colours: {
                            normal: "rgb(181, 186, 255)",
                            hover: "rgb(164, 169, 252)",
                            focus: "rgb(155, 161, 252)",
                        },
                        indicator: "none",
                        nameFontStyle: "italic",
                    }}
                />
            )}
            {!disabled && selectingItem && (
                <ul className={styles["selection-list"]}>
                    {[...lootGeneratorState.items.keys()].map((itemId) => {
                        const selectionItem = lootGeneratorState.items.get(itemId);
                        return (
                            selectionItem && (
                                <Item
                                    id={itemId}
                                    displayMode="selection"
                                    onClick={() => {
                                        const success =
                                            pathToRoot[0].id &&
                                            setItemOnEntry(pathToRoot[0].id, entryKey, itemId);
                                        if (success) setSelectingItem(false);
                                    }}
                                    key={itemId}
                                />
                            )
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
