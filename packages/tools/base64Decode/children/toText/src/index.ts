import type { ToolHandlerContext } from "@fastgpt-plugin/sdk-factory";
import { z } from "zod";
import { resolveUploadFileName } from "../../../utils/fileName";

type UploadContext = Pick<ToolHandlerContext<any>, "invoke">;
type UploadFileInput = Parameters<UploadContext["invoke"]["uploadFile"]>[0];

export const InputType = z.object({
  base64: z.string().nonempty(),
  fileName: z.string().optional(),
});

export const OutputType = z.object({
  text: z.string(),
  url: z.string().optional(),
});

/**
 * Convert base64 image data to a file and return its URL, type, and size
 * Supports both data URL format (with MIME type) and raw base64 (auto-detected)
 */
export async function tool(
  { base64, fileName }: z.infer<typeof InputType>,
  ctx?: UploadContext,
): Promise<z.infer<typeof OutputType>> {
  // Remove data URL prefix if present (e.g., "data:text/plain;base64,")
  const cleanBase64 = base64.replace(/^data:[^;]*;base64,/, "");

  // Decode base64 to text using Buffer (Node.js) or atob (browser)
  const decodedText =
    typeof Buffer !== "undefined"
      ? Buffer.from(cleanBase64, "base64").toString("utf-8")
      : decodeURIComponent(escape(atob(cleanBase64)));

  const output: z.infer<typeof OutputType> = {
    text: decodedText,
  };

  if (!fileName?.trim()) return output;
  if (!ctx) throw new Error("Upload context is required when fileName is set");

  const uploadInput: UploadFileInput = {
    file: Buffer.from(decodedText, "utf-8"),
    fileName: resolveUploadFileName(fileName, "text", "txt"),
    contentType: "text/plain",
  };
  const [meta, error] = await ctx.invoke.uploadFile(uploadInput);

  if (error) throw error;
  if (!meta) throw new Error("Failed to upload text file");

  return {
    ...output,
    url: meta.accessURL,
  };
}
