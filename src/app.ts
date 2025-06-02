import express, { Response as ExResponse, Request as ExRequest, urlencoded, json } from "express";
import { RegisterRoutes } from '../build/routes';
import swaggerUi from "swagger-ui-express";
import { ValidateError } from "tsoa";
import cors from "cors";

import { ReportService } from "../src/report-service/application/report.service";  
import { OrdersRepository } from "../src/order-service/infraestructure/respository/order.repository"; 

export const app = express();

// Swagger UI
app.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  const html = await import("../build/swagger.json").then(mod => swaggerUi.generateHTML(mod));
  res.send(html);
});

app.use(
  urlencoded({
    extended: true,
  })
);
app.use(json());
app.use(cors());

// **RUTA MANUAL PARA PDF**
app.get("/reports/:deliveryId/pdf", async (req: ExRequest, res: ExResponse) => {
  try {
    const { deliveryId } = req.params;

    const reportService = new ReportService(new OrdersRepository());
    const { pdf } = await reportService.generateReport(deliveryId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="report_${deliveryId}.pdf"`
    );

    res.send(pdf);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Error generating PDF report" });
  }
});

// **RUTA MANUAL PARA EXCEL**
app.get("/reports/:deliveryId/excel", async (req: ExRequest, res: ExResponse) => {
  try {
    const { deliveryId } = req.params;

    const reportService = new ReportService(new OrdersRepository());
    const { excel } = await reportService.generateReport(deliveryId);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="report_${deliveryId}.xlsx"`
    );

    res.send(excel);
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).json({ message: "Error generating Excel report" });
  }
});

// Registrar rutas TSOA
RegisterRoutes(app);

// Middleware para manejo de errores
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
