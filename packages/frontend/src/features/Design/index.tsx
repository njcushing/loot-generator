import { TabSelector } from "@/components/structural/components/TabSelector";
import { JSONDisplay } from "./components/JSONDisplay";
import styles from "./index.module.css";

export function Design() {
    return (
        <TabSelector
            tabs={{
                interactive: { name: "Interactive", content: <p>Interactive</p>, position: "left" },
                JSON: { name: "JSON", content: <JSONDisplay />, position: "left" },
            }}
        />
    );
}
