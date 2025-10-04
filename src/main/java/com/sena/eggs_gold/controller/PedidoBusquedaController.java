package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.PedidoBusquedaDTO;
import com.sena.eggs_gold.service.PedidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoBusquedaController {

    private final PedidoService pedidoService;

    public PedidoBusquedaController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping("/buscar")
    public ResponseEntity<List<PedidoBusquedaDTO>> buscar(@RequestBody Map<String, String> body) {
        String buscar = body.getOrDefault("buscar", "");
        List<PedidoBusquedaDTO> resultados = pedidoService.buscarPedidos(buscar);
        return ResponseEntity.ok(resultados);
    }
}
