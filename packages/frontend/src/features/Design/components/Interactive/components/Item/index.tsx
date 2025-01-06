import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { Inputs } from "../../inputs";
import styles from "./index.module.css";

export type TItem = {
    id: string;
    displayMode?: "normal" | "entry" | "entryViewOnly" | "selection";
    onClick?: (optionClicked: "toggle" | "delete" | "edit" | "remove_selection") => unknown;
};

export function Item({ id, displayMode = "normal", onClick }: TItem) {
    const { lootGeneratorState, deleteItem } = useContext(LootGeneratorContext);

    const item = useMemo(() => lootGeneratorState.items[id], [id, lootGeneratorState.items]);

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        if (displayMode === "normal") {
            options.push({
                symbol: "Delete",
                onClick: () => {
                    deleteItem(id);
                    if (onClick) onClick("delete");
                },
                colours: { hover: "rgb(255, 120, 120)", focus: "rgb(255, 83, 83)" },
            });
        }
        if (displayMode === "entry") {
            options.push({
                symbol: "Remove_Selection",
                onClick: () => onClick && onClick("remove_selection"),
            });
            options.push({
                symbol: "Edit",
                onClick: () => onClick && onClick("edit"),
            });
        }
        return options;
    }, [id, displayMode, onClick, deleteItem]);

    if (!item) return null;

    const { name, value } = item;
    let displayName = name || "Unnamed Item";
    let nameFontStyle = name ? "normal" : "italic";
    if (displayMode === "entry" || displayMode === "entryViewOnly") {
        displayName = "Item Properties";
        nameFontStyle = "normal";
    }

    let colours = {
        normal: "rgb(245, 158, 240)",
        hover: "rgb(235, 139, 230)",
        focus: "rgb(226, 125, 221)",
    };
    if (displayMode === "entry" || displayMode === "entryViewOnly") {
        colours = {
            normal: "rgb(181, 186, 255)",
            hover: "rgb(164, 169, 252)",
            focus: "rgb(155, 161, 252)",
        };
    }

    return (
        <ToggleBar
            name={displayName}
            options={toggleBarOptions}
            onClick={() => onClick && onClick("toggle")}
            style={{
                size: displayMode === "normal" ? "m" : "s",
                colours,
                indicator: displayMode !== "selection" ? "signs" : "none",
                nameFontStyle,
            }}
            key={id}
        >
            <div className={styles["item-fields"]}>
                <Inputs.Text
                    idOrKey={id}
                    type="item"
                    labelText="Name"
                    value={name || ""}
                    fieldPath={["name"]}
                    disabled={displayMode !== "normal"}
                />
                <Inputs.Numeric
                    idOrKey={id}
                    type="item"
                    labelText="Value"
                    value={typeof value === "number" ? value : 1}
                    min={0}
                    fieldPath={["value"]}
                    disabled={displayMode !== "normal"}
                />
            </div>
        </ToggleBar>
    );
}
