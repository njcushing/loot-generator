import { createContext, useMemo } from "react";
import { TabSelector } from "@/components/structural/components/TabSelector";
import { Active } from "./components/Active";
import { Tables } from "./components/Tables";
import { Items } from "./components/Items";

interface InteractiveContext {
    menuType: "active" | "tables" | "items";
}

const defaultInteractiveContext: InteractiveContext = {
    menuType: "active",
};

export const InteractiveContext = createContext<InteractiveContext>(defaultInteractiveContext);

export function Interactive() {
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
                                }),
                                [],
                            )}
                        >
                            <Active />
                        </InteractiveContext.Provider>
                    ),
                    position: "left",
                },
                tables: {
                    name: "Tables",
                    content: (
                        <InteractiveContext.Provider
                            value={useMemo(
                                () => ({
                                    menuType: "tables",
                                }),
                                [],
                            )}
                        >
                            <Tables />
                        </InteractiveContext.Provider>
                    ),
                    position: "left",
                },
                items: {
                    name: "Items",
                    content: (
                        <InteractiveContext.Provider
                            value={useMemo(
                                () => ({
                                    menuType: "items",
                                }),
                                [],
                            )}
                        >
                            <Items />
                        </InteractiveContext.Provider>
                    ),
                    position: "left",
                },
            }}
        />
    );
}
