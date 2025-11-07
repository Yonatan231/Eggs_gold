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


    @GetMapping("/reporte-pedidos")
    public ResponseEntity<ByteArrayResource> pedidosUsuarios() {
        return buildResponse(reporteService.generarReportePedidosUsuarios(), "Reporte_Pedidos.pdf");
    }

    @GetMapping("/reporte-productos")
    public ResponseEntity<ByteArrayResource> productos() {
        return buildResponse(reporteService.generarReporteProductos(), "Reporte_Productos.pdf");
    }

    @GetMapping("/reporte-clientes")
    public ResponseEntity<ByteArrayResource> clientes() {
        return buildResponse(reporteService.generarReporteCliente(), "Reporte_Clientes.pdf");
    }

    @GetMapping("/reporte-conductores")
    public ResponseEntity<ByteArrayResource> conductores() {
        return buildResponse(reporteService.generarReporteConductor(), "Reporte_Conductores.pdf");
    }

    @GetMapping("/reporte-logistica")
    public ResponseEntity<ByteArrayResource> logistica() {
        return buildResponse(reporteService.generarReporteLogistica(), "Reporte_Logistica.pdf");
    }

    private ResponseEntity<ByteArrayResource> buildResponse(byte[] bytes, String filename) {
        ByteArrayResource resource = new ByteArrayResource(bytes);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(bytes.length)
                .body(resource);
    }
}