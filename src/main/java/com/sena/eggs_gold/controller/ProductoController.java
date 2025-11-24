package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.ProductoDTO;
import com.sena.eggs_gold.model.entity.Producto;
import com.sena.eggs_gold.service.ProductoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    // ✅ NUEVO: Endpoint para listar TODOS los productos (usado por cargarProductos())
    @GetMapping("/api/productos")
    @ResponseBody
    public List<ProductoDTO> listarTodosLosProductos() {
        return productoService.listaProductos();
    }

    // Mostrar formulario para agregar producto
    @GetMapping("/registrar_producto")
    public String mostrarFormularioAgregarProducto(Model model) {
        model.addAttribute("producto", new ProductoDTO());
        return "registros/registro_producto";
    }

    // Procesar formulario de guardado
    @PostMapping("/registrar_producto")
    public String guardarProducto(
            @ModelAttribute ProductoDTO productoDTO,
            @RequestParam("imagenFile") MultipartFile imagenFile,
            Model model
    ) {
        try {
            productoService.guardarProducto(productoDTO, imagenFile);
            model.addAttribute("success", "✅ Producto guardado con éxito");
        } catch (IOException e) {
            model.addAttribute("error", "❌ Error al guardar el producto: " + e.getMessage());
        }
        model.addAttribute("producto", new ProductoDTO()); // limpiar formulario
        return "registros/registro_producto";
    }

    // Listar productos en una vista
    @GetMapping("/lista_productos")
    public String listaProductos(Model model) {
        model.addAttribute("productos", productoService.listaProductos());
        return "lista_productos";
    }

    // ✅ CORREGIDO: Actualizar producto
    @PutMapping("/api/productos/actualizar/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizarProducto(
            @PathVariable Integer id,
            @RequestBody Producto productoRequest) {

        Map<String, Object> response = new HashMap<>();
        try {
            Producto actualizado = productoService.actualizarProducto(id, productoRequest);

            response.put("success", true);
            response.put("producto", actualizado);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ✅ CORREGIDO: Descontinuar producto
    @PutMapping("/api/productos/descontinuar")
    @ResponseBody
    public ResponseEntity<String> descontinuarProducto(@RequestParam Integer id) {
        boolean actualizado = productoService.marcarComoDescontinuado(id);

        if (actualizado) {
            return ResponseEntity.ok("✅ Producto marcado como DESCONTINUADO.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("❌ No se pudo actualizar el estado del producto.");
        }
    }

    @PostMapping("/api/productos/cargar-csv")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cargarProductosCSV(
            @RequestParam("archivoCSV") MultipartFile archivoCSV) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Validar que se envió un archivo
            if (archivoCSV.isEmpty()) {
                response.put("success", false);
                response.put("message", "❌ Debes seleccionar un archivo CSV");
                return ResponseEntity.badRequest().body(response);
            }

            // Validar extensión del archivo
            String nombreArchivo = archivoCSV.getOriginalFilename();
            if (nombreArchivo == null || !nombreArchivo.toLowerCase().endsWith(".csv")) {
                response.put("success", false);
                response.put("message", "❌ El archivo debe ser .csv");
                return ResponseEntity.badRequest().body(response);
            }

            // Procesar el CSV
            Map<String, Object> resultado = productoService.guardarProductosDesdeCSV(archivoCSV);

            response.put("success", true);
            response.put("exitosos", resultado.get("exitosos"));
            response.put("fallidos", resultado.get("fallidos"));
            response.put("errores", resultado.get("errores"));
            response.put("message", "✅ Carga completada: " +
                    resultado.get("exitosos") + " productos insertados, " +
                    resultado.get("fallidos") + " fallidos");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "❌ Error al procesar el archivo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}