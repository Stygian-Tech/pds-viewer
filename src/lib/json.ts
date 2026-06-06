export function stringifyValue(value: unknown, indent = 2): string {
  try {
    return JSON.stringify(value, null, indent);
  } catch {
    return String(value);
  }
}

export function recordLabel(value: unknown, uri: string): string {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.$type === "string") {
      return record.$type;
    }
    if (typeof record.name === "string") {
      return record.name;
    }
    if (typeof record.title === "string") {
      return record.title;
    }
    if (typeof record.text === "string") {
      const text = record.text.trim();
      if (text.length > 0) {
        return text.length > 48 ? `${text.slice(0, 48)}…` : text;
      }
    }
  }

  const rkey = uri.split("/").pop();
  return rkey ?? uri;
}
