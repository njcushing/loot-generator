import { Structural } from "@/components/structural/";
import styles from "./index.module.css";

export function About() {
    return (
        <div className={styles["about"]}>
            <Structural.TabSelector
                tabs={{
                    overview: {
                        name: "Overview",
                        content: (
                            <section className={styles["section-container"]}>
                                <h2 className={styles["title"]}>Overview</h2>
                            </section>
                        ),
                        position: "left",
                    },
                    items: {
                        name: "Items",
                        content: (
                            <section className={styles["section-container"]}>
                                <h2 className={styles["title"]}>Items</h2>
                            </section>
                        ),
                        position: "left",
                    },
                    tables: {
                        name: "Tables",
                        content: (
                            <section className={styles["section-container"]}>
                                <h2 className={styles["title"]}>Tables</h2>
                            </section>
                        ),
                        position: "left",
                    },
                    JSON: {
                        name: "JSON",
                        content: (
                            <section className={styles["section-container"]}>
                                <h2 className={styles["title"]}>JSON</h2>
                            </section>
                        ),
                        position: "left",
                    },
                }}
            />
        </div>
    );
}
