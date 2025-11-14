package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.EntradaStockDTO;
import com.sena.eggs_gold.model.entity.EntradaStock;
import com.sena.eggs_gold.service.EntradaStockService;
import com.sena.eggs_gold.service.ProductoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/entrada-stock")
public class EntradaStockController {

    private final EntradaStockService entradaStockService;
    private final ProductoService productoService;

    public EntradaStockController(EntradaStockService entradaStockService,
                                  ProductoService productoService) {
        this.entradaStockService = entradaStockService;
        this.productoService = productoService;
    }

    // Mostrar formulario de registro (ADMIN)
    @GetMapping("/registrar")
    public String mostrarFormularioRegistro(Model model) {
        model.addAttribute("productos", productoService.listaProductos());
        return "registros/entrada_stock";
    }

    // ✅ NUEVO: Mostrar vista de aprobación (LOGÍSTICA)
    @GetMapping("/aprobar")
    public String mostrarVistaAprobacion() {
        return "logistica/aprobar_entrada";
    }

    // Endpoint para obtener productos (API REST)
    @GetMapping("/api/productos")
    @ResponseBody
    public ResponseEntity<List<?>> obtenerProductosDisponibles() {
        return ResponseEntity.ok(productoService.listaProductos());
    }

    // Registrar nueva entrada de stock
    @PostMapping("/api/registrar")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> registrarEntrada(@RequestBody Map<String, Object> datos) {
        Map<String, Object> response = new HashMap<>();

        try {
            Integer idProducto = Integer.parseInt(datos.get("idProducto").toString());
            Integer cantidad = Integer.parseInt(datos.get("cantidad").toString());
            String proveedor = datos.get("proveedor").toString();

            EntradaStock entrada = entradaStockService.registrarEntrada(idProducto, cantidad, proveedor);

            response.put("success", true);
            response.put("message", "✅ Entrada registrada correctamente");
            response.put("id", entrada.getId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "❌ Error al registrar entrada: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Listar todas las entradas
    @GetMapping("/api/listar")
    @ResponseBody
    public ResponseEntity<List<EntradaStockDTO>> listarEntradas() {
        return ResponseEntity.ok(entradaStockService.listarTodasLasEntradas());
    }

    // Listar solo entradas pendientes
    @GetMapping("/api/pendientes")
    @ResponseBody
    public ResponseEntity<List<EntradaStockDTO>> listarPendientes() {
        return ResponseEntity.ok(entradaStockService.listarEntradasPendientes());
    }

    // ✅ NUEVO: Aprobar entrada
    @PostMapping("/api/aprobar")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> aprobarEntrada(
            @RequestBody Map<String, Object> datos,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Obtener ID del usuario de logística desde la sesión
            Integer idLogistica = (Integer) session.getAttribute("usuario_id");

            if (idLogistica == null) {
                response.put("success", false);
                response.put("message", "❌ No se encontró la sesión del usuario");
                return ResponseEntity.badRequest().body(response);
            }

            Integer idEntrada = Integer.parseInt(datos.get("idEntrada").toString());
            Integer cantidadFinal = Integer.parseInt(datos.get("cantidad").toString());
            String observacion = datos.getOrDefault("observacion", "").toString();

            boolean aprobado = entradaStockService.aprobarEntrada(
                    idEntrada,
                    idLogistica,
                    cantidadFinal,
                    observacion
            );

            if (aprobado) {
                response.put("success", true);
                response.put("message", "✅ Entrada aprobada e inventario actualizado correctamente");
            } else {
                response.put("success", false);
                response.put("message", "❌ Error al aprobar la entrada");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}