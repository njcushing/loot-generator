import { createContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import { z } from "zod";
import { itemsSchema, tablesSchema, lootSchema, sortOptionsSchema } from "@/utils/types/zod";
import { PopUpModal } from "@/components/ui/components/PopUpModal";
import { Design } from "@/features/Design";
import { updateFieldsInObject, TFieldToUpdate } from "@/utils/mutateFieldsInObject";
import { v4 as uuid } from "uuid";
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

const lootGeneratorStateSchema = z.object({
    loot: lootSchema,
    active: z.string().nullable(),
    tables: tablesSchema,
    items: itemsSchema,
    quantitySelected: z.number(),
    quantityOptionSelected: z.number(),
    customQuantity: z.number(),
    sortOptions: z.object({
        selected: z.string(),
        options: sortOptionsSchema,
    }),
});

const defaultLootGeneratorState: LootGeneratorState = {
    loot: {},
    active: null,
    tables: {},
    items: {},
    quantitySelected: 1,
    quantityOptionSelected: 0,
    customQuantity: 50,
    sortOptions: {
        selected: "quantity",
        options: structuredClone(sortOptions),
    },
};

const loadState = (): LootGeneratorState | null => {
    const state = localStorage.getItem(`${import.meta.env.LOCALSTORAGE_PREFIX}-session`);
    if (!state) return null;

    try {
        const parsed = JSON.parse(state);
        const validated = lootGeneratorStateSchema.parse(parsed);
        return validated as LootGeneratorState;
    } catch (error) {
        /* eslint-disable-next-line no-console */
        console.error("Unable to load session state (invalid):", error);
        return defaultLootGeneratorState;
    }
};

const saveState = (state: LootGeneratorState) => {
    localStorage.setItem(`${import.meta.env.LOCALSTORAGE_PREFIX}-session`, JSON.stringify(state));
};

interface LootGeneratorContext {
    displayPopUpMessage: (text: string) => void;

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
    createEntry: (tableId: string) => boolean;

    createItem: () => void;
    updateItem: (id: string, fieldsToMutate: TFieldToUpdate[]) => boolean;
    deleteItem: (id: string) => boolean;

    getEntry: (
        tableId: string,
        entryKey: string,
    ) => { entry: Table["loot"][number]; path: (Table | LootTable)[]; index: number } | null;
    updateEntry: (tableId: string, entryKey: string, fieldsToMutate: TFieldToUpdate[]) => boolean;
    setTypeOnEntry: (tableId: string, entryKey: string, type: "table" | "item") => boolean;
    setIdOnEntry: (tableId: string, entryKey: string, setId: string) => boolean;
    removeIdFromEntry: (tableId: string, entryKey: string) => boolean;
    deleteEntry: (tableId: string, entryKey: string) => boolean;
    createSubEntry: (tableId: string, entryKey: string) => boolean;
}

const defaultLootGeneratorContext: LootGeneratorContext = {
    displayPopUpMessage: () => {},

    lootGeneratorState: defaultLootGeneratorState,
    setLootGeneratorStateProperty: () => {},

    deleteActive: () => {},

    createTable: () => {},
    updateTable: () => false,
    deleteTable: () => false,
    uploadTableToActive: () => {},
    createEntry: () => false,

    createItem: () => {},
    updateItem: () => false,
    deleteItem: () => false,

    getEntry: () => null,
    updateEntry: () => false,
    setTypeOnEntry: () => false,
    setIdOnEntry: () => false,
    removeIdFromEntry: () => false,
    deleteEntry: () => false,
    createSubEntry: () => false,
};

export const LootGeneratorContext = createContext<LootGeneratorContext>(
    defaultLootGeneratorContext,
);

export function LootGenerator() {
    const messages = useRef<{ [key: string]: JSX.Element }>({});
    const [messagesMutated, setMessagesMutated] = useState<string>("");
    const displayPopUpMessage = useCallback((text: string) => {
        const id = uuid();
        const callback = () => {
            setMessagesMutated(id);
            delete messages.current[id as keyof typeof messages.current];
        };
        const element = (
            <PopUpModal
                text={text}
                timer={{ duration: 3000, callback }}
                onClose={callback}
                key={id}
            />
        );
        messages.current[id] = element;
    }, []);

    const [lootGeneratorState, setLootGeneratorState] = useState<LootGeneratorState>(() => {
        const loadedState = loadState();
        if (!loadedState) {
            displayPopUpMessage("Could not load session state");
            return defaultLootGeneratorState;
        }
        displayPopUpMessage("Successfully loaded session state");
        return loadedState;
    });

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
        const newTables = structuredClone(lootGeneratorState.tables);
        newTables[uuid()] = newTable();
        setLootGeneratorStateProperty("tables", newTables);
    }, [lootGeneratorState.tables, setLootGeneratorStateProperty]);

    const updateTable = useCallback(
        (id: string, fieldsToUpdate: TFieldToUpdate[]): boolean => {
            const tablesCopy = structuredClone(lootGeneratorState.tables);
            const table = tablesCopy[id];
            if (!table) return false;

            updateFieldsInObject(table, fieldsToUpdate);

            saveCopy("tables", tablesCopy);

            return true;
        },
        [lootGeneratorState.tables, saveCopy],
    );

    const deleteTable = useCallback(
        (id: string): boolean => {
            if (!lootGeneratorState.tables[id]) return false;
            const newTables = structuredClone(lootGeneratorState.tables);
            delete newTables.id;
            setLootGeneratorStateProperty("tables", newTables);
            return true;
        },
        [lootGeneratorState.tables, setLootGeneratorStateProperty],
    );

    const uploadTableToActive = useCallback(
        (id: string) => {
            const table = lootGeneratorState.tables[id];
            if (!table) return;
            setLootGeneratorStateProperty("active", id);
        },
        [lootGeneratorState.tables, setLootGeneratorStateProperty],
    );

    const createEntry = useCallback(
        (tableId: string): boolean => {
            const copy = getCopy("tables") as LootGeneratorState["tables"];
            if (!copy) return false;

            const table = copy[tableId];
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

    const createItem = useCallback(() => {
        const newItems = structuredClone(lootGeneratorState.items);
        newItems[uuid()] = newItem();
        setLootGeneratorStateProperty("items", newItems);
    }, [lootGeneratorState.items, setLootGeneratorStateProperty]);

    const updateItem = useCallback(
        (id: string, fieldsToUpdate: TFieldToUpdate[]): boolean => {
            const itemsCopy = structuredClone(lootGeneratorState.items);
            const item = itemsCopy[id];
            if (!item) return false;

            updateFieldsInObject(item, fieldsToUpdate);

            saveCopy("items", itemsCopy);

            return true;
        },
        [lootGeneratorState.items, saveCopy],
    );

    const deleteItem = useCallback(
        (id: string): boolean => {
            if (!lootGeneratorState.items[id]) return false;
            const newItems = structuredClone(lootGeneratorState.items);
            delete newItems.id;
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
            path: (Table | LootTable)[];
            index: number;
            copy: LootGeneratorState["tables"];
        } | null => {
            const copy = getCopy("tables") as LootGeneratorState["tables"];
            if (!copy) return null;

            const table = copy[tableId];
            if (!table) return null;

            const search = (
                currentEntry: Table["loot"],
                currentPath: (Table | LootTable)[] = [],
            ): {
                entry: Table["loot"][number];
                path: (Table | LootTable)[];
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
                    if (subEntry.type === "table_noid") {
                        return search(subEntry.loot, [...currentPath, subEntry]);
                    }
                }
                return null;
            };

            return search(table.loot as unknown as Table["loot"], [table]);
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

    const setTypeOnEntry = useCallback(
        (tableId: string, entryKey: string, type: "table" | "item"): boolean => {
            const result = getEntry(tableId, entryKey);
            if (!result) return false;
            const { entry, copy } = result;

            let newEntry;
            if (type === "table") {
                newEntry = createLootTable("table_noid", {
                    ...entry,
                    id: undefined,
                    type: "table_noid",
                });
            }
            if (type === "item") {
                newEntry = createLootItem("item_noid", {
                    ...entry,
                    id: undefined,
                    type: "item_noid",
                });
            }

            Object.keys(entry).forEach((key) => delete entry[key as keyof typeof entry]);
            Object.assign(entry, newEntry);

            saveCopy("tables", copy);

            return true;
        },
        [saveCopy, getEntry],
    );

    const setIdOnEntry = useCallback(
        (tableId: string, entryKey: string, setId: string): boolean => {
            let type: "table" | "item" | null = null;
            if (lootGeneratorState.tables[setId]) type = "table";
            if (Object.prototype.hasOwnProperty.call(lootGeneratorState.items, setId)) {
                type = "item";
            }
            if (!type) return false;

            const result = getEntry(tableId, entryKey);
            if (!result) return false;
            const { entry, copy } = result;

            let newEntry;
            if (type === "table") {
                newEntry = createLootTable("table_id", {
                    ...entry,
                    type: "table_id",
                    id: setId,
                });
            }
            if (type === "item") {
                newEntry = createLootItem("item_id", {
                    ...entry,
                    type: "item_id",
                    id: setId,
                });
            }

            Object.keys(entry).forEach((key) => delete entry[key as keyof typeof entry]);
            Object.assign(entry, newEntry);

            saveCopy("tables", copy);

            return true;
        },
        [lootGeneratorState.tables, lootGeneratorState.items, saveCopy, getEntry],
    );

    const removeIdFromEntry = useCallback(
        (tableId: string, entryKey: string): boolean => {
            const result = getEntry(tableId, entryKey);
            if (!result) return false;
            const { entry, copy } = result;

            if (entry.type !== "table_id" && entry.type !== "item_id") return false;

            let newEntry;
            if (entry.type === "table_id") {
                newEntry = createLootTable("table_noid", {
                    ...entry,
                    id: undefined,
                    type: "table_noid",
                });
            }
            if (entry.type === "item_id") {
                newEntry = createLootItem("item_noid", {
                    ...entry,
                    id: undefined,
                    type: "item_noid",
                });
            }

            Object.keys(entry).forEach((key) => delete entry[key as keyof typeof entry]);
            Object.assign(entry, newEntry);

            saveCopy("tables", copy);

            return true;
        },
        [saveCopy, getEntry],
    );

    const deleteEntry = useCallback(
        (tableId: string, entryKey: string): boolean => {
            const copy = getCopy("tables") as LootGeneratorState["tables"];
            if (!copy) return false;

            const table = copy[tableId];
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
        (tableId: string, entryKey: string): boolean => {
            const result = getEntry(tableId, entryKey);
            if (!result) return false;
            const { entry, copy } = result;

            if (entry.type !== "table_noid") return false;

            let newSubEntry = null;
            newSubEntry = createLootEntry();
            if (!newSubEntry) return false;
            entry.loot.push(newSubEntry);

            saveCopy("tables", copy);

            return true;
        },
        [saveCopy, getEntry],
    );

    useEffect(() => {
        saveState(lootGeneratorState);
        return () => saveState(lootGeneratorState);
    }, [lootGeneratorState]);

    const pageContent = useMemo(() => {
        switch (layout) {
            case "wide":
                return (
                    <>
                        <div className={styles["left-panel"]}>
                            <div className={styles["info"]}>
                                <h1 className={styles["title"]}>Loot Generator</h1>
                                <p className={styles["name"]}>by njcushing</p>
                                <p className={styles["version"]}>{`v${version}`}</p>
                            </div>
                            <Structural.TabSelector
                                tabs={{
                                    design: {
                                        name: "Design",
                                        content: <Design />,
                                        position: "left",
                                    },
                                    about: {
                                        name: "About",
                                        content: <p>About</p>,
                                        position: "right",
                                    },
                                }}
                            />
                        </div>
                        <div className={styles["right-panel"]}>
                            <Structural.TabSelector
                                tabs={{
                                    generate: {
                                        name: "Generate",
                                        content: <Generate />,
                                        position: "left",
                                    },
                                }}
                            />
                        </div>
                    </>
                );
            case "thin":
                return (
                    <div className={styles["main-panel"]}>
                        <div className={styles["info"]}>
                            <h1 className={styles["title"]}>Loot Generator</h1>
                            <p className={styles["name"]}>by njcushing</p>
                            <p className={styles["version"]}>{`v${version}`}</p>
                        </div>
                        <Structural.TabSelector
                            tabs={{
                                design: {
                                    name: "Design",
                                    content: <Design />,
                                    position: "left",
                                },
                                generate: {
                                    name: "Generate",
                                    content: <Generate />,
                                    position: "left",
                                },
                                about: {
                                    name: "About",
                                    content: <p>About</p>,
                                    position: "right",
                                },
                            }}
                        />
                    </div>
                );
            default:
        }
        return null;
    }, [layout]);

    const messageElements = useMemo(() => {
        return Object.keys(messages.current).length > 0 ? (
            <div className={styles["messages"]}>
                {Object.values(messages.current).map((message) => message)}
            </div>
        ) : null;
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [messagesMutated]);

    return (
        <LootGeneratorContext.Provider
            value={useMemo(
                () => ({
                    displayPopUpMessage,

                    lootGeneratorState,
                    setLootGeneratorStateProperty,

                    deleteActive,

                    createTable,
                    updateTable,
                    deleteTable,
                    uploadTableToActive,
                    createEntry,

                    createItem,
                    updateItem,
                    deleteItem,

                    getEntry,
                    updateEntry,
                    setTypeOnEntry,
                    setIdOnEntry,
                    removeIdFromEntry,
                    deleteEntry,
                    createSubEntry,
                }),
                [
                    displayPopUpMessage,

                    lootGeneratorState,
                    setLootGeneratorStateProperty,

                    deleteActive,

                    createTable,
                    updateTable,
                    deleteTable,
                    uploadTableToActive,
                    createEntry,

                    createItem,
                    updateItem,
                    deleteItem,

                    getEntry,
                    updateEntry,
                    setTypeOnEntry,
                    setIdOnEntry,
                    removeIdFromEntry,
                    deleteEntry,
                    createSubEntry,
                ],
            )}
        >
            <div className={`${styles["page"]} ${styles[`${layout}`]}`} ref={containerRef}>
                {pageContent}
                {messageElements}
            </div>
        </LootGeneratorContext.Provider>
    );
}
