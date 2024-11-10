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
};

export function ItemEntry({ entry }: TItemEntry) {
    const { menuStates } = useContext(InteractiveContext);

    const { key, information, weight } = entry;
    const { name } = information;

    return (
        <li className={styles["item"]} key={key}>
            <div className={styles["item-entry-bar"]}>
                <div className={styles["toggle-button-container"]}>
                    <ToggleButton entry={entry} />
                </div>
                <div className={styles["save-as-preset-button-container"]}>
                    <SaveAsPresetButton />
                </div>
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
                        fieldPath={["information", "name"]}
                    />
                    <Inputs.Numeric
                        entryKey={key}
                        labelText="Weight"
                        defaultValue={weight || 1}
                        fieldPath={["weight"]}
                    />
                </div>
            )}
        </li>
    );
}
