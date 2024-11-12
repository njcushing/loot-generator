import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { TabSelector } from "@/components/structural/components/TabSelector";
import { Active } from "./components/Active";
import * as manageMenuStates from "./utils/manageMenuStates";

interface InteractiveContext {
    menuStates: manageMenuStates.MenuStates;
    setMenuStates: React.Dispatch<React.SetStateAction<manageMenuStates.MenuStates>>;
}

const defaultInteractiveContext: InteractiveContext = {
    menuStates: new Map(),
    setMenuStates: () => {},
};

export const InteractiveContext = createContext<InteractiveContext>(defaultInteractiveContext);

export function Interactive() {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    const [menuStates, setMenuStates] = useState<Map<string, "collapsed" | "expanded">>(() => {
        return manageMenuStates.update(lootGeneratorState.lootTable, new Map(), new Map());
    });
    useEffect(() => {
        setMenuStates((currentMenuStates) => {
            return manageMenuStates.update(
                lootGeneratorState.lootTable,
                currentMenuStates,
                new Map(),
            );
        });
    }, [lootGeneratorState.lootTable]);

    return (
        <TabSelector
            tabs={{
                active: {
                    name: "Active",
                    content: (
                        <InteractiveContext.Provider
                            value={useMemo(
                                () => ({
                                    menuStates,
                                    setMenuStates,
                                }),
                                [menuStates, setMenuStates],
                            )}
                        >
                            <Active />
                        </InteractiveContext.Provider>
                    ),
                    position: "left",
                },
            }}
        />
    );
}
