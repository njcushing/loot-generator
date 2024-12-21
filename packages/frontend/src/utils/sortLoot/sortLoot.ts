import { Items, Loot, SortOptions } from "../types";

export const sortLoot = (loot: Loot, items: Items, sorts: SortOptions): Loot => {
    let mutableLoot = new Map([...loot.entries()]);

    [...sorts.keys()].forEach((criteria) => {
        const order = sorts.get(criteria);
        switch (criteria) {
            case "name":
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
            case "quantity":
                mutableLoot = new Map(
                    [...mutableLoot.entries()].sort((a, b) => {
                        const [, quantityA] = a;
                        const [, quantityB] = b;

                        return (quantityA - quantityB) * (order === "descending" ? -1 : 1);
                    }),
                );
                break;
            case "value":
                mutableLoot = new Map(
                    [...mutableLoot.entries()].sort((a, b) => {
                        const [keyA] = a;
                        const [keyB] = b;

                        const valueA = items.get(keyA)?.value || 1;
                        const valueB = items.get(keyB)?.value || 1;

                        return (valueA - valueB) * (order === "descending" ? -1 : 1);
                    }),
                );
                break;
            default:
        }
    });

    return mutableLoot;
};
