import { CSSProperties, useMemo } from "react";
import _ from "lodash";
import styles from "./index.module.css";

export type TOption = {
    symbol: string;
    text?: string;
    onClick?: () => unknown;
    disabled?: boolean;
    style?: {
        width?: CSSProperties["width"];
    };
};

const defaultStyle: Required<TOption["style"]> = {
    width: "auto",
};

export function Option({ symbol, text, onClick, disabled = false, style }: TOption) {
    const concatenatedStyle = useMemo(
        () => _.merge(structuredClone(defaultStyle), style || {}),
        [style],
    );

    const gridTemplateColumns: CSSProperties["gridTemplateColumns"] = useMemo(() => {
        return text ? "auto minmax(0, 1fr)" : "auto";
    }, [text]);

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
            style={{
                gridTemplateColumns,

                width: concatenatedStyle.width,
            }}
        >
            <p className={`${styles["symbol"]} material-symbols-sharp`}>{symbol}</p>
            {text && <p className="truncate-ellipsis">New Table</p>}
        </button>
    );
}
