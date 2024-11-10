import { useState } from "react";
import styles from "./index.module.css";

export function CreateNewEntryButton() {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    return (
        <div className={`${styles["create-new-entry-button-wrapper"]} material-symbols-sharp`}>
            <button
                type="button"
                className={`${styles["create-new-entry-button"]} material-symbols-sharp`}
                onClick={(e) => {
                    setMenuOpen(!menuOpen);
                    e.currentTarget.blur();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                }}
            >
                Add_Circle
            </button>
            {menuOpen && (
                <div className={styles["creation-menu"]}>
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
                        Create New Table
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
                        Create New Item
                    </button>
                </div>
            )}
        </div>
    );
}
