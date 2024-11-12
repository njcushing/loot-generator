import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { TableEntry } from "../TableEntry";
import { ItemEntry } from "../ItemEntry";
import styles from "./index.module.css";

export function Presets() {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    return (
        <ul className={styles["presets"]}>
            {lootGeneratorState.presets.map((preset) => {
                if (preset.type === "table") return <TableEntry entry={preset} key={preset.key} />;
                if (preset.type === "item") return <ItemEntry entry={preset} key={preset.key} />;
                return null;
            })}
        </ul>
    );
}
