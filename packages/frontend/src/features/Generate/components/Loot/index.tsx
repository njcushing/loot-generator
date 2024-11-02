import { Fragment } from "react/jsx-runtime";
import { mockData } from "./utils/mockData";
import styles from "./index.module.css";

export type Item = {
    name?: string;
    quantity: number;
    value?: number;
};

export type Items = {
    [key: string]: Item;
};

export function Loot() {
    return (
        <ul className={styles["loot"]}>
            {Object.keys(mockData).map((key, i) => {
                const item = mockData[key];
                return (
                    <Fragment key={key}>
                        <li className={styles["item"]}>
                            <p className={`${styles["item-name"]} truncate-ellipsis`}>
                                {item.name || key}
                            </p>
                            <p className={styles["item-quantity"]}>{item.quantity}</p>
                        </li>
                        {i < Object.keys(mockData).length - 1 && (
                            <div className={styles["separator"]}></div>
                        )}
                    </Fragment>
                );
            })}
        </ul>
    );
}
