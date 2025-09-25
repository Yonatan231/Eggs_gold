package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.ProductoDTO;
import com.sena.eggs_gold.service.ProductoService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

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
}