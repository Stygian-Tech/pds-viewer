import { stringifyValue, tokenizeJson, type JsonTokenType } from "@/lib/json";

const TOKEN_CLASSES: Record<JsonTokenType, string> = {
  key: "text-sky-300",
  string: "text-emerald-300",
  number: "text-amber-300",
  boolean: "text-violet-300",
  null: "text-rose-300",
  plain: "text-zinc-400",
};

export function JsonSyntax({ value }: { value: unknown }) {
  const json = stringifyValue(value);

  return (
    <code>
      {tokenizeJson(json).map((token, index) => (
        <span key={`${index}-${token.type}`} className={TOKEN_CLASSES[token.type]}>
          {token.value}
        </span>
      ))}
    </code>
  );
}
