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
                <p className={`${styles["symbol"]} material-symbols-sharp`}>Table</p>
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
                <p className={`${styles["symbol"]} material-symbols-sharp`}>Nutrition</p>
                New Item
            </button>
        </div>
    );
}
