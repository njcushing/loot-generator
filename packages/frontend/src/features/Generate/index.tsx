import { useState, useCallback } from "react";
import { Loot } from "./components/Loot";
import { QuantityOptions } from "./components/QuantityOptions";
import styles from "./index.module.css";

export function Generate() {
    const [currentQuantity, setCurrentQuantity] = useState<number>();

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
            <Loot />
            <QuantityOptions newQuantitySelected={(value) => setCurrentQuantity(value)} />
            <div className={styles["generate-and-reset-buttons"]}>
                {createButton("Generate", () => {}, "generate-button")}
                {createButton("Reset", () => {}, "reset-button")}
            </div>
        </div>
    );
}
