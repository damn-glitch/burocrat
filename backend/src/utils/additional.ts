import { BadRequestError } from '@src/http/errors';

export function validateFields(bind: any, requiredFields: any) {
  for (const field of requiredFields) {
    const path = field.split('.');
    let value = bind;

    for (const key of path) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        throw new BadRequestError(`${field} is required`);
      }
    }

    if (value === null || value === undefined || value === '') {
      throw { code: 400, message: `${field} is required` };
    }
  }
}

export function pluck<T, K extends keyof T>(arr: T[], key: K): T[K][] {
  return arr.map(item => item[key]);
}

export function parseListQuery(q:any){
  const limit = Math.min(Number(q.limit ?? 50), 200);
  const offset = Math.max(Number(q.offset ?? 0), 0);
  const search = (q.q as string | undefined)?.trim();
  return { limit, offset, search };
}
