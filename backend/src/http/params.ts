import { BadRequestError } from './errors';

export function parseId(param: any, name = 'id'): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequestError(`Invalid ${name}`);
  return id;
}
