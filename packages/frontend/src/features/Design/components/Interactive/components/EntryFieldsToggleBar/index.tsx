import { useState } from "react";
import { ToggleBar } from "@/components/buttons/components/ToggleBar";
import styles from "./index.module.css";

export type TEntryFieldsToggleBar = {
    name: string;
    isOpen?: boolean;
    onClick?: () => unknown;
    fields?: JSX.Element | JSX.Element[] | null;
    subCategories?: JSX.Element | JSX.Element[] | null;
};

export function EntryFieldsToggleBar({
    name,
    isOpen = false,
    onClick,
    fields,
    subCategories,
}: TEntryFieldsToggleBar) {
    const [isOpenState, setIsOpenState] = useState<boolean>(isOpen);

    return (
        <ToggleBar
            name={name || "Unnamed Item"}
            onClick={() => {
                if (onClick) onClick();
                setIsOpenState(!isOpenState);
            }}
            style={{
                size: "s",
                colours: {
                    normal: "rgb(255, 255, 255)",
                    hover: "rgb(242, 242, 242)",
                    focus: "rgb(228, 228, 228)",
                },
                nameFontStyle: name ? "normal" : "italic",
            }}
        >
            <div className={styles["entry-fields-container"]}>
                <div className={styles["entry-fields"]}>{fields}</div>
                <div className={styles["entry-fields-subcategories"]}>{subCategories}</div>
            </div>
        </ToggleBar>
    );
}
