import { useContext } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { Item } from "../Item";
import styles from "./index.module.css";

export function Items() {
    const { lootGeneratorState, addNewItem } = useContext(LootGeneratorContext);

    return (
        <div className={styles["items-tab"]}>
            <ul className={styles["items"]}>
                {[...lootGeneratorState.items.keys()].map((key) => {
                    const item = lootGeneratorState.items.get(key);
                    return item && <Item id={key} key={key} />;
                })}
            </ul>
            <div className={styles["create-new-item-options"]}>
                <button
                    type="button"
                    className={styles["create-new-item-button"]}
                    onClick={(e) => {
                        addNewItem();
                        e.currentTarget.blur();
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.blur();
                    }}
                >
                    <p className="truncate-ellipsis">+</p>
                </button>
            </div>
        </div>
    );
}
