import { useState, useCallback } from "react";
import { TabSelector } from "@/components/structural/components/TabSelector";
import { Loot } from "./components/Loot";
import { QuantityOptions } from "./components/QuantityOptions";
import { SortOptions } from "./components/SortOptions";
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
        <TabSelector
            tabs={{
                results: {
                    name: "Results",
                    content: (
                        <div className={styles["results"]}>
                            <Loot />
                            <QuantityOptions
                                newQuantitySelected={(value) => setCurrentQuantity(value)}
                            />
                            <div className={styles["generate-and-reset-buttons"]}>
                                {createButton("Generate", () => {}, "generate-button")}
                                {createButton("Reset", () => {}, "reset-button")}
                            </div>
                        </div>
                    ),
                    position: "left",
                },
                sort: { name: "Sort", content: <SortOptions />, position: "left" },
            }}
        />
    );
}
