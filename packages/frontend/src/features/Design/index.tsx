import { TabSelector } from "@/components/structural/components/TabSelector";
import { Interactive } from "./components/Interactive";
import { JSONDisplay } from "./components/JSONDisplay";

export function Design() {
    return (
        <TabSelector
            tabs={{
                interactive: { name: "Interactive", content: <Interactive />, position: "left" },
                JSON: { name: "JSON", content: <JSONDisplay />, position: "left" },
            }}
        />
    );
}
