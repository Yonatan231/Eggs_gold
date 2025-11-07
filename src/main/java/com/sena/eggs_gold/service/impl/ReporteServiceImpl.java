package com.sena.eggs_gold.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.sena.eggs_gold.service.ReporteService;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReporteServiceImpl implements ReporteService {

    @Override
    public byte[] generarReporteProductos() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            agregarLogo(document);
            agregarTitulo(document, "Reporte de Productos");

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 2f, 2f, 2f});

            addHeaderCell(table, "Producto");
            addHeaderCell(table, "Precio");
            addHeaderCell(table, "Stock");
            addHeaderCell(table, "Estado");

            // Ejemplo — cambia por tu query real
            List<Object[]> productos = List.of(
                    new Object[]{"Huevos AAA", 15000, 40, "DISPONIBLE"},
                    new Object[]{"Huevos AA", 12000, 0, "AGOTADO"}
            );

            for (Object[] p : productos) {
                addDataCell(table, new Phrase(p[0].toString()), Color.WHITE, Element.ALIGN_LEFT);
                addDataCell(table, new Phrase(p[1].toString()), Color.WHITE, Element.ALIGN_CENTER);
                addDataCell(table, new Phrase(p[2].toString()), Color.WHITE, Element.ALIGN_CENTER);

                Color estadoColor = getProductoEstadoColor(p[3].toString());
                addDataCell(table, new Phrase(p[3].toString()), estadoColor, Element.ALIGN_CENTER);
            }

            document.add(table);
            agregarFooter(document);

        } catch (Exception e) {
            System.out.println("Error PDF productos: " + e.getMessage());
        }

        document.close();
        return baos.toByteArray();
    }

    @Override
    public byte[] generarReportePedidosUsuarios() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            agregarLogo(document);
            agregarTitulo(document, "Reporte de Pedidos - Usuarios");

            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3, 2, 2});

            addHeaderCell(table, "Usuario");
            addHeaderCell(table, "Pedidos");
            addHeaderCell(table, "Estado");

            // Ejemplo
            List<Object[]> pedidos = List.of(
                    new Object[]{"Juan Pérez", 5, "ENTREGADO"},
                    new Object[]{"Carlos Ruiz", 2, "PENDIENTE"}
            );

            for (Object[] p : pedidos) {
                addDataCell(table, new Phrase(p[0].toString()), Color.WHITE, Element.ALIGN_LEFT);
                addDataCell(table, new Phrase(p[1].toString()), Color.WHITE, Element.ALIGN_CENTER);

                Color estadoColor = getPedidoEstadoColor(p[2].toString());
                addDataCell(table, new Phrase(p[2].toString()), estadoColor, Element.ALIGN_CENTER);
            }

            document.add(table);
            agregarFooter(document);

        } catch (Exception e) {
            System.out.println("Error PDF pedidos: " + e.getMessage());
        }

        document.close();
        return baos.toByteArray();
    }

    @Override
    public byte[] generarReporteCliente() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            agregarLogo(document);
            agregarTitulo(document, "Reporte de Clientes");

            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);

            addHeaderCell(table, "Cliente");
            addHeaderCell(table, "Teléfono");
            addHeaderCell(table, "Estado");

            // Ejemplo
            List<Object[]> clientes = List.of(
                    new Object[]{"Ana Gómez", "987654321", "ACTIVO"},
                    new Object[]{"Luis Rojas", "555444333", "INACTIVO"}
            );

            for (Object[] c : clientes) {
                addDataCell(table, new Phrase(c[0].toString()), Color.WHITE, Element.ALIGN_LEFT);
                addDataCell(table, new Phrase(c[1].toString()), Color.WHITE, Element.ALIGN_CENTER);

                Color estadoColor = getClienteEstadoColor(c[2].toString());
                addDataCell(table, new Phrase(c[2].toString()), estadoColor, Element.ALIGN_CENTER);
            }

            document.add(table);
            agregarFooter(document);

        } catch (Exception e) {
            System.out.println("Error PDF clientes: " + e.getMessage());
        }

        document.close();
        return baos.toByteArray();
    }

    @Override
    public byte[] generarReporteConductor() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            agregarLogo(document);
            agregarTitulo(document, "Reporte de Conductores");

            Paragraph p = new Paragraph("Este reporte está pendiente de implementación.\n\n");
            p.setAlignment(Element.ALIGN_CENTER);
            document.add(p);

            agregarFooter(document);
        } catch (Exception e) {
            System.out.println("Error PDF conductores: " + e.getMessage());
        }

        document.close();
        return baos.toByteArray();
    }

    @Override
    public byte[] generarReporteLogistica() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            agregarLogo(document);
            agregarTitulo(document, "Reporte de Logística");

            Paragraph p = new Paragraph("Este reporte está pendiente de implementación.\n\n");
            p.setAlignment(Element.ALIGN_CENTER);
            document.add(p);

            agregarFooter(document);
        } catch (Exception e) {
            System.out.println("Error PDF logística: " + e.getMessage());
        }

        document.close();
        return baos.toByteArray();
    }


    /* ------------------- MÉTODOS UTILITARIOS ------------------- */

    private void agregarLogo(Document document) {
        try {
            InputStream logoStream = getClass().getClassLoader()
                    .getResourceAsStream("static/imagenes/inicio/logo.jpg");

            if (logoStream == null) {
                System.out.println("⚠️ Logo NO encontrado en /static/imagenes/inicio/");
                return;
            }

            byte[] logoBytes = logoStream.readAllBytes(); // ✅ Java nativo
            Image logo = Image.getInstance(logoBytes);

            logo.scaleToFit(120, 120);
            logo.setAlignment(Element.ALIGN_CENTER);

            document.add(logo);
            document.add(new Paragraph("\n"));

        } catch (Exception e) {
            System.out.println("Error al insertar logo: " + e.getMessage());
        }
    }

    private void agregarTitulo(Document doc, String titulo) throws Exception {
        Font font = new Font(Font.HELVETICA, 18, Font.BOLD);
        Paragraph title = new Paragraph("\n" + titulo + "\n\n", font);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);
    }

    private void agregarFooter(Document doc) throws Exception {
        Paragraph footer = new Paragraph(
                "\nReporte generado: " +
                        LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                new Font(Font.HELVETICA, 10, Font.ITALIC)
        );
        footer.setAlignment(Element.ALIGN_RIGHT);
        doc.add(footer);
    }

    private void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, new Font(Font.HELVETICA, 12, Font.BOLD)));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(new Color(220, 220, 220));
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addDataCell(PdfPTable table, Phrase phrase, Color bg, int align) {
        PdfPCell cell = new PdfPCell(phrase);
        cell.setBackgroundColor(bg);
        cell.setHorizontalAlignment(align);
        cell.setPadding(6);
        table.addCell(cell);
    }

    /* ----- COLORES ESTADOS ----- */

    private Color getProductoEstadoColor(String estado) {
        return switch (estado) {
            case "DISPONIBLE" -> new Color(19, 141, 117);
            case "AGOTADO" -> new Color(192, 57, 43);
            default -> Color.GRAY;
        };
    }

    private Color getPedidoEstadoColor(String estado) {
        return switch (estado) {
            case "ENTREGADO" -> new Color(39, 174, 96);
            case "PENDIENTE" -> new Color(241, 196, 15);
            default -> Color.GRAY;
        };
    }

    private Color getClienteEstadoColor(String estado) {
        return "ACTIVO".equals(estado)
                ? new Color(52, 152, 219)
                : new Color(192, 57, 43);
    }
}
