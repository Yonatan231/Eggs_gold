package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.CarritoDTO;
import com.sena.eggs_gold.model.entity.Carrito;
import com.sena.eggs_gold.service.CarritoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/carrito")
public class CarritoController {

    private final CarritoService carritoService;

    public CarritoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    // Mostrar vista del carrito
    @GetMapping
    public String mostrarCarrito() {
        return "cliente/carrito";
    }

    // Agregar producto al carrito
    @PostMapping("/api/agregar")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> agregarAlCarrito(
            @RequestBody Map<String, Object> datos,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            Integer idUsuario = (Integer) session.getAttribute("usuario_id");

            if (idUsuario == null) {
                response.put("success", false);
                response.put("message", "❌ Debes iniciar sesión para agregar productos al carrito");
                return ResponseEntity.badRequest().body(response);
            }

            Integer idProducto = Integer.parseInt(datos.get("idProducto").toString());
            Integer cantidad = Integer.parseInt(datos.get("cantidad").toString());

            if (cantidad <= 0) {
                response.put("success", false);
                response.put("message", "❌ La cantidad debe ser mayor a 0");
                return ResponseEntity.badRequest().body(response);
            }

            Carrito carrito = carritoService.agregarAlCarrito(idUsuario, idProducto, cantidad);

            response.put("success", true);
            response.put("message", "✅ Producto agregado al carrito");
            response.put("cantidadCarrito", carritoService.contarProductosEnCarrito(idUsuario));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Obtener productos del carrito
    @GetMapping("/api/obtener")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerCarrito(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            Integer idUsuario = (Integer) session.getAttribute("usuario_id");

            if (idUsuario == null) {
                response.put("success", false);
                response.put("message", "❌ Debes iniciar sesión");
                return ResponseEntity.badRequest().body(response);
            }

            List<CarritoDTO> productos = carritoService.obtenerCarritoUsuario(idUsuario);
            Float total = carritoService.calcularTotal(idUsuario);

            response.put("success", true);
            response.put("productos", productos);
            response.put("total", total);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Actualizar cantidad de un producto
    @PutMapping("/api/actualizar/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizarCantidad(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> datos) {

        Map<String, Object> response = new HashMap<>();

        try {
            Integer nuevaCantidad = Integer.parseInt(datos.get("cantidad").toString());
            boolean actualizado = carritoService.actualizarCantidad(id, nuevaCantidad);

            if (actualizado) {
                response.put("success", true);
                response.put("message", "✅ Cantidad actualizada");
            } else {
                response.put("success", false);
                response.put("message", "❌ Error al actualizar");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Eliminar producto del carrito
    @DeleteMapping("/api/eliminar/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> eliminarDelCarrito(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        try {
            boolean eliminado = carritoService.eliminarDelCarrito(id);

            if (eliminado) {
                response.put("success", true);
                response.put("message", "✅ Producto eliminado del carrito");
            } else {
                response.put("success", false);
                response.put("message", "❌ Error al eliminar");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Obtener contador del carrito
    @GetMapping("/api/contador")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerContador(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            Integer idUsuario = (Integer) session.getAttribute("usuario_id");

            if (idUsuario == null) {
                response.put("cantidad", 0);
                return ResponseEntity.ok(response);
            }

            Integer cantidad = carritoService.contarProductosEnCarrito(idUsuario);
            response.put("cantidad", cantidad);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("cantidad", 0);
            return ResponseEntity.ok(response);
        }
    }
}