import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { v4 as uuid } from "uuid";
import { Inputs } from "../../inputs";
import { LootEntry } from "../LootEntry";
import styles from "./index.module.css";

export type TTable = {
    id: string;
    onClick?: () => unknown;
};

export function Table({ id, onClick }: TTable) {
    const { lootGeneratorState, deleteTable } = useContext(LootGeneratorContext);

    const table = useMemo(() => lootGeneratorState.tables.get(id), [id, lootGeneratorState.tables]);

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        options.push({
            symbol: "Delete",
            onClick: () => {
                deleteTable(id);
            },
            colours: { hover: "rgb(255, 120, 120)", focus: "rgb(255, 83, 83)" },
        });
        return options;
    }, [id, deleteTable]);

    if (!table) return null;

    const { name } = table;
    const displayName = name || "Unnamed Table";

    const colours = {
        normal: "rgb(186, 240, 228)",
        hover: "rgb(157, 224, 210)",
        focus: "rgb(139, 206, 191)",
    };

    return (
        <ToggleBar
            name={displayName}
            options={toggleBarOptions}
            onClick={() => onClick && onClick()}
            style={{
                colours,
                nameFontStyle: name ? "normal" : "italic",
            }}
            key={id}
        >
            <div className={styles["table-fields"]}>
                <Inputs.Text
                    entryKey={id}
                    labelText="Name"
                    value={name || ""}
                    fieldPath={["name"]}
                />
            </div>
            <ul className={styles["table-entries"]}>
                {table.loot.map((entry) => {
                    return <LootEntry id={entry.id} key={entry.id || uuid()} />;
                })}
            </ul>
        </ToggleBar>
    );
}
