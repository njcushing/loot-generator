import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { Option } from "@/features/Design/components/Option";
import { Table } from "../Table";
import styles from "./index.module.css";

export function Tables() {
    const { lootGeneratorState, addNewTable } = useContext(LootGeneratorContext);

    const tableKeys = useMemo(() => {
        return [...lootGeneratorState.tables.keys()];
    }, [lootGeneratorState.tables]);

    return (
        <div className={styles["tables-tab"]}>
            <ul className={styles["tables"]}>
                {tableKeys.length > 0 ? (
                    tableKeys.map((key) => {
                        const table = lootGeneratorState.tables.get(key);
                        return table && <Table id={key} key={key} />;
                    })
                ) : (
                    <p
                        className={styles["help-message"]}
                    >{`Please click the '+' button below to create a new table`}</p>
                )}
            </ul>
            <div className={styles["create-new-table-options"]}>
                <Option symbol="Add" onClick={() => addNewTable()} style={{ width: "100%" }} />
            </div>
        </div>
    );
}
