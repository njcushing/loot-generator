import styles from "./index.module.css";

export function CreateNewPresetButton() {
    return (
        <button
            type="button"
            className={`${styles["create-new-preset-button"]} material-symbols-sharp`}
            onClick={(e) => {
                e.currentTarget.blur();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
        >
            Add
        </button>
    );
}
