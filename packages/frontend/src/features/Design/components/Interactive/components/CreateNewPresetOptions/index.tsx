import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import styles from "./index.module.css";

export function CreateNewPresetOptions() {
    const { createPreset } = useContext(LootGeneratorContext);

    return (
        <div className={styles["create-new-preset-options"]}>
            <button
                type="button"
                className={styles["create-new-table-button"]}
                onClick={(e) => {
                    createPreset("table");
                    e.currentTarget.blur();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                }}
            >
                <p className={`${styles["symbol"]} material-symbols-sharp`}>Table</p>
                <p className="truncate-ellipsis">New Table</p>
            </button>
            <button
                type="button"
                className={styles["create-new-item-button"]}
                onClick={(e) => {
                    createPreset("item");
                    e.currentTarget.blur();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                }}
            >
                <p className={`${styles["symbol"]} material-symbols-sharp`}>Nutrition</p>
                <p className="truncate-ellipsis">New Item</p>
            </button>
        </div>
    );
}
