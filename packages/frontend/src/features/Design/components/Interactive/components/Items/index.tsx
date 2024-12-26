import { useContext, useState, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { Option } from "@/features/Design/components/Option";
import { Inputs } from "@/components/inputs";
import { Item } from "../Item";
import styles from "./index.module.css";

export function Items() {
    const { lootGeneratorState, addNewItem } = useContext(LootGeneratorContext);

    const [currentSearch, setCurrentSearch] = useState<string>("");
    const filterRegex = new RegExp(`${currentSearch}`, "i");

    const itemKeys = useMemo(() => {
        return [...lootGeneratorState.items.keys()];
    }, [lootGeneratorState.items]);

    return (
        <div className={styles["items-tab"]}>
            <div className={styles["items-tab-options"]}>
                <Inputs.Search
                    value={currentSearch}
                    onChange={(value) => setCurrentSearch(value)}
                />
            </div>
            <ul className={styles["items"]}>
                {itemKeys.length > 0 ? (
                    itemKeys
                        .filter((key) => {
                            const item = lootGeneratorState.items.get(key);
                            if (!item) return false;
                            return filterRegex.test(item.name || "");
                        })
                        .map((key) => {
                            const item = lootGeneratorState.items.get(key);
                            return item && <Item id={key} key={key} />;
                        })
                ) : (
                    <p
                        className={styles["help-message"]}
                    >{`Please click the '+' button below to create a new item`}</p>
                )}
            </ul>
            <div className={styles["create-new-item-options"]}>
                <Option symbol="Add" onClick={() => addNewItem()} style={{ width: "100%" }} />
            </div>
        </div>
    );
}
