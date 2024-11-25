import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { TableEntry } from "../TableEntry";
import { ItemEntry } from "../ItemEntry";
import styles from "./index.module.css";

export function Presets() {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    return (
        <ul className={styles["presets"]}>
            {lootGeneratorState.presets
                .sort((a, b) => b.type.localeCompare(a.type))
                .map((preset) => {
                    if (preset.type === "table")
                        return <TableEntry entry={preset} isPreset key={preset.key} />;
                    if (preset.type === "item")
                        return <ItemEntry entry={preset} isPreset key={preset.key} />;
                    return null;
                })}
        </ul>
    );
}
