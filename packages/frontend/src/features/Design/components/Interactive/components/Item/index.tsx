import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { EntryFieldsToggleBar } from "../EntryFieldsToggleBar";
import { Inputs } from "../../inputs";
import { InteractiveContext } from "../..";
import styles from "./index.module.css";

export type TItem = {
    id: string;
    displayingWithinEntry?: boolean;
};

export function Item({ id, displayingWithinEntry = false }: TItem) {
    const { lootGeneratorState, deleteItem } = useContext(LootGeneratorContext);
    const { menuStates, setMenuStates, menuType } = useContext(InteractiveContext);

    const item = useMemo(() => lootGeneratorState.items.get(id), [id, lootGeneratorState.items]);

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (!displayingWithinEntry) {
            options.push({
                symbol: "Delete",
                onClick: () => deleteItem(id),
                colours: { hover: "rgb(255, 120, 120)", focus: "rgb(255, 83, 83)" },
            });
        }
        return options;
    }, [id, displayingWithinEntry, deleteItem]);

    if (!item) return null;

    const { name } = item;
    let displayName;
    if (!displayingWithinEntry) displayName = name || "Unnamed Item";
    else displayName = "Item Properties";

    return (
        <ToggleBar
            name={displayName}
            defaultState={menuStates.get(id) === "expanded"}
            options={toggleBarOptions}
            onClick={() => {
                if (menuType === "items") {
                    setMenuStates((currentMenuStates) => {
                        const newMenuStates = new Map(currentMenuStates);
                        const currentState = newMenuStates.get(id);
                        newMenuStates.set(
                            id,
                            currentState === "expanded" ? "collapsed" : "expanded",
                        );
                        return newMenuStates;
                    });
                }
            }}
            style={{
                size: !displayingWithinEntry ? "m" : "s",
                colours: {
                    normal: !displayingWithinEntry ? "rgb(245, 158, 240)" : "rgb(181, 186, 255)",
                    hover: !displayingWithinEntry ? "rgb(235, 139, 230)" : "rgb(164, 169, 252)",
                    focus: !displayingWithinEntry ? "rgb(226, 125, 221)" : "rgb(155, 161, 252)",
                },
                nameFontStyle: name ? "normal" : "italic",
            }}
            key={`${id}-${menuStates.get(id)}`}
        >
            <div className={styles["item-fields"]}>
                <Inputs.Text
                    entryKey={id}
                    labelText="Name"
                    value={name || ""}
                    fieldPath={["name"]}
                    disabled={displayingWithinEntry}
                />
            </div>
        </ToggleBar>
    );
}
