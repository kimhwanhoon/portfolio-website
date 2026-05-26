export function isUniqueViolation(err: unknown, constraint?: string): boolean {
  if (!err || typeof err !== "object") return false;

  const e = err as {
    code?: string;
    constraint?: string;
    cause?: { code?: string; constraint?: string };
  };

  const code = e.code ?? e.cause?.code;
  if (code !== "23505") return false;
  if (!constraint) return true;

  return (e.constraint ?? e.cause?.constraint) === constraint;
}
