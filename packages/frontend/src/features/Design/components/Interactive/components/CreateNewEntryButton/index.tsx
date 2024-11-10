import styles from "./index.module.css";

export function CreateNewEntryButton() {
    return (
        <button
            type="button"
            className={`${styles["create-new-entry-button"]} material-symbols-sharp`}
            onClick={(e) => {
                e.currentTarget.blur();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
        >
            Add_Circle
        </button>
    );
}
