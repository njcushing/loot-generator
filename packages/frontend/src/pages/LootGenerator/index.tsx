import { createContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import useResizeObserverElement from "@/hooks/useResizeObserverElement";
import { Structural } from "@/components/structural";
import { Generate } from "@/features/Generate";
import { createLootItem, createLootTable } from "@/utils/generateLoot";
import { LootItem, LootTable, Loot, SortOptions, LootTableProps } from "@/utils/types";
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

    findEntryFromEntry: (
        key: string,
        entry: (LootItem | LootTable)[],
    ) => LootTableProps["loot"][number] | LootGeneratorState["presets"][number] | null;
    findEntryFromPlace: (
        key: string,
        place: "active" | "preset",
    ) => LootTableProps["loot"][number] | LootGeneratorState["presets"][number] | null;
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
}

const defaultLootGeneratorContext: LootGeneratorContext = {
    lootGeneratorState: defaultLootGeneratorState,
    setLootGeneratorStateProperty: () => {},

    findEntryFromEntry: () => null,
    findEntryFromPlace: () => null,
    mutateEntryField: () => false,
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

    const getCopyAndSearchOrigin = useCallback(
        (
            place: "active" | "preset",
        ): {
            copy: LootGeneratorState["lootTable"] | LootGeneratorState["presets"];
            searchOrigin: (LootItem | LootTable)[];
        } => {
            let copy;
            if (place === "active") copy = lootGeneratorState.lootTable;
            if (place === "preset") copy = lootGeneratorState.presets;
            copy = JSON.parse(JSON.stringify(copy));

            let searchOrigin;
            if (place === "active") searchOrigin = copy.props.loot;
            if (place === "preset") searchOrigin = copy;

            return { copy, searchOrigin };
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

    const findEntryFromEntry = useCallback(
        (
            key: string,
            entry: LootTableProps["loot"] | LootGeneratorState["presets"],
        ): LootTableProps["loot"][number] | LootGeneratorState["presets"][number] | null => {
            for (let i = 0; i < entry.length; i++) {
                const subEntry = entry[i];
                if (subEntry.type === "preset") {
                    return lootGeneratorState.presetsMap.get(subEntry.key) || null;
                }
                if (subEntry.key === key) {
                    return subEntry;
                }
                if (subEntry.type === "table") {
                    const nestedEntry = findEntryFromEntry(key, subEntry.props.loot);
                    if (nestedEntry) return nestedEntry;
                }
            }
            return null;
        },
        [lootGeneratorState.presetsMap],
    );

    const findEntryFromPlace = useCallback(
        (
            key: string,
            place: "active" | "preset",
        ): LootTableProps["loot"][number] | LootGeneratorState["presets"][number] | null => {
            let start;
            if (place === "active") start = lootGeneratorState.lootTable.props.loot;
            if (place === "preset") start = lootGeneratorState.presets;
            if (!start) return null;

            return findEntryFromEntry(key, start);
        },
        [lootGeneratorState.lootTable, lootGeneratorState.presets, findEntryFromEntry],
    );

    const mutateEntryField = useCallback(
        (
            key: string,
            fieldPaths: string[][],
            value: unknown,
            place: "active" | "preset",
        ): boolean => {
            const { copy, searchOrigin } = getCopyAndSearchOrigin(place);

            const entry = findEntryFromEntry(key, searchOrigin);
            if (!entry) return false;
            if (entry.type === "preset") return false;

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
        [getCopyAndSearchOrigin, saveCopy, findEntryFromEntry],
    );

    const deleteEntry = useCallback(
        (key: string, place: "active" | "preset"): boolean => {
            const { copy, searchOrigin } = getCopyAndSearchOrigin(place);

            const search = (entry: LootTableProps["loot"]): boolean => {
                let deleted = false;
                for (let i = 0; i < entry.length; i++) {
                    const subEntry = entry[i];
                    if (subEntry.key === key) {
                        entry.splice(i, 1);
                        deleted = true;
                    }
                    if (!deleted && subEntry.type === "table") {
                        deleted = search(subEntry.props.loot);
                    }
                }
                return deleted;
            };
            const deleted = search(searchOrigin);

            saveCopy(place, copy);

            return deleted;
        },
        [getCopyAndSearchOrigin, saveCopy],
    );

    const createSubEntry = useCallback(
        (
            key: string,
            type: LootItem["type"] | LootTable["type"],
            place: "active" | "preset",
        ): boolean => {
            const { copy, searchOrigin } = getCopyAndSearchOrigin(place);

            const entry = findEntryFromEntry(key, searchOrigin);
            if (!entry || entry.type !== "table") return false;

            let newSubEntry = null;
            if (type === "table") newSubEntry = createLootTable();
            if (type === "item") newSubEntry = createLootItem();
            if (!newSubEntry) return false;
            entry.props.loot.push(newSubEntry);

            saveCopy(place, copy);

            return true;
        },
        [getCopyAndSearchOrigin, saveCopy, findEntryFromEntry],
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

                    findEntryFromEntry,
                    findEntryFromPlace,
                    mutateEntryField,
                    deleteEntry,
                    createSubEntry,
                }),
                [
                    lootGeneratorState,
                    setLootGeneratorStateProperty,

                    findEntryFromEntry,
                    findEntryFromPlace,
                    mutateEntryField,
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
