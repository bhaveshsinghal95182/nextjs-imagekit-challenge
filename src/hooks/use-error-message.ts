export function formatError(err: unknown): string {
  try {
    if (!err) return "An unknown error occurred.";
    if (typeof err === "string") return err;
    const anyErr = err as unknown & {message?: string; errors?: unknown};
    if (anyErr.message) return String(anyErr.message);
    if (anyErr.errors) return JSON.stringify(anyErr.errors);
    return JSON.stringify(err, null, 2);
  } catch (_e) {
    return "An error occurred (failed to parse).";
  }
}

export default formatError;
