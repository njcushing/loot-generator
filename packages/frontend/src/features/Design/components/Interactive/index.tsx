import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { TabSelector } from "@/components/structural/components/TabSelector";
import { Active } from "./components/Active";
import { Presets } from "./components/Presets";
import * as manageMenuStates from "./utils/manageMenuStates";

interface InteractiveContext {
    menuType: "active" | "preset";
    menuStates: manageMenuStates.MenuStates;
    setMenuStates: React.Dispatch<React.SetStateAction<manageMenuStates.MenuStates>>;
}

const defaultInteractiveContext: InteractiveContext = {
    menuType: "active",
    menuStates: new Map(),
    setMenuStates: () => {},
};

export const InteractiveContext = createContext<InteractiveContext>(defaultInteractiveContext);

export function Interactive() {
    const { lootGeneratorState } = useContext(LootGeneratorContext);

    const [activeMenuStates, setActiveMenuStates] = useState<Map<string, "collapsed" | "expanded">>(
        () => {
            return manageMenuStates.update([lootGeneratorState.lootTable], new Map(), new Map());
        },
    );
    useEffect(() => {
        setActiveMenuStates((currentActiveMenuStates) => {
            return manageMenuStates.update(
                [lootGeneratorState.lootTable],
                currentActiveMenuStates,
                new Map(),
            );
        });
    }, [lootGeneratorState.lootTable]);

    const [presetMenuStates, setPresetMenuStates] = useState<Map<string, "collapsed" | "expanded">>(
        () => {
            return manageMenuStates.update(lootGeneratorState.presets, new Map(), new Map());
        },
    );
    useEffect(() => {
        setPresetMenuStates((currentPresetMenuStates) => {
            return manageMenuStates.update(
                lootGeneratorState.presets,
                currentPresetMenuStates,
                new Map(),
            );
        });
    }, [lootGeneratorState.presets]);

    return (
        <TabSelector
            tabs={{
                active: {
                    name: "Active",
                    content: (
                        <InteractiveContext.Provider
                            value={useMemo(
                                () => ({
                                    menuType: "active",
                                    menuStates: activeMenuStates,
                                    setMenuStates: setActiveMenuStates,
                                }),
                                [activeMenuStates, setActiveMenuStates],
                            )}
                        >
                            <Active />
                        </InteractiveContext.Provider>
                    ),
                    position: "left",
                },
                presets: {
                    name: "Presets",
                    content: (
                        <InteractiveContext.Provider
                            value={useMemo(
                                () => ({
                                    menuType: "preset",
                                    menuStates: presetMenuStates,
                                    setMenuStates: setPresetMenuStates,
                                }),
                                [presetMenuStates, setPresetMenuStates],
                            )}
                        >
                            <Presets />
                        </InteractiveContext.Provider>
                    ),
                    position: "left",
                },
            }}
        />
    );
}
