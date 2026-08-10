import { describe, expect, it, vi } from "vitest";
import { tool as toFile } from "../children/toFile/src";
import { tool as toImage } from "../children/toImage/src";
import { tool as toText } from "../children/toText/src";

function createUploadContext(accessURL = "https://example.test/file") {
  const uploadFile = vi.fn().mockResolvedValue([
    {
      accessURL,
      fileName: "uploaded-file",
      contentType: "application/octet-stream",
      size: 1,
    },
    null,
  ]);

  return {
    context: {
      invoke: {
        uploadFile,
      },
    } as any,
    uploadFile,
  };
}

describe("base64Decode tools", () => {
  it("passes the custom file name to the file upload host call", async () => {
    const { context, uploadFile } = createUploadContext();

    await toFile(
      {
        base64: Buffer.from("hello").toString("base64"),
        fileName: "report",
      },
      context,
    );

    expect(uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: "report.txt",
        contentType: "text/plain",
      }),
    );
  });

  it("passes the custom file name to the image upload host call", async () => {
    const { context, uploadFile } = createUploadContext();
    const pngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z3wAAAABJRU5ErkJggg==";

    await toImage(
      {
        base64: pngBase64,
        fileName: "avatar",
      },
      context,
    );

    expect(uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: "avatar.png",
        contentType: "image/png",
      }),
    );
  });

  it("keeps text-only behavior when no file name is provided", async () => {
    const { context, uploadFile } = createUploadContext();

    await expect(
      toText(
        {
          base64: Buffer.from("hello").toString("base64"),
        },
        context,
      ),
    ).resolves.toEqual({ text: "hello" });
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it("uploads decoded text when a file name is provided", async () => {
    const { context, uploadFile } = createUploadContext(
      "https://example.test/note.txt",
    );

    await expect(
      toText(
        {
          base64: Buffer.from("hello").toString("base64"),
          fileName: "note",
        },
        context,
      ),
    ).resolves.toEqual({
      text: "hello",
      url: "https://example.test/note.txt",
    });
    expect(uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: "note.txt",
        contentType: "text/plain",
      }),
    );
  });
});
