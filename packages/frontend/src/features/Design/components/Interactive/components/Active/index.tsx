import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { TableEntry } from "../TableEntry";
import styles from "./index.module.css";

export function Active() {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    return (
        <ul className={styles["active"]}>
            {lootGeneratorState.lootTable && <TableEntry entry={lootGeneratorState.lootTable} />}
        </ul>
    );
}
