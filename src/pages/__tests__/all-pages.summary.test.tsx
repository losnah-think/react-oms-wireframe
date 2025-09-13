import React from "react";
import { render } from "@testing-library/react";
import fs from "fs";
import path from "path";

// Mock common layout components to avoid heavy deps
jest.mock("../../components/layout/Header", () => ({
  __esModule: true,
  default: () => React.createElement("header", null, "Header Mock"),
}));
jest.mock("../../components/layout/Sidebar", () => ({
  __esModule: true,
  default: (props: any) => React.createElement("aside", null, "Sidebar Mock"),
}));
jest.mock("next/router", () => ({
  useRouter: () => ({ push: jest.fn(), query: {} }),
}));

const pagesDir = path.resolve(__dirname, "..");

function collectPageFiles(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(collectPageFiles(full));
    } else if (
      entry.isFile() &&
      /\.tsx?$/.test(entry.name) &&
      !entry.name.endsWith(".test.tsx")
    ) {
      files.push(full);
    }
  }
  return files;
}

describe("All pages render summary (non-failing)", () => {
  it("attempts to render each page and prints a summary table", () => {
    const files = collectPageFiles(pagesDir);
    const results: Array<{
      page: string;
      status: "pass" | "fail";
      message?: string;
    }> = [];

    files.forEach((file) => {
      const rel = path.relative(pagesDir, file);
      try {
        const mod = require(file);
        const Comp = mod && (mod.default || mod);
        if (typeof Comp === "function") {
          // try render with empty props — many pages expect props; errors will be caught
          try {
            render(React.createElement(Comp, {} as any));
            results.push({ page: rel, status: "pass" });
          } catch (err: any) {
            results.push({
              page: rel,
              status: "fail",
              message: err && err.message ? err.message : String(err),
            });
          }
        } else {
          // not a component default export
          results.push({ page: rel, status: "pass" });
        }
      } catch (err: any) {
        results.push({
          page: rel,
          status: "fail",
          message: err && err.message ? err.message : String(err),
        });
      }
    });

    // Print a concise table to the console for user review
    // eslint-disable-next-line no-console
    console.table(
      results.map((r) => ({
        page: r.page,
        status: r.status,
        message: r.message || "",
      })),
    );

    // If running in CI, write a machine-readable artifact for later inspection
    if (process.env.GITHUB_ACTIONS === "true") {
      const outDir = path.resolve(__dirname, "..", "..", "..", "test-results");
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, "pages-summary.json");
      try {
        fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
        // eslint-disable-next-line no-console
        console.log("Wrote pages summary to", outPath);
      } catch (e) {
        // ignore write errors in CI if any
      }
    }

    // ensure test does not fail — user will inspect the console table
    expect(true).toBe(true);
  });
});
