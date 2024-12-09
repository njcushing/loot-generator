import { useContext, useMemo } from "react";
import { LootGeneratorContext } from "@/pages/LootGenerator";
import { ToggleBar, TToggleBar } from "@/components/buttons/components/ToggleBar";
import { InteractiveContext } from "../..";
import styles from "./index.module.css";

export type TItem = {
    id: string;
};

export function Item({ id }: TItem) {
    const { lootGeneratorState } = useContext(LootGeneratorContext);
    const { menuStates, setMenuStates } = useContext(InteractiveContext);

    const item = useMemo(() => lootGeneratorState.items.get(id), [id, lootGeneratorState.items]);

    const toggleBarOptions = useMemo((): TToggleBar["options"] => {
        const options: TToggleBar["options"] = [];
        options.push({
            symbol: "Delete",
            colours: { hover: "rgb(255, 120, 120)", focus: "rgb(255, 83, 83)" },
        });
        return options;
    }, []);

    if (!item) return null;

    const { name } = item;

    return (
        <ToggleBar
            name={name || "Unnamed Item"}
            defaultState={menuStates.get(id) === "expanded"}
            options={toggleBarOptions}
            onClick={() => {
                setMenuStates((currentMenuStates) => {
                    const newMenuStates = new Map(currentMenuStates);
                    const currentState = newMenuStates.get(id);
                    newMenuStates.set(id, currentState === "collapsed" ? "expanded" : "collapsed");
                    return newMenuStates;
                });
            }}
            style={{
                colours: {
                    normal: "rgb(245, 158, 240)",
                    hover: "rgb(235, 139, 230)",
                    focus: "rgb(226, 125, 221)",
                },
                nameFontStyle: name ? "normal" : "italic",
            }}
        />
    );
}
