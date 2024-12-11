import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { Option } from "@/features/Design/components/Option";
import styles from "./index.module.css";

export function CreateNewPresetOptions() {
    const { createPreset } = useContext(LootGeneratorContext);

    return (
        <div className={styles["create-new-preset-options"]}>
            <Option symbol="Table" text="New Table" onClick={() => createPreset("table")} />
            <Option symbol="Nutrition" text="New Item" onClick={() => createPreset("item")} />
        </div>
    );
}
