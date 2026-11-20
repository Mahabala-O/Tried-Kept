/** Slice one ordered result set before rendering, so earlier pages are filled first. */
export function paginate<T>(
  items: readonly T[],
  requested?: string,
  pageSize = 12,
) {
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const parsed = Number(requested);
  const page = Math.min(
    pages,
    Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1,
  );
  const offset = (page - 1) * pageSize;
  return {
    page,
    pages,
    items: items.slice(offset, offset + pageSize),
    start: items.length ? offset + 1 : 0,
    end: Math.min(offset + pageSize, items.length),
  };
}
