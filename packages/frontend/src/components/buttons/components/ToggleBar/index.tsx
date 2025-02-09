import { CSSProperties, useState, useCallback, useMemo } from "react";
import _ from "lodash";
import styles from "./index.module.css";

export type TToggleBarButton = {
    symbol?: string;
    onClick?: () => unknown;
    colours?: { hover?: CSSProperties["color"]; focus?: CSSProperties["color"] };
    disabled?: boolean;
};

export type TToggleBar = {
    defaultState?: boolean;
    name: string;
    options?: TToggleBarButton[];
    onClick?: () => unknown;
    disabled?: boolean;
    children?: JSX.Element | null | (JSX.Element | null)[];
    style?: {
        size?: "m" | "s";
        colours?: {
            normal?: CSSProperties["color"];
            hover?: CSSProperties["color"];
            focus?: CSSProperties["color"];
        };
        indicator?: "signs" | "arrows" | "none";
        nameFontStyle?: CSSProperties["fontStyle"];
    };
};

const defaultStyles: Required<TToggleBar["style"]> = {
    size: "m",
    colours: {
        normal: "rgba(var(--text-primary-dec, 0, 0, 0), 0)",
        hover: "rgba(var(--text-primary-dec, 0, 0, 0), 0.1)",
        focus: "rgba(var(--text-primary-dec, 0, 0, 0), 0.2)",
    },
    indicator: "signs",
    nameFontStyle: "normal",
};

export function ToggleBar({
    name,
    defaultState = false,
    options,
    onClick,
    disabled = false,
    children,
    style = {},
}: TToggleBar) {
    const concatenatedStyles = useMemo(
        () => _.merge(structuredClone(defaultStyles), style),
        [style],
    );

    const [isOpen, setIsOpen] = useState<boolean>(defaultState);

    const [backgroundColor, setBackgroundColor] = useState<CSSProperties["backgroundColor"]>(
        concatenatedStyles.colours.normal,
    );

    const switchBackgroundColor = useCallback((color: CSSProperties["backgroundColor"]) => {
        setBackgroundColor(color);
    }, []);

    let toggleBarSymbol = "";
    if (concatenatedStyles.indicator === "signs") toggleBarSymbol = isOpen ? "Remove" : "Add";
    if (concatenatedStyles.indicator === "arrows") {
        toggleBarSymbol = isOpen ? "Keyboard_Arrow_Down" : "Keyboard_Arrow_Right";
    }

    const fontSize = concatenatedStyles.size === "m" ? "1.5rem" : "1.2rem";

    return (
        <div className={`${styles["toggle-bar-container"]} ${styles[concatenatedStyles.size]}`}>
            <div className={styles["toggle-bar"]} style={{ backgroundColor }}>
                <button
                    type="button"
                    className={styles["toggle-bar-button"]}
                    onClick={() => {
                        if (onClick) onClick();
                        setIsOpen(!isOpen);
                    }}
                    onFocus={() => switchBackgroundColor(concatenatedStyles.colours.focus)}
                    onBlur={() => switchBackgroundColor(concatenatedStyles.colours.normal)}
                    onMouseDown={() => switchBackgroundColor(concatenatedStyles.colours.focus)}
                    onMouseUp={() => switchBackgroundColor(concatenatedStyles.colours.hover)}
                    onMouseEnter={() => switchBackgroundColor(concatenatedStyles.colours.hover)}
                    onMouseLeave={(e) => {
                        switchBackgroundColor(concatenatedStyles.colours.normal);
                        e.currentTarget.blur();
                    }}
                    disabled={disabled}
                >
                    {concatenatedStyles.indicator !== "none" && (
                        <p
                            className={`${styles["symbol"]} material-symbols-sharp`}
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",

                                fontSize,
                                fontWeight: 100,
                            }}
                        >
                            {toggleBarSymbol}
                        </p>
                    )}
                    <p
                        className={`${styles["name"]} truncate-ellipsis`}
                        style={{
                            fontStyle: concatenatedStyles.nameFontStyle,
                        }}
                    >
                        {name}
                    </p>
                </button>
                <ul className={styles["options"]}>
                    {options?.map((option) => {
                        const { symbol, colours, disabled: optionDisabled } = option;
                        const { normal } = concatenatedStyles.colours;
                        const hover = colours?.hover || concatenatedStyles.colours.hover;
                        const focus = colours?.focus || concatenatedStyles.colours.focus;
                        return (
                            <button
                                type="button"
                                className="material-symbols-sharp"
                                onClick={() => {
                                    if (option.onClick) option.onClick();
                                }}
                                onFocus={() => switchBackgroundColor(focus)}
                                onBlur={() => switchBackgroundColor(normal)}
                                onMouseDown={() => switchBackgroundColor(focus)}
                                onMouseUp={() => switchBackgroundColor(hover)}
                                onMouseEnter={() => switchBackgroundColor(hover)}
                                onMouseLeave={(e) => {
                                    switchBackgroundColor(normal);
                                    e.currentTarget.blur();
                                }}
                                disabled={optionDisabled}
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",

                                    fontSize,
                                    fontWeight: 100,
                                }}
                                key={symbol}
                            >
                                {symbol}
                            </button>
                        );
                    })}
                </ul>
            </div>
            {isOpen && children}
        </div>
    );
}
