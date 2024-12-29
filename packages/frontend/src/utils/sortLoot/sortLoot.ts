import { LootGeneratorState } from "@/pages/LootGenerator";
import { Items, Loot } from "../types";

export const sortLoot = (
    loot: Loot,
    items: Items,
    sortOptions: LootGeneratorState["sortOptions"],
): Loot => {
    const { selected, options } = sortOptions;
    const criterion = options.get(selected);
    if (!criterion) return loot;

    let mutableLoot = new Map([...loot.entries()]);

    switch (selected) {
        case "name": {
            if (!criterion.has("order")) break;
            const order = criterion.get("order")!.selected;
            // Sort by 'name' as a priority, and fall back on key in its absence
            mutableLoot = new Map(
                [...mutableLoot.entries()].sort((a, b) => {
                    const [keyA] = a;
                    const [keyB] = b;

                    const nameA = items.get(keyA)?.name || keyA;
                    const nameB = items.get(keyB)?.name || keyB;

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
                    const [, quantityA] = a;
                    const [, quantityB] = b;

                    return (quantityA - quantityB) * (order === "descending" ? -1 : 1);
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
                    const [keyA, quantityA] = a;
                    const [keyB, quantityB] = b;

                    let valueA = items.get(keyA)?.value || 1;
                    let valueB = items.get(keyB)?.value || 1;

                    if (summation === "total") {
                        valueA *= quantityA;
                        valueB *= quantityB;
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
