export function stringifyValue(value: unknown, indent = 2): string {
  try {
    return JSON.stringify(value, null, indent);
  } catch {
    return String(value);
  }
}

export type JsonTokenType =
  | "key"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "plain";

export interface JsonToken {
  type: JsonTokenType;
  value: string;
}

const JSON_VALUE_PATTERN =
  /"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\b(?:true|false|null)\b/g;

export function tokenizeJson(json: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let cursor = 0;

  for (const match of json.matchAll(JSON_VALUE_PATTERN)) {
    const index = match.index;
    if (index > cursor) {
      tokens.push({ type: "plain", value: json.slice(cursor, index) });
    }

    const value = match[0];
    let type: JsonTokenType;

    if (value.startsWith('"')) {
      type = /^\s*:/.test(json.slice(index + value.length))
        ? "key"
        : "string";
    } else if (value === "true" || value === "false") {
      type = "boolean";
    } else if (value === "null") {
      type = "null";
    } else {
      type = "number";
    }

    tokens.push({ type, value });
    cursor = index + value.length;
  }

  if (cursor < json.length) {
    tokens.push({ type: "plain", value: json.slice(cursor) });
  }

  return tokens;
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
