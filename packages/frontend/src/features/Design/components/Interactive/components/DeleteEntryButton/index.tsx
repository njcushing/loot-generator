import styles from "./index.module.css";

export function DeleteEntryButton() {
    return (
        <button
            type="button"
            className={`${styles["delete-entry-button"]} material-symbols-sharp`}
            onClick={(e) => {
                e.currentTarget.blur();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
        >
            Delete
        </button>
    );
}
