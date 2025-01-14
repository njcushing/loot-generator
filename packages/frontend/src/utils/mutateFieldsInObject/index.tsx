export type TFieldToUpdate = {
    path: string[];
    newValue: unknown;
};

export const updateFieldsInObject = (obj: object, fieldsToUpdate: TFieldToUpdate[]): void => {
    if (typeof obj !== "object" || obj === null) return;
    for (let i = 0; i < fieldsToUpdate.length; i++) {
        const { path, newValue } = fieldsToUpdate[i];
        let currentField = obj;
        for (let j = 0; j < path.length; j++) {
            const fieldName = path[j] as keyof typeof currentField;
            const field = currentField[fieldName];
            if (j === path.length - 1) {
                (currentField[fieldName] as unknown) = newValue;
                break;
            }
            if (typeof field === "object" && field !== null) {
                (currentField as unknown) = field;
            } else break;
        }
    }
};
