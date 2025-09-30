package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.service.ReporteService;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class ReporteServiceImpl implements ReporteService {

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
}