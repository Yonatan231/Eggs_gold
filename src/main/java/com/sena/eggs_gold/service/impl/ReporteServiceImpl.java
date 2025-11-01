package com.sena.eggs_gold.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.sena.eggs_gold.model.entity.Logistica;
import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.entity.Producto;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.dto.ConductorDTO;
import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.repository.*;
import com.sena.eggs_gold.service.ReporteService;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.awt.Font;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReporteServiceImpl implements ReporteService {
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ConductorRepository conductorRepository;
    private final LogisticaRepository logisticaRepository;

    public ReporteServiceImpl(PedidoRepository pedidoRepository,
                              ProductoRepository productoRepository,
                              UsuarioRepository usuarioRepository,
                              ConductorRepository conductorRepository,
                              LogisticaRepository logisticaRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.conductorRepository = conductorRepository;
        this.logisticaRepository = logisticaRepository;
    }

    // ========== REPORTE DE PRODUCTOS ==========
    @Override
    public byte[] generarReporteProductos() {
        try {
            List<Producto> productos = productoRepository.findAll();
            productos.sort((p1, p2) -> p2.getIdProducto().compareTo(p1.getIdProducto()));

            Document document = new Document();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);

            document.open();

            // ENCABEZADO
            Paragraph title = new Paragraph("REPORTE DE PRODUCTOS - EGGS & GOLD");
            title.getFont().setSize(16);
            title.getFont().setStyle(Font.BOLD);
            title.getFont().setColor(new Color(0, 51, 102));
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10f);
            document.add(title);

            Paragraph line = new Paragraph("_________________________________________________________");
            line.setAlignment(Element.ALIGN_CENTER);
            line.setSpacingAfter(15f);
            document.add(line);

            // INFORMACIÓN GENERAL
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20f);

            addInfoCell(infoTable, "Fecha de generación:",
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            addInfoCell(infoTable, "Total de productos:", String.valueOf(productos.size()));
            document.add(infoTable);

            // TABLA PRINCIPAL
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.8f, 2f, 1.2f, 1f, 1.2f, 0.8f});
            table.setSpacingBefore(10f);
            table.setSpacingAfter(25f);

            String[] headers = {"ID", "NOMBRE", "PRECIO", "CATEGORÍA", "ESTADO", "STOCK"};
            Color headerColor = new Color(41, 128, 185);

            for (String headerText : headers) {
                Phrase phrase = new Phrase(headerText);
                phrase.getFont().setSize(10);
                phrase.getFont().setStyle(Font.BOLD);
                phrase.getFont().setColor(Color.WHITE);

                PdfPCell cell = new PdfPCell(phrase);
                cell.setBackgroundColor(headerColor);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setPadding(8);
                cell.setBorderWidth(1f);
                cell.setBorderColor(headerColor);
                table.addCell(cell);
            }

            // DATOS DE LA TABLA
            boolean alternate = false;
            Color rowColor1 = new Color(255, 255, 255);
            Color rowColor2 = new Color(248, 248, 248);

            for (Producto producto : productos) {
                Color rowColor = alternate ? rowColor2 : rowColor1;
                alternate = !alternate;

                // ID
                Phrase idPhrase = new Phrase(producto.getIdProducto().toString());
                idPhrase.getFont().setStyle(Font.BOLD);
                addDataCell(table, idPhrase, rowColor, Element.ALIGN_CENTER);

                // Nombre
                String nombre = producto.getNombre() != null ? producto.getNombre() : "N/A";
                addDataCell(table, new Phrase(nombre), rowColor, Element.ALIGN_LEFT);

                // Precio
                String precio = "S/ " + (producto.getPrecio() != null ?
                        String.format("%.2f", producto.getPrecio()) : "0.00");
                Phrase precioPhrase = new Phrase(precio);
                precioPhrase.getFont().setStyle(Font.BOLD);
                precioPhrase.getFont().setColor(new Color(220, 0, 0));
                addDataCell(table, precioPhrase, rowColor, Element.ALIGN_RIGHT);

                // Categoría
                String categoria = producto.getCategoria() != null ?
                        producto.getCategoria().name() : "SIN CATEGORÍA";
                addDataCell(table, new Phrase(categoria), rowColor, Element.ALIGN_CENTER);

                // Estado
                String estado = producto.getEstado() != null ? producto.getEstado().name() : "SIN ESTADO";
                Phrase estadoPhrase = new Phrase(estado);
                estadoPhrase.getFont().setStyle(Font.BOLD);

                PdfPCell estadoCell = new PdfPCell(estadoPhrase);
                estadoCell.setBackgroundColor(getProductoEstadoColor(estado));
                estadoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                estadoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                estadoCell.setPadding(6);
                estadoCell.setBorderWidth(0.5f);
                estadoCell.setBorderColor(new Color(220, 220, 220));
                table.addCell(estadoCell);

                // Stock
                String stock = producto.getCantidad() != null ? producto.getCantidad().toString() : "N/A";
                addDataCell(table, new Phrase(stock), rowColor, Element.ALIGN_CENTER);
            }

            document.add(table);

            // RESUMEN ESTADÍSTICO
            PdfPTable summaryTable = new PdfPTable(3);
            summaryTable.setWidthPercentage(80);
            summaryTable.setHorizontalAlignment(Element.ALIGN_CENTER);
            summaryTable.setSpacingBefore(10f);

            long productosDisponibles = productos.stream()
                    .filter(p -> p.getEstado() != null && "DISPONIBLE".equals(p.getEstado().name()))
                    .count();

            long productosConStock = productos.stream()
                    .filter(p -> p.getCantidad() != null && p.getCantidad() > 0)
                    .count();

            Paragraph summaryTitle = new Paragraph("RESUMEN ESTADÍSTICO");
            summaryTitle.getFont().setSize(12);
            summaryTitle.getFont().setStyle(Font.BOLD);
            summaryTitle.getFont().setColor(new Color(0, 51, 102));
            summaryTitle.setAlignment(Element.ALIGN_CENTER);
            summaryTitle.setSpacingAfter(10f);
            document.add(summaryTitle);

            addSummaryRow(summaryTable, "PRODUCTOS DISPONIBLES:", productosDisponibles + " de " + productos.size());
            addSummaryRow(summaryTable, "PRODUCTOS CON STOCK:", String.valueOf(productosConStock));
            addSummaryRow(summaryTable, "TOTAL PRODUCTOS:", String.valueOf(productos.size()));
            document.add(summaryTable);

            // PIE DE PÁGINA
            Paragraph footer = new Paragraph("Sistema de Gestión - Eggs & Gold • Reporte generado automáticamente");
            footer.getFont().setSize(8);
            footer.getFont().setStyle(Font.ITALIC);
            footer.getFont().setColor(Color.GRAY);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(25f);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al generar reporte de productos: " + e.getMessage(), e);
        }
    }

    // ========== REPORTE DE PEDIDOS ==========
    @Override
    public byte[] generarReportePedidosUsuarios() {
        try {
            List<Pedido> pedidos = pedidoRepository.findAllByOrderByFechaCreacionDesc();

            Document document = new Document(PageSize.A4.rotate());
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);

            document.open();

            // ENCABEZADO
            Paragraph title = new Paragraph("REPORTE DE PEDIDOS - EGGS & GOLD");
            title.getFont().setSize(16);
            title.getFont().setStyle(Font.BOLD);
            title.getFont().setColor(new Color(0, 51, 102));
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10f);
            document.add(title);

            Paragraph line = new Paragraph("_________________________________________________________");
            line.setAlignment(Element.ALIGN_CENTER);
            line.setSpacingAfter(15f);
            document.add(line);

            // INFORMACIÓN GENERAL
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20f);

            addInfoCell(infoTable, "Fecha de generación:",
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            addInfoCell(infoTable, "Total de pedidos:", String.valueOf(pedidos.size()));
            document.add(infoTable);

            // TABLA PRINCIPAL
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.8f, 1.5f, 2f, 1.2f, 1.2f, 1.5f});
            table.setSpacingBefore(10f);
            table.setSpacingAfter(25f);

            String[] headers = {"ID", "CLIENTE", "DIRECCIÓN", "ESTADO", "TOTAL", "FECHA CREACIÓN"};
            Color headerColor = new Color(41, 128, 185);

            for (String headerText : headers) {
                Phrase phrase = new Phrase(headerText);
                phrase.getFont().setSize(10);
                phrase.getFont().setStyle(Font.BOLD);
                phrase.getFont().setColor(Color.WHITE);

                PdfPCell cell = new PdfPCell(phrase);
                cell.setBackgroundColor(headerColor);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setPadding(8);
                cell.setBorderWidth(1f);
                cell.setBorderColor(headerColor);
                table.addCell(cell);
            }

            // DATOS DE LA TABLA
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            boolean alternate = false;
            Color rowColor1 = new Color(255, 255, 255);
            Color rowColor2 = new Color(248, 248, 248);

            for (Pedido pedido : pedidos) {
                Color rowColor = alternate ? rowColor2 : rowColor1;
                alternate = !alternate;

                // ID
                Phrase idPhrase = new Phrase(pedido.getIdPedidos().toString());
                idPhrase.getFont().setStyle(Font.BOLD);
                addDataCell(table, idPhrase, rowColor, Element.ALIGN_CENTER);

                // Cliente
                String cliente = "N/A";
                if (pedido.getUsuario() != null) {
                    cliente = pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido();
                }
                addDataCell(table, new Phrase(cliente), rowColor, Element.ALIGN_LEFT);

                // Dirección
                String direccion = pedido.getDireccion() != null ? pedido.getDireccion() : "N/A";
                if (direccion.length() > 30) {
                    direccion = direccion.substring(0, 27) + "...";
                }
                addDataCell(table, new Phrase(direccion), rowColor, Element.ALIGN_LEFT);

                // Estado
                String estado = pedido.getEstado() != null ? pedido.getEstado().name() : "SIN ESTADO";
                Phrase estadoPhrase = new Phrase(estado);
                estadoPhrase.getFont().setStyle(Font.BOLD);

                PdfPCell estadoCell = new PdfPCell(estadoPhrase);
                estadoCell.setBackgroundColor(getPedidoEstadoColor(estado));
                estadoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                estadoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                estadoCell.setPadding(6);
                estadoCell.setBorderWidth(0.5f);
                estadoCell.setBorderColor(new Color(220, 220, 220));
                table.addCell(estadoCell);

                // Total
                String total = "S/ " + (pedido.getTotal() != null ?
                        pedido.getTotal().setScale(2, java.math.RoundingMode.HALF_UP).toString() : "0.00");
                Phrase totalPhrase = new Phrase(total);
                totalPhrase.getFont().setStyle(Font.BOLD);
                addDataCell(table, totalPhrase, rowColor, Element.ALIGN_RIGHT);

                // Fecha Creación
                String fecha = "N/A";
                if (pedido.getFechaCreacion() != null) {
                    fecha = pedido.getFechaCreacion().format(dateFormatter);
                }
                addDataCell(table, new Phrase(fecha), rowColor, Element.ALIGN_CENTER);
            }

            document.add(table);

            // RESUMEN ESTADÍSTICO
            PdfPTable summaryTable = new PdfPTable(4);
            summaryTable.setWidthPercentage(80);
            summaryTable.setHorizontalAlignment(Element.ALIGN_CENTER);
            summaryTable.setSpacingBefore(10f);

            BigDecimal totalGeneral = pedidos.stream()
                    .map(Pedido::getTotal)
                    .filter(total -> total != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long pedidosEntregados = pedidos.stream()
                    .filter(p -> p.getEstado() != null && "ENTREGADO".equals(p.getEstado().name()))
                    .count();

            long pedidosPendientes = pedidos.stream()
                    .filter(p -> p.getEstado() != null && "PENDIENTE".equals(p.getEstado().name()))
                    .count();

            long pedidosAprobados = pedidos.stream()
                    .filter(p -> p.getEstado() != null && "APROBADO".equals(p.getEstado().name()))
                    .count();

            Paragraph summaryTitle = new Paragraph("RESUMEN ESTADÍSTICO");
            summaryTitle.getFont().setSize(12);
            summaryTitle.getFont().setStyle(Font.BOLD);
            summaryTitle.getFont().setColor(new Color(0, 51, 102));
            summaryTitle.setAlignment(Element.ALIGN_CENTER);
            summaryTitle.setSpacingAfter(10f);
            document.add(summaryTitle);

            addSummaryRow(summaryTable, "TOTAL GENERAL:", "S/ " + totalGeneral.setScale(2, java.math.RoundingMode.HALF_UP));
            addSummaryRow(summaryTable, "PEDIDOS ENTREGADOS:", pedidosEntregados + " de " + pedidos.size());
            addSummaryRow(summaryTable, "PEDIDOS PENDIENTES:", String.valueOf(pedidosPendientes));
            addSummaryRow(summaryTable, "PEDIDOS APROBADOS:", String.valueOf(pedidosAprobados));
            document.add(summaryTable);

            // PIE DE PÁGINA
            Paragraph footer = new Paragraph("Sistema de Gestión - Eggs & Gold • Reporte generado automáticamente");
            footer.getFont().setSize(8);
            footer.getFont().setStyle(Font.ITALIC);
            footer.getFont().setColor(Color.GRAY);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(25f);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al generar reporte de pedidos: " + e.getMessage(), e);
        }
    }

    // ========== REPORTE DE CLIENTES ==========
    @Override
    public byte[] generarReporteCliente() {
        try {
            List<Usuario> usuarios = usuarioRepository.buscarClientePorEstado("", com.sena.eggs_gold.model.enums.Estado.ACTIVO);

            Document document = new Document();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);

            document.open();

            // ENCABEZADO
            Paragraph title = new Paragraph("REPORTE DE CLIENTES - EGGS & GOLD");
            title.getFont().setSize(16);
            title.getFont().setStyle(Font.BOLD);
            title.getFont().setColor(new Color(0, 51, 102));
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10f);
            document.add(title);

            Paragraph line = new Paragraph("_________________________________________________________");
            line.setAlignment(Element.ALIGN_CENTER);
            line.setSpacingAfter(15f);
            document.add(line);

            // INFORMACIÓN GENERAL
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20f);

            addInfoCell(infoTable, "Fecha de generación:",
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            addInfoCell(infoTable, "Total de clientes:", String.valueOf(usuarios.size()));
            document.add(infoTable);

            // TABLA PRINCIPAL
            PdfPTable table = new PdfPTable(8);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.8f, 1.5f, 1.5f, 1.2f, 1.5f, 1.2f, 1.5f, 1.2f});
            table.setSpacingBefore(10f);
            table.setSpacingAfter(25f);

            String[] headers = {"ID", "NOMBRE", "APELLIDO", "DOCUMENTO", "TELÉFONO", "CORREO", "FECHA REGISTRO", "ESTADO"};
            Color headerColor = new Color(41, 128, 185);

            for (String headerText : headers) {
                Phrase phrase = new Phrase(headerText);
                phrase.getFont().setSize(9);
                phrase.getFont().setStyle(Font.BOLD);
                phrase.getFont().setColor(Color.WHITE);

                PdfPCell cell = new PdfPCell(phrase);
                cell.setBackgroundColor(headerColor);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setPadding(6);
                cell.setBorderWidth(1f);
                cell.setBorderColor(headerColor);
                table.addCell(cell);
            }

            // DATOS DE LA TABLA
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            boolean alternate = false;
            Color rowColor1 = new Color(255, 255, 255);
            Color rowColor2 = new Color(248, 248, 248);

            for (Usuario usuario : usuarios) {
                Color rowColor = alternate ? rowColor2 : rowColor1;
                alternate = !alternate;

                // ID
                Phrase idPhrase = new Phrase(usuario.getIdUsuarios().toString());
                idPhrase.getFont().setStyle(Font.BOLD);
                addDataCell(table, idPhrase, rowColor, Element.ALIGN_CENTER);

                // Nombre
                String nombre = usuario.getNombre() != null ? usuario.getNombre() : "N/A";
                addDataCell(table, new Phrase(nombre), rowColor, Element.ALIGN_LEFT);

                // Apellido
                String apellido = usuario.getApellido() != null ? usuario.getApellido() : "N/A";
                addDataCell(table, new Phrase(apellido), rowColor, Element.ALIGN_LEFT);

                // Documento
                String tipoDoc = usuario.getTipoDocumento() != null ? usuario.getTipoDocumento().name() : "CC";
                String numDoc = usuario.getNumDocumento() != null ? usuario.getNumDocumento() : "N/A";
                String documento = tipoDoc + ": " + numDoc;
                addDataCell(table, new Phrase(documento), rowColor, Element.ALIGN_CENTER);

                // Teléfono
                String telefono = usuario.getTelefono() != null ? usuario.getTelefono() : "N/A";
                addDataCell(table, new Phrase(telefono), rowColor, Element.ALIGN_CENTER);

                // Correo
                String correo = usuario.getCorreo() != null ? usuario.getCorreo() : "N/A";
                addDataCell(table, new Phrase(correo), rowColor, Element.ALIGN_LEFT);

                // Fecha Registro
                String fechaRegistro = "N/A";
                if (usuario.getFechaRegistro() != null) {
                    fechaRegistro = usuario.getFechaRegistro().format(dateFormatter);
                }
                addDataCell(table, new Phrase(fechaRegistro), rowColor, Element.ALIGN_CENTER);

                // Estado
                String estado = usuario.getEstado() != null ? usuario.getEstado().name() : "SIN ESTADO";
                Phrase estadoPhrase = new Phrase(estado);
                estadoPhrase.getFont().setStyle(Font.BOLD);

                PdfPCell estadoCell = new PdfPCell(estadoPhrase);
                estadoCell.setBackgroundColor(getClienteEstadoColor(estado));
                estadoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                estadoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                estadoCell.setPadding(5);
                estadoCell.setBorderWidth(0.5f);
                estadoCell.setBorderColor(new Color(220, 220, 220));
                table.addCell(estadoCell);
            }

            document.add(table);

            // RESUMEN ESTADÍSTICO
            PdfPTable summaryTable = new PdfPTable(4);
            summaryTable.setWidthPercentage(90);
            summaryTable.setHorizontalAlignment(Element.ALIGN_CENTER);
            summaryTable.setSpacingBefore(10f);

            long clientesActivos = usuarios.stream()
                    .filter(u -> u.getEstado() != null && "ACTIVO".equals(u.getEstado().name()))
                    .count();

            long clientesInactivos = usuarios.stream()
                    .filter(u -> u.getEstado() != null && "INACTIVO".equals(u.getEstado().name()))
                    .count();

            long clientesConCC = usuarios.stream()
                    .filter(u -> u.getTipoDocumento() != null && "CC".equals(u.getTipoDocumento().name()))
                    .count();

            long clientesConCE = usuarios.stream()
                    .filter(u -> u.getTipoDocumento() != null && "CE".equals(u.getTipoDocumento().name()))
                    .count();

            Paragraph summaryTitle = new Paragraph("RESUMEN ESTADÍSTICO");
            summaryTitle.getFont().setSize(12);
            summaryTitle.getFont().setStyle(Font.BOLD);
            summaryTitle.getFont().setColor(new Color(0, 51, 102));
            summaryTitle.setAlignment(Element.ALIGN_CENTER);
            summaryTitle.setSpacingAfter(10f);
            document.add(summaryTitle);

            addSummaryRow(summaryTable, "CLIENTES ACTIVOS:", clientesActivos + " de " + usuarios.size());
            addSummaryRow(summaryTable, "CLIENTES INACTIVOS:", String.valueOf(clientesInactivos));
            addSummaryRow(summaryTable, "CON CÉDULA (CC):", String.valueOf(clientesConCC));
            addSummaryRow(summaryTable, "CON CÉDULA EXTRANJERÍA (CE):", String.valueOf(clientesConCE));
            document.add(summaryTable);

            // PIE DE PÁGINA
            Paragraph footer = new Paragraph("Sistema de Gestión - Eggs & Gold • Reporte generado automáticamente");
            footer.getFont().setSize(8);
            footer.getFont().setStyle(Font.ITALIC);
            footer.getFont().setColor(Color.GRAY);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(25f);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al generar reporte de clientes: " + e.getMessage(), e);
        }
    }

    // ========== REPORTE DE CONDUCTORES ==========
    @Override
    public byte[] generarReporteConductor() {
        try {
            List<ConductorDTO> conductores = conductorRepository.listarConductoresConPedidosEntregados();

            Document document = new Document();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);

            document.open();

            // ENCABEZADO
            Paragraph title = new Paragraph("REPORTE DE CONDUCTORES - EGGS & GOLD");
            title.getFont().setSize(16);
            title.getFont().setStyle(Font.BOLD);
            title.getFont().setColor(new Color(0, 51, 102));
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10f);
            document.add(title);

            Paragraph line = new Paragraph("_________________________________________________________");
            line.setAlignment(Element.ALIGN_CENTER);
            line.setSpacingAfter(15f);
            document.add(line);

            // INFORMACIÓN GENERAL
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20f);

            addInfoCell(infoTable, "Fecha de generación:",
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            addInfoCell(infoTable, "Total de conductores activos:", String.valueOf(conductores.size()));
            document.add(infoTable);

            // TABLA PRINCIPAL
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.8f, 1.5f, 1.5f, 1.5f, 2.0f, 1.2f, 1.2f});
            table.setSpacingBefore(10f);
            table.setSpacingAfter(25f);

            String[] headers = {"ID", "NOMBRE", "APELLIDO", "DOCUMENTO", "DIRECCIÓN", "TELÉFONO", "PEDIDOS ENTREGADOS"};
            Color headerColor = new Color(41, 128, 185);

            for (String headerText : headers) {
                Phrase phrase = new Phrase(headerText);
                phrase.getFont().setSize(9);
                phrase.getFont().setStyle(Font.BOLD);
                phrase.getFont().setColor(Color.WHITE);

                PdfPCell cell = new PdfPCell(phrase);
                cell.setBackgroundColor(headerColor);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setPadding(6);
                cell.setBorderWidth(1f);
                cell.setBorderColor(headerColor);
                table.addCell(cell);
            }

            // DATOS DE LA TABLA
            boolean alternate = false;
            Color rowColor1 = new Color(255, 255, 255);
            Color rowColor2 = new Color(248, 248, 248);

            for (ConductorDTO conductor : conductores) {
                Color rowColor = alternate ? rowColor2 : rowColor1;
                alternate = !alternate;

                // ID
                Phrase idPhrase = new Phrase(conductor.getIdUsuarios().toString());
                idPhrase.getFont().setStyle(Font.BOLD);
                addDataCell(table, idPhrase, rowColor, Element.ALIGN_CENTER);

                // Nombre
                String nombre = conductor.getNombre() != null ? conductor.getNombre() : "N/A";
                addDataCell(table, new Phrase(nombre), rowColor, Element.ALIGN_LEFT);

                // Apellido
                String apellido = conductor.getApellido() != null ? conductor.getApellido() : "N/A";
                addDataCell(table, new Phrase(apellido), rowColor, Element.ALIGN_LEFT);

                // Documento
                String documento = conductor.getNumDocumento() != null ? conductor.getNumDocumento() : "N/A";
                addDataCell(table, new Phrase(documento), rowColor, Element.ALIGN_CENTER);

                // Dirección
                String direccion = conductor.getDireccionUsuario() != null ? conductor.getDireccionUsuario() : "N/A";
                if (direccion.length() > 25) {
                    direccion = direccion.substring(0, 22) + "...";
                }
                addDataCell(table, new Phrase(direccion), rowColor, Element.ALIGN_LEFT);

                // Teléfono
                String telefono = conductor.getTelefono() != null ? conductor.getTelefono() : "N/A";
                addDataCell(table, new Phrase(telefono), rowColor, Element.ALIGN_CENTER);

                // Pedidos Entregados
                String pedidosEntregados = String.valueOf(conductor.getPedidosEntregados());
                Phrase pedidosPhrase = new Phrase(pedidosEntregados);
                pedidosPhrase.getFont().setStyle(Font.BOLD);
                pedidosPhrase.getFont().setColor(new Color(0, 100, 0));

                PdfPCell pedidosCell = new PdfPCell(pedidosPhrase);
                pedidosCell.setBackgroundColor(getPedidosConductorColor(conductor.getPedidosEntregados()));
                pedidosCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                pedidosCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                pedidosCell.setPadding(6);
                pedidosCell.setBorderWidth(0.5f);
                pedidosCell.setBorderColor(new Color(220, 220, 220));
                table.addCell(pedidosCell);
            }

            document.add(table);

            // RESUMEN ESTADÍSTICO
            PdfPTable summaryTable = new PdfPTable(4);
            summaryTable.setWidthPercentage(90);
            summaryTable.setHorizontalAlignment(Element.ALIGN_CENTER);
            summaryTable.setSpacingBefore(10f);

            long totalPedidosEntregados = conductores.stream()
                    .mapToLong(ConductorDTO::getPedidosEntregados)
                    .sum();

            long conductoresConPedidos = conductores.stream()
                    .filter(c -> c.getPedidosEntregados() > 0)
                    .count();

            long conductoresSinPedidos = conductores.stream()
                    .filter(c -> c.getPedidosEntregados() == 0)
                    .count();

            double promedioPedidos = conductores.isEmpty() ? 0 : (double) totalPedidosEntregados / conductores.size();

            // Conductor con más pedidos
            String conductorTop = "Ninguno";
            long maxPedidos = 0;
            for (ConductorDTO conductor : conductores) {
                if (conductor.getPedidosEntregados() > maxPedidos) {
                    maxPedidos = conductor.getPedidosEntregados();
                    conductorTop = conductor.getNombre() + " " + conductor.getApellido();
                }
            }

            Paragraph summaryTitle = new Paragraph("RESUMEN ESTADÍSTICO - CONDUCTORES ACTIVOS");
            summaryTitle.getFont().setSize(12);
            summaryTitle.getFont().setStyle(Font.BOLD);
            summaryTitle.getFont().setColor(new Color(0, 51, 102));
            summaryTitle.setAlignment(Element.ALIGN_CENTER);
            summaryTitle.setSpacingAfter(10f);
            document.add(summaryTitle);

            addSummaryRow(summaryTable, "TOTAL CONDUCTORES ACTIVOS:", String.valueOf(conductores.size()));
            addSummaryRow(summaryTable, "CONDUCTORES CON ENTREGAS:", conductoresConPedidos + " (" +
                    String.format("%.1f%%", (conductoresConPedidos * 100.0 / conductores.size())) + ")");
            addSummaryRow(summaryTable, "CONDUCTORES SIN ENTREGAS:", conductoresSinPedidos + " (" +
                    String.format("%.1f%%", (conductoresSinPedidos * 100.0 / conductores.size())) + ")");
            addSummaryRow(summaryTable, "TOTAL PEDIDOS ENTREGADOS:", String.valueOf(totalPedidosEntregados));
            addSummaryRow(summaryTable, "PROMEDIO POR CONDUCTOR:", String.format("%.1f", promedioPedidos));
            addSummaryRow(summaryTable, "CONDUCTOR CON MÁS ENTREGAS:", conductorTop + " (" + maxPedidos + " pedidos)");
            document.add(summaryTable);

            // PIE DE PÁGINA
            Paragraph footer = new Paragraph("Sistema de Gestión - Eggs & Gold • Reporte generado automáticamente");
            footer.getFont().setSize(8);
            footer.getFont().setStyle(Font.ITALIC);
            footer.getFont().setColor(Color.GRAY);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(25f);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al generar reporte de conductores: " + e.getMessage(), e);
        }
    }

    // ========== REPORTE DE LOGÍSTICA ==========
    @Override
    public byte[] generarReporteLogistica() {
        try {
            // SOLUCIÓN: Usar findAll() que existe por defecto en JpaRepository
            List<Logistica> logisticasEntities = logisticaRepository.findAll();

            Document document = new Document();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);

            document.open();

            // ENCABEZADO
            Paragraph title = new Paragraph("REPORTE DE LOGÍSTICA - EGGS & GOLD");
            title.getFont().setSize(16);
            title.getFont().setStyle(Font.BOLD);
            title.getFont().setColor(new Color(0, 51, 102));
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10f);
            document.add(title);

            Paragraph line = new Paragraph("_________________________________________________________");
            line.setAlignment(Element.ALIGN_CENTER);
            line.setSpacingAfter(15f);
            document.add(line);

            // INFORMACIÓN GENERAL
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20f);

            addInfoCell(infoTable, "Fecha de generación:",
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            addInfoCell(infoTable, "Total de personal de logística:", String.valueOf(logisticasEntities.size()));
            document.add(infoTable);

            // TABLA PRINCIPAL
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.8f, 1.5f, 1.5f, 1.2f, 2.0f, 1.5f, 1.5f});
            table.setSpacingBefore(10f);
            table.setSpacingAfter(25f);

            String[] headers = {"ID", "NOMBRE", "APELLIDO", "DOCUMENTO", "DIRECCIÓN", "TELÉFONO", "CORREO"};
            Color headerColor = new Color(41, 128, 185);

            for (String headerText : headers) {
                Phrase phrase = new Phrase(headerText);
                phrase.getFont().setSize(9);
                phrase.getFont().setStyle(Font.BOLD);
                phrase.getFont().setColor(Color.WHITE);

                PdfPCell cell = new PdfPCell(phrase);
                cell.setBackgroundColor(headerColor);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setPadding(6);
                cell.setBorderWidth(1f);
                cell.setBorderColor(headerColor);
                table.addCell(cell);
            }

            // DATOS DE LA TABLA - USANDO ENTIDAD Logistica DIRECTAMENTE
            boolean alternate = false;
            Color rowColor1 = new Color(255, 255, 255);
            Color rowColor2 = new Color(248, 248, 248);

            for (Logistica logistica : logisticasEntities) {
                Color rowColor = alternate ? rowColor2 : rowColor1;
                alternate = !alternate;

                // ID
                Phrase idPhrase = new Phrase(logistica.getIdUsuarios().toString());
                idPhrase.getFont().setStyle(Font.BOLD);
                addDataCell(table, idPhrase, rowColor, Element.ALIGN_CENTER);

                // Nombre
                String nombre = logistica.getNombre() != null ? logistica.getNombre() : "N/A";
                addDataCell(table, new Phrase(nombre), rowColor, Element.ALIGN_LEFT);

                // Apellido
                String apellido = logistica.getApellido() != null ? logistica.getApellido() : "N/A";
                addDataCell(table, new Phrase(apellido), rowColor, Element.ALIGN_LEFT);

                // Documento
                String documento = logistica.getNumDocumento() != null ? logistica.getNumDocumento() : "N/A";
                addDataCell(table, new Phrase(documento), rowColor, Element.ALIGN_CENTER);

                // Dirección
                String direccion = logistica.getDireccionUsuario() != null ? logistica.getDireccionUsuario() : "N/A";
                if (direccion.length() > 25) {
                    direccion = direccion.substring(0, 22) + "...";
                }
                addDataCell(table, new Phrase(direccion), rowColor, Element.ALIGN_LEFT);

                // Teléfono
                String telefono = logistica.getTelefono() != null ? logistica.getTelefono() : "N/A";
                addDataCell(table, new Phrase(telefono), rowColor, Element.ALIGN_CENTER);

                // Correo
                String correo = logistica.getCorreo() != null ? logistica.getCorreo() : "N/A";
                Phrase correoPhrase = new Phrase(correo);
                correoPhrase.getFont().setColor(new Color(0, 0, 139));
                addDataCell(table, correoPhrase, rowColor, Element.ALIGN_LEFT);
            }

            document.add(table);

            // RESUMEN ESTADÍSTICO
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(70);
            summaryTable.setHorizontalAlignment(Element.ALIGN_CENTER);
            summaryTable.setSpacingBefore(10f);

            Paragraph summaryTitle = new Paragraph("INFORMACIÓN DE LOGÍSTICA");
            summaryTitle.getFont().setSize(12);
            summaryTitle.getFont().setStyle(Font.BOLD);
            summaryTitle.getFont().setColor(new Color(0, 51, 102));
            summaryTitle.setAlignment(Element.ALIGN_CENTER);
            summaryTitle.setSpacingAfter(10f);
            document.add(summaryTitle);

            addSummaryRow(summaryTable, "TOTAL PERSONAL DE LOGÍSTICA:", String.valueOf(logisticasEntities.size()));

            // Usar el rol del primer registro si está disponible
            String rolAsignado = "Personal de Logística";
            if (!logisticasEntities.isEmpty() && logisticasEntities.get(0).getRol() != null) {
                rolAsignado = logisticasEntities.get(0).getRol().getNombreRol();
            }
            addSummaryRow(summaryTable, "ROL ASIGNADO:", rolAsignado);

            addSummaryRow(summaryTable, "ESTADO:", "Todos Activos");
            addSummaryRow(summaryTable, "FUNCIÓN PRINCIPAL:", "Gestión de operaciones");
            document.add(summaryTable);

            // INFORMACIÓN DE CONTACTO
            if (!logisticasEntities.isEmpty()) {
                document.add(new Paragraph(" "));

                Paragraph contactTitle = new Paragraph("INFORMACIÓN DE CONTACTO");
                contactTitle.getFont().setSize(11);
                contactTitle.getFont().setStyle(Font.BOLD);
                contactTitle.getFont().setColor(new Color(0, 51, 102));
                contactTitle.setAlignment(Element.ALIGN_CENTER);
                contactTitle.setSpacingAfter(10f);
                document.add(contactTitle);

                PdfPTable contactTable = new PdfPTable(3);
                contactTable.setWidthPercentage(90);
                contactTable.setHorizontalAlignment(Element.ALIGN_CENTER);

                String[] contactHeaders = {"NOMBRE COMPLETO", "TELÉFONO", "CORREO"};
                for (String header : contactHeaders) {
                    PdfPCell cell = new PdfPCell(new Phrase(header));
                    cell.setBackgroundColor(new Color(100, 150, 200));
                    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    cell.setPadding(5);
                    cell.setBorderWidth(1f);
                    cell.setBorderColor(new Color(100, 150, 200));
                    cell.getPhrase().getFont().setColor(Color.WHITE);
                    cell.getPhrase().getFont().setStyle(Font.BOLD);
                    contactTable.addCell(cell);
                }

                for (Logistica logistica : logisticasEntities) {
                    String nombreCompleto = (logistica.getNombre() != null ? logistica.getNombre() : "") + " " +
                            (logistica.getApellido() != null ? logistica.getApellido() : "");
                    String telefono = logistica.getTelefono() != null ? logistica.getTelefono() : "N/A";
                    String correo = logistica.getCorreo() != null ? logistica.getCorreo() : "N/A";

                    contactTable.addCell(createCell(nombreCompleto.trim(), Element.ALIGN_LEFT));
                    contactTable.addCell(createCell(telefono, Element.ALIGN_CENTER));
                    contactTable.addCell(createCell(correo, Element.ALIGN_LEFT));
                }

                document.add(contactTable);
            }

            // PIE DE PÁGINA
            Paragraph footer = new Paragraph("Sistema de Gestión - Eggs & Gold • Reporte generado automáticamente");
            footer.getFont().setSize(8);
            footer.getFont().setStyle(Font.ITALIC);
            footer.getFont().setColor(Color.GRAY);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(25f);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al generar reporte de logística: " + e.getMessage(), e);
        }
    }

    // ========== MÉTODOS AUXILIARES ==========
    private void addInfoCell(PdfPTable table, String label, String value) {
        Phrase labelPhrase = new Phrase(label);
        labelPhrase.getFont().setStyle(Font.BOLD);

        PdfPCell labelCell = new PdfPCell(labelPhrase);
        labelCell.setBorder(PdfPCell.NO_BORDER);
        labelCell.setPadding(5);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value));
        valueCell.setBorder(PdfPCell.NO_BORDER);
        valueCell.setPadding(5);
        table.addCell(valueCell);
    }

    private void addDataCell(PdfPTable table, Phrase phrase, Color backgroundColor, int alignment) {
        PdfPCell cell = new PdfPCell(phrase);
        cell.setBackgroundColor(backgroundColor);
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6);
        cell.setBorderWidth(0.5f);
        cell.setBorderColor(new Color(220, 220, 220));
        table.addCell(cell);
    }

    private void addSummaryRow(PdfPTable table, String label, String value) {
        Phrase labelPhrase = new Phrase(label);
        labelPhrase.getFont().setStyle(Font.BOLD);

        PdfPCell labelCell = new PdfPCell(labelPhrase);
        labelCell.setBackgroundColor(new Color(250, 250, 250));
        labelCell.setPadding(8);
        labelCell.setBorderWidth(1f);
        labelCell.setBorderColor(new Color(200, 200, 200));
        table.addCell(labelCell);

        Phrase valuePhrase = new Phrase(value);
        valuePhrase.getFont().setStyle(Font.BOLD);
        valuePhrase.getFont().setColor(new Color(41, 128, 185));

        PdfPCell valueCell = new PdfPCell(valuePhrase);
        valueCell.setBackgroundColor(new Color(250, 250, 250));
        valueCell.setPadding(8);
        valueCell.setBorderWidth(1f);
        valueCell.setBorderColor(new Color(200, 200, 200));
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(valueCell);
    }

    private PdfPCell createCell(String text, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(5);
        cell.setBorderWidth(0.5f);
        cell.setBorderColor(new Color(200, 200, 200));
        return cell;
    }

    private Color getClienteEstadoColor(String estado) {
        switch (estado.toUpperCase()) {
            case "ACTIVO": return new Color(220, 255, 220);
            case "INACTIVO": return new Color(255, 220, 220);
            case "SUSPENDIDO": return new Color(255, 255, 200);
            default: return new Color(240, 240, 240);
        }
    }

    private Color getPedidosConductorColor(long totalPedidos) {
        if (totalPedidos == 0) return new Color(255, 240, 240);
        else if (totalPedidos <= 10) return new Color(255, 255, 240);
        else if (totalPedidos <= 25) return new Color(240, 255, 240);
        else return new Color(220, 240, 255);
    }

    private Color getPedidoEstadoColor(String estado) {
        switch (estado.toUpperCase()) {
            case "ENTREGADO": return new Color(220, 255, 220);
            case "APROBADO": return new Color(220, 230, 255);
            case "PENDIENTE": return new Color(255, 255, 200);
            case "CANCELADO": return new Color(255, 220, 220);
            default: return new Color(240, 240, 240);
        }
    }

    private Color getProductoEstadoColor(String estado) {
        switch (estado.toUpperCase()) {
            case "DISPONIBLE": return new Color(220, 255, 220);
            case "AGOTADO": return new Color(255, 220, 220);
            case "INACTIVO": return new Color(255, 255, 200);
            default: return new Color(240, 240, 240);
        }
    }
}