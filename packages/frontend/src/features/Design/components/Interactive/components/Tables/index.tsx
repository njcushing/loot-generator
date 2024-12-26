import { useContext, useState, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { Option } from "@/features/Design/components/Option";
import { Inputs } from "@/components/inputs";
import { Table } from "../Table";
import styles from "./index.module.css";

export function Tables() {
    const { lootGeneratorState, addNewTable } = useContext(LootGeneratorContext);

    const [currentSearch, setCurrentSearch] = useState<string>("");
    const filterRegex = new RegExp(`${currentSearch}`, "i");

    const tableKeys = useMemo(() => {
        return [...lootGeneratorState.tables.keys()];
    }, [lootGeneratorState.tables]);

    return (
        <div className={styles["tables-tab"]}>
            <div className={styles["tables-tab-options"]}>
                <Inputs.Search
                    value={currentSearch}
                    onChange={(value) => setCurrentSearch(value)}
                />
            </div>
            <ul className={styles["tables"]}>
                {tableKeys.length > 0 ? (
                    tableKeys
                        .filter((key) => {
                            const table = lootGeneratorState.tables.get(key);
                            if (!table) return false;
                            return filterRegex.test(table.name || "");
                        })
                        .map((key) => {
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
