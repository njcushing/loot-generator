import styles from "./index.module.css";

export type TSearch = {
    value?: string;
    disabled?: boolean;
    onChange?: (value: string) => unknown;
};

export function Search({ value, disabled, onChange }: TSearch) {
    return (
        <input
            type="search"
            className={styles["search-input"]}
            defaultValue={value}
            onChange={(e) => onChange && onChange(e.currentTarget.value)}
            disabled={disabled}
        />
    );
}
