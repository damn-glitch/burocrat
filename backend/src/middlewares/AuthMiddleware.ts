import jwt from 'jsonwebtoken';
import express from 'express';

export async function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): Promise<any> {
  // Публичные роуты (полностью без авторизации)
  const publicRoutes = ['/auth', '/file', '/user', '/health'];

  // Опциональные роуты (авторизация желательна, но не обязательна)
  const optionalAuthRoutes = ['123'];
  try {
    if (req.method === 'OPTIONS') {
      next();
    }

    const isPublicRoute = publicRoutes.some((route) => req.url.indexOf(route) !== -1);
    const isOptionalRoute = optionalAuthRoutes.some((route) => req.url.indexOf(route) !== -1);
    if (isPublicRoute && !isOptionalRoute) {
      return next();
    }

    const authHeader = req?.headers?.authorization;
    const authCookiesToken = req?.cookies?.token;
    if (authHeader || authCookiesToken) {
      const payload: string = authHeader ? authHeader.split(' ')[1] : authCookiesToken;
      let jwtData: any = await verifyToken(payload, process.env.SECRET_KEY_JWT);

      // @ts-ignore
      req['userinfo'] = jwtData;
      // @ts-ignore
      req['userinfo'].token = payload;
      // @ts-ignore
      req.user_id = jwtData.user_id;
      next();
    } else {
      if (isOptionalRoute) {
        // Для опциональных роутов продолжаем без userinfo
        next();
      } else {
        throw 'Пользователь не авторизован (noDataAuthorization)';
      }
    }
  } catch (error) {
    res.status(401).json({
      message: 'Не пройдена сверка авторизации. ' + (typeof error === 'object' ? JSON.stringify(error) : error),
    });
  }
}

async function verifyToken(payload: any, secretKey: any) {
  return new Promise((resolve, reject) =>
    jwt.verify(payload, secretKey, (err: any, decoded: any) => (err ? reject(err) : resolve(decoded))),
  );
}
