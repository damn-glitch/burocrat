// types/page.ts
export type OffsetPage<T> = {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};
