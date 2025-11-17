package com.sena.eggs_gold.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class FacturaPDFService {

    public byte[] generarFacturaPDF(Map<String, Object> facturaData) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);

            document.open();

            // Fuentes
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD);
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
            Font normalFont = new Font(Font.FontFamily.HELVETICA, 10);

            // Título
            Paragraph title = new Paragraph("EGGS GOLD", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph("Factura de Venta", headerFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            // Información de la factura
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            LocalDateTime fechaPago = (LocalDateTime) facturaData.get("fechaPago");

            document.add(new Paragraph("Factura N°: " + facturaData.get("numeroFactura"), headerFont));
            document.add(new Paragraph("Fecha: " + fechaPago.format(formatter), normalFont));
            document.add(new Paragraph("Método de pago: " + facturaData.get("metodoPago"), normalFont));
            document.add(new Paragraph(" ")); // Espacio

            // Datos del cliente
            document.add(new Paragraph("DATOS DEL CLIENTE", headerFont));
            document.add(new Paragraph("Nombre: " + facturaData.get("clienteNombre"), normalFont));
            document.add(new Paragraph("Documento: " + facturaData.get("clienteDocumento"), normalFont));
            document.add(new Paragraph("Dirección: " + facturaData.get("clienteDireccion"), normalFont));
            document.add(new Paragraph("Teléfono: " + facturaData.get("clienteTelefono"), normalFont));
            document.add(new Paragraph(" ")); // Espacio

            // Tabla de productos
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new int[]{3, 1, 2, 2});

            // Encabezados
            PdfPCell cell;
            cell = new PdfPCell(new Phrase("Producto", headerFont));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            table.addCell(cell);

            cell = new PdfPCell(new Phrase("Cant.", headerFont));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            table.addCell(cell);

            cell = new PdfPCell(new Phrase("Precio Unit.", headerFont));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            table.addCell(cell);

            cell = new PdfPCell(new Phrase("Subtotal", headerFont));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            table.addCell(cell);

            // Productos
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> productos = (List<Map<String, Object>>) facturaData.get("productos");

            for (Map<String, Object> producto : productos) {
                table.addCell(new Phrase((String) producto.get("nombre"), normalFont));
                table.addCell(new Phrase(producto.get("cantidad").toString(), normalFont));
                table.addCell(new Phrase("$" + producto.get("precioUnitario").toString(), normalFont));
                table.addCell(new Phrase("$" + producto.get("subtotal").toString(), normalFont));
            }

            document.add(table);
            document.add(new Paragraph(" ")); // Espacio

            // Total
            Paragraph total = new Paragraph("TOTAL: $" + facturaData.get("totalPagado"), titleFont);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            document.add(new Paragraph(" ")); // Espacio
            document.add(new Paragraph("Gracias por su compra", normalFont));

            document.close();

            return baos.toByteArray();

        } catch (DocumentException e) {
            throw new RuntimeException("Error al generar PDF: " + e.getMessage());
        }
    }
}
