import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { Option } from "@/features/Design/components/Option";
import { TableEntry } from "../TableEntry";
import { ItemEntry } from "../ItemEntry";
import styles from "./index.module.css";

export function Presets() {
    const { lootGeneratorState, createPreset } = useContext(LootGeneratorContext);

    const sortedPresets = useMemo(() => {
        return lootGeneratorState.presets.sort((a, b) => b.type.localeCompare(a.type));
    }, [lootGeneratorState.presets]);

    return (
        <div className={styles["presets-tab"]}>
            <ul className={styles["presets"]}>
                {sortedPresets.map((preset, i) => {
                    const elements: JSX.Element[] = [];
                    if (i > 0 && sortedPresets[i - 1].type !== sortedPresets[i].type) {
                        elements.push(
                            <div
                                className={styles["separator"]}
                                key={`${sortedPresets[i - 1].type}-${sortedPresets[i].type}-presets-separator`}
                            ></div>,
                        );
                    }
                    if (preset.type === "table") {
                        elements.push(<TableEntry entry={preset} isPreset key={preset.key} />);
                    }
                    if (preset.type === "item") {
                        elements.push(<ItemEntry entry={preset} isPreset key={preset.key} />);
                    }
                    return elements;
                })}
            </ul>
            <div className={styles["create-new-preset-options"]}>
                <Option symbol="Table" text="New Table" onClick={() => createPreset("table")} />
                <Option symbol="Nutrition" text="New Item" onClick={() => createPreset("item")} />
            </div>
        </div>
    );
}
