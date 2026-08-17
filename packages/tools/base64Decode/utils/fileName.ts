function stripControlCharacters(value: string) {
  return [...value]
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code > 0x1f && code !== 0x7f;
    })
    .join("");
}

export function resolveUploadFileName(
  fileName: string | undefined,
  fallbackBaseName: string,
  extension: string,
) {
  const fallback = `${fallbackBaseName}.${extension}`;
  const trimmed = fileName?.trim();

  if (!trimmed) return fallback;

  const basename = stripControlCharacters(
    trimmed.replace(/\\/g, "/").split("/").pop() ?? "",
  )
    .replace(/[.]+$/, "")
    .trim();

  if (!basename || basename === "." || basename === "..") return fallback;

  const extensionIndex = basename.lastIndexOf(".");
  if (extensionIndex <= 0 || extensionIndex === basename.length - 1) {
    return `${basename}.${extension}`;
  }

  return basename;
}
