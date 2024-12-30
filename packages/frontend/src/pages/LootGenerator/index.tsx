import { createContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import useResizeObserverElement from "@/hooks/useResizeObserverElement";
import { Structural } from "@/components/structural";
import { Generate } from "@/features/Generate";
import {
    createLootEntry,
    createItem as newItem,
    createLootItem,
    createTable as newTable,
    createLootTable,
} from "@/utils/generateLoot";
import { LootTable, Items, Table, Tables, Loot, SortOptions } from "@/utils/types";
import { Design } from "@/features/Design";
import { updateFieldsInObject, TFieldToUpdate } from "@/utils/mutateFieldsInObject";
import { v4 as uuid } from "uuid";
import * as exampleLoot from "./utils/exampleLoot";
import { sortOptions } from "./utils/sortOptions";
import { version } from "../../../package.json";
import styles from "./index.module.css";

export type LootGeneratorState = {
    loot: Loot;
    active: string | null;
    tables: Tables;
    items: Items;
    quantitySelected: number;
    quantityOptionSelected: number;
    customQuantity: number;
    sortOptions: { selected: string; options: SortOptions };
};

const defaultLootGeneratorState: LootGeneratorState = {
    loot: new Map(),
    active: [...exampleLoot.tables.keys()][0],
    tables: exampleLoot.tables,
    items: exampleLoot.items,
    quantitySelected: 1,
    quantityOptionSelected: 0,
    customQuantity: 50,
    sortOptions: {
        selected: "quantity",
        options: structuredClone(sortOptions),
    },
};

interface LootGeneratorContext {
    lootGeneratorState: LootGeneratorState;
    setLootGeneratorStateProperty: <K extends keyof LootGeneratorState>(
        property: K,
        value: LootGeneratorState[K],
    ) => void;

    deleteActive: () => void;

    createTable: () => void;
    updateTable: (id: string, fieldsToMutate: TFieldToUpdate[]) => boolean;
    deleteTable: (id: string) => boolean;
    uploadTableToActive: (id: string) => void;

    createItem: () => void;
    updateItem: (id: string, fieldsToMutate: TFieldToUpdate[]) => boolean;
    deleteItem: (id: string) => boolean;

    getEntry: (
        tableId: string,
        entryKey: string,
    ) => { entry: Table["loot"][number]; path: LootTable[]; index: number } | null;
    updateEntry: (tableId: string, entryKey: string, fieldsToMutate: TFieldToUpdate[]) => boolean;
    setItemOnEntry: (tableId: string, entryKey: string, setItemId: string) => boolean;
    setTableOnEntry: (tableId: string, entryKey: string, setTableId: string) => boolean;
    deleteEntry: (tableId: string, entryKey: string) => boolean;
    createSubEntry: (tableId: string) => boolean;
}

const defaultLootGeneratorContext: LootGeneratorContext = {
    lootGeneratorState: defaultLootGeneratorState,
    setLootGeneratorStateProperty: () => {},

    deleteActive: () => {},

    createTable: () => {},
    updateTable: () => false,
    deleteTable: () => false,
    uploadTableToActive: () => {},

    createItem: () => {},
    updateItem: () => false,
    deleteItem: () => false,

    getEntry: () => null,
    updateEntry: () => false,
    setItemOnEntry: () => false,
    setTableOnEntry: () => false,
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
                const mutableState = structuredClone(current);
                mutableState[property] = value;
                return mutableState;
            });
        },
        [],
    );

    const getCopy = useCallback(
        (
            source: "active" | "tables" | "items",
        ):
            | LootGeneratorState["active"]
            | LootGeneratorState["tables"]
            | LootGeneratorState["items"] => {
            let copy;
            if (source === "active") copy = lootGeneratorState.active;
            if (source === "tables") copy = lootGeneratorState.tables;
            if (source === "items") copy = lootGeneratorState.items;
            copy = structuredClone(copy)!;

            return copy;
        },
        [lootGeneratorState.active, lootGeneratorState.tables, lootGeneratorState.items],
    );

    const saveCopy = useCallback(
        (
            source: "active" | "tables" | "items",
            copy:
                | LootGeneratorState["active"]
                | LootGeneratorState["tables"]
                | LootGeneratorState["items"],
        ) => {
            if (source === "active") {
                setLootGeneratorStateProperty("active", copy as LootGeneratorState["active"]);
            }
            if (source === "tables") {
                setLootGeneratorStateProperty("tables", copy as LootGeneratorState["tables"]);
            }
            if (source === "items") {
                setLootGeneratorStateProperty("items", copy as LootGeneratorState["items"]);
            }
        },
        [setLootGeneratorStateProperty],
    );

    const deleteActive = useCallback(() => {
        setLootGeneratorState({ ...structuredClone(lootGeneratorState), active: null });
    }, [lootGeneratorState]);

    const createTable = useCallback(() => {
        const newTables = new Map(lootGeneratorState.tables);
        newTables.set(uuid(), newTable());
        setLootGeneratorStateProperty("tables", newTables);
    }, [lootGeneratorState.tables, setLootGeneratorStateProperty]);

    const updateTable = useCallback(
        (id: string, fieldsToUpdate: TFieldToUpdate[]): boolean => {
            const tablesCopy = structuredClone(lootGeneratorState.tables);
            const table = tablesCopy.get(id);
            if (!table) return false;

            updateFieldsInObject(table, fieldsToUpdate);

            saveCopy("tables", tablesCopy);

            return true;
        },
        [lootGeneratorState.tables, saveCopy],
    );

    const deleteTable = useCallback(
        (id: string): boolean => {
            if (!lootGeneratorState.tables.has(id)) return false;
            const newTables = new Map(lootGeneratorState.tables);
            newTables.delete(id);
            setLootGeneratorStateProperty("tables", newTables);
            return true;
        },
        [lootGeneratorState.tables, setLootGeneratorStateProperty],
    );

    const uploadTableToActive = useCallback(
        (id: string) => {
            const table = lootGeneratorState.tables.get(id);
            if (!table) return;
            setLootGeneratorStateProperty("active", id);
        },
        [lootGeneratorState.tables, setLootGeneratorStateProperty],
    );

    const createItem = useCallback(() => {
        const newItems = new Map(lootGeneratorState.items);
        newItems.set(uuid(), newItem());
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
        (id: string): boolean => {
            if (!lootGeneratorState.items.has(id)) return false;
            const newItems = new Map(lootGeneratorState.items);
            newItems.delete(id);
            setLootGeneratorStateProperty("items", newItems);
            return true;
        },
        [lootGeneratorState.items, setLootGeneratorStateProperty],
    );

    const getEntry = useCallback(
        (
            tableId: string,
            entryKey: string,
        ): {
            entry: Table["loot"][number];
            path: LootTable[];
            index: number;
            copy: LootGeneratorState["tables"];
        } | null => {
            const copy = getCopy("tables") as LootGeneratorState["tables"];
            if (!copy) return null;

            const table = copy.get(tableId);
            if (!table) return null;

            const search = (
                currentEntry: Table["loot"],
                currentPath: LootTable[] = [],
            ): {
                entry: Table["loot"][number];
                path: LootTable[];
                index: number;
                copy: LootGeneratorState["tables"];
            } | null => {
                for (let i = 0; i < currentEntry.length; i++) {
                    const subEntry = currentEntry[i];
                    if (subEntry.key === entryKey) {
                        return {
                            entry: subEntry,
                            path: currentPath,
                            index: i,
                            copy,
                        };
                    }
                }
                return null;
            };

            return search(table.loot as unknown as Table["loot"], []);
        },
        [getCopy],
    );

    const updateEntry = useCallback(
        (tableId: string, entryKey: string, fieldsToUpdate: TFieldToUpdate[]): boolean => {
            const result = getEntry(tableId, entryKey);
            if (!result) return false;
            const { entry, copy } = result;

            updateFieldsInObject(entry, fieldsToUpdate);

            saveCopy("tables", copy);

            return true;
        },
        [saveCopy, getEntry],
    );

    const setTableOnEntry = useCallback(
        (tableId: string, entryKey: string, setTableId: string): boolean => {
            if (!lootGeneratorState.tables.has(setTableId)) return false;

            const result = getEntry(tableId, entryKey);
            if (!result) return false;
            const { entry, copy } = result;

            if (entry.type === "table_id") entry.id = setTableId;
            if (entry.type === "entry" || entry.type === "item_id") {
                const table = createLootTable("table_id", {
                    ...entry,
                    type: "table_id",
                    id: setTableId,
                });
                Object.keys(entry).forEach((key) => delete entry[key as keyof typeof entry]);
                Object.assign(entry, table);
            }

            saveCopy("tables", copy);

            return true;
        },
        [lootGeneratorState.tables, getEntry, saveCopy],
    );

    const setItemOnEntry = useCallback(
        (tableId: string, entryKey: string, setItemId: string) => {
            if (!lootGeneratorState.items.has(setItemId)) return false;

            const result = getEntry(tableId, entryKey);
            if (!result) return false;
            const { entry, copy } = result;

            if (entry.type === "item_id") entry.id = setItemId;
            if (entry.type === "entry" || entry.type === "table_id") {
                const item = createLootItem("item_id", {
                    ...entry,
                    type: "item_id",
                    id: setItemId,
                });
                Object.keys(entry).forEach((key) => delete entry[key as keyof typeof entry]);
                Object.assign(entry, item);
            }

            saveCopy("tables", copy);

            return true;
        },
        [lootGeneratorState.items, getEntry, saveCopy],
    );

    const deleteEntry = useCallback(
        (tableId: string, entryKey: string): boolean => {
            const copy = getCopy("tables") as LootGeneratorState["tables"];
            if (!copy) return false;

            const table = copy.get(tableId);
            if (!table) return false;

            const search = (currentEntry: Table["loot"]): boolean => {
                for (let i = 0; i < currentEntry.length; i++) {
                    const subEntry = currentEntry[i];
                    if (subEntry.key === entryKey) {
                        currentEntry.splice(i, 1);
                        return true;
                    }
                }
                return false;
            };

            if (search(table.loot)) saveCopy("tables", copy);

            return true;
        },
        [getCopy, saveCopy],
    );

    const createSubEntry = useCallback(
        (tableId: string): boolean => {
            const copy = getCopy("tables") as LootGeneratorState["tables"];
            if (!copy) return false;

            const table = copy.get(tableId);
            if (!table) return false;

            let newSubEntry = null;
            newSubEntry = createLootEntry();
            if (!newSubEntry) return false;
            table.loot.push(newSubEntry);

            saveCopy("tables", copy);

            return true;
        },
        [getCopy, saveCopy],
    );

    useEffect(() => {
        setLootGeneratorState((current) => ({ ...structuredClone(current), loot: new Map() }));
    }, [lootGeneratorState.active]);

    return (
        <LootGeneratorContext.Provider
            value={useMemo(
                () => ({
                    lootGeneratorState,
                    setLootGeneratorStateProperty,

                    deleteActive,

                    createTable,
                    updateTable,
                    deleteTable,
                    uploadTableToActive,

                    createItem,
                    updateItem,
                    deleteItem,

                    getEntry,
                    updateEntry,
                    setItemOnEntry,
                    setTableOnEntry,
                    deleteEntry,
                    createSubEntry,
                }),
                [
                    lootGeneratorState,
                    setLootGeneratorStateProperty,

                    deleteActive,

                    createTable,
                    updateTable,
                    deleteTable,
                    uploadTableToActive,

                    createItem,
                    updateItem,
                    deleteItem,

                    getEntry,
                    updateEntry,
                    setItemOnEntry,
                    setTableOnEntry,
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
                        }}
                    />
                </div>
            </div>
        </LootGeneratorContext.Provider>
    );
}
