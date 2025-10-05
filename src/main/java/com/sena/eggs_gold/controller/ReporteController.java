package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.service.PedidoService;
import com.sena.eggs_gold.service.ReporteService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/reportes")
public class ReporteController {

    private final PedidoService pedidoService;
    private final ReporteService reporteService;

    public ReporteController(PedidoService pedidoService, ReporteService reporteService) {
        this.pedidoService = pedidoService;
        this.reporteService = reporteService;
    }

    @GetMapping("/ventas")
    public ResponseEntity<ByteArrayResource> descargarReporteVentas() {
        byte[] pdfBytes = reporteService.generarReporteVentas();
        ByteArrayResource resource = new ByteArrayResource(pdfBytes);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Reporte_Ventas.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
    }

    @GetMapping("/pedidos-usuarios")
    public ResponseEntity<byte[]> descargarReportePedidosUsuarios() {
        byte[] pdf = reporteService.generarReportePedidosUsuarios();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("reporte_pedidos_usuarios", "reporte_pedidos_usuarios.pdf");

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}