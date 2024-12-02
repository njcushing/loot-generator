export const randomRange = (min: number, max: number, integer: boolean): number => {
    if (min > max) return NaN;

    let range = max - min;
    if (integer) range += 1;

    const rand = Math.random() * range;
    const value = min + rand;

    if (integer) return Math.floor(value);
    return value;
};
