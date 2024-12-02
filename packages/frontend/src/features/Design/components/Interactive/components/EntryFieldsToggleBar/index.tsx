import styles from "./index.module.css";

export function EntryFieldsToggleBar() {
    return (
        <button
            type="button"
            className={styles["entry-fields-toggle-bar"]}
            onClick={(e) => {
                e.currentTarget.blur();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
        ></button>
    );
}
