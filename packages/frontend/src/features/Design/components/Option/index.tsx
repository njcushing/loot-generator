import styles from "./index.module.css";

export type TOption = {
    symbol: string;
    onClick?: () => unknown;
    disabled?: boolean;
};

export function Option({ symbol, onClick, disabled = false }: TOption) {
    return (
        <button
            type="button"
            className={styles["option"]}
            onClick={(e) => {
                if (onClick) onClick();
                e.currentTarget.blur();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
            disabled={disabled}
        >
            <p className={`${styles["symbol"]} material-symbols-sharp`}>{symbol}</p>
        </button>
    );
}
