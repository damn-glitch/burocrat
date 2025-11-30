// src/swagger.ts
import path from 'path';
import express from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export const swaggerDocs = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const routesGlob = isProd
    ? path.join(__dirname, 'routes', '*.js') // dist/routes/*.js
    : path.join(process.cwd(), 'src', 'routes', '*.ts'); // src/routes/*.ts

  const options = {
    definition: {
      openapi: '3.0.0',
      info: { title: 'Assignment service API', version: '1.0.0' },
      servers: [{ url: 'http://localhost:3000' }],
    },
    apis: [routesGlob],
    failOnErrors: true, // покажет, если аннотации кривые
  };

  const spec = swaggerJSDoc(options);

  const router = express.Router();
  router.use(swaggerUi.serve);
  router.get('/', swaggerUi.setup(spec, { explorer: true }));
  router.get('/swagger.json', (_req, res) => {
    res.json(spec); // ничего не возвращаем из функции — только res.json(...)
  });

  return router;
};
