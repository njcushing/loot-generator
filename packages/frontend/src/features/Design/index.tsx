import { TabSelector } from "@/components/structural/components/TabSelector";
import styles from "./index.module.css";

export function Design() {
    return (
        <TabSelector
            tabs={{
                interactive: { name: "Interactive", content: <p>Interactive</p>, position: "left" },
                JSON: { name: "JSON", content: <p>JSON</p>, position: "left" },
            }}
        />
    );
}
