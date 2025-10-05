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
import java.util.Map;

@Controller
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    // Mostrar formulario para agregar producto
    @GetMapping("/agregar_producto")
    public String mostrarFormularioAgregarProducto(Model model) {
        model.addAttribute("producto", new ProductoDTO());
        return "agregar_producto"; // thymeleaf (src/main/resources/templates/agregar_producto.html)
    }

    // Procesar formulario de guardado
    @PostMapping("/agregar_producto")
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
        return "agregar_producto";
    }

    // Listar productos en una vista
    @GetMapping("/lista_productos")
    public String listaProductos(Model model) {
        model.addAttribute("productos", productoService.listaProductos());
        return "lista_productos"; // thymeleaf (src/main/resources/templates/lista_productos.html)
    }


        @PutMapping("/actualizar/{id}")
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

    @PutMapping("/descontinuar")
    public ResponseEntity<String> descontinuarProducto(@RequestParam Integer id) {
        boolean actualizado = productoService.marcarComoDescontinuado(id);

        if (actualizado) {
            return ResponseEntity.ok("✅ Producto marcado como DESCONTINUADO.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("❌ No se pudo actualizar el estado del producto.");
        }
    }




}
