import { createContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import useResizeObserverElement from "@/hooks/useResizeObserverElement";
import { Structural } from "@/components/structural";
import { Generate } from "@/features/Generate";
import {
    createItem,
    createLootItem,
    createLootTable,
    createLootPresetFromEntry,
} from "@/utils/generateLoot";
import {
    Items,
    LootItem,
    LootTable,
    Preset,
    Loot,
    SortOptions,
    LootTableProps,
} from "@/utils/types";
import { Design } from "@/features/Design";
import { updateFieldsInObject, TFieldToUpdate } from "@/utils/mutateFieldsInObject";
import { v4 as uuid } from "uuid";
import * as exampleLoot from "./utils/exampleLoot";
import { version } from "../../../package.json";
import styles from "./index.module.css";

export type LootGeneratorState = {
    items: Items;
    loot: Loot;
    active: LootTable;
    presets: Preset[];
    presetsMap: Map<string, Preset>;
    quantitySelected: number;
    quantityOptionSelected: number;
    customQuantity: number;
    sortOptions: SortOptions;
};

const defaultLootGeneratorState: LootGeneratorState = {
    items: exampleLoot.items,
    loot: new Map(),
    active: exampleLoot.table,
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

    addNewItem: () => void;
    updateItem: (key: string, fieldsToMutate: TFieldToUpdate[]) => boolean;
    deleteItem: (key: string) => boolean;

    getEntry: (
        key: string,
        source: "active" | "presets",
    ) => {
        entry: LootTableProps["loot"][number] | LootGeneratorState["presets"][number];
        path: LootTable[];
        copy: LootGeneratorState["active"] | LootGeneratorState["presets"];
    } | null;
    updateEntry: (
        key: string,
        fieldsToMutate: TFieldToUpdate[],
        source: "active" | "presets",
    ) => boolean;
    setItemOnEntry: (key: string, itemId: string, source: "active" | "presets") => boolean;
    deleteEntry: (key: string, source: "active" | "presets") => boolean;
    createSubEntry: (
        key: string,
        type: LootItem["type"] | LootTable["type"],
        source: "active" | "presets",
    ) => boolean;

    createPreset: () => void;
    saveEntryAsPreset: (key: string, source: "active" | "presets") => boolean;
    deletePreset: (key: string) => boolean;
}

const defaultLootGeneratorContext: LootGeneratorContext = {
    lootGeneratorState: defaultLootGeneratorState,
    setLootGeneratorStateProperty: () => {},

    addNewItem: () => {},
    updateItem: () => false,
    deleteItem: () => false,

    getEntry: () => null,
    updateEntry: () => false,
    setItemOnEntry: () => false,
    deleteEntry: () => false,
    createSubEntry: () => false,

    createPreset: () => {},
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
            source: "active" | "presets" | "items",
        ): {
            copy:
                | LootGeneratorState["active"]
                | LootGeneratorState["presets"]
                | LootGeneratorState["items"];
        } => {
            let copy;
            if (source === "items") copy = lootGeneratorState.items;
            if (source === "active") copy = lootGeneratorState.active;
            if (source === "presets") copy = lootGeneratorState.presets;
            copy = structuredClone(copy)!;

            return { copy };
        },
        [lootGeneratorState.active, lootGeneratorState.presets, lootGeneratorState.items],
    );

    const saveCopy = useCallback(
        (
            source: "active" | "presets" | "items",
            copy:
                | LootGeneratorState["active"]
                | LootGeneratorState["presets"]
                | LootGeneratorState["items"],
        ) => {
            if (source === "items") {
                setLootGeneratorStateProperty("items", copy as LootGeneratorState["items"]);
            }
            if (source === "active") {
                setLootGeneratorStateProperty("active", copy as LootGeneratorState["active"]);
            }
            if (source === "presets") {
                setLootGeneratorStateProperty("presets", copy as LootGeneratorState["presets"]);
            }
        },
        [setLootGeneratorStateProperty],
    );

    const addNewItem = useCallback(() => {
        const newItems = new Map(lootGeneratorState.items);
        newItems.set(uuid(), createItem());
        setLootGeneratorStateProperty("items", newItems);
    }, [lootGeneratorState.items, setLootGeneratorStateProperty]);

    const updateItem = useCallback(
        (id: string, fieldsToUpdate: TFieldToUpdate[]): boolean => {
            const itemsCopy = structuredClone(lootGeneratorState.items);
            const item = itemsCopy.get(id);
            if (!item) return false;

            updateFieldsInObject(item, fieldsToUpdate);

            saveCopy("items", itemsCopy);

            return true;
        },
        [lootGeneratorState.items, saveCopy],
    );

    const deleteItem = useCallback(
        (key: string): boolean => {
            if (!lootGeneratorState.items.has(key)) return false;
            const newItems = new Map(lootGeneratorState.items);
            newItems.delete(key);
            setLootGeneratorStateProperty("items", newItems);
            return true;
        },
        [lootGeneratorState.items, setLootGeneratorStateProperty],
    );

    const getEntry = useCallback(
        (
            key: string,
            source: "active" | "presets",
        ): {
            entry: LootTableProps["loot"][number] | LootGeneratorState["presets"][number];
            path: LootTable[];
            index: number;
            copy: LootGeneratorState["active"] | LootGeneratorState["presets"];
        } | null => {
            let copy;
            if (source === "active") copy = structuredClone(lootGeneratorState.active);
            if (source === "presets") copy = structuredClone(lootGeneratorState.presets);
            if (!copy) return null;

            let origin;
            if (source === "active") origin = (copy as LootGeneratorState["active"]).props.loot;
            if (source === "presets") origin = copy as LootGeneratorState["presets"];
            if (!origin) return null;

            const path: LootTable[] = [];
            if (source === "active") path.push(copy as LootGeneratorState["active"]);

            const search = (
                currentEntry: LootTableProps["loot"] | LootGeneratorState["presets"],
                currentPath: LootTable[] = [],
            ): {
                entry: LootTableProps["loot"][number] | LootGeneratorState["presets"][number];
                path: LootTable[];
                index: number;
                copy: LootGeneratorState["active"] | LootGeneratorState["presets"];
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
        [lootGeneratorState.active, lootGeneratorState.presets],
    );

    const updateEntry = useCallback(
        (key: string, fieldsToUpdate: TFieldToUpdate[], source: "active" | "presets"): boolean => {
            const result = getEntry(key, source);
            if (!result) return false;
            const { entry, copy } = result;

            updateFieldsInObject(entry, fieldsToUpdate);

            saveCopy(source, copy);

            return true;
        },
        [saveCopy, getEntry],
    );

    const setItemOnEntry = useCallback(
        (key: string, itemId: string, source: "active" | "presets") => {
            if (!lootGeneratorState.items.has(itemId)) return false;

            const result = getEntry(key, source);
            if (!result) return false;
            const { entry, copy } = result;
            if (entry.type !== "item") return false;

            entry.id = itemId;

            saveCopy(source, copy);

            return true;
        },
        [lootGeneratorState.items, getEntry, saveCopy],
    );

    const deleteEntry = useCallback(
        (key: string, source: "active" | "presets"): boolean => {
            const result = getEntry(key, source);
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

            saveCopy(source, copy);

            return deleted;
        },
        [saveCopy, getEntry],
    );

    const createSubEntry = useCallback(
        (
            key: string,
            type: LootItem["type"] | LootTable["type"],
            source: "active" | "presets",
        ): boolean => {
            const result = getEntry(key, source);
            if (!result) return false;
            const { entry, copy } = result;
            if (!entry || entry.type !== "table") return false;

            let newSubEntry = null;
            if (type === "table") newSubEntry = createLootTable();
            if (type === "item") newSubEntry = createLootItem();
            if (!newSubEntry) return false;
            entry.props.loot.push(newSubEntry);

            saveCopy(source, copy);

            return true;
        },
        [saveCopy, getEntry],
    );

    const createPreset = useCallback(() => {
        const newPresets = [...lootGeneratorState.presets];
        newPresets.push(createLootTable());
        setLootGeneratorState((current) => ({ ...current, presets: newPresets }));
    }, [lootGeneratorState.presets]);

    const saveEntryAsPreset = useCallback(
        (key: string, source: "active" | "presets"): boolean => {
            const result = getEntry(key, source);
            if (!result) return false;
            const { entry, path, index, copy } = result;

            if (entry.type === "item" || entry.type === "preset") return false;
            if (lootGeneratorState.presetsMap.has(entry.key)) return false;
            if (path.length === 0) return false; // Don't allow user to save base lootTable as preset

            if (source === "presets") {
                (copy as LootGeneratorState["presets"]).push(structuredClone(entry));
                path[path.length - 1].props.loot[index] = createLootPresetFromEntry(entry);
                saveCopy("presets", copy);
            }

            if (source === "active") {
                const entryCopy = structuredClone(entry);

                path[path.length - 1].props.loot[index] = createLootPresetFromEntry(entry);
                saveCopy("active", copy);

                const { copy: presetsCopy } = getCopy("presets");
                (presetsCopy as LootGeneratorState["presets"]).push(structuredClone(entryCopy));
                saveCopy("presets", presetsCopy);
            }

            return true;
        },
        [lootGeneratorState.presetsMap, getCopy, saveCopy, getEntry],
    );

    const deletePreset = useCallback(
        (key: string): boolean => {
            if (!lootGeneratorState.presetsMap.has(key)) return false;

            const presetsCopy = getCopy("presets").copy as LootGeneratorState["presets"];
            const activeCopy = getCopy("active").copy as LootGeneratorState["active"];

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
            saveCopy("presets", presetsCopy);

            return true;
        },
        [lootGeneratorState.presetsMap, getCopy, saveCopy],
    );

    useEffect(() => {
        setLootGeneratorState((current) => ({ ...current, loot: new Map() }));
    }, [lootGeneratorState.active]);

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

                    addNewItem,
                    updateItem,
                    deleteItem,

                    getEntry,
                    updateEntry,
                    setItemOnEntry,
                    deleteEntry,
                    createSubEntry,

                    createPreset,
                    saveEntryAsPreset,
                    deletePreset,
                }),
                [
                    lootGeneratorState,
                    setLootGeneratorStateProperty,

                    addNewItem,
                    updateItem,
                    deleteItem,

                    getEntry,
                    updateEntry,
                    setItemOnEntry,
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
