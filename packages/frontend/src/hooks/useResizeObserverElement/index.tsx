import { useState, useEffect } from "react";
import * as calculateElementSize from "@/utils/calculateElementSize";

type Params = {
    ref: React.MutableRefObject<HTMLElement | null>;
};

type ReturnTypes = [[number, number], React.Dispatch<React.SetStateAction<[number, number]>>];

export function useResizeObserverElement(
    params: Params,
    dependencies: unknown[] | undefined = undefined,
): ReturnTypes {
    const [elementSize, setElementSize] = useState<[number, number]>([0, 0]);

    const { ref } = params;

    useEffect(() => {
        let refCurrent: Element;
        const observer = new ResizeObserver((entries) => {
            setElementSize(calculateElementSize.fromResizeObserverEntry(entries[0]));
        });
        if (ref.current) {
            refCurrent = ref.current;
            observer.observe(ref.current);
        }
        return () => {
            if (refCurrent instanceof Element) observer.unobserve(refCurrent);
        };
    }, [ref, dependencies]);

    return [elementSize, setElementSize];
}
