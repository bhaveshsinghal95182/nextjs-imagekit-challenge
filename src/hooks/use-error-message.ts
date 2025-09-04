export function formatError(err: unknown): string {
  try {
    if (!err) return "An unknown error occurred.";
    if (typeof err === "string") return err;

    if (err instanceof Error) return err.message || String(err);

    const anyErr = err as unknown & {message?: string; errors?: unknown};
    if (anyErr?.message) return String(anyErr.message);
    if (anyErr?.errors) return safeStringify(anyErr.errors);

    return safeStringify(err);
  } catch (_e) {
    return "An error occurred (failed to parse).";
  }
}

function safeStringify(obj: unknown) {
  const seen = new WeakSet<object>();
  return JSON.stringify(
    obj,
    (_key, value) => {
      if (value && typeof value === "object") {
        // Type guard for non-null objects
        const asObj = value as object;
        if (seen.has(asObj)) return "[Circular]";
        seen.add(asObj);
      }
      if (typeof value === "function")
        return `[Function ${value.name || "anonymous"}]`;
      return value;
    },
    2
  );
}

export default formatError;
