import styles from "./index.module.css";

export type TSearch = {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    onChange?: (value: string) => unknown;
};

export function Search({ value, placeholder, disabled, onChange }: TSearch) {
    return (
        <input
            type="search"
            className={styles["search-input"]}
            defaultValue={value}
            placeholder={placeholder}
            onChange={(e) => onChange && onChange(e.currentTarget.value)}
            disabled={disabled}
        />
    );
}
