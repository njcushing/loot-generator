import { LootTable, LootItem } from "@/utils/types";

export type MenuStates = Map<string, "collapsed" | "expanded">;

export const update = (
    entries: (LootTable | LootItem)[],
    previousStates: MenuStates,
    newStates: MenuStates,
): MenuStates => {
    let mutableNewStates = new Map(newStates);

    entries.forEach((entry) => {
        const defaultState = entry.type === "item" ? "collapsed" : "expanded";
        mutableNewStates.set(
            entry.key,
            !previousStates.has(entry.key) ? defaultState : previousStates.get(entry.key)!,
        );

        if (entry.type === "table") {
            [...entry.loot.keys()].forEach((key) => {
                const subEntry = entry.loot[key];
                mutableNewStates = update([subEntry], previousStates, mutableNewStates);
            });
        }
    });

    return mutableNewStates;
};
