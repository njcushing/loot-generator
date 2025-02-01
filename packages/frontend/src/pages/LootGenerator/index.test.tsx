import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Items, LootEntry, LootTable, Tables } from "@/utils/types";
import {
    LootGeneratorState,
    ILootGeneratorContext,
    LootGeneratorContext,
    LootGenerator,
} from "@/pages/LootGenerator";
import * as uuid from "uuid";
import { act } from "react";
import { IMessagesContext, MessagesContext } from "@/features/Messages";

// Mock dependencies
const mockItems: Items = {
    apple: {
        name: "Apple",
        value: 10,
        custom: {},
    },
    banana: {
        name: "Banana",
        value: 100,
        custom: {},
    },
    cherry: {
        name: "Cherry",
        value: 1000,
        custom: {},
    },
};

const mockTables: Tables = {
    fruits: {
        name: "Fruits",
        loot: [
            {
                key: "apple",
                type: "item_id",
                id: "apple",
                quantity: { min: 1, max: 1 },
                criteria: { weight: 1 },
            },
            {
                key: "banana",
                type: "item_id",
                id: "banana",
                quantity: { min: 1, max: 1 },
                criteria: { weight: 1 },
            },
            {
                key: "vegetables",
                type: "table_id",
                id: "vegetables",
                criteria: { weight: 1 },
            },
            {
                key: "carbohydrates",
                type: "table_noid",
                name: "Carbohydrates",
                loot: [
                    {
                        key: "cherry",
                        type: "item_id",
                        id: "cherry",
                        quantity: { min: 1, max: 1 },
                        criteria: { weight: 1 },
                    },
                ],
                custom: {},
                criteria: { weight: 1 },
            },
            {
                key: "pineapple",
                type: "item_noid",
                name: "pineapple",
                value: 90,
                custom: {},
                quantity: { min: 1, max: 1 },
                criteria: { weight: 1 },
            },
            {
                key: "loot-entry-key",
                type: "entry",
            },
        ],
        custom: {},
    },
    vegetables: {
        name: "Vegetables",
        loot: [],
        custom: {},
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

const mockLootGeneratorState: LootGeneratorState = {
    loot: {},
    active: "fruits",
    tables: mockTables,
    items: mockItems,
    quantitySelected: 1,
    quantityOptionSelected: 0,
    customQuantity: 50,
    sortOptions: mockSortOptions,
};

const mockDisplayMessage = vi.fn((message) => message);
const mockMessagesContext: IMessagesContext = {
    displayMessage: mockDisplayMessage,
};

const mockGetItem = vi.fn(() => JSON.stringify(mockLootGeneratorState));
const mockSetItem = vi.fn(() => null);

Object.defineProperty(window, "localStorage", {
    writable: true,
    value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
        removeItem: vi.fn(),
        clear: vi.fn(),
    },
});

type renderFuncArgs = {
    MessagesContextOverride?: IMessagesContext;
};
const renderFunc = (args: renderFuncArgs = {}) => {
    const { MessagesContextOverride } = args;

    let MessagesContextValue!: IMessagesContext;
    let LootGeneratorContextValue!: ILootGeneratorContext;

    const component = (
        <MessagesContext.Provider
            value={MessagesContextOverride || (mockMessagesContext as unknown as IMessagesContext)}
        >
            <MessagesContext.Consumer>
                {(value) => {
                    MessagesContextValue = value;
                    return null;
                }}
            </MessagesContext.Consumer>
            <LootGenerator>
                <LootGeneratorContext.Consumer>
                    {(value) => {
                        LootGeneratorContextValue = value;
                        return null;
                    }}
                </LootGeneratorContext.Consumer>
            </LootGenerator>
        </MessagesContext.Provider>
    );

    const { rerender } = render(component);

    const getContextValue = () => ({
        Messages: MessagesContextValue,
        LootGenerator: LootGeneratorContextValue,
    });

    return {
        rerender,
        getContextValue,
    };
};

let mockDimensions = [800, 600];
vi.mock("@/hooks/useResizeObserverElement", () => ({
    useResizeObserverElement: vi.fn(() => [mockDimensions]),
}));
function updateMockDimensions(width: number, height: number) {
    mockDimensions = [width, height];
}

const mockCreateLootEntry = vi.fn();
const mockCreateItem = vi.fn((props) => ({ ...props }));
const mockCreateLootItem = vi.fn((type, props) => ({ type, ...props }));
const mockCreateTable = vi.fn((props) => ({ ...props }));
const mockCreateLootTable = vi.fn((type, props) => ({ type, ...props }));
vi.mock("@/utils/generateLoot", async (importActual) => {
    const actual = await importActual();
    return {
        ...(actual || {}),
        createLootEntry: vi.fn(() => mockCreateLootEntry()),
        createItem: vi.fn((props) => mockCreateItem(props)),
        createLootItem: vi.fn((type, props) => mockCreateLootItem(type, props)),
        createTable: vi.fn((props) => mockCreateTable(props)),
        createLootTable: vi.fn((type, props) => mockCreateLootTable(type, props)),
    };
});

const mockUpdateFieldsInObject = vi.fn((obj, fieldsToUpdate) => [obj, fieldsToUpdate]);
vi.mock("@/utils/mutateFieldsInObject", () => ({
    updateFieldsInObject: vi.fn((obj, fieldsToUpdate) =>
        mockUpdateFieldsInObject(obj, fieldsToUpdate),
    ),
}));

vi.mock("@/components/structural/components/TabSelector", () => ({
    TabSelector: vi.fn(({ tabs }) => (
        <div>
            TabSelector Component
            {Object.keys(tabs).map((key) => {
                const tab = tabs[key];
                const { name, content } = tab;
                return (
                    <div aria-label={`TabSelector-tab-${name}`} key={uuid.v4()}>
                        {content}
                    </div>
                );
            })}
        </div>
    )),
}));

vi.mock("@/features/Design", () => ({
    Design: vi.fn(() => <div aria-label="Design Component"></div>),
}));

vi.mock("@/features/Generate", () => ({
    Generate: vi.fn(() => <div aria-label="Generate Component"></div>),
}));

describe("The LootGenerator component...", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Should attempt to load the lootGeneratorState JSON from localStorage on mount, parse it, then parse it again through a zod parser...", () => {
        test("And, upon completion, should invoke the Messages component's context's 'displayMessage' function with the text 'Successfully loaded session state'", () => {
            expect(mockDisplayMessage).not.toHaveBeenCalled();

            renderFunc();

            expect(mockDisplayMessage).toHaveBeenCalledTimes(1);
            expect(mockDisplayMessage).toHaveBeenCalledWith("Successfully loaded session state");
        });
        test("Unless the state load was unsuccessful, in which case the 'displayMessage' function should be called with the text 'Could not load session state'", () => {
            expect(mockDisplayMessage).not.toHaveBeenCalled();

            mockGetItem.mockReturnValueOnce("{}");

            renderFunc();

            expect(mockDisplayMessage).toHaveBeenCalledTimes(1);
            expect(mockDisplayMessage).toHaveBeenCalledWith("Could not load session state");
        });
    });

    describe("Should pass a context object to its descendant components...", () => {
        describe("Including a 'lootGeneratorState' field loaded from localStorage...", async () => {
            test("That contains the parsed JSON fields or default state returned by the loadState function", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;

                expect(LootGeneratorContextValue).toBeDefined();
                expect(LootGeneratorContextValue.lootGeneratorState).toBeDefined();

                const {
                    loot,
                    active,
                    tables,
                    items,
                    quantitySelected,
                    quantityOptionSelected,
                    customQuantity,
                    sortOptions,
                } = LootGeneratorContextValue.lootGeneratorState;

                expect(loot).toStrictEqual(mockLootGeneratorState.loot);
                expect(active).toBe(mockLootGeneratorState.active);
                expect(tables).toStrictEqual(mockLootGeneratorState.tables);
                expect(items).toStrictEqual(mockLootGeneratorState.items);
                expect(quantitySelected).toBe(mockLootGeneratorState.quantitySelected);
                expect(quantityOptionSelected).toBe(mockLootGeneratorState.quantityOptionSelected);
                expect(customQuantity).toBe(mockLootGeneratorState.customQuantity);
                expect(sortOptions).toStrictEqual(mockLootGeneratorState.sortOptions);
            });
        });

        test("Including a setter function for updating the 'lootGeneratorState' field", async () => {
            const { getContextValue } = renderFunc();
            const LootGeneratorContextValue = getContextValue().LootGenerator;
            const { setLootGeneratorStateProperty } = LootGeneratorContextValue;

            expect(setLootGeneratorStateProperty).toBeDefined();

            await act(async () => setLootGeneratorStateProperty("active", "vegetables"));

            const updatedLootGeneratorContextValue = getContextValue().LootGenerator;

            expect(updatedLootGeneratorContextValue.lootGeneratorState.active).toBe("vegetables");
        });

        describe("Including the 'deleteActive' function...", () => {
            test("Which should set the context's 'lootGeneratorState.active' field to 'null'", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { deleteActive } = LootGeneratorContextValue;

                expect(getContextValue().LootGenerator.lootGeneratorState.active).toBe("fruits");

                await act(async () => deleteActive());

                expect(getContextValue().LootGenerator.lootGeneratorState.active).toBeNull();
            });
        });

        describe("Including the 'createTable' function...", () => {
            test("Which should set a new table in the context's 'lootGeneratorState.tables' object with a random key and value equal to the return value of the 'createTable' function from the generateLoot utility functions file", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { createTable } = LootGeneratorContextValue;

                expect(getContextValue().LootGenerator.lootGeneratorState.tables).toStrictEqual(
                    mockTables,
                );

                const newTable = { name: "Dairy", loot: [], custom: {} };

                vi.spyOn(uuid, "v4").mockReturnValueOnce("dairy");
                mockCreateTable.mockReturnValueOnce(newTable);

                await act(async () => createTable());

                const newTables = structuredClone(mockTables);
                newTables["dairy"] = newTable;

                expect(getContextValue().LootGenerator.lootGeneratorState.tables).toStrictEqual(
                    newTables,
                );
            });
        });

        describe("Including the 'updateTable' function...", () => {
            test("Which should invoke the 'updateFieldsInObject' function with the specified table from the context's 'lootGeneratorState.tables' object and the second argument passed to the 'updateTable' function as arguments", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { updateTable } = LootGeneratorContextValue;

                expect(mockUpdateFieldsInObject).not.toHaveBeenCalled();

                const fieldsToUpdate = [{ path: ["name"], newValue: "Dairy" }];

                await act(async () => updateTable("vegetables", fieldsToUpdate));

                expect(mockUpdateFieldsInObject).toHaveBeenCalledWith(
                    mockTables["vegetables"],
                    fieldsToUpdate,
                );
            });
            test("Unless the specified table is not found in the context's 'lootGeneratorState.tables' object", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { updateTable } = LootGeneratorContextValue;

                expect(mockUpdateFieldsInObject).not.toHaveBeenCalled();

                const fieldsToUpdate = [{ path: ["name"], newValue: "Dairy" }];

                await act(async () => updateTable("invalid-table", fieldsToUpdate));

                expect(mockUpdateFieldsInObject).not.toHaveBeenCalled();
            });
        });

        describe("Including the 'deleteTable' function...", () => {
            test("Which should remove the table from the context's 'lootGeneratorState.tables' object", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { deleteTable } = LootGeneratorContextValue;

                expect(getContextValue().LootGenerator.lootGeneratorState.tables).toStrictEqual(
                    mockTables,
                );

                await act(async () => deleteTable("vegetables"));

                const newTables = structuredClone(mockTables);
                delete newTables["vegetables"];

                expect(getContextValue().LootGenerator.lootGeneratorState.tables).toStrictEqual(
                    newTables,
                );
            });
            test("Unless the specified table is not found in the context's 'lootGeneratorState.tables' object", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { deleteTable } = LootGeneratorContextValue;

                expect(getContextValue().LootGenerator.lootGeneratorState.tables).toStrictEqual(
                    mockTables,
                );

                await act(async () => deleteTable("invalid-table"));

                expect(getContextValue().LootGenerator.lootGeneratorState.tables).toStrictEqual(
                    mockTables,
                );
            });
        });

        describe("Including the 'uploadTableToActive' function...", () => {
            test("Which should set the context's 'lootGeneratorState.active' field to the value of the argument", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { uploadTableToActive } = LootGeneratorContextValue;

                expect(getContextValue().LootGenerator.lootGeneratorState.active).toBe(
                    mockLootGeneratorState.active,
                );

                await act(async () => uploadTableToActive("vegetables"));

                expect(getContextValue().LootGenerator.lootGeneratorState.active).toBe(
                    "vegetables",
                );
            });
            test("Unless the specified table is not found in the context's 'lootGeneratorState.tables' object", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { uploadTableToActive } = LootGeneratorContextValue;

                expect(getContextValue().LootGenerator.lootGeneratorState.active).toBe(
                    mockLootGeneratorState.active,
                );

                await act(async () => uploadTableToActive("invalid-table"));

                expect(getContextValue().LootGenerator.lootGeneratorState.active).toBe(
                    mockLootGeneratorState.active,
                );
            });
        });

        describe("Including the 'createEntry' function...", () => {
            test("Which should push a new entry to the end of the specified table's 'loot' array equal to the return value of the 'createLootEntry' function", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { createEntry } = LootGeneratorContextValue;

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["vegetables"].loot,
                ).toStrictEqual(mockTables["vegetables"].loot);

                const newEntry = { key: "loot-entry-key", type: "entry" };

                mockCreateLootEntry.mockReturnValueOnce(newEntry);

                await act(async () => createEntry("vegetables"));

                const newLoot = structuredClone(mockTables["vegetables"].loot);
                newLoot.push(newEntry as LootEntry);

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["vegetables"].loot,
                ).toStrictEqual(newLoot);
            });
            test("Unless the specified table is not found in the context's 'lootGeneratorState.items' object", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { createEntry } = LootGeneratorContextValue;

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["vegetables"].loot,
                ).toStrictEqual(mockTables["vegetables"].loot);

                const newEntry = { key: "loot-entry-key", type: "entry" };

                mockCreateLootEntry.mockReturnValueOnce(newEntry);

                await act(async () => createEntry("invalid-table"));

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["vegetables"].loot,
                ).toStrictEqual(mockTables["vegetables"].loot);
            });
            test("Unless the 'createLootEntry' function returns a falsy value", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { createEntry } = LootGeneratorContextValue;

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["vegetables"].loot,
                ).toStrictEqual(mockTables["vegetables"].loot);

                mockCreateLootEntry.mockReturnValueOnce(null);

                await act(async () => createEntry("invalid-table"));

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["vegetables"].loot,
                ).toStrictEqual(mockTables["vegetables"].loot);
            });
        });

        describe("Including the 'createItem' function...", () => {
            test("Which should set a new item in the context's 'lootGeneratorState.items' object with a random key and value equal to the return value of the 'createItem' function from the generateLoot utility functions file", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { createItem } = LootGeneratorContextValue;

                expect(getContextValue().LootGenerator.lootGeneratorState.items).toStrictEqual(
                    mockItems,
                );

                const newItem = { name: "Durian", value: 1, custom: {} };

                vi.spyOn(uuid, "v4").mockReturnValueOnce("durian");
                mockCreateItem.mockReturnValueOnce(newItem);

                await act(async () => createItem());

                const newItems = structuredClone(mockItems);
                newItems["durian"] = newItem;

                expect(getContextValue().LootGenerator.lootGeneratorState.items).toStrictEqual(
                    newItems,
                );
            });
        });

        describe("Including the 'updateItem' function...", () => {
            test("Which should invoke the 'updateFieldsInObject' function with the specified item from the context's 'lootGeneratorState.items' object and the second argument passed to the 'updateItem' function as arguments", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { updateItem } = LootGeneratorContextValue;

                expect(mockUpdateFieldsInObject).not.toHaveBeenCalled();

                const fieldsToUpdate = [{ path: ["name"], newValue: "Pear" }];

                await act(async () => updateItem("apple", fieldsToUpdate));

                expect(mockUpdateFieldsInObject).toHaveBeenCalledWith(
                    mockItems["apple"],
                    fieldsToUpdate,
                );
            });
            test("Unless the specified item is not found in the context's 'lootGeneratorState.items' object", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { updateItem } = LootGeneratorContextValue;

                expect(mockUpdateFieldsInObject).not.toHaveBeenCalled();

                const fieldsToUpdate = [{ path: ["name"], newValue: "Pear" }];

                await act(async () => updateItem("invalid-item", fieldsToUpdate));

                expect(mockUpdateFieldsInObject).not.toHaveBeenCalled();
            });
        });

        describe("Including the 'deleteItem' function...", () => {
            test("Which should remove the item from the context's 'lootGeneratorState.items' object", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { deleteItem } = LootGeneratorContextValue;

                expect(getContextValue().LootGenerator.lootGeneratorState.items).toStrictEqual(
                    mockItems,
                );

                await act(async () => deleteItem("apple"));

                const newItems = structuredClone(mockItems);
                delete newItems["apple"];

                expect(getContextValue().LootGenerator.lootGeneratorState.items).toStrictEqual(
                    newItems,
                );
            });
            test("Unless the specified item is not found in the context's 'lootGeneratorState.items' object", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { deleteItem } = LootGeneratorContextValue;

                expect(getContextValue().LootGenerator.lootGeneratorState.items).toStrictEqual(
                    mockItems,
                );

                await act(async () => deleteItem("invalid-item"));

                expect(getContextValue().LootGenerator.lootGeneratorState.items).toStrictEqual(
                    mockItems,
                );
            });
        });

        describe("Including the 'getEntry' function...", () => {
            test("Which should recursively search the specified table and its 'noid' loot tables until the specified entry is found", () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { getEntry } = LootGeneratorContextValue;

                expect(getContextValue().LootGenerator.lootGeneratorState.items).toStrictEqual(
                    mockItems,
                );

                const result = getEntry("fruits", "cherry");

                expect(result).toStrictEqual({
                    // @ts-expect-error - TypeScript isn't recognising that the LootTable type can have 'loot' as a field in some circumstances
                    entry: (mockTables["fruits"].loot[3] as LootTable).loot[0],
                    path: [mockTables["fruits"], mockTables["fruits"].loot[3]],
                    index: 0,
                    copy: structuredClone(mockTables),
                });
            });
            test("Which should return 'null' if the specified table is not found in the context's 'lootGeneratorState.tables' object", () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { getEntry } = LootGeneratorContextValue;

                expect(getContextValue().LootGenerator.lootGeneratorState.items).toStrictEqual(
                    mockItems,
                );

                const result = getEntry("invalid-table", "cherry");

                expect(result).toBeNull();
            });
            test("Which should return 'null' if the specified entry is not found", () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { getEntry } = LootGeneratorContextValue;

                expect(getContextValue().LootGenerator.lootGeneratorState.items).toStrictEqual(
                    mockItems,
                );

                const result = getEntry("fruits", "invalid-entry");

                expect(result).toBeNull();
            });
        });

        describe("Including the 'updateEntry' function...", () => {
            test("Which should invoke the 'updateFieldsInObject' function with the specified entry within the specified table from the context's 'lootGeneratorState.tables' object and the third argument passed to the 'updateEntry' function as arguments", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { updateEntry } = LootGeneratorContextValue;

                expect(mockUpdateFieldsInObject).not.toHaveBeenCalled();

                const fieldsToUpdate = [{ path: ["name"], newValue: "Dairy" }];

                await act(async () => updateEntry("fruits", "carbohydrates", fieldsToUpdate));

                expect(mockUpdateFieldsInObject).toHaveBeenCalledWith(
                    mockTables["fruits"].loot[3],
                    fieldsToUpdate,
                );
            });
            test("Unless the specified table is not found in the context's 'lootGeneratorState.tables' object", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { updateEntry } = LootGeneratorContextValue;

                expect(mockUpdateFieldsInObject).not.toHaveBeenCalled();

                const fieldsToUpdate = [{ path: ["name"], newValue: "Dairy" }];

                await act(async () =>
                    updateEntry("invalid-table", "carbohydrates", fieldsToUpdate),
                );

                expect(mockUpdateFieldsInObject).not.toHaveBeenCalled();
            });
            test("Unless the specified entry is not found", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { updateEntry } = LootGeneratorContextValue;

                expect(mockUpdateFieldsInObject).not.toHaveBeenCalled();

                const fieldsToUpdate = [{ path: ["name"], newValue: "Dairy" }];

                await act(async () => updateEntry("fruits", "invalid-entry", fieldsToUpdate));

                expect(mockUpdateFieldsInObject).not.toHaveBeenCalled();
            });
        });

        describe("Including the 'setTypeOnEntry' function...", () => {
            test("Which should replace an entry with a 'noid' table if specified, returned by the createLootTable function", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { setTypeOnEntry } = LootGeneratorContextValue;

                expect(mockCreateLootTable).not.toHaveBeenCalled();

                const oldEntry = mockTables["fruits"].loot[4];
                const newEntry = {
                    key: "pineapple",
                    type: "table_noid",
                    name: "Pineapple",
                    loot: [],
                    custom: {},
                    criteria: { weight: 1 },
                };
                mockCreateLootTable.mockReturnValueOnce(newEntry);

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"].loot[4],
                ).toStrictEqual(oldEntry);

                await act(async () => setTypeOnEntry("fruits", "pineapple", "table"));

                expect(mockCreateLootTable).toHaveBeenCalledWith("table_noid", {
                    ...oldEntry,
                    id: undefined,
                    type: "table_noid",
                });

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"].loot[4],
                ).toStrictEqual(newEntry);
            });
            test("Which should replace an entry with a 'noid' item if specified, returned by the createLootItem function", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { setTypeOnEntry } = LootGeneratorContextValue;

                expect(mockCreateLootItem).not.toHaveBeenCalled();

                const oldEntry = mockTables["fruits"].loot[3];
                const newEntry = {
                    key: "carbohydrates",
                    type: "item_noid",
                    name: "Carbohydrates",
                    value: 1,
                    custom: {},
                    criteria: { weight: 1 },
                    quantity: { min: 1, max: 1 },
                };
                mockCreateLootItem.mockReturnValueOnce(newEntry);

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"].loot[3],
                ).toStrictEqual(oldEntry);

                await act(async () => setTypeOnEntry("fruits", "carbohydrates", "item"));

                expect(mockCreateLootItem).toHaveBeenCalledWith("item_noid", {
                    ...oldEntry,
                    id: undefined,
                    type: "item_noid",
                });

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"].loot[3],
                ).toStrictEqual(newEntry);
            });
            test("Unless the specified table is not found in the context's 'lootGeneratorState.tables' or 'lootGeneratorState.items' objects, respectively", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { setTypeOnEntry } = LootGeneratorContextValue;

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();

                await act(async () => setTypeOnEntry("invalid-table", "carbohydrates", "item"));

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();
            });
            test("Unless the specified entry is not found", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { setTypeOnEntry } = LootGeneratorContextValue;

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();

                await act(async () => setTypeOnEntry("fruits", "invalid-entry", "item"));

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();
            });
        });

        describe("Including the 'setIdOnEntry' function...", () => {
            test("Which should replace an 'id' table entry's 'id' with the specified id, or a 'noid' table entry with an 'id' table entry with the specified id, returned by the createLootTable function", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { setIdOnEntry } = LootGeneratorContextValue;

                expect(mockCreateLootTable).not.toHaveBeenCalled();

                const oldEntry = mockTables["fruits"].loot[2];
                const newEntry = {
                    ...oldEntry,
                    id: "dairy",
                    type: "table_id",
                };
                mockCreateLootTable.mockReturnValueOnce(newEntry);

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"].loot[2],
                ).toStrictEqual(oldEntry);

                await act(async () => setIdOnEntry("fruits", "vegetables", "dairy"));

                expect(mockCreateLootTable).toHaveBeenCalledWith("table_id", {
                    ...oldEntry,
                    id: "dairy",
                    type: "table_id",
                });

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"].loot[2],
                ).toStrictEqual(newEntry);
            });
            test("Which should replace an 'id' item entry's 'id' with the specified id, or a 'noid' item entry with an 'id' item entry with the specified id, returned by the createLootItem function", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { setIdOnEntry } = LootGeneratorContextValue;

                expect(mockCreateLootItem).not.toHaveBeenCalled();

                const oldEntry = mockTables["fruits"].loot[0];
                const newEntry = {
                    ...oldEntry,
                    id: "pear",
                    type: "item_id",
                };
                mockCreateLootItem.mockReturnValueOnce(newEntry);

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"].loot[0],
                ).toStrictEqual(oldEntry);

                await act(async () => setIdOnEntry("fruits", "apple", "pear"));

                expect(mockCreateLootItem).toHaveBeenCalledWith("item_id", {
                    ...oldEntry,
                    id: "pear",
                    type: "item_id",
                });

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"].loot[0],
                ).toStrictEqual(newEntry);
            });
            test("Which should set the new table, returned by the createTable function from the generateLoot utility functions file, in the context's 'lootGeneratorState.tables' object function, when setting an id on a 'noid' table", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { setIdOnEntry } = LootGeneratorContextValue;

                expect(mockCreateTable).not.toHaveBeenCalled();

                const oldEntry = mockTables["fruits"].loot[3];
                const newEntry = {
                    ...oldEntry,
                    id: "dairy",
                    type: "table_id",
                };
                mockCreateLootTable.mockReturnValueOnce(newEntry);

                const newTable = {
                    id: "dairy",
                    name: "Carbohydrates",
                    loot: [],
                    custom: {},
                };
                mockCreateTable.mockReturnValueOnce(newTable);

                expect(getContextValue().LootGenerator.lootGeneratorState.tables).toStrictEqual(
                    mockTables,
                );

                await act(async () => setIdOnEntry("fruits", "carbohydrates", "dairy"));

                expect(mockCreateTable).toHaveBeenCalledWith({
                    ...oldEntry,
                    id: "dairy",
                    type: "table_id",
                });

                expect(getContextValue().LootGenerator.lootGeneratorState.tables).toStrictEqual({
                    ...mockTables,
                    fruits: {
                        ...mockTables["fruits"],
                        loot: [
                            ...[...mockTables["fruits"].loot].splice(0, 3),
                            newEntry,
                            ...[...mockTables["fruits"].loot].splice(4),
                        ],
                    },
                    dairy: newTable,
                });
            });
            test("Which should set the new item, returned by the createItem function from the generateLoot utility functions file, in the context's 'lootGeneratorState.items' object function, when setting an id on a 'noid' item", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { setIdOnEntry } = LootGeneratorContextValue;

                expect(mockCreateItem).not.toHaveBeenCalled();

                const oldEntry = mockTables["fruits"].loot[4];
                const newEntry = {
                    ...oldEntry,
                    id: "pear",
                    type: "item_id",
                };
                mockCreateLootItem.mockReturnValueOnce(newEntry);

                const newItem = {
                    id: "pear",
                    name: "Pineapple",
                    value: 1,
                    custom: {},
                };
                mockCreateItem.mockReturnValueOnce(newItem);

                expect(getContextValue().LootGenerator.lootGeneratorState.items).toStrictEqual(
                    mockItems,
                );

                await act(async () => setIdOnEntry("fruits", "pineapple", "pear"));

                expect(mockCreateItem).toHaveBeenCalledWith({
                    ...oldEntry,
                    id: "pear",
                    type: "item_id",
                });

                expect(getContextValue().LootGenerator.lootGeneratorState.items).toStrictEqual({
                    ...mockItems,
                    pear: newItem,
                });
            });
            test("Unless the specified entry does not have a 'type' field equal to 'table_id', 'table_noid', 'item_id' or 'item_noid'", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { removeIdFromEntry } = LootGeneratorContextValue;

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();
                expect(mockCreateTable).not.toHaveBeenCalled();
                expect(mockCreateItem).not.toHaveBeenCalled();

                await act(async () => removeIdFromEntry("fruits", "loot-entry-key"));

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();
                expect(mockCreateTable).not.toHaveBeenCalled();
                expect(mockCreateItem).not.toHaveBeenCalled();
            });
            test("Unless the specified table is not found in the context's 'lootGeneratorState.tables' object", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { removeIdFromEntry } = LootGeneratorContextValue;

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();
                expect(mockCreateTable).not.toHaveBeenCalled();
                expect(mockCreateItem).not.toHaveBeenCalled();

                await act(async () => removeIdFromEntry("invalid-table", "loot-entry-key"));

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();
                expect(mockCreateTable).not.toHaveBeenCalled();
                expect(mockCreateItem).not.toHaveBeenCalled();
            });
            test("Unless the specified entry is not found", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { removeIdFromEntry } = LootGeneratorContextValue;

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();

                await act(async () => removeIdFromEntry("fruits", "invalid-entry"));

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();
            });
        });

        describe("Including the 'removeIdFromEntry' function...", () => {
            test("Which should replace an 'id' table entry with a 'noid' table entry if specified, returned by the createLootTable function", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { removeIdFromEntry } = LootGeneratorContextValue;

                expect(mockCreateLootTable).not.toHaveBeenCalled();

                const oldEntry = mockTables["fruits"].loot[2];
                const newEntry = {
                    ...oldEntry,
                    id: undefined,
                    type: "table_noid",
                };
                mockCreateLootTable.mockReturnValueOnce(newEntry);

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"].loot[2],
                ).toStrictEqual(oldEntry);

                await act(async () => removeIdFromEntry("fruits", "vegetables"));

                expect(mockCreateLootTable).toHaveBeenCalledWith("table_noid", {
                    ...oldEntry,
                    id: undefined,
                    type: "table_noid",
                });

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"].loot[2],
                ).toStrictEqual(newEntry);
            });
            test("Which should replace an 'id' item entry with a 'noid' item entry if specified, returned by the createLootItem function", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { removeIdFromEntry } = LootGeneratorContextValue;

                expect(mockCreateLootItem).not.toHaveBeenCalled();

                const oldEntry = mockTables["fruits"].loot[1];
                const newEntry = {
                    ...oldEntry,
                    id: undefined,
                    type: "item_noid",
                };
                mockCreateLootItem.mockReturnValueOnce(newEntry);

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"].loot[1],
                ).toStrictEqual(oldEntry);

                await act(async () => removeIdFromEntry("fruits", "banana"));

                expect(mockCreateLootItem).toHaveBeenCalledWith("item_noid", {
                    ...oldEntry,
                    id: undefined,
                    type: "item_noid",
                });

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"].loot[1],
                ).toStrictEqual(newEntry);
            });
            test("Unless the specified entry does not have a 'type' field equal to 'table_id' or 'item_id'", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { removeIdFromEntry } = LootGeneratorContextValue;

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();

                await act(async () => removeIdFromEntry("fruits", "carbohydrates"));

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();
            });
            test("Unless the specified table is not found in the context's 'lootGeneratorState.tables' object", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { removeIdFromEntry } = LootGeneratorContextValue;

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();

                await act(async () => removeIdFromEntry("invalid-table", "vegetables"));

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();
            });
            test("Unless the specified entry is not found", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { removeIdFromEntry } = LootGeneratorContextValue;

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();

                await act(async () => removeIdFromEntry("fruits", "invalid-entry"));

                expect(mockCreateLootTable).not.toHaveBeenCalled();
                expect(mockCreateLootItem).not.toHaveBeenCalled();
            });
        });

        describe("Including the 'deleteEntry' function...", () => {
            test("Which should recursively search the specified table and its 'noid' loot tables until the specified entry is found, at which point it should be removed", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { deleteEntry } = LootGeneratorContextValue;

                const oldTable = { ...mockTables["fruits"] };

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"],
                ).toStrictEqual(oldTable);

                await act(async () => deleteEntry("fruits", "pineapple"));

                const newTable = { ...oldTable };
                newTable.loot.splice(4, 1);

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"],
                ).toStrictEqual(newTable);
            });
            test("Unless the specified table is not found in the context's 'lootGeneratorState.tables' object", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { deleteEntry } = LootGeneratorContextValue;

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"],
                ).toStrictEqual(mockTables["fruits"]);

                await act(async () => deleteEntry("invalid-table", "pineapple"));

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"],
                ).toStrictEqual(mockTables["fruits"]);
            });
            test("Unless the specified entry is not found", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { deleteEntry } = LootGeneratorContextValue;

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"],
                ).toStrictEqual(mockTables["fruits"]);

                await act(async () => deleteEntry("fruits", "invalid-entry"));

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"],
                ).toStrictEqual(mockTables["fruits"]);
            });
        });

        describe("Including the 'createSubEntry' function...", () => {
            test("Which should push a new LootEntry, returned by the createLootEntry function, into the specified table's specified 'noid' table entry", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { createSubEntry } = LootGeneratorContextValue;

                expect(mockCreateLootEntry).not.toHaveBeenCalled();

                const oldTable = { ...mockTables["fruits"].loot[3] };
                const newEntry = { type: "entry", key: "mock-entry" } as LootEntry;

                mockCreateLootEntry.mockReturnValueOnce(newEntry);

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"].loot[3],
                ).toStrictEqual(oldTable);

                await act(async () => createSubEntry("fruits", "carbohydrates"));

                expect(mockCreateLootEntry).toHaveBeenCalled();

                const newTable = { ...oldTable };
                // @ts-expect-error - TypeScript isn't recognising that the LootTable type can have 'loot' as a field in some circumstances
                (newTable as LootTable).loot.push(newEntry);

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"].loot[3],
                ).toStrictEqual(newTable);
            });
            test("Unless the specified entry does not have a 'type' field equal to 'table_noid'", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { createSubEntry } = LootGeneratorContextValue;

                expect(mockCreateLootEntry).not.toHaveBeenCalled();

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"],
                ).toStrictEqual(mockTables["fruits"]);

                await act(async () => createSubEntry("fruits", "vegetables"));

                expect(mockCreateLootEntry).not.toHaveBeenCalled();

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"],
                ).toStrictEqual(mockTables["fruits"]);
            });
            test("Unless the specified table is not found in the context's 'lootGeneratorState.tables' object", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { createSubEntry } = LootGeneratorContextValue;

                expect(mockCreateLootEntry).not.toHaveBeenCalled();

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"],
                ).toStrictEqual(mockTables["fruits"]);

                await act(async () => createSubEntry("invalid-table", "carbohydrates"));

                expect(mockCreateLootEntry).not.toHaveBeenCalled();

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"],
                ).toStrictEqual(mockTables["fruits"]);
            });
            test("Unless the specified entry is not found", async () => {
                const { getContextValue } = renderFunc();
                const LootGeneratorContextValue = getContextValue().LootGenerator;
                const { createSubEntry } = LootGeneratorContextValue;

                expect(mockCreateLootEntry).not.toHaveBeenCalled();

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"],
                ).toStrictEqual(mockTables["fruits"]);

                await act(async () => createSubEntry("fruits", "invalid-entry"));

                expect(mockCreateLootEntry).not.toHaveBeenCalled();

                expect(
                    getContextValue().LootGenerator.lootGeneratorState.tables["fruits"],
                ).toStrictEqual(mockTables["fruits"]);
            });
        });

        describe("Which, when consumed by a component other than the LootGenerator component, should contain the same state, state setter and functions...", () => {
            test("But none of those functions should do anything when invoked, and should exit gracefully", async () => {
                let LootGeneratorContextValue!: ILootGeneratorContext;

                render(
                    <div>
                        <LootGeneratorContext.Consumer>
                            {(value) => {
                                LootGeneratorContextValue = value;
                                return null;
                            }}
                        </LootGeneratorContext.Consumer>
                    </div>,
                );

                expect(LootGeneratorContextValue).toBeDefined();

                const {
                    lootGeneratorState,
                    setLootGeneratorStateProperty,

                    deleteActive,

                    createTable,
                    updateTable,
                    deleteTable,
                    uploadTableToActive,
                    createEntry,

                    createItem,
                    updateItem,
                    deleteItem,

                    getEntry,
                    updateEntry,
                    setTypeOnEntry,
                    setIdOnEntry,
                    removeIdFromEntry,
                    deleteEntry,
                    createSubEntry,
                } = LootGeneratorContextValue;

                expect(lootGeneratorState).toBeDefined();
                expect(() => setLootGeneratorStateProperty("active", "fruits")).not.toThrow();

                expect(() => deleteActive()).not.toThrow();

                expect(() => createTable()).not.toThrow();
                expect(() =>
                    updateTable("fruits", [{ path: ["name"], newValue: "Dairy" }]),
                ).not.toThrow();
                expect(() => deleteTable("fruits")).not.toThrow();
                expect(() => uploadTableToActive("fruits")).not.toThrow();
                expect(() => createEntry("fruits")).not.toThrow();

                expect(() => createItem()).not.toThrow();
                expect(() =>
                    updateItem("apple", [{ path: ["name"], newValue: "Pear" }]),
                ).not.toThrow();
                expect(() => deleteItem("apple")).not.toThrow();

                expect(() => getEntry("fruits", "cherry")).not.toThrow();
                expect(() =>
                    updateEntry("fruits", "carbohydrates", [{ path: ["name"], newValue: "Dairy" }]),
                ).not.toThrow();
                expect(() => setTypeOnEntry("fruits", "carbohydrates", "item")).not.toThrow();
                expect(() =>
                    setIdOnEntry("fruits", "carbohydrates", "carbohydrates"),
                ).not.toThrow();
                expect(() => removeIdFromEntry("fruits", "carbohydrates")).not.toThrow();
                expect(() => deleteEntry("fruits", "carbohydrates")).not.toThrow();
                expect(() => createSubEntry("fruits", "carbohydrates")).not.toThrow();
            });
        });
    });

    describe("Should have a dynamic layout...", () => {
        test("Including a 'wide' layout when the container element's size exceeds or is equal to 800px, with two TabSelector components", async () => {
            renderFunc();

            expect(screen.queryAllByText("TabSelector Component")).toHaveLength(2);
        });
        test("Including a 'thin' layout when the container element's size is lower than 800px, with one TabSelector component", async () => {
            const { rerender } = renderFunc();

            expect(screen.queryAllByText("TabSelector Component")).toHaveLength(2);

            updateMockDimensions(799, 600);

            rerender(<LootGenerator></LootGenerator>);

            expect(screen.queryAllByText("TabSelector Component")).toHaveLength(1);
        });
    });
});
