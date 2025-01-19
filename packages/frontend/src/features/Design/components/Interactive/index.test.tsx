import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Interactive } from ".";

// Mock dependencies
vi.mock("@/components/structural/components/TabSelector", () => ({
    TabSelector: vi.fn(() => <div>TabSelector Component</div>),
}));

describe("The Interactive component...", () => {
    test("Should render the TabSelector component", () => {
        render(<Interactive />);

        const TabSelectorComponent = screen.getByText("TabSelector Component");
        expect(TabSelectorComponent).toBeInTheDocument();
    });
});
