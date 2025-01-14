import "@testing-library/jest-dom";
import { updateFieldsInObject, TFieldToUpdate } from ".";

describe("The 'updateFieldsInObject' function", () => {
    test("Should update a single field in a flat object", () => {
        const obj = { a: 1, b: 2 };
        const updates: TFieldToUpdate[] = [{ path: ["a"], newValue: 10 }];

        updateFieldsInObject(obj, updates);

        expect(obj).toEqual({ a: 10, b: 2 });
    });
    test("Should update multiple fields in a flat object", () => {
        const obj = { a: 1, b: 2, c: 3 };
        const updates: TFieldToUpdate[] = [
            { path: ["a"], newValue: 10 },
            { path: ["b"], newValue: 20 },
        ];

        updateFieldsInObject(obj, updates);

        expect(obj).toEqual({ a: 10, b: 20, c: 3 });
    });
    test("Should update nested fields in an object", () => {
        const obj = { a: { b: { c: 1 } }, d: 2 };
        const updates: TFieldToUpdate[] = [{ path: ["a", "b", "c"], newValue: 100 }];

        updateFieldsInObject(obj, updates);

        expect(obj).toEqual({ a: { b: { c: 100 } }, d: 2 });
    });
    test("Should update multiple fields in an object", () => {
        const obj = { a: { b: { c: 1 } }, d: 2 };
        const updates: TFieldToUpdate[] = [
            { path: ["a", "b", "c"], newValue: 100 },
            { path: ["d"], newValue: 200 },
        ];

        updateFieldsInObject(obj, updates);

        expect(obj).toEqual({ a: { b: { c: 100 } }, d: 200 });
    });
    test("Should not update fields if the path is invalid", () => {
        const obj = { a: { b: { c: 1 } }, d: 2 };
        const updates: TFieldToUpdate[] = [{ path: ["a", "x", "c"], newValue: 100 }];

        updateFieldsInObject(obj, updates);

        expect(obj).toEqual({ a: { b: { c: 1 } }, d: 2 });
    });
    test("Should handle updating fields to `null`", () => {
        const obj = { a: { b: 1 }, c: 2 };
        const updates: TFieldToUpdate[] = [{ path: ["a", "b"], newValue: null }];

        updateFieldsInObject(obj, updates);

        expect(obj).toEqual({ a: { b: null }, c: 2 });
    });
    test("Should handle updating fields to `undefined`", () => {
        const obj = { a: { b: 1 }, c: 2 };
        const updates: TFieldToUpdate[] = [{ path: ["a", "b"], newValue: undefined }];

        updateFieldsInObject(obj, updates);

        expect(obj).toEqual({ a: { b: undefined }, c: 2 });
    });
    test("Should not create nested objects if the path partially exists", () => {
        const obj = { a: {} };
        const updates: TFieldToUpdate[] = [{ path: ["a", "b", "c"], newValue: 42 }];

        updateFieldsInObject(obj, updates);

        expect(obj).toEqual({ a: {} });
    });
    test("Should not modify the original object when no updates are provided", () => {
        const obj = { a: 1, b: 2 };
        const updates: TFieldToUpdate[] = [];

        updateFieldsInObject(obj, updates);

        expect(obj).toEqual({ a: 1, b: 2 });
    });
    test("Should handle multiple updates across nested and flat paths", () => {
        const obj = { a: { b: { c: 1 } }, d: 2, e: 3 };
        const updates: TFieldToUpdate[] = [
            { path: ["a", "b", "c"], newValue: 100 },
            { path: ["d"], newValue: 200 },
            { path: ["e"], newValue: 300 },
        ];

        updateFieldsInObject(obj, updates);

        expect(obj).toEqual({ a: { b: { c: 100 } }, d: 200, e: 300 });
    });
    test("Should handle updating fields in an array", () => {
        const obj = { a: [1, 2, 3] };
        const updates: TFieldToUpdate[] = [{ path: ["a", "1"], newValue: 42 }];

        updateFieldsInObject(obj, updates);

        expect(obj).toEqual({ a: [1, 42, 3] });
    });
    test("Should exit gracefully and not modify the input object when passed a non-object input", () => {
        const obj = null;
        const updates: TFieldToUpdate[] = [{ path: ["a", "b"], newValue: 42 }];

        // @ts-expect-error - Disabling type checking for function parameters in unit test
        expect(() => updateFieldsInObject(obj, updates)).not.toThrow();
        expect(obj).toBeNull();
    });
    test("Should exit gracefully and not modify the input object if the path leads to a non-object value", () => {
        const obj = { a: { b: 42 } };
        const updates: TFieldToUpdate[] = [{ path: ["a", "b", "c"], newValue: 100 }];

        expect(() => updateFieldsInObject(obj, updates)).not.toThrow();
        expect(obj).toEqual({ a: { b: 42 } });
    });
    test("Should exit gracefully and not modify the input object when passed an empty path array", () => {
        const obj = { a: 1 };
        const updates: TFieldToUpdate[] = [{ path: [], newValue: 42 }];

        expect(() => updateFieldsInObject(obj, updates)).not.toThrow();
        expect(obj).toEqual({ a: 1 });
    });
});
