import express, { Response as ExResponse, Request as ExRequest, urlencoded, json } from "express";
import { RegisterRoutes } from '../build/routes';
import swaggerUi from "swagger-ui-express";
import { ValidateError } from "tsoa";

// src/app.ts

export const app = express();

// Swagger UI
// @ts-expect-error: req and res typing
app.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(
    swaggerUi.generateHTML(await import("../build/swagger.json"))
  );
});

// Middleware to proccess incoming requests
// Use body parser to read sent json payloads
app.use(
  urlencoded({
    extended: true,
  })
);
app.use(json());

// Register routes
RegisterRoutes(app);

app.use(function errorHandler(
  err: unknown,
  _: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (err instanceof ValidateError) {
    res.status(422).json({
      message: 'Validation Failed',
      details: err?.fields,
    });
  } else if (err instanceof Error) {
    res.status(500).json({
      message: err.message,
    });
  } else {
    next();
  }
});
