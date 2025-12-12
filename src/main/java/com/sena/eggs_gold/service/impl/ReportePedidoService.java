package com.sena.eggs_gold.service.impl;

import com.itextpdf.text.*;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.draw.LineSeparator;
import com.sena.eggs_gold.dto.EstadisticasPedidosDTO;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.model.enums.MetodoPago;
import com.sena.eggs_gold.repository.DetallePedidoRepository;
import com.sena.eggs_gold.repository.PedidoRepository;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.data.category.DefaultCategoryDataset;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ReportePedidoService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;

    private static final BaseColor COLOR_PRIMARIO = new BaseColor(41, 128, 185); // Azul
    private static final BaseColor COLOR_SECUNDARIO = new BaseColor(52, 73, 94); // Gris oscuro
    private static final BaseColor COLOR_EXITO = new BaseColor(39, 174, 96); // Verde

    private static final Color COLOR_GRAFICA_1 = new Color(41, 128, 185);
    private static final Color COLOR_GRAFICA_2 = new Color(39, 174, 96);
    private static final Color COLOR_GRAFICA_3 = new Color(230, 126, 34);
    private static final Color COLOR_GRAFICA_4 = new Color(231, 76, 60);

    public ReportePedidoService(PedidoRepository pedidoRepository,
                                DetallePedidoRepository detallePedidoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
    }

    public EstadisticasPedidosDTO obtenerEstadisticasPedidos() {
        EstadisticasPedidosDTO estadisticas = new EstadisticasPedidosDTO();

        estadisticas.setTotalPedidos(pedidoRepository.count());

        Map<String, Long> pedidosPorEstado = new LinkedHashMap<>();
        List<Object[]> resultadosEstado = pedidoRepository.countPedidosPorEstado();
        for (Object[] resultado : resultadosEstado) {
            EstadoPedido estado = (EstadoPedido) resultado[0];
            Long cantidad = (Long) resultado[1];
            pedidosPorEstado.put(estado.name(), cantidad);
        }
        estadisticas.setPedidosPorEstado(pedidosPorEstado);

        Map<String, Long> pedidosPorMetodoPago = new LinkedHashMap<>();
        List<Object[]> resultadosMetodoPago = pedidoRepository.countPedidosPorMetodoPago();
        for (Object[] resultado : resultadosMetodoPago) {
            MetodoPago metodoPago = (MetodoPago) resultado[0];
            Long cantidad = (Long) resultado[1];
            pedidosPorMetodoPago.put(metodoPago.name(), cantidad);
        }
        estadisticas.setPedidosPorMetodoPago(pedidosPorMetodoPago);

        Map<String, BigDecimal> ventasPorMes = new LinkedHashMap<>();
        List<Object[]> resultadosVentas = detallePedidoRepository.calcularVentasPorMes();
        for (Object[] resultado : resultadosVentas) {
            String mes = (String) resultado[0];
            BigDecimal total = (BigDecimal) resultado[1];
            ventasPorMes.put(mes, total);
        }
        estadisticas.setVentasPorMes(ventasPorMes);

        Map<String, Long> crecimientoPorMes = new LinkedHashMap<>();
        List<Object[]> resultadosMes = pedidoRepository.countPedidosPorMes();
        for (Object[] resultado : resultadosMes) {
            String mes = (String) resultado[0];
            Long cantidad = (Long) resultado[1];
            crecimientoPorMes.put(mes, cantidad);
        }
        estadisticas.setCrecimientoPorMes(crecimientoPorMes);

        return estadisticas;
    }

    public byte[] generarPDFEstadisticasPedidos() throws DocumentException, IOException {
        Document document = new Document(PageSize.LETTER);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            EstadisticasPedidosDTO estadisticas = obtenerEstadisticasPedidos();

            agregarEncabezado(document);
            agregarInformacionGeneral(document, estadisticas);

            agregarEstadisticasPorEstado(document, estadisticas);
            agregarGraficaBarrasEstado(document, estadisticas);

            document.newPage();
            agregarEstadisticasPorMetodoPago(document, estadisticas);
            agregarGraficaBarrasMetodoPago(document, estadisticas);

            document.newPage();
            agregarVentasPorMes(document, estadisticas);
            agregarGraficaBarrasVentas(document, estadisticas);

            document.newPage();
            agregarCrecimientoPorMes(document, estadisticas);
            agregarGraficaBarrasCrecimiento(document, estadisticas);

            agregarPiePagina(document);

        } finally {
            document.close();
        }

        return baos.toByteArray();
    }


    private void agregarEncabezado(Document document) throws DocumentException {
        Font tituloFont = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, COLOR_PRIMARIO);
        Paragraph titulo = new Paragraph("REPORTE DE ESTADÍSTICAS DE PEDIDOS", tituloFont);
        titulo.setAlignment(Element.ALIGN_CENTER);
        titulo.setSpacingAfter(10);
        document.add(titulo);

        Font subtituloFont = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL, COLOR_SECUNDARIO);
        String fechaActual = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        Paragraph subtitulo = new Paragraph("Generado el: " + fechaActual, subtituloFont);
        subtitulo.setAlignment(Element.ALIGN_CENTER);
        subtitulo.setSpacingAfter(20);
        document.add(subtitulo);

        agregarLineaSeparadora(document);
    }

    private void agregarInformacionGeneral(Document document, EstadisticasPedidosDTO estadisticas)
            throws DocumentException {

        Font tituloSeccionFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, COLOR_SECUNDARIO);
        Paragraph tituloSeccion = new Paragraph("1. RESUMEN GENERAL", tituloSeccionFont);
        tituloSeccion.setSpacingBefore(15);
        tituloSeccion.setSpacingAfter(10);
        document.add(tituloSeccion);

        PdfPTable tabla = new PdfPTable(2);
        tabla.setWidthPercentage(100);
        tabla.setSpacingAfter(15);

        PdfPCell celdaEncabezado = new PdfPCell(new Phrase("TOTAL DE PEDIDOS REGISTRADOS",
                new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.WHITE)));
        celdaEncabezado.setBackgroundColor(COLOR_PRIMARIO);
        celdaEncabezado.setPadding(10);
        celdaEncabezado.setHorizontalAlignment(Element.ALIGN_CENTER);
        tabla.addCell(celdaEncabezado);

        PdfPCell celdaCantidad = new PdfPCell(new Phrase(estadisticas.getTotalPedidos().toString(),
                new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.WHITE)));
        celdaCantidad.setBackgroundColor(COLOR_EXITO);
        celdaCantidad.setPadding(10);
        celdaCantidad.setHorizontalAlignment(Element.ALIGN_CENTER);
        tabla.addCell(celdaCantidad);

        document.add(tabla);
    }

    private void agregarEstadisticasPorEstado(Document document, EstadisticasPedidosDTO estadisticas)
            throws DocumentException {

        Font tituloSeccionFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, COLOR_SECUNDARIO);
        Paragraph tituloSeccion = new Paragraph("2. PEDIDOS POR ESTADO", tituloSeccionFont);
        tituloSeccion.setSpacingBefore(15);
        tituloSeccion.setSpacingAfter(10);
        document.add(tituloSeccion);

        PdfPTable tabla = new PdfPTable(3);
        tabla.setWidthPercentage(100);
        tabla.setWidths(new float[]{3, 2, 2});
        tabla.setSpacingAfter(15);

        agregarCeldaEncabezado(tabla, "ESTADO");
        agregarCeldaEncabezado(tabla, "CANTIDAD");
        agregarCeldaEncabezado(tabla, "PORCENTAJE");

        Long total = estadisticas.getTotalPedidos();
        for (Map.Entry<String, Long> entry : estadisticas.getPedidosPorEstado().entrySet()) {
            agregarCeldaDato(tabla, entry.getKey());
            agregarCeldaDato(tabla, entry.getValue().toString());

            double porcentaje = (entry.getValue() * 100.0) / total;
            agregarCeldaDato(tabla, String.format("%.1f%%", porcentaje));
        }

        document.add(tabla);
    }

    private void agregarGraficaBarrasEstado(Document document, EstadisticasPedidosDTO estadisticas)
            throws DocumentException, IOException {

        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        for (Map.Entry<String, Long> entry : estadisticas.getPedidosPorEstado().entrySet()) {
            dataset.addValue(entry.getValue(), "Pedidos", entry.getKey());
        }

        JFreeChart chart = ChartFactory.createBarChart(
                "Distribución de Pedidos por Estado",
                "Estado",
                "Cantidad",
                dataset,
                PlotOrientation.VERTICAL,
                false, true, false
        );

        CategoryPlot plot = chart.getCategoryPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setRangeGridlinePaint(Color.LIGHT_GRAY);

        org.jfree.chart.renderer.category.BarRenderer renderer =
                (org.jfree.chart.renderer.category.BarRenderer) plot.getRenderer();
        renderer.setSeriesPaint(0, COLOR_GRAFICA_1);
        renderer.setBarPainter(new org.jfree.chart.renderer.category.StandardBarPainter());
        renderer.setShadowVisible(false);

        agregarGraficaAlPDF(document, chart, 500, 300);
    }

    private void agregarEstadisticasPorMetodoPago(Document document, EstadisticasPedidosDTO estadisticas)
            throws DocumentException {

        Font tituloSeccionFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, COLOR_SECUNDARIO);
        Paragraph tituloSeccion = new Paragraph("3. PEDIDOS POR MÉTODO DE PAGO", tituloSeccionFont);
        tituloSeccion.setSpacingBefore(15);
        tituloSeccion.setSpacingAfter(10);
        document.add(tituloSeccion);

        PdfPTable tabla = new PdfPTable(3);
        tabla.setWidthPercentage(100);
        tabla.setWidths(new float[]{3, 2, 2});
        tabla.setSpacingAfter(15);

        agregarCeldaEncabezado(tabla, "MÉTODO DE PAGO");
        agregarCeldaEncabezado(tabla, "CANTIDAD");
        agregarCeldaEncabezado(tabla, "PORCENTAJE");

        Long total = estadisticas.getTotalPedidos();
        for (Map.Entry<String, Long> entry : estadisticas.getPedidosPorMetodoPago().entrySet()) {
            agregarCeldaDato(tabla, entry.getKey());
            agregarCeldaDato(tabla, entry.getValue().toString());

            double porcentaje = (entry.getValue() * 100.0) / total;
            agregarCeldaDato(tabla, String.format("%.1f%%", porcentaje));
        }

        document.add(tabla);
    }

    private void agregarGraficaBarrasMetodoPago(Document document, EstadisticasPedidosDTO estadisticas)
            throws DocumentException, IOException {

        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        for (Map.Entry<String, Long> entry : estadisticas.getPedidosPorMetodoPago().entrySet()) {
            dataset.addValue(entry.getValue(), "Pedidos", entry.getKey());
        }

        JFreeChart chart = ChartFactory.createBarChart(
                "Distribución por Método de Pago",
                "Método",
                "Cantidad",
                dataset,
                PlotOrientation.VERTICAL,
                false, true, false
        );

        CategoryPlot plot = chart.getCategoryPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setRangeGridlinePaint(Color.LIGHT_GRAY);

        org.jfree.chart.renderer.category.BarRenderer renderer =
                (org.jfree.chart.renderer.category.BarRenderer) plot.getRenderer();
        renderer.setSeriesPaint(0, COLOR_GRAFICA_2);
        renderer.setBarPainter(new org.jfree.chart.renderer.category.StandardBarPainter());
        renderer.setShadowVisible(false);

        agregarGraficaAlPDF(document, chart, 500, 300);
    }

    private void agregarVentasPorMes(Document document, EstadisticasPedidosDTO estadisticas)
            throws DocumentException {

        Font tituloSeccionFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, COLOR_SECUNDARIO);
        Paragraph tituloSeccion = new Paragraph("4. VENTAS MENSUALES", tituloSeccionFont);
        tituloSeccion.setSpacingBefore(15);
        tituloSeccion.setSpacingAfter(10);
        document.add(tituloSeccion);

        PdfPTable tabla = new PdfPTable(2);
        tabla.setWidthPercentage(100);
        tabla.setWidths(new float[]{2, 2});
        tabla.setSpacingAfter(15);

        agregarCeldaEncabezado(tabla, "MES");
        agregarCeldaEncabezado(tabla, "TOTAL VENTAS");

        NumberFormat formatoPesos = NumberFormat.getCurrencyInstance(new Locale("es", "CO"));
        for (Map.Entry<String, BigDecimal> entry : estadisticas.getVentasPorMes().entrySet()) {
            agregarCeldaDato(tabla, formatearMes(entry.getKey()));
            agregarCeldaDato(tabla, formatoPesos.format(entry.getValue()));
        }

        document.add(tabla);
    }

    private void agregarGraficaBarrasVentas(Document document, EstadisticasPedidosDTO estadisticas)
            throws DocumentException, IOException {

        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        for (Map.Entry<String, BigDecimal> entry : estadisticas.getVentasPorMes().entrySet()) {
            String mesFormateado = formatearMesCorto(entry.getKey());
            dataset.addValue(entry.getValue(), "Ventas", mesFormateado);
        }

        JFreeChart chart = ChartFactory.createBarChart(
                "Ventas Mensuales",
                "Mes",
                "Total ($)",
                dataset,
                PlotOrientation.VERTICAL,
                false, true, false
        );

        CategoryPlot plot = chart.getCategoryPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setRangeGridlinePaint(Color.LIGHT_GRAY);

        org.jfree.chart.renderer.category.BarRenderer renderer =
                (org.jfree.chart.renderer.category.BarRenderer) plot.getRenderer();
        renderer.setSeriesPaint(0, COLOR_GRAFICA_3);
        renderer.setBarPainter(new org.jfree.chart.renderer.category.StandardBarPainter());
        renderer.setShadowVisible(false);

        agregarGraficaAlPDF(document, chart, 500, 300);
    }

    private void agregarCrecimientoPorMes(Document document, EstadisticasPedidosDTO estadisticas)
            throws DocumentException {

        Font tituloSeccionFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, COLOR_SECUNDARIO);
        Paragraph tituloSeccion = new Paragraph("5. CRECIMIENTO DE PEDIDOS POR MES", tituloSeccionFont);
        tituloSeccion.setSpacingBefore(15);
        tituloSeccion.setSpacingAfter(10);
        document.add(tituloSeccion);

        PdfPTable tabla = new PdfPTable(2);
        tabla.setWidthPercentage(100);
        tabla.setWidths(new float[]{2, 2});
        tabla.setSpacingAfter(15);

        agregarCeldaEncabezado(tabla, "MES");
        agregarCeldaEncabezado(tabla, "CANTIDAD");

        for (Map.Entry<String, Long> entry : estadisticas.getCrecimientoPorMes().entrySet()) {
            agregarCeldaDato(tabla, formatearMes(entry.getKey()));
            agregarCeldaDato(tabla, entry.getValue().toString());
        }

        document.add(tabla);
    }

    private void agregarGraficaBarrasCrecimiento(Document document, EstadisticasPedidosDTO estadisticas)
            throws DocumentException, IOException {

        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        for (Map.Entry<String, Long> entry : estadisticas.getCrecimientoPorMes().entrySet()) {
            String mesFormateado = formatearMesCorto(entry.getKey());
            dataset.addValue(entry.getValue(), "Pedidos", mesFormateado);
        }

        JFreeChart chart = ChartFactory.createBarChart(
                "Crecimiento Mensual de Pedidos",
                "Mes",
                "Cantidad",
                dataset,
                PlotOrientation.VERTICAL,
                false, true, false
        );

        CategoryPlot plot = chart.getCategoryPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setRangeGridlinePaint(Color.LIGHT_GRAY);

        org.jfree.chart.renderer.category.BarRenderer renderer =
                (org.jfree.chart.renderer.category.BarRenderer) plot.getRenderer();
        renderer.setSeriesPaint(0, COLOR_GRAFICA_4);
        renderer.setBarPainter(new org.jfree.chart.renderer.category.StandardBarPainter());
        renderer.setShadowVisible(false);

        agregarGraficaAlPDF(document, chart, 500, 300);
    }

    private void agregarGraficaAlPDF(Document document, JFreeChart chart, int width, int height)
            throws IOException, DocumentException {

        BufferedImage bufferedImage = chart.createBufferedImage(width, height);
        ByteArrayOutputStream imageOutputStream = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "png", imageOutputStream);

        Image image = Image.getInstance(imageOutputStream.toByteArray());
        image.scaleToFit(500, 300);
        image.setAlignment(Element.ALIGN_CENTER);
        image.setSpacingBefore(10);
        image.setSpacingAfter(20);

        document.add(image);
    }

    private void agregarPiePagina(Document document) throws DocumentException {
        agregarLineaSeparadora(document);

        Font pieFont = new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC, BaseColor.GRAY);
        Paragraph pie = new Paragraph("Este reporte fue generado automáticamente por Eggs Gold", pieFont);
        pie.setAlignment(Element.ALIGN_CENTER);
        pie.setSpacingBefore(10);
        document.add(pie);
    }

    private void agregarLineaSeparadora(Document document) throws DocumentException {
        LineSeparator linea = new LineSeparator();
        linea.setLineColor(COLOR_PRIMARIO);
        document.add(new Chunk(linea));
    }

    private void agregarCeldaEncabezado(PdfPTable tabla, String texto) {
        Font font = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.WHITE);
        PdfPCell celda = new PdfPCell(new Phrase(texto, font));
        celda.setBackgroundColor(COLOR_PRIMARIO);
        celda.setPadding(8);
        celda.setHorizontalAlignment(Element.ALIGN_CENTER);
        tabla.addCell(celda);
    }

    private void agregarCeldaDato(PdfPTable tabla, String texto) {
        Font font = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, COLOR_SECUNDARIO);
        PdfPCell celda = new PdfPCell(new Phrase(texto, font));
        celda.setPadding(6);
        celda.setHorizontalAlignment(Element.ALIGN_CENTER);
        tabla.addCell(celda);
    }

    private String formatearMes(String mes) {
        String[] partes = mes.split("-");
        int anio = Integer.parseInt(partes[0]);
        int mesNum = Integer.parseInt(partes[1]);

        String[] meses = {"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"};

        return meses[mesNum - 1] + " " + anio;
    }

    private String formatearMesCorto(String mes) {
        String[] partes = mes.split("-");
        int anio = Integer.parseInt(partes[0]);
        int mesNum = Integer.parseInt(partes[1]);

        String[] meses = {"Ene", "Feb", "Mar", "Abr", "May", "Jun",
                "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"};

        return meses[mesNum - 1] + " " + anio;
    }
}