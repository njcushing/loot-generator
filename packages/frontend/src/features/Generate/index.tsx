import { useState, useCallback } from "react";
import styles from "./index.module.css";

type QuantityOption = { text: string; value: number };

export function Generate() {
    const [quantitySelected, setQuantitySelected] = useState<number>(0);
    const [quantityOptions, setQuantityOptions] = useState<QuantityOption[]>([
        { text: "1", value: 1 },
        { text: "10", value: 10 },
        { text: "100", value: 100 },
        { text: "1000", value: 1000 },
        { text: "Custom", value: 50 },
    ]);

    const createButton = useCallback(
        (text: string, onClickHandler: () => void, className: string) => {
            return (
                <button
                    type="button"
                    className={styles[className]}
                    onClick={(e) => {
                        onClickHandler();
                        e.currentTarget.blur();
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.blur();
                    }}
                >
                    {text}
                </button>
            );
        },
        [],
    );

    return (
        <div className={styles["generate"]}>
            <div></div>
            <div className={styles["generation-quantity-buttons"]}>
                {quantityOptions.map((option, i) => {
                    const { text, value } = option;
                    return (
                        <button
                            type="button"
                            className={`${styles["generation-quantity-button"]} ${styles[quantitySelected === i ? "selected" : ""]}`}
                            onClick={(e) => {
                                setQuantitySelected(i);
                                e.currentTarget.blur();
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.blur();
                            }}
                            key={`generation-quantity-button-${value}`}
                        >
                            {text}
                        </button>
                    );
                })}
            </div>
            <div className={styles["generate-and-reset-buttons"]}>
                {createButton("Generate", () => {}, "generate-button")}
                {createButton("Reset", () => {}, "reset-button")}
            </div>
        </div>
    );
}
