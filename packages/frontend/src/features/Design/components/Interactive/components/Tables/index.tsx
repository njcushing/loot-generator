import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { Option } from "@/features/Design/components/Option";
import { Table } from "../Table";
import styles from "./index.module.css";

export function Tables() {
    const { lootGeneratorState, addNewTable } = useContext(LootGeneratorContext);

    return (
        <div className={styles["tables-tab"]}>
            <ul className={styles["tables"]}>
                {[...lootGeneratorState.tables.keys()].map((key) => {
                    const table = lootGeneratorState.tables.get(key);
                    return table && <Table id={key} key={key} />;
                })}
            </ul>
            <div className={styles["create-new-table-options"]}>
                <Option symbol="Add" onClick={() => addNewTable()} style={{ width: "100%" }} />
            </div>
        </div>
    );
}
