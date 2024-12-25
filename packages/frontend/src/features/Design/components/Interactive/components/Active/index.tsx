import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { Table } from "../Table";
import styles from "./index.module.css";

export function Active() {
    const { lootGeneratorState, deleteActive } = useContext(LootGeneratorContext);

    return (
        <ul className={styles["active"]}>
            {lootGeneratorState.active && (
                <Table
                    id={lootGeneratorState.active}
                    onClick={(optionClicked) => {
                        if (optionClicked === "delete") deleteActive();
                    }}
                />
            )}
        </ul>
    );
}
