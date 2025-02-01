import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
import { MessagesContext } from "@/features/Messages";
import { useResizeObserverElement } from "@/hooks/useResizeObserverElement";
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
import { Design } from "@/features/Design";
import { updateFieldsInObject, TFieldToUpdate } from "@/utils/mutateFieldsInObject";
import { v4 as uuid } from "uuid";
import { sortOptions } from "@/utils/sortOptions";
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
        return null;
    }
};

const saveState = (state: LootGeneratorState) => {
    localStorage.setItem(`${import.meta.env.LOCALSTORAGE_PREFIX}-session`, JSON.stringify(state));
};

export interface ILootGeneratorContext {
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

const defaultLootGeneratorContext: ILootGeneratorContext = {
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

export const LootGeneratorContext = createContext<ILootGeneratorContext>(
    defaultLootGeneratorContext,
);

export type TLootGenerator = {
    children?: JSX.Element | null | (JSX.Element | null)[];
};

export function LootGenerator({ children }: TLootGenerator) {
    const { displayMessage } = useContext(MessagesContext);

    const [loadStateSuccess, setLoadStateSuccess] = useState<boolean>(false);
    const [loadStateMessage, setLoadStateMessage] = useState<string>("");
    const [lootGeneratorState, setLootGeneratorState] = useState<LootGeneratorState>(() => {
        const loadedState = loadState();
        if (loadedState) setLoadStateSuccess(true);
        return loadedState || defaultLootGeneratorState;
    });
    useEffect(() => {
        if (!loadStateSuccess) {
            setLoadStateMessage("Could not load session state");
        } else {
            setLoadStateMessage("Successfully loaded session state");
        }
    }, [loadStateSuccess]);
    useEffect(() => {
        if (loadStateMessage.length > 0) {
            displayMessage(loadStateMessage);
            setLoadStateMessage("");
        }
    }, [displayMessage, loadStateMessage]);

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

            setLootGeneratorStateProperty("tables", tablesCopy);

            return true;
        },
        [lootGeneratorState.tables, setLootGeneratorStateProperty],
    );

    const deleteTable = useCallback(
        (id: string): boolean => {
            if (!lootGeneratorState.tables[id]) return false;
            const newTables = structuredClone(lootGeneratorState.tables);
            delete newTables[id];
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
            const copy = structuredClone(lootGeneratorState.tables);

            const table = copy[tableId];
            if (!table) return false;

            let newSubEntry = null;
            newSubEntry = createLootEntry();
            if (!newSubEntry) return false;
            table.loot.push(newSubEntry);

            setLootGeneratorStateProperty("tables", copy);

            return true;
        },
        [lootGeneratorState.tables, setLootGeneratorStateProperty],
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

            setLootGeneratorStateProperty("items", itemsCopy);

            return true;
        },
        [lootGeneratorState.items, setLootGeneratorStateProperty],
    );

    const deleteItem = useCallback(
        (id: string): boolean => {
            if (!lootGeneratorState.items[id]) return false;
            const newItems = structuredClone(lootGeneratorState.items);
            delete newItems[id];
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
            const copy = structuredClone(lootGeneratorState.tables);

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
                        const found = search(subEntry.loot, [...currentPath, subEntry]);
                        if (found) return found;
                    }
                }
                return null;
            };

            return search(table.loot as unknown as Table["loot"], [table]);
        },
        [lootGeneratorState.tables],
    );

    const updateEntry = useCallback(
        (tableId: string, entryKey: string, fieldsToUpdate: TFieldToUpdate[]): boolean => {
            const result = getEntry(tableId, entryKey);
            if (!result) return false;
            const { entry, copy } = result;

            updateFieldsInObject(entry, fieldsToUpdate);

            setLootGeneratorStateProperty("tables", copy);

            return true;
        },
        [setLootGeneratorStateProperty, getEntry],
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

            setLootGeneratorStateProperty("tables", copy);

            return true;
        },
        [setLootGeneratorStateProperty, getEntry],
    );

    const setIdOnEntry = useCallback(
        (tableId: string, entryKey: string, setId: string): boolean => {
            let type: "table" | "item" | undefined;
            if (lootGeneratorState.tables[setId]) type = "table";
            if (lootGeneratorState.items[setId]) type = "item";
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

            setLootGeneratorStateProperty("tables", copy);

            return true;
        },
        [
            lootGeneratorState.tables,
            lootGeneratorState.items,
            setLootGeneratorStateProperty,
            getEntry,
        ],
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

            setLootGeneratorStateProperty("tables", copy);

            return true;
        },
        [setLootGeneratorStateProperty, getEntry],
    );

    const deleteEntry = useCallback(
        (tableId: string, entryKey: string): boolean => {
            const copy = structuredClone(lootGeneratorState.tables);

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

            if (search(table.loot)) setLootGeneratorStateProperty("tables", copy);

            return true;
        },
        [lootGeneratorState.tables, setLootGeneratorStateProperty],
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

            setLootGeneratorStateProperty("tables", copy);

            return true;
        },
        [setLootGeneratorStateProperty, getEntry],
    );

    useEffect(() => {
        saveState(lootGeneratorState);
        return () => saveState(lootGeneratorState);
    }, [lootGeneratorState]);

    const pageContent = useMemo(() => {
        if (layout === "wide") {
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
        }
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
    }, [layout]);

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
                {children}
            </div>
        </LootGeneratorContext.Provider>
    );
}
