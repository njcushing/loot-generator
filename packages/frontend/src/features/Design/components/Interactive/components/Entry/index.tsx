import { ToggleBar } from "@/components/buttons/components/ToggleBar";
import { v4 as uuid } from "uuid";
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
            ></ToggleBar>
        </li>
    );
}
