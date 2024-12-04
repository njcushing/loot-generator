import styles from "./index.module.css";

export function Items() {
    return (
        <div className={styles["items-tab"]}>
            <ul className={styles["items"]}></ul>
            <div className={styles["create-new-item-options"]}>
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
                    <p className="truncate-ellipsis">+</p>
                </button>
            </div>
        </div>
    );
}
