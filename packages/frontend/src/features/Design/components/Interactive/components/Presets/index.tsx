import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { TableEntry } from "../TableEntry";
import { ItemEntry } from "../ItemEntry";
import styles from "./index.module.css";

export function Presets() {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    const sortedPresets = useMemo(() => {
        return lootGeneratorState.presets.sort((a, b) => b.type.localeCompare(a.type));
    }, [lootGeneratorState.presets]);

    return (
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
    );
}
