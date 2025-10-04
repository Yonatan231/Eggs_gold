package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.ProductoBusquedaDTO;
import com.sena.eggs_gold.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
public class ProductoBusquedaController {

    @Autowired
    private ProductoService productoService;

    @PostMapping("/buscar")
    public ResponseEntity<List<ProductoBusquedaDTO>> buscar(@RequestBody Map<String, String> body) {
        String buscar = body.getOrDefault("buscar", "");
        List<ProductoBusquedaDTO> resultado = productoService.buscarProductos(buscar);
        return ResponseEntity.ok(resultado);
    }
}
