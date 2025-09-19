import React from "react";
import { render, screen } from "@testing-library/react";

// Mock heavy child pages used by pages/index.tsx to keep test focused
jest.mock("../dashboard/Dashboard", () => ({
  __esModule: true,
  default: () => React.createElement("div", null, "Dashboard Mock"),
}));
jest.mock("../../components/layout/Header", () => ({
  __esModule: true,
  default: () => React.createElement("header", null, "Header Mock"),
}));
jest.mock("../../components/layout/Sidebar", () => ({
  __esModule: true,
  default: (props: any) => React.createElement("aside", null, "Sidebar Mock"),
}));

import Home from "../../../pages/index";
import Layout from "../../components/layout/Layout";

describe("Pages - Home", () => {
  it("renders header and sidebar", () => {
    // Render Home inside Layout with session=true so Header and Sidebar appear
    render(
      React.createElement(Layout, {
        children: React.createElement(Home, { session: true }),
      }),
    );
    expect(screen.getByText("Header Mock")).toBeInTheDocument();
    expect(screen.getByText("Sidebar Mock")).toBeInTheDocument();
  });
});
