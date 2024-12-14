import { CSSProperties, useState, useCallback, useRef, useMemo } from "react";
import _ from "lodash";
import styles from "./index.module.css";

export type TToggleBarButton = {
    symbol?: string;
    onClick?: () => unknown;
    colours?: { hover?: CSSProperties["color"]; focus?: CSSProperties["color"] };
};

export type TToggleBar = {
    defaultState?: boolean;
    name: string;
    options?: TToggleBarButton[];
    onClick?: () => unknown;
    children?: JSX.Element | JSX.Element[];
    style?: {
        colours?: {
            normal?: CSSProperties["color"];
            hover?: CSSProperties["color"];
            focus?: CSSProperties["color"];
        };
        indicator?: "signs" | "arrows";
        nameFontStyle?: CSSProperties["fontStyle"];
    };
};

const defaultStyles: Required<TToggleBar["style"]> = {
    colours: {
        normal: "rgba(0, 0, 0, 0)",
        hover: "rgba(0, 0, 0, 0.1)",
        focus: "rgba(0, 0, 0, 0.2)",
    },
    indicator: "signs",
    nameFontStyle: "normal",
};

export function ToggleBar({
    name,
    defaultState = false,
    options,
    onClick,
    children,
    style,
}: TToggleBar) {
    const concatenatedStyles = useMemo(
        () => _.merge(structuredClone(defaultStyles), style || {}),
        [style],
    );

    const [isOpen, setIsOpen] = useState<boolean>(defaultState);

    const toggleBarRef = useRef<HTMLDivElement>(null);

    const switchBackgroundColor = useCallback(
        (color: CSSProperties["backgroundColor"]) => {
            if (!toggleBarRef.current) return;
            toggleBarRef.current.style.backgroundColor =
                color || concatenatedStyles.colours.normal!;
        },
        [concatenatedStyles],
    );

    let toggleBarSymbol = "";
    if (concatenatedStyles.indicator === "signs") toggleBarSymbol = isOpen ? "Remove" : "Add";
    if (concatenatedStyles.indicator === "arrows") {
        toggleBarSymbol = isOpen ? "Keyboard_Arrow_Down" : "Keyboard_Arrow_Right";
    }

    return (
        <div className={styles["toggle-bar-container"]}>
            <div
                className={styles["toggle-bar"]}
                style={{ backgroundColor: concatenatedStyles.colours.normal }}
                ref={toggleBarRef}
            >
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
                >
                    <p
                        className={`${styles["symbol"]} material-symbols-sharp`}
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",

                            fontSize: "1.5rem",
                            fontWeight: 100,
                        }}
                    >
                        {toggleBarSymbol}
                    </p>
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
                        const { symbol, colours } = option;
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
