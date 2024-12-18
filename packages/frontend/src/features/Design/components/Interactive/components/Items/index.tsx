import { useContext, useState, useCallback } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { Option } from "@/features/Design/components/Option";
import { Inputs } from "@/components/inputs";
import { InteractiveContext } from "../..";
import { Item } from "../Item";
import styles from "./index.module.css";

export function Items() {
    const { lootGeneratorState, addNewItem } = useContext(LootGeneratorContext);
    const { setMenuStates } = useContext(InteractiveContext);

    const [currentSearch, setCurrentSearch] = useState<string>("");
    const filterRegex = new RegExp(`${currentSearch}`, "i");

    const expandItems = useCallback(() => {
        setMenuStates(new Map(lootGeneratorState.items.keys().map((key) => [key, "expanded"])));
    }, [lootGeneratorState.items, setMenuStates]);

    const collapseItems = useCallback(() => {
        setMenuStates(new Map(lootGeneratorState.items.keys().map((key) => [key, "collapsed"])));
    }, [lootGeneratorState.items, setMenuStates]);

    return (
        <div className={styles["items-tab"]}>
            <div className={styles["items-tab-options"]}>
                <Inputs.Search
                    value={currentSearch}
                    onChange={(value) => setCurrentSearch(value)}
                />
                <Option symbol="Expand_Content" onClick={() => expandItems()} />
                <Option symbol="Collapse_Content" onClick={() => collapseItems()} />
            </div>
            <ul className={styles["items"]}>
                {[...lootGeneratorState.items.keys()]
                    .filter((key) => {
                        const item = lootGeneratorState.items.get(key);
                        if (!item) return false;
                        return filterRegex.test(item.name || "");
                    })
                    .map((key) => {
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
