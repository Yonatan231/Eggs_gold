package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.InventarioBusquedaDTO;
import com.sena.eggs_gold.service.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InventarioBusquedaController {

    private final InventarioService inventarioService;

    @PostMapping("/buscar")
    public ResponseEntity<List<InventarioBusquedaDTO>> buscar(@RequestBody Map<String, String> body) {
        String buscar = body.getOrDefault("buscar", "");
        List<InventarioBusquedaDTO> resultados = inventarioService.buscarInventario(buscar);
        return ResponseEntity.ok(resultados);
    }
}
