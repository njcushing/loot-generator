import "@testing-library/jest-dom";
import { LootGeneratorState } from "@/pages/LootGenerator";
import { sortLoot } from ".";
import { Loot } from "../types";

const mockLoot: Loot = {
    apple: {
        props: {
            type: "item_id",
            key: "apple-key",
            id: "apple",
            quantity: { min: 1, max: 1 },
            criteria: { weight: 1, rolls: {} },
            name: "Apple",
            value: 5,
            custom: {},
        },
        quantity: 8,
    },
    cherry: {
        props: {
            type: "item_id",
            key: "cherry-key",
            id: "cherry",
            criteria: { weight: 1, rolls: {} },
            quantity: { min: 1, max: 1 },
            name: "Cherry",
            value: 7,
            custom: {},
        },
        quantity: 5,
    },
    banana: {
        props: {
            type: "item_id",
            key: "banana-key",
            id: "banana",
            criteria: { weight: 1, rolls: {} },
            quantity: { min: 1, max: 1 },
            name: "Banana",
            value: 6,
            custom: {},
        },
        quantity: 10,
    },
};
const mockSortOptions: LootGeneratorState["sortOptions"] = {
    selected: "quantity",
    options: [
        {
            name: "name",
            criteria: [
                { name: "order", selected: "descending", values: ["ascending", "descending"] },
            ],
        },
        {
            name: "quantity",
            criteria: [
                { name: "order", selected: "descending", values: ["ascending", "descending"] },
            ],
        },
        {
            name: "value",
            criteria: [
                { name: "order", selected: "ascending", values: ["ascending", "descending"] },
                { name: "summation", selected: "total", values: ["individual", "total"] },
            ],
        },
    ],
};

const setOptionSelected = (
    sortOptions: LootGeneratorState["sortOptions"],
    option: LootGeneratorState["sortOptions"]["options"][number]["name"],
    criterion: LootGeneratorState["sortOptions"]["options"][number]["criteria"][number]["name"],
    value: LootGeneratorState["sortOptions"]["options"][number]["criteria"][number]["values"][number],
) => {
    const selectedOption = sortOptions.options.find((opt) => opt.name === option);
    const selectedCriterion = selectedOption!.criteria.find((crt) => crt.name === criterion);
    selectedCriterion!.selected = value;
};

describe("The sortLoot function...", () => {
    test("Should return the entries in the first argument object in a Map", async () => {
        const result = sortLoot(mockLoot, mockSortOptions);
        expect(result instanceof Map).toBeTruthy();
    });

    describe("Should, if the selected sort option is 'name'...", () => {
        test("And, if the 'order' criterion's selected value is 'ascending', sort the loot accordingly", async () => {
            const adjustedSortOptions = structuredClone(mockSortOptions);
            adjustedSortOptions.selected = "name";
            setOptionSelected(adjustedSortOptions, "name", "order", "ascending");

            const result = sortLoot(mockLoot, adjustedSortOptions);
            const correctResult = new Map(
                ["apple", "banana", "cherry"].map((key) => [key, mockLoot[key]]),
            );
            const resultValues = [...result.values()];
            const correctResultValues = [...correctResult.values()];

            resultValues.forEach((value, i) => expect(value).toStrictEqual(correctResultValues[i]));
        });
        test("And, if the 'order' criterion's selected value is 'descending', sort the loot accordingly", async () => {
            const adjustedSortOptions = structuredClone(mockSortOptions);
            adjustedSortOptions.selected = "name";
            setOptionSelected(adjustedSortOptions, "name", "order", "descending");

            const result = sortLoot(mockLoot, adjustedSortOptions);
            const correctResult = new Map(
                ["cherry", "banana", "apple"].map((key) => [key, mockLoot[key]]),
            );
            const resultValues = [...result.values()];
            const correctResultValues = [...correctResult.values()];

            resultValues.forEach((value, i) => expect(value).toStrictEqual(correctResultValues[i]));
        });
        test("Using the key of the loot entry in the input object instead of a name when the item doesn't have a name", async () => {
            const adjustedLoot = structuredClone(mockLoot);
            const { apple, banana } = adjustedLoot;
            delete adjustedLoot["apple"];
            delete adjustedLoot["banana"];
            adjustedLoot["y"] = banana;
            adjustedLoot["y"].props.name = undefined;
            adjustedLoot["z"] = apple;
            adjustedLoot["z"].props.name = undefined;

            const adjustedSortOptions = structuredClone(mockSortOptions);
            adjustedSortOptions.selected = "name";
            setOptionSelected(adjustedSortOptions, "name", "order", "ascending");

            const result = sortLoot(adjustedLoot, adjustedSortOptions);
            const correctResult = new Map(
                ["cherry", "y", "z"].map((key) => [key, adjustedLoot[key]]),
            );
            const resultValues = [...result.values()];
            const correctResultValues = [...correctResult.values()];

            resultValues.forEach((value, i) => expect(value).toStrictEqual(correctResultValues[i]));
        });
        test("Unless the 'order' criterion is not present in the sort option, in which case the original loot object should be returned as a Map", async () => {
            const adjustedSortOptions = structuredClone(mockSortOptions);
            adjustedSortOptions.selected = "name";
            const selectedOption = adjustedSortOptions.options.find((opt) => opt.name === "name");

            const criterionIndex = selectedOption!.criteria.findIndex(
                (opt) => opt.name === "order",
            );
            expect(criterionIndex).not.toBe(-1);
            selectedOption!.criteria.splice(criterionIndex, 1);

            const result = sortLoot(mockLoot, adjustedSortOptions);
            const correctResult = new Map([...Object.entries(mockLoot)]);
            const resultValues = [...result.values()];
            const correctResultValues = [...correctResult.values()];

            resultValues.forEach((value, i) => expect(value).toStrictEqual(correctResultValues[i]));
        });
    });

    describe("Should, if the selected sort option is 'quantity'...", () => {
        test("And, if the 'order' criterion's selected value is 'ascending', sort the loot accordingly", async () => {
            const adjustedSortOptions = structuredClone(mockSortOptions);
            adjustedSortOptions.selected = "quantity";
            setOptionSelected(adjustedSortOptions, "quantity", "order", "ascending");

            const result = sortLoot(mockLoot, adjustedSortOptions);
            const correctResult = new Map(
                ["cherry", "apple", "banana"].map((key) => [key, mockLoot[key]]),
            );
            const resultValues = [...result.values()];
            const correctResultValues = [...correctResult.values()];

            resultValues.forEach((value, i) => expect(value).toStrictEqual(correctResultValues[i]));
        });
        test("And, if the 'order' criterion's selected value is 'descending', sort the loot accordingly", async () => {
            const adjustedSortOptions = structuredClone(mockSortOptions);
            adjustedSortOptions.selected = "quantity";
            setOptionSelected(adjustedSortOptions, "quantity", "order", "descending");

            const result = sortLoot(mockLoot, adjustedSortOptions);
            const correctResult = new Map(
                ["banana", "apple", "cherry"].map((key) => [key, mockLoot[key]]),
            );
            const resultValues = [...result.values()];
            const correctResultValues = [...correctResult.values()];

            resultValues.forEach((value, i) => expect(value).toStrictEqual(correctResultValues[i]));
        });
        test("Unless the 'order' criterion is not present in the sort option, in which case the original loot object should be returned as a Map", async () => {
            const adjustedSortOptions = structuredClone(mockSortOptions);
            adjustedSortOptions.selected = "quantity";
            const selectedOption = adjustedSortOptions.options.find(
                (opt) => opt.name === "quantity",
            );

            const criterionIndex = selectedOption!.criteria.findIndex(
                (opt) => opt.name === "order",
            );
            expect(criterionIndex).not.toBe(-1);
            selectedOption!.criteria.splice(criterionIndex, 1);

            const result = sortLoot(mockLoot, adjustedSortOptions);
            const correctResult = new Map([...Object.entries(mockLoot)]);
            const resultValues = [...result.values()];
            const correctResultValues = [...correctResult.values()];

            resultValues.forEach((value, i) => expect(value).toStrictEqual(correctResultValues[i]));
        });
    });

    describe("Should, if the selected sort option is 'value'...", () => {
        test("And, if the 'order' criterion's selected value is 'ascending' and the 'summation' criterion's selected value is 'individual', sort the loot accordingly", async () => {
            const adjustedSortOptions = structuredClone(mockSortOptions);
            adjustedSortOptions.selected = "value";
            setOptionSelected(adjustedSortOptions, "value", "order", "ascending");
            setOptionSelected(adjustedSortOptions, "value", "summation", "individual");

            const result = sortLoot(mockLoot, adjustedSortOptions);
            const correctResult = new Map(
                ["apple", "banana", "cherry"].map((key) => [key, mockLoot[key]]),
            );
            const resultValues = [...result.values()];
            const correctResultValues = [...correctResult.values()];

            resultValues.forEach((value, i) => expect(value).toStrictEqual(correctResultValues[i]));
        });
        test("And, if the 'order' criterion's selected value is 'ascending' and the 'summation' criterion's selected value is 'total', sort the loot accordingly", async () => {
            const adjustedSortOptions = structuredClone(mockSortOptions);
            adjustedSortOptions.selected = "value";
            setOptionSelected(adjustedSortOptions, "value", "order", "ascending");
            setOptionSelected(adjustedSortOptions, "value", "summation", "total");

            const result = sortLoot(mockLoot, adjustedSortOptions);
            const correctResult = new Map(
                ["cherry", "apple", "banana"].map((key) => [key, mockLoot[key]]),
            );
            const resultValues = [...result.values()];
            const correctResultValues = [...correctResult.values()];

            resultValues.forEach((value, i) => expect(value).toStrictEqual(correctResultValues[i]));
        });
        test("And, if the 'order' criterion's selected value is 'descending' and the 'summation' criterion's selected value is 'individual', sort the loot accordingly", async () => {
            const adjustedSortOptions = structuredClone(mockSortOptions);
            adjustedSortOptions.selected = "value";
            setOptionSelected(adjustedSortOptions, "value", "order", "descending");
            setOptionSelected(adjustedSortOptions, "value", "summation", "individual");

            const result = sortLoot(mockLoot, adjustedSortOptions);
            const correctResult = new Map(
                ["cherry", "banana", "apple"].map((key) => [key, mockLoot[key]]),
            );
            const resultValues = [...result.values()];
            const correctResultValues = [...correctResult.values()];

            resultValues.forEach((value, i) => expect(value).toStrictEqual(correctResultValues[i]));
        });
        test("And, if the 'order' criterion's selected value is 'descending' and the 'summation' criterion's selected value is 'total', sort the loot accordingly", async () => {
            const adjustedSortOptions = structuredClone(mockSortOptions);
            adjustedSortOptions.selected = "value";
            setOptionSelected(adjustedSortOptions, "value", "order", "descending");
            setOptionSelected(adjustedSortOptions, "value", "summation", "total");

            const result = sortLoot(mockLoot, adjustedSortOptions);
            const correctResult = new Map(
                ["banana", "apple", "cherry"].map((key) => [key, mockLoot[key]]),
            );
            const resultValues = [...result.values()];
            const correctResultValues = [...correctResult.values()];

            resultValues.forEach((value, i) => expect(value).toStrictEqual(correctResultValues[i]));
        });
        test("Using a value of 1 when the item doesn't have a valid 'value' field", async () => {
            const adjustedLoot = structuredClone(mockLoot);
            const { apple, banana } = adjustedLoot;
            // @ts-expect-error - Disabling type checking for mocking props in unit test
            apple.props.value = undefined;
            // @ts-expect-error - Disabling type checking for mocking props in unit test
            banana.props.value = undefined;

            const adjustedSortOptions = structuredClone(mockSortOptions);
            adjustedSortOptions.selected = "value";
            setOptionSelected(adjustedSortOptions, "value", "order", "ascending");
            setOptionSelected(adjustedSortOptions, "value", "summation", "individual");

            const result = sortLoot(adjustedLoot, adjustedSortOptions);
            const correctResult = new Map(
                ["apple", "banana", "cherry"].map((key) => [key, adjustedLoot[key]]),
            );
            const resultValues = [...result.values()];
            const correctResultValues = [...correctResult.values()];

            resultValues.forEach((value, i) => expect(value).toStrictEqual(correctResultValues[i]));
        });
        test("Unless the 'order' criterion is not present in the sort option, in which case the original loot object should be returned as a Map", async () => {
            const adjustedSortOptions = structuredClone(mockSortOptions);
            adjustedSortOptions.selected = "value";
            const selectedOption = adjustedSortOptions.options.find((opt) => opt.name === "value");

            const criterionIndex = selectedOption!.criteria.findIndex(
                (opt) => opt.name === "order",
            );
            expect(criterionIndex).not.toBe(-1);
            selectedOption!.criteria.splice(criterionIndex, 1);

            const result = sortLoot(mockLoot, adjustedSortOptions);
            const correctResult = new Map([...Object.entries(mockLoot)]);
            const resultValues = [...result.values()];
            const correctResultValues = [...correctResult.values()];

            resultValues.forEach((value, i) => expect(value).toStrictEqual(correctResultValues[i]));
        });
        test("Or the 'summation' criterion is not present in the sort option, in which case the original loot object should be returned as a Map", async () => {
            const adjustedSortOptions = structuredClone(mockSortOptions);
            adjustedSortOptions.selected = "value";
            const selectedOption = adjustedSortOptions.options.find((opt) => opt.name === "value");

            const criterionIndex = selectedOption!.criteria.findIndex(
                (opt) => opt.name === "summation",
            );
            expect(criterionIndex).not.toBe(-1);
            selectedOption!.criteria.splice(criterionIndex, 1);

            const result = sortLoot(mockLoot, adjustedSortOptions);
            const correctResult = new Map([...Object.entries(mockLoot)]);
            const resultValues = [...result.values()];
            const correctResultValues = [...correctResult.values()];

            resultValues.forEach((value, i) => expect(value).toStrictEqual(correctResultValues[i]));
        });
    });

    describe("Should, if the selected sort option does not have a valid option in the 'options' array...", () => {
        test("Exit gracefully by returning the entries in the first argument object in a Map", () => {
            const adjustedSortOptions = structuredClone(mockSortOptions);

            adjustedSortOptions.options.push({ name: "invalid-sort-option", criteria: [] });
            adjustedSortOptions.selected = "invalid-sort-option";

            const result = sortLoot(mockLoot, adjustedSortOptions);
            expect(result instanceof Map).toBeTruthy();
        });
    });

    describe("Should, if the selected sort option does not contain a valid 'criteria' array...", () => {
        test("Exit gracefully by returning the entries in the first argument object in a Map", () => {
            const result = sortLoot(mockLoot, {
                ...mockSortOptions,
                selected: "invalid-sort-option",
            });
            expect(result instanceof Map).toBeTruthy();
        });
    });
});
