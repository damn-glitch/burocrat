export class BadRequestError extends Error {
  status = 400 as const;

  constructor(message = 'Некорректный запрос') {
    super(message);
  }
}

export class NotFoundError extends Error {
  status = 404 as const;

  constructor(message = 'Ресурс не найден') {
    super(message);
  }
}
