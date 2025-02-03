import { randomRange } from ".";

describe("The randomRange function...", () => {
    test("Should always return a value greater than or equal to the min value, and lower than the max value, for non-integer values", () => {
        const result = randomRange(23, 94, false);
        expect(result).toBeGreaterThanOrEqual(23);
        expect(result).toBeLessThanOrEqual(94);
    });
    test("Should always return an integer value, when specified, between the min and max values inclusive", () => {
        const result = randomRange(23, 94, true);
        expect(Number.isInteger(result)).toBeTruthy();
    });
    test("Should return NaN if the min value exceeds the max value", () => {
        const result = randomRange(94, 23, false);
        expect(result).toBeNaN();
    });
});
