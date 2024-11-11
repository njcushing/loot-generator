import { TabSelector } from "@/components/structural/components/TabSelector";
import { Tables } from "./components/Tables";
import { Items } from "./components/Items";
import styles from "./index.module.css";

export function Presets() {
    return (
        <TabSelector
            tabs={{
                tables: { name: "Tables", content: <Tables />, position: "left" },
                items: { name: "Items", content: <Items />, position: "left" },
            }}
        />
    );
}
