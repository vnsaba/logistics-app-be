import express, { Response as ExResponse, Request as ExRequest, urlencoded, json } from "express";
import { RegisterRoutes } from '../build/routes';
import swaggerUi from "swagger-ui-express";

// src/app.ts

export const app = express();

// Swagger UI
// @ts-ignore
app.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(
    swaggerUi.generateHTML(await import("../build/swagger.json"))
  );
});

// Use body parser to read sent json payloads
app.use(
  urlencoded({
    extended: true,
  })
);
app.use(json());

// Register routes

RegisterRoutes(app);
