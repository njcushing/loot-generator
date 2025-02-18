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
                            <SortOptions />
                            <Loot />
                            <QuantityOptions />
                            <div className={styles["generate-and-reset-buttons"]}>
                                {createButton(
                                    "Generate",
                                    () => {
                                        setLootGeneratorStateProperty(
                                            "loot",
                                            generateLoot(
                                                lootGeneratorState.active,
                                                lootGeneratorState.tables,
                                                lootGeneratorState.items,
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
                                        setLootGeneratorStateProperty("loot", {});
                                    },
                                    "reset-button",
                                )}
                            </div>
                        </div>
                    ),
                    position: "left",
                },
            }}
        />
    );
}
