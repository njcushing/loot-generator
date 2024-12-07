import { createContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import useResizeObserverElement from "@/hooks/useResizeObserverElement";
import { Structural } from "@/components/structural";
import { Generate } from "@/features/Generate";
import { createLootItem, createLootTable, createLootPresetFromEntry } from "@/utils/generateLoot";
import { Items, LootItem, LootTable, Loot, SortOptions, LootTableProps } from "@/utils/types";
import { Design } from "@/features/Design";
import * as exampleLoot from "./utils/exampleLoot";
import { version } from "../../../package.json";
import styles from "./index.module.css";

export type LootGeneratorState = {
    items: Items;
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
    items: new Map(),
    loot: new Map(),
    lootTable: exampleLoot.table,
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

    getEntry: (
        key: string,
        place: "active" | "preset",
    ) => {
        entry: LootTableProps["loot"][number] | LootGeneratorState["presets"][number];
        path: LootTable[];
        copy: LootGeneratorState["lootTable"] | LootGeneratorState["presets"];
    } | null;
    mutateEntryField: (
        key: string,
        fieldPaths: string[][],
        value: unknown,
        place: "active" | "preset",
    ) => boolean;
    deleteEntry: (key: string, place: "active" | "preset") => boolean;
    createSubEntry: (
        key: string,
        type: LootItem["type"] | LootTable["type"],
        place: "active" | "preset",
    ) => boolean;

    createPreset: (type: LootItem["type"] | LootTable["type"]) => boolean;
    saveEntryAsPreset: (key: string, place: "active" | "preset") => boolean;
    deletePreset: (key: string) => boolean;
}

const defaultLootGeneratorContext: LootGeneratorContext = {
    lootGeneratorState: defaultLootGeneratorState,
    setLootGeneratorStateProperty: () => {},

    getEntry: () => null,
    mutateEntryField: () => false,
    deleteEntry: () => false,
    createSubEntry: () => false,

    createPreset: () => false,
    saveEntryAsPreset: () => false,
    deletePreset: () => false,
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

    const getCopy = useCallback(
        (
            place: "active" | "preset",
        ): {
            copy: LootGeneratorState["lootTable"] | LootGeneratorState["presets"];
        } => {
            let copy;
            if (place === "active") copy = lootGeneratorState.lootTable;
            if (place === "preset") copy = lootGeneratorState.presets;
            copy = structuredClone(copy)!;

            return { copy };
        },
        [lootGeneratorState.lootTable, lootGeneratorState.presets],
    );

    const saveCopy = useCallback(
        (
            place: "active" | "preset",
            copy: LootGeneratorState["lootTable"] | LootGeneratorState["presets"],
        ) => {
            if (place === "active") {
                setLootGeneratorStateProperty("lootTable", copy as LootGeneratorState["lootTable"]);
            }
            if (place === "preset") {
                setLootGeneratorStateProperty("presets", copy as LootGeneratorState["presets"]);
            }
        },
        [setLootGeneratorStateProperty],
    );

    const getEntry = useCallback(
        (
            key: string,
            place: "active" | "preset",
        ): {
            entry: LootTableProps["loot"][number] | LootGeneratorState["presets"][number];
            path: LootTable[];
            index: number;
            copy: LootGeneratorState["lootTable"] | LootGeneratorState["presets"];
        } | null => {
            const { copy } = getCopy(place);
            if (!copy) return null;

            let origin;
            if (place === "active") origin = (copy as LootGeneratorState["lootTable"]).props.loot;
            if (place === "preset") origin = copy as LootGeneratorState["presets"];
            if (!origin) return null;

            const path: LootTable[] = [];
            if (place === "active") path.push(copy as LootGeneratorState["lootTable"]);

            const search = (
                currentEntry: LootTableProps["loot"] | LootGeneratorState["presets"],
                currentPath: LootTable[] = [],
            ): {
                entry: LootTableProps["loot"][number] | LootGeneratorState["presets"][number];
                path: LootTable[];
                index: number;
                copy: LootGeneratorState["lootTable"] | LootGeneratorState["presets"];
            } | null => {
                for (let i = 0; i < currentEntry.length; i++) {
                    const subEntry = currentEntry[i];
                    if (subEntry.key === key) {
                        return {
                            entry: subEntry,
                            path: currentPath,
                            index: i,
                            copy,
                        };
                    }
                    if (subEntry.type === "table") {
                        currentPath.push(subEntry);
                        const nestedEntry = search(subEntry.props.loot, currentPath);
                        if (nestedEntry) return nestedEntry;
                    }
                }
                return null;
            };

            return search(origin, path);
        },
        [getCopy],
    );

    const mutateEntryField = useCallback(
        (
            key: string,
            fieldPaths: string[][],
            value: unknown,
            place: "active" | "preset",
        ): boolean => {
            const result = getEntry(key, place);
            if (!result) return false;
            const { entry, copy } = result;

            for (let i = 0; i < fieldPaths.length; i++) {
                let nestedEntry = entry;
                const fieldPath = fieldPaths[i];
                for (let j = 0; j < fieldPath.length; j++) {
                    const fieldName = fieldPath[j] as keyof typeof nestedEntry;
                    const field = nestedEntry[fieldName];
                    if (j === fieldPath.length - 1) {
                        (nestedEntry[fieldName] as unknown) = value;
                        break;
                    }
                    if (typeof field === "object" && field !== null) {
                        (nestedEntry as unknown) = field;
                    } else break;
                }
            }

            saveCopy(place, copy);

            return true;
        },
        [saveCopy, getEntry],
    );

    const deleteEntry = useCallback(
        (key: string, place: "active" | "preset"): boolean => {
            const result = getEntry(key, place);
            if (!result) return false;
            const { path, copy } = result;
            if (path.length === 0) return false;
            const entryParentLoot = path[path.length - 1].props.loot;

            let deleted = false;
            for (let i = 0; i < entryParentLoot.length; i++) {
                const entry = entryParentLoot[i];
                if (entry.key === key) {
                    entryParentLoot.splice(i, 1);
                    deleted = true;
                }
            }

            saveCopy(place, copy);

            return deleted;
        },
        [saveCopy, getEntry],
    );

    const createSubEntry = useCallback(
        (
            key: string,
            type: LootItem["type"] | LootTable["type"],
            place: "active" | "preset",
        ): boolean => {
            const result = getEntry(key, place);
            if (!result) return false;
            const { entry, copy } = result;
            if (!entry || entry.type !== "table") return false;

            let newSubEntry = null;
            if (type === "table") newSubEntry = createLootTable();
            if (type === "item") newSubEntry = createLootItem();
            if (!newSubEntry) return false;
            entry.props.loot.push(newSubEntry);

            saveCopy(place, copy);

            return true;
        },
        [saveCopy, getEntry],
    );

    const createPreset = useCallback(
        (type: LootItem["type"] | LootTable["type"]): boolean => {
            let newPreset;
            if (type === "item") newPreset = createLootItem();
            if (type === "table") newPreset = createLootTable();
            if (!newPreset) return false;

            const newPresets = [...lootGeneratorState.presets];
            newPresets.push(newPreset);

            setLootGeneratorState((current) => ({ ...current, presets: newPresets }));
            return true;
        },
        [lootGeneratorState.presets],
    );

    const saveEntryAsPreset = useCallback(
        (key: string, place: "active" | "preset"): boolean => {
            const result = getEntry(key, place);
            if (!result) return false;
            const { entry, path, index, copy } = result;

            if (entry.type === "preset") return false;
            if (lootGeneratorState.presetsMap.has(entry.key)) return false;
            if (path.length === 0) return false; // Don't allow user to save base lootTable as preset

            if (place === "preset") {
                (copy as LootGeneratorState["presets"]).push(structuredClone(entry));
                path[path.length - 1].props.loot[index] = createLootPresetFromEntry(entry);
                saveCopy("preset", copy);
            }

            if (place === "active") {
                const entryCopy = structuredClone(entry);

                path[path.length - 1].props.loot[index] = createLootPresetFromEntry(entry);
                saveCopy("active", copy);

                const { copy: presetsCopy } = getCopy("preset");
                (presetsCopy as LootGeneratorState["presets"]).push(structuredClone(entryCopy));
                saveCopy("preset", presetsCopy);
            }

            return true;
        },
        [lootGeneratorState.presetsMap, getCopy, saveCopy, getEntry],
    );

    const deletePreset = useCallback(
        (key: string): boolean => {
            if (!lootGeneratorState.presetsMap.has(key)) return false;

            const presetsCopy = getCopy("preset").copy as LootGeneratorState["presets"];
            const activeCopy = getCopy("active").copy as LootGeneratorState["lootTable"];

            presetsCopy.splice(
                presetsCopy.findIndex((preset) => preset.key === key),
                1,
            );

            const search = (currentEntry: LootTable) => {
                const { length } = currentEntry.props.loot;
                for (let i = length - 1; i >= 0; i--) {
                    const subEntry = currentEntry.props.loot[i];
                    if (subEntry.type === "preset") {
                        if (subEntry.id === key) currentEntry.props.loot.splice(i, 1);
                    }
                    if (subEntry.type === "table") search(subEntry);
                }
                return false;
            };

            // Delete all occurrences of preset as 'preset'-type entry in loot tables
            presetsCopy.forEach((preset) => {
                if (preset.type === "table") search(preset);
            });
            search(activeCopy);

            saveCopy("active", activeCopy);
            saveCopy("preset", presetsCopy);

            return true;
        },
        [lootGeneratorState.presetsMap, getCopy, saveCopy],
    );

    useEffect(() => {
        setLootGeneratorState((current) => ({ ...current, loot: new Map() }));
    }, [lootGeneratorState.lootTable]);

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

                    getEntry,
                    mutateEntryField,
                    deleteEntry,
                    createSubEntry,

                    createPreset,
                    saveEntryAsPreset,
                    deletePreset,
                }),
                [
                    lootGeneratorState,
                    setLootGeneratorStateProperty,

                    getEntry,
                    mutateEntryField,
                    deleteEntry,
                    createSubEntry,

                    createPreset,
                    saveEntryAsPreset,
                    deletePreset,
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
