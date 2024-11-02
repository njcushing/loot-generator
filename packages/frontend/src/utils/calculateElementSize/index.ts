export const fromResizeObserverEntry = (
    entry: ResizeObserverEntry,
    setter: React.Dispatch<React.SetStateAction<[number, number]>> | undefined = undefined,
): [number, number] => {
    const contentWidth = entry.contentRect.width;
    const contentHeight = entry.contentRect.height;
    const paddingHorizontal =
        parseFloat(window.getComputedStyle(entry.target).paddingLeft) +
        parseFloat(window.getComputedStyle(entry.target).paddingRight);
    const paddingVertical =
        parseFloat(window.getComputedStyle(entry.target).paddingTop) +
        parseFloat(window.getComputedStyle(entry.target).paddingBottom);
    const totalWidth = contentWidth + paddingHorizontal;
    const totalHeight = contentHeight + paddingVertical;
    if (setter) setter([totalWidth, totalHeight]);
    return [totalWidth, totalHeight];
};

export const fromElement = (
    entry: Element,
    setter: React.Dispatch<React.SetStateAction<[number, number]>> | undefined = undefined,
): [number, number] => {
    const contentWidth = entry.clientWidth;
    const contentHeight = entry.clientHeight;
    const paddingHorizontal =
        parseFloat(window.getComputedStyle(entry).paddingLeft) +
        parseFloat(window.getComputedStyle(entry).paddingRight);
    const paddingVertical =
        parseFloat(window.getComputedStyle(entry).paddingTop) +
        parseFloat(window.getComputedStyle(entry).paddingBottom);
    const totalWidth = contentWidth + paddingHorizontal;
    const totalHeight = contentHeight + paddingVertical;
    if (setter) setter([totalWidth, totalHeight]);
    return [totalWidth, totalHeight];
};
