import { useContext, useEffect, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import styles from "./index.module.css";

type QuantityOption = { text: string; value: number };

export function QuantityOptions() {
    const { lootGeneratorState, setLootGeneratorStateProperty } = useContext(LootGeneratorContext);

    const quantityOptionSelected = useMemo<number>(() => {
        return lootGeneratorState.quantityOptionSelected;
    }, [lootGeneratorState.quantityOptionSelected]);
    const quantityOptions = useMemo<QuantityOption[]>(() => {
        return [
            { text: "1", value: 1 },
            { text: "10", value: 10 },
            { text: "100", value: 100 },
            { text: "1000", value: 1000 },
            { text: "Custom", value: lootGeneratorState.customQuantity },
        ];
    }, [lootGeneratorState.customQuantity]);

    useEffect(() => {
        setLootGeneratorStateProperty(
            "quantitySelected",
            quantityOptions[quantityOptionSelected].value,
        );
    }, [setLootGeneratorStateProperty, quantityOptionSelected, quantityOptions]);

    return (
        <div className={styles["generation-quantity-options"]}>
            <div className={styles["quantity-buttons"]}>
                {quantityOptions.map((option, i) => {
                    const { text } = option;
                    return (
                        <button
                            type="button"
                            className={`${styles["generation-quantity-button"]} ${styles[quantityOptionSelected === i ? "selected" : ""]}`}
                            onClick={(e) => {
                                setLootGeneratorStateProperty("quantityOptionSelected", i);
                                e.currentTarget.blur();
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.blur();
                            }}
                            key={`generation-quantity-button-${text}`}
                        >
                            {text}
                        </button>
                    );
                })}
            </div>
            {quantityOptionSelected === 4 && (
                <label htmlFor="custom-quantity" className={styles["custom-quantity-field"]}>
                    Enter custom quantity:
                    <input
                        type="number"
                        value={lootGeneratorState.customQuantity}
                        onChange={(e) => {
                            setLootGeneratorStateProperty(
                                "customQuantity",
                                Math.max(1, Number(e.target.value)),
                            );
                        }}
                        id="custom-quantity"
                    />
                </label>
            )}
        </div>
    );
}
