import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Design } from ".";

// Mock dependencies
vi.mock("@/components/structural/components/TabSelector", () => ({
    TabSelector: vi.fn(() => <div>TabSelector Component</div>),
}));

describe("The Design component...", () => {
    test("Should render the TabSelector component", () => {
        render(<Design />);

        const TabSelectorComponent = screen.getByText("TabSelector Component");
        expect(TabSelectorComponent).toBeInTheDocument();
    });
});
