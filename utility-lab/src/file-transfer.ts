import { Capacitor } from "@capacitor/core";

function exportName(value: string): string {
  return (
    value
      .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_")
      .replace(/^\.+/, "")
      .trim()
      .slice(0, 180) || "utility-lab-export"
  );
}

function base64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const separator = result.indexOf(",");
      if (separator < 0) reject(new Error("The export could not be prepared."));
      else resolve(result.slice(separator + 1));
    };
    reader.onerror = () =>
      reject(
        new Error(
          "The export could not be read. Your saved records are unchanged.",
        ),
      );
    reader.readAsDataURL(blob);
  });
}

/** Download in a browser, or open the native share sheet (including Save to Files).
 * Native cache bytes exist only for the lifetime of that share operation.
 * A resolved promise means the browser download was requested or the share sheet
 * completed; the operating system does not tell us where a recipient saved it.
 */
export async function exportFile(blob: Blob, name: string): Promise<void> {
  const filename = exportName(name);
  if (!Capacitor.isNativePlatform()) {
    // Keep the browser path synchronous until the anchor click, preserving the
    // caller's user activation. Native plugins are never loaded for this path.
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    try {
      anchor.click();
    } finally {
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    return;
  }

  const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([
    import("@capacitor/filesystem"),
    import("@capacitor/share"),
  ]);
  if (!(await Share.canShare()).value)
    throw new Error(
      "This device cannot open a share sheet. Your saved records are unchanged.",
    );
  const folder = `utility-lab-exports/${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
  const path = `${folder}/${filename}`;
  let written = false;
  try {
    const isText = blob.type.includes("json") || blob.type.startsWith("text/");
    const result = await Filesystem.writeFile({
      path,
      directory: Directory.Cache,
      recursive: true,
      data: isText ? await blob.text() : await base64(blob),
      ...(isText ? { encoding: Encoding.UTF8 } : {}),
    });
    written = true;
    await Share.share({
      title: filename,
      files: [result.uri],
      dialogTitle: "Export from Utility Lab",
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    if (/cancel(?:led|ed)?|dismiss/i.test(message))
      throw new DOMException(
        "Export cancelled. Your saved records are unchanged.",
        "AbortError",
      );
    throw new Error(
      written
        ? "The export could not be shared. Try Export again; your saved records are unchanged."
        : "The export could not be written to this device. Check available storage and try again.",
    );
  } finally {
    // iOS resolves/rejects share() after the activity controller finishes. Do
    // not delete files before recipients have finished reading them.
    try {
      await Filesystem.rmdir({
        path: folder,
        directory: Directory.Cache,
        recursive: true,
      });
    } catch {
      // A partial write may not create the folder; the OS also clears Cache.
    }
  }
}
