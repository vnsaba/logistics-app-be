import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import fs from "fs";

import { OrdersRepository } from "../../order-service/infraestructure/respository/order.repository";
import { OrderStatus } from "../../shared/enums/orderStatus.enum";
import { EnrichedOrder } from "../../shared/domain/interfaces/enrichedOrder.interface";


export class ReportService {
  constructor(private readonly orderRepository: OrdersRepository) { }

  async generateReport(
    deliveryId: string
  ): Promise<{ pdf: Buffer; excel: Buffer }> {
    // // Obtener la fecha actual
    // const today = new Date();
    // const startOfDay = new Date(today);
    // startOfDay.setHours(0, 0, 0, 0);

    // const endOfDay = new Date(today);
    // endOfDay.setHours(23, 59, 59, 999);

    // Establecer la fecha de prueba como el 01 de junio de 2025 en UTC
    const today = new Date(Date.UTC(2025, 5, 1)); // Meses en JavaScript son base 0 (junio es 5)
    const startOfDay = new Date(today);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log("Start Date:", startOfDay.toISOString());
    console.log("End Date:", endOfDay.toISOString());

    // Obtener los pedidos asignados al repartidor en la fecha actual
    const orders = await this.orderRepository.findByDeliveryAndDate(
      deliveryId,
      startOfDay,
      endOfDay
    );

    console.log(orders)


    if (!orders || orders.length === 0) {
      console.log(
        "No hay pedidos disponibles para el repartidor en la fecha especificada."
      );
      return {
        pdf: Buffer.from(
          "No hay pedidos disponibles para el repartidor en la fecha especificada."
        ),
        excel: Buffer.from(""),
      };
    }

    orders.forEach((order) => {
      if (!order || !order.status || !order.customerId || !order.address) {
        console.error("Invalid order data:", order);
      }
    });

    // Generar el reporte PDF
    const pdfBuffer = await this.generatePDF(orders);


    // Generar el reporte Excel
    const excelBuffer = await this.generateExcel(orders);


    return { pdf: pdfBuffer, excel: excelBuffer };
  }

  private generatePDF(orders: EnrichedOrder[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => {
        buffers.push(chunk);
      });

      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);

        // Guardar temporalmente el PDF en disco para prueba
        try {
          fs.writeFileSync("test_report.pdf", pdfBuffer);
          console.log("PDF guardado en test_report.pdf");
        } catch (err) {
          console.error("Error guardando el PDF:", err);
        }

        resolve(pdfBuffer);
      });

      doc.on("error", (err) => {
        reject(err);
      });

      // Estilos generales
      const primaryColor = "#1E90FF";
      const secondaryColor = "#F5F5F5";

      // Encabezado del reporte con logo
      doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);
      doc.image("assets/geolocalizacion.png", 50, 20, { width: 50 }); // Logo en el encabezado
      doc.fillColor("white").fontSize(20).text("GEOTRACK - Reporte de Pedidos", 110, 30); // Ajustar posición del texto
      doc.fillColor("white").fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`, 110, 55);

      doc.moveDown();

      if (orders.length === 0) {
        // Mensaje si no hay pedidos
        doc.fillColor("black").fontSize(14).text(
          "No hay pedidos disponibles para el repartidor en la fecha especificada.",
          { align: "center" }
        );
      } else {
        // Ajustar posiciones de columnas para más espacio entre ellas
        const startX = 50;
        const tableTop = 120;
        const columnSpacing = 15;
        const columnWidths = [50, 60, 170, 80, 80];

        const pedidoX = startX;
        const clienteX = pedidoX + columnWidths[0] + columnSpacing;
        const direccionX = clienteX + columnWidths[1] + columnSpacing;
        const subtotalX = direccionX + columnWidths[2] + columnSpacing;
        const estadoX = subtotalX + columnWidths[3] + columnSpacing;

        doc.fillColor(primaryColor).fontSize(12).text("Pedido ID", pedidoX, tableTop);
        doc.text("Cliente", clienteX, tableTop);
        doc.text("Dirección", direccionX, tableTop);
        doc.text("Subtotal", subtotalX, tableTop);
        doc.text("Estado", estadoX, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(doc.page.width - 50, tableTop + 15).stroke(primaryColor);

        let rowTop = tableTop + 25;
        orders.forEach((order) => {
          if (!order || !order.status || !order.customerId || !order.address) {
            return;
          }

          doc.fillColor("black").fontSize(10).text(`${order.id}`, 50, rowTop);
          doc.text(`${order.customer ? order.customer.fullname : order.customerId}`, 50 + columnWidths[0] + columnSpacing, rowTop);
          doc.text(`${order.address}`, 50 + columnWidths[0] + columnWidths[1] + columnSpacing * 2, rowTop);
          doc.text(`$${order.subTotal.toFixed(2)}`, 50 + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnSpacing * 3, rowTop);
          doc.text(`${order.status}`, 50 + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnSpacing * 4, rowTop);

          rowTop += 20;
        });
      }

      doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(secondaryColor);

      doc.end();
    });
  }

  private generateExcel(orders: EnrichedOrder[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const data = orders.map((order) => ({
          PedidoID: order.id,
          Cliente: order.customerId,
          Dirección: order.address,
          Subtotal: order.subTotal,
          Estado: order.status ?? OrderStatus.PENDING,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");

        const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        fs.writeFileSync("test_report.xlsx", excelBuffer);
        console.log("Excel guardado en test_report.xlsx");

        resolve(excelBuffer);
      } catch (error) {
        reject(error);
      }
    });
  }

}
