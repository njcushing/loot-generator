import { createContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import useResizeObserverElement from "@/hooks/useResizeObserverElement";
import { Structural } from "@/components/structural";
import { Generate } from "@/features/Generate";
import { createLootItem, createLootTable } from "@/utils/generateLoot";
import { LootItem, LootTable, Loot, SortOptions } from "@/utils/types";
import { Design } from "@/features/Design";
import { exampleLootTable } from "@/features/Design/utils/exampleLootTable";
import { version } from "../../../package.json";
import styles from "./index.module.css";

export type LootGeneratorState = {
    loot: Loot;
    lootTable: LootTable;
    presets: (LootItem | LootTable)[];
    presetsMap: Map<string, LootItem | LootTable>;
    quantitySelected: number;
    quantityOptionSelected: number;
    customQuantity: number;
    sortOptions: SortOptions;
};

const defaultLootGeneratorState: LootGeneratorState = {
    loot: new Map(),
    lootTable: exampleLootTable,
    presets: [],
    presetsMap: new Map(),
    quantitySelected: 1,
    quantityOptionSelected: 0,
    customQuantity: 50,
    sortOptions: new Map([["quantity", "descending"]]),
};

interface LootGeneratorContext {
    lootGeneratorState: LootGeneratorState;
    setLootGeneratorStateProperty: <K extends keyof LootGeneratorState>(
        property: K,
        value: LootGeneratorState[K],
    ) => void;

    findNestedEntry: (key: string, entry: (LootItem | LootTable)[]) => LootItem | LootTable | null;
    mutateNestedField: (
        fieldPaths: string[][],
        value: unknown,
        entry: LootItem | LootTable,
    ) => void;
    mutateNestedEntryAndNestedField: (
        key: string,
        fieldPaths: string[][],
        value: unknown,
        entry: (LootItem | LootTable)[],
    ) => void;
    deleteEntry: (key: string, entry: (LootItem | LootTable)[]) => boolean;
    createSubEntry: (
        key: string,
        type: LootItem["type"] | LootTable["type"],
        place: "active" | "preset",
    ) => boolean;
}

const defaultLootGeneratorContext: LootGeneratorContext = {
    lootGeneratorState: defaultLootGeneratorState,
    setLootGeneratorStateProperty: () => {},

    findNestedEntry: () => null,
    mutateNestedField: () => {},
    mutateNestedEntryAndNestedField: () => {},
    deleteEntry: () => false,
    createSubEntry: () => false,
};

export const LootGeneratorContext = createContext<LootGeneratorContext>(
    defaultLootGeneratorContext,
);

export function LootGenerator() {
    const [lootGeneratorState, setLootGeneratorState] =
        useState<LootGeneratorState>(defaultLootGeneratorState);

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize] = useResizeObserverElement({ ref: containerRef });
    const [layout, setLayout] = useState<"wide" | "thin">("wide");

    useEffect(() => {
        if (containerSize[0] >= 800) setLayout("wide");
        else setLayout("thin");
    }, [containerSize]);

    const setLootGeneratorStateProperty = useCallback(
        <K extends keyof LootGeneratorState>(property: K, value: LootGeneratorState[K]) => {
            setLootGeneratorState((current) => {
                const mutableState = { ...current };
                mutableState[property] = value;
                return mutableState;
            });
        },
        [],
    );

    const findNestedEntry = useCallback(
        (key: string, entry: (LootItem | LootTable)[]): LootItem | LootTable | null => {
            for (let i = 0; i < entry.length; i++) {
                const subEntry = entry[i];
                if (subEntry.key === key) {
                    return subEntry;
                }
                if (subEntry.type === "table") {
                    const nestedEntry = findNestedEntry(key, subEntry.loot);
                    if (nestedEntry) return nestedEntry;
                }
            }
            return null;
        },
        [],
    );

    const mutateNestedField = useCallback(
        (fieldPaths: string[][], value: unknown, entry: LootItem | LootTable) => {
            for (let i = 0; i < fieldPaths.length; i++) {
                let nestedEntry = entry;
                const fieldPath = fieldPaths[i];
                for (let j = 0; j < fieldPath.length; j++) {
                    const fieldName = fieldPath[j];
                    const field = nestedEntry[fieldName];
                    if (j === fieldPath.length - 1) {
                        nestedEntry[fieldName] = value;
                        return;
                    }
                    if (typeof field === "object" && field !== null) {
                        nestedEntry = field as LootItem | LootTable;
                    } else break;
                }
            }
        },
        [],
    );

    const mutateNestedEntryAndNestedField = useCallback(
        (key: string, fieldPaths: string[][], value: unknown, entry: (LootItem | LootTable)[]) => {
            const nestedEntry = findNestedEntry(key, entry);
            if (!nestedEntry) return;
            mutateNestedField(fieldPaths, value, nestedEntry);
        },
        [findNestedEntry, mutateNestedField],
    );

    const deleteEntry = useCallback((key: string, entry: (LootItem | LootTable)[]): boolean => {
        let deleted = false;
        for (let i = 0; i < entry.length; i++) {
            const subEntry = entry[i];
            if (subEntry.key === key) {
                entry.splice(i, 1);
                deleted = true;
            }
            if (!deleted && subEntry.type === "table") deleted = deleteEntry(key, subEntry.loot);
        }
        return deleted;
    }, []);

    const createSubEntry = useCallback(
        (
            key: string,
            type: LootItem["type"] | LootTable["type"],
            place: "active" | "preset",
        ): boolean => {
            let copy;
            if (place === "active") copy = lootGeneratorState.lootTable;
            if (place === "preset") copy = lootGeneratorState.presets;
            copy = JSON.parse(JSON.stringify(copy));

            let start;
            if (place === "active") start = copy.loot;
            if (place === "preset") start = copy;

            const entry = findNestedEntry(key, start);
            if (!entry || entry.type !== "table") return false;
            let newSubEntry = null;
            if (type === "table") newSubEntry = createLootTable();
            if (type === "item") newSubEntry = createLootItem();
            if (!newSubEntry) return false;
            entry.loot.push(newSubEntry);

            if (place === "active") setLootGeneratorStateProperty("lootTable", copy);
            if (place === "preset") setLootGeneratorStateProperty("presets", copy);

            return true;
        },
        [
            lootGeneratorState.lootTable,
            lootGeneratorState.presets,
            setLootGeneratorStateProperty,
            findNestedEntry,
        ],
    );

    useEffect(() => {
        const newPresetsMap = new Map(
            lootGeneratorState.presets.map((preset) => [preset.key, preset]),
        );
        setLootGeneratorStateProperty("presetsMap", newPresetsMap);
    }, [lootGeneratorState.presets, setLootGeneratorStateProperty]);

    return (
        <LootGeneratorContext.Provider
            value={useMemo(
                () => ({
                    lootGeneratorState,
                    setLootGeneratorStateProperty,

                    findNestedEntry,
                    mutateNestedField,
                    mutateNestedEntryAndNestedField,
                    deleteEntry,
                    createSubEntry,
                }),
                [
                    lootGeneratorState,
                    setLootGeneratorStateProperty,

                    findNestedEntry,
                    mutateNestedField,
                    mutateNestedEntryAndNestedField,
                    deleteEntry,
                    createSubEntry,
                ],
            )}
        >
            <div className={`${styles["page"]} ${styles[`${layout}`]}`} ref={containerRef}>
                <div className={styles["left-panel"]}>
                    <h1 className={styles["title"]}>Loot Generator</h1>
                    <p className={styles["name"]}>by njcushing</p>
                    <p className={styles["version"]}>{`v${version}`}</p>
                    <Structural.TabSelector
                        tabs={{
                            design: { name: "Design", content: <Design />, position: "left" },
                            about: { name: "About", content: <p>About</p>, position: "right" },
                        }}
                    />
                </div>
                <div className={styles["right-panel"]}>
                    <Structural.TabSelector
                        tabs={{
                            generate: { name: "Generate", content: <Generate />, position: "left" },
                            code: { name: "Code", content: <p>Code</p>, position: "left" },
                            data: { name: "Data", content: <p>Data</p>, position: "left" },
                        }}
                    />
                </div>
            </div>
        </LootGeneratorContext.Provider>
    );
}
