import { LootGeneratorState } from "@/pages/LootGenerator";
import { Loot } from "../types";

export const sortLoot = (
    loot: Loot,
    sortOptions: LootGeneratorState["sortOptions"],
): Map<string, Loot[string]> => {
    const { selected, options } = sortOptions;
    const criterion = options.get(selected);

    let mutableLoot = new Map([...Object.entries(loot)]);

    if (!criterion) return mutableLoot;

    switch (selected) {
        case "name": {
            if (!criterion.has("order")) break;
            const order = criterion.get("order")!.selected;
            // Sort by 'name' as a priority, and fall back on key in its absence
            mutableLoot = new Map(
                [...mutableLoot.entries()].sort((a, b) => {
                    const [keyA, itemA] = a;
                    const [keyB, itemB] = b;

                    const nameA = itemA.props.name || keyA;
                    const nameB = itemB.props.name || keyB;

                    let result;

                    if (nameA && nameB) result = nameA.localeCompare(nameB);
                    else if (nameA) result = nameA.localeCompare(keyB);
                    else if (nameB) result = keyA.localeCompare(nameB);
                    else result = keyA.localeCompare(keyB);

                    return result * (order === "descending" ? -1 : 1);
                }),
            );
            break;
        }
        case "quantity": {
            if (!criterion.has("order")) break;
            const order = criterion.get("order")!.selected;
            mutableLoot = new Map(
                [...mutableLoot.entries()].sort((a, b) => {
                    const [, itemA] = a;
                    const [, itemB] = b;

                    return (itemA.quantity - itemB.quantity) * (order === "descending" ? -1 : 1);
                }),
            );
            break;
        }
        case "value": {
            if (!criterion.has("order")) break;
            if (!criterion.has("summation")) break;
            const order = criterion.get("order")!.selected;
            const summation = criterion.get("summation")!.selected;
            mutableLoot = new Map(
                [...mutableLoot.entries()].sort((a, b) => {
                    const [, itemA] = a;
                    const [, itemB] = b;

                    let valueA = itemA.props.value || 1;
                    let valueB = itemB.props.value || 1;

                    if (summation === "total") {
                        valueA *= itemA.quantity;
                        valueB *= itemB.quantity;
                    }

                    return (valueA - valueB) * (order === "descending" ? -1 : 1);
                }),
            );
            break;
        }
        default:
    }

    return mutableLoot;
};
