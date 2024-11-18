import { useContext, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { TabSelector } from "@/components/structural/components/TabSelector";
import { generateLoot } from "@/utils/generateLoot";
import { Loot } from "./components/Loot";
import { QuantityOptions } from "./components/QuantityOptions";
import { SortOptions } from "./components/SortOptions";
import styles from "./index.module.css";

export function Generate() {
    const { lootGeneratorState, setLootGeneratorStateProperty } = useContext(LootGeneratorContext);

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
                            <QuantityOptions />
                            <div className={styles["generate-and-reset-buttons"]}>
                                {createButton(
                                    "Generate",
                                    () => {
                                        setLootGeneratorStateProperty(
                                            "loot",
                                            generateLoot(
                                                lootGeneratorState.lootTable,
                                                lootGeneratorState.presets,
                                                lootGeneratorState.quantitySelected,
                                                lootGeneratorState.loot,
                                            ),
                                        );
                                    },
                                    "generate-button",
                                )}
                                {createButton(
                                    "Reset",
                                    () => {
                                        setLootGeneratorStateProperty("loot", new Map());
                                    },
                                    "reset-button",
                                )}
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
