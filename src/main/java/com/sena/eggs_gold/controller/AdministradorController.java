package com.sena.eggs_gold.controller;

import com.itextpdf.text.DocumentException;
import com.sena.eggs_gold.service.AdminService;
import com.sena.eggs_gold.service.impl.ReportePedidoService;
import com.sena.eggs_gold.service.impl.ReporteUsuarioService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Controller
public class AdministradorController {

    private final AdminService adminService;
    private final ReporteUsuarioService reporteUsuarioService;
    private final ReportePedidoService reportePedidoService;

    // Constructor - Spring inyecta automáticamente los servicios
    public AdministradorController(AdminService adminService,
                                   ReporteUsuarioService reporteUsuarioService,
                                   ReportePedidoService reportePedidoService) {
        this.adminService = adminService;
        this.reporteUsuarioService = reporteUsuarioService;
        this.reportePedidoService = reportePedidoService;
    }

    // Endpoint para el panel de administrador
    @GetMapping("/administrador_inicio")
    public String mostrarPanelAdmin() {
        return "administrador/administrador_inicio";
    }

    @GetMapping("/entrada_stock")
    public String mostrarLlegadaStock() {
        return "administrador/entrada_stock";
    }

    /**
     * Endpoint para descargar el reporte PDF de estadísticas de usuarios
     * Genera un PDF con información sobre usuarios por rol, estado y crecimiento
     */
    @GetMapping("/admin/reportes/reporte-usuarios")
    public ResponseEntity<byte[]> descargarReporteUsuarios() {
        try {
            // Generar el PDF
            byte[] pdfBytes = reporteUsuarioService.generarPDFEstadisticasUsuarios();

            // Crear nombre del archivo con fecha actual
            String fechaActual = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String nombreArchivo = "Reporte_Usuarios_" + fechaActual + ".pdf";

            // Configurar headers para la descarga
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", nombreArchivo);
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (DocumentException | java.io.IOException e) {
            // En caso de error al generar el PDF o las gráficas
            System.err.println("Error al generar reporte PDF: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint para descargar el reporte PDF de estadísticas de pedidos
     * Genera un PDF con información sobre pedidos por estado, método de pago y ventas
     */
    @GetMapping("/admin/reportes/reporte-pedidos")
    public ResponseEntity<byte[]> descargarReportePedidos() {
        try {
            // Generar el PDF
            byte[] pdfBytes = reportePedidoService.generarPDFEstadisticasPedidos();

            // Crear nombre del archivo con fecha actual
            String fechaActual = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String nombreArchivo = "Reporte_Pedidos_" + fechaActual + ".pdf";

            // Configurar headers para la descarga
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", nombreArchivo);
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (DocumentException | java.io.IOException e) {
            // En caso de error al generar el PDF o las gráficas
            System.err.println("Error al generar reporte PDF de pedidos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}