import { ToggleBar } from "@/components/buttons/components/ToggleBar";
import { v4 as uuid } from "uuid";
import { Option } from "../../../Option";
import styles from "./index.module.css";

export function Entry() {
    return (
        <li className={styles["entry"]} key={uuid()}>
            <ToggleBar
                name="New Entry"
                style={{
                    size: "s",
                    colours: {
                        normal: "rgb(253, 222, 47)",
                        hover: "rgb(240, 208, 31)",
                        focus: "rgb(218, 187, 14)",
                    },
                    nameFontStyle: "italic",
                }}
            >
                <div className={styles["entry-options"]}>
                    <button
                        type="button"
                        className={styles["entry-option"]}
                        onClick={(e) => {
                            e.currentTarget.blur();
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.blur();
                        }}
                    >
                        <p
                            className={`${styles["symbol"]} material-symbols-sharp`}
                            style={{ fontSize: "1.4rem" }}
                        >
                            Table
                        </p>
                        <p className="truncate-ellipsis">Table</p>
                    </button>
                    <button
                        type="button"
                        className={styles["entry-option"]}
                        onClick={(e) => {
                            e.currentTarget.blur();
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.blur();
                        }}
                    >
                        <p
                            className={`${styles["symbol"]} material-symbols-sharp`}
                            style={{ fontSize: "1.4rem" }}
                        >
                            Nutrition
                        </p>
                        <p className="truncate-ellipsis">Item</p>
                    </button>
                </div>
            </ToggleBar>
        </li>
    );
}
