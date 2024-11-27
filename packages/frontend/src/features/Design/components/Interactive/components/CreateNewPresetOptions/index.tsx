import styles from "./index.module.css";

export function CreateNewPresetOptions() {
    return (
        <div className={styles["create-new-preset-options"]}>
            <button
                type="button"
                className={styles["create-new-table-button"]}
                onClick={(e) => {
                    e.currentTarget.blur();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                }}
            >
                New Table
            </button>
            <button
                type="button"
                className={styles["create-new-item-button"]}
                onClick={(e) => {
                    e.currentTarget.blur();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                }}
            >
                New Item
            </button>
        </div>
    );
}
