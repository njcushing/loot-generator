import { ToggleBar } from "@/components/buttons/components/ToggleBar";
import styles from "./index.module.css";

export type TEntryFieldsToggleBar = {
    name: string;
    onClick?: () => unknown;
    fields?: JSX.Element | JSX.Element[] | null;
    subCategories?: JSX.Element | JSX.Element[] | null;
};

export function EntryFieldsToggleBar({
    name,
    onClick,
    fields,
    subCategories,
}: TEntryFieldsToggleBar) {
    return (
        <ToggleBar
            name={name}
            onClick={() => {
                if (onClick) onClick();
            }}
            style={{
                size: "s",
                colours: {
                    normal: "var(--background-primary, white)",
                    hover: "var(--background-secondary, rgb(226, 226, 226))",
                    focus: "var(--background-tertiary, rgb(216, 216, 216))",
                },
            }}
        >
            <div className={styles["entry-fields-container"]}>
                <div className={styles["entry-fields"]}>{fields}</div>
                <div className={styles["entry-fields-subcategories"]}>{subCategories}</div>
            </div>
        </ToggleBar>
    );
}
