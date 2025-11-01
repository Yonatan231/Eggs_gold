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

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @GetMapping("/productos")
    public ResponseEntity<ByteArrayResource> descargarReporteProductos() {
        byte[] pdfBytes = reporteService.generarReporteProductos();
        ByteArrayResource resource = new ByteArrayResource(pdfBytes);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Reporte_Productos.pdf")
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