export const clipboard = {
  write: async (text: string): Promise<void> => {
    if (process.platform !== "darwin")
      throw new Error("Clipboard integration currently supports macOS.");
    const child = Bun.spawn(["/usr/bin/pbcopy"], {
      stdin: new TextEncoder().encode(text),
      stdout: "ignore",
      stderr: "pipe",
    });
    const error = await new Response(child.stderr).text();
    if ((await child.exited) !== 0) throw new Error(error || "Could not copy to the clipboard.");
  },
};
