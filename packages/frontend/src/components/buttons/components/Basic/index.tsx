import { forwardRef } from "react";
import styles from "./index.module.css";

export type TBasic = {
    type?: HTMLButtonElement["type"];
    text?: string;
    symbol?: string;
    label?: string;
    onClickHandler?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | null;
    onMouseEnterHandler?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | null;
    onMouseLeaveHandler?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | null;
    disabled?: boolean;
    allowDefaultEventHandling?: boolean;
    palette?:
        | "primary"
        | "secondary"
        | "bare"
        | "red"
        | "orange"
        | "gold"
        | "green"
        | "lightblue"
        | "blue"
        | "black";
    animation?: "rigid" | "squishy";
    style?: {
        shape?: "sharp" | "rounded";
        symbol?: "sharp" | "rounded";
    };
    otherStyles?: React.CSSProperties;
    children?: React.ReactElement | null;
};

const defaultStyles: TBasic["style"] = {
    shape: "rounded",
    symbol: "rounded",
};

export const Basic = forwardRef<HTMLButtonElement, TBasic>(
    (
        {
            type = "button",
            text = "",
            symbol = "",
            label = "",
            onClickHandler = null,
            onMouseEnterHandler = null,
            onMouseLeaveHandler = null,
            disabled = false,
            allowDefaultEventHandling = false,
            palette = "primary",
            animation = "rigid",
            style = defaultStyles,
            otherStyles = {},
            children = null,
        }: TBasic,
        ref,
    ) => {
        const concatenatedStyles = { ...defaultStyles, ...style };

        return (
            <button
                // eslint-disable-next-line react/button-has-type
                type={type}
                className={styles["button"]}
                aria-label={label}
                onClick={(e) => {
                    if (onClickHandler) onClickHandler(e);
                    e.currentTarget.blur();
                    if (!allowDefaultEventHandling) e.preventDefault();
                }}
                onMouseEnter={(e) => {
                    if (onMouseEnterHandler) onMouseEnterHandler(e);
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                    if (!allowDefaultEventHandling) e.preventDefault();
                    if (onMouseLeaveHandler) onMouseLeaveHandler(e);
                }}
                style={{ ...otherStyles }}
                data-shape={concatenatedStyles.shape}
                disabled={disabled}
                data-palette={palette}
                data-animation={animation}
                ref={ref}
            >
                {symbol && symbol.length > 0 && (
                    <p
                        className={`material-symbols-${concatenatedStyles.symbol} ${styles["symbol"]}`}
                    >
                        {symbol}
                    </p>
                )}
                {text}
                {children}
            </button>
        );
    },
);

Basic.displayName = "ButtonBasic";
