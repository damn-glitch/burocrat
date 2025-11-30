import { BadRequestError } from './errors';

export type PageParams = { page: number; perPage: number; skip: number };

export function parsePage(query: any): PageParams {
  const page = query.page ? Number(query.page) : 1;
  const perPage = query.perPage ? Number(query.perPage) : 20;
  if (!Number.isInteger(page) || page <= 0) throw new BadRequestError('Invalid page');
  if (!Number.isInteger(perPage) || perPage <= 0 || perPage > 100) throw new BadRequestError('Invalid perPage');
  return { page, perPage, skip: (page - 1) * perPage };
}
