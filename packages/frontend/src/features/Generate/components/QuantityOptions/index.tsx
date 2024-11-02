import { useContext, useEffect, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import styles from "./index.module.css";

type QuantityOption = { text: string; value: number };

export type TQuantityOptions = {
    newQuantitySelected: (value: number) => unknown;
};

export function QuantityOptions({ newQuantitySelected }: TQuantityOptions) {
    const { lootGeneratorState, setLootGeneratorState } = useContext(LootGeneratorContext);

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
        newQuantitySelected(quantityOptions[quantityOptionSelected].value);
    }, [newQuantitySelected, quantityOptionSelected, quantityOptions]);

    return (
        <div className={styles["generation-quantity-buttons"]}>
            {quantityOptions.map((option, i) => {
                const { text, value } = option;
                return (
                    <button
                        type="button"
                        className={`${styles["generation-quantity-button"]} ${styles[quantityOptionSelected === i ? "selected" : ""]}`}
                        onClick={(e) => {
                            setLootGeneratorState({
                                ...lootGeneratorState,
                                quantityOptionSelected: i,
                            });
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
    );
}
