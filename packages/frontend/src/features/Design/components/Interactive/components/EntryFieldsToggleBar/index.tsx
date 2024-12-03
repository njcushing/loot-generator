import { useState } from "react";
import styles from "./index.module.css";

export type TEntryFieldsToggleBar = {
    name: string;
    isOpen?: boolean;
    onClick?: () => unknown;
    children?: JSX.Element | JSX.Element[] | null;
};

export function EntryFieldsToggleBar({
    name,
    isOpen = false,
    onClick,
    children,
}: TEntryFieldsToggleBar) {
    const [isOpenState, setIsOpenState] = useState<boolean>(isOpen);

    return (
        <>
            <button
                type="button"
                className={styles["entry-fields-toggle-bar"]}
                onClick={(e) => {
                    setIsOpenState(!isOpenState);
                    if (onClick) onClick();
                    e.currentTarget.blur();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                }}
            >
                <p
                    className={`${styles["symbol"]} material-symbols-sharp`}
                    style={{ fontSize: "1.2rem" }}
                >
                    {isOpenState ? "Keyboard_Arrow_Down" : "Keyboard_Arrow_Right"}
                </p>
                <p className={`${styles["name"]} truncate-ellipsis`}>{name}</p>
            </button>
            {isOpenState && <div className={styles["entry-fields-container"]}>{children}</div>}
        </>
    );
}
