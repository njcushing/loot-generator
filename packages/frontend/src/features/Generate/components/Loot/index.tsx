import { mockData } from "./utils/mockData";
import styles from "./index.module.css";

export type Item = {
    name?: string;
    quantity: number;
    value?: number;
};

export type Items = Map<string, Item>;

export function Loot() {
    return (
        <ul className={styles["loot"]}>
            {[...mockData.keys()].map((key, i) => {
                const item = mockData.get(key);
                return (
                    item && (
                        <li
                            className={`${styles["item"]} ${styles[i % 2 === 0 ? "even" : "odd"]}`}
                            key={key}
                        >
                            <p className={`${styles["item-name"]} truncate-ellipsis`}>
                                {item.name || key}
                            </p>
                            <p className={styles["item-quantity"]}>{item.quantity}</p>
                        </li>
                    )
                );
            })}
        </ul>
    );
}
