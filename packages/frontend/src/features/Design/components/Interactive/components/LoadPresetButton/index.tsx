import { LootItem, LootTable } from "@/utils/types";
import styles from "./index.module.css";

export type TLoadPresetButton = {
    entry: LootItem | LootTable;
};

export function LoadPresetButton({ entry }: TLoadPresetButton) {
    return (
        <button
            type="button"
            className={`${styles["load-preset-button"]} material-symbols-sharp`}
            onClick={(e) => {
                e.currentTarget.blur();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
        >
            Upload
        </button>
    );
}
