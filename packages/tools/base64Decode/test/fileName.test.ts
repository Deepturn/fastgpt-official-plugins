import { describe, expect, it } from "vitest";
import { resolveUploadFileName } from "../utils/fileName";

describe("resolveUploadFileName", () => {
  it("uses the fallback name when no custom name is provided", () => {
    expect(resolveUploadFileName(undefined, "file", "pdf")).toBe("file.pdf");
    expect(resolveUploadFileName("   ", "image", "png")).toBe("image.png");
  });

  it("adds the detected extension when the custom name has none", () => {
    expect(resolveUploadFileName("report", "file", "pdf")).toBe("report.pdf");
  });

  it("keeps an existing extension", () => {
    expect(resolveUploadFileName("report.final.pdf", "file", "txt")).toBe(
      "report.final.pdf",
    );
  });

  it("removes path segments and control characters", () => {
    expect(resolveUploadFileName("../exports/report", "file", "csv")).toBe(
      "report.csv",
    );
    expect(
      resolveUploadFileName("C:\\exports\\rep\u0000ort", "file", "txt"),
    ).toBe("report.txt");
  });

  it("falls back for path-only or dot-only names", () => {
    expect(resolveUploadFileName("../", "file", "txt")).toBe("file.txt");
    expect(resolveUploadFileName("..", "file", "txt")).toBe("file.txt");
  });
});
