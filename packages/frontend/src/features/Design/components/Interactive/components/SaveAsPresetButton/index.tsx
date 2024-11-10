import styles from "./index.module.css";

export function SaveAsPresetButton() {
    return (
        <button
            type="button"
            className={`${styles["save-as-preset-button"]} material-symbols-sharp`}
            onClick={(e) => {
                e.currentTarget.blur();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
        >
            Save
        </button>
    );
}
