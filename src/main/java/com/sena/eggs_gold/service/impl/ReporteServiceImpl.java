package com.sena.eggs_gold.service.impl;

import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.repository.PedidoRepository;
import com.sena.eggs_gold.service.ReporteService;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;

import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Stream;

@Service
public class ReporteServiceImpl implements ReporteService {
    private final PedidoRepository pedidoRepository;

    public ReporteServiceImpl(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @Override
    public byte[] generarReporteVentas() {
        try {
            Document document = new Document();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);

            document.open();
            document.add(new Paragraph("📊 Reporte de Ventas - Administrador"));
            document.add(new Paragraph("Fecha: 28/09/2025"));
            document.add(new Paragraph("Total de Ventas: $1500"));
            document.add(new Paragraph("Reservas confirmadas: 220"));
            document.add(new Paragraph("Denuncias atendidas: 10"));
            document.close();

            return baos.toByteArray();
        } catch (DocumentException e) {
            throw new RuntimeException("Error al generar PDF", e);
        }
    }

    @Override
    public byte[] generarReportePedidosUsuarios() {
        List<Pedido> pedidos = pedidoRepository.findAllByOrderByFechaCreacionDesc();

        try {
            Document document = new Document();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);

            document.open();
            document.add(new Paragraph("📦 Reporte de Todos los Pedidos"));
            document.add(new Paragraph("Fecha de generación: " + LocalDate.now()));
            document.add(new Paragraph("Total pedidos: " + pedidos.size()));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);

            Stream.of("ID", "Cliente", "Estado", "Total", "Fecha")
                    .forEach(header -> {
                        PdfPCell cell = new PdfPCell(new Phrase(header));
                        cell.setBackgroundColor(Color.LIGHT_GRAY);
                        table.addCell(cell);
                    });

            for (Pedido pedido : pedidos) {
                table.addCell(pedido.getIdPedidos().toString());
                table.addCell(pedido.getUsuario().getNombre());
                table.addCell(pedido.getEstado().name());
                table.addCell(pedido.getFechaCreacion().toString());
            }

            document.add(table);
            document.close();
            return baos.toByteArray();
        } catch (DocumentException e) {
            throw new RuntimeException("Error al generar PDF", e);
        }

    }
}