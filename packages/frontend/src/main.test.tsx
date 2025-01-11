import { vi } from "vitest";
import React, { act } from "react";
import { App } from "./App";

const renderMock = vi.fn(() => {});
const createRootMock = vi.fn(() => ({ render: renderMock }));
vi.mock("react-dom/client", () => ({
    default: {
        createRoot: createRootMock,
    },
}));

vi.mock("./App.tsx", () => ({
    App: () => <div aria-label="app"></div>,
}));

describe("The entry point main.tsx", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("Successfully renders the application", async () => {
        const rootElement = document.createElement("div");
        rootElement.setAttribute("id", "root");
        document.body.appendChild(rootElement);

        await act(async () => import("./main"));

        expect(createRootMock).toHaveBeenCalledWith(rootElement);
        expect(renderMock).toHaveBeenCalledWith(
            <React.StrictMode>
                <App />
            </React.StrictMode>,
        );
    });
});
