package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.dto.ConfirmarPedidoRequestDTO;
import com.sena.eggs_gold.dto.PedidoDTO;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.service.CarritoService;
import com.sena.eggs_gold.service.PedidoService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedido")
public class PedidoController {

    private final CarritoService carritoService;
    private final PedidoService pedidoService;

    public PedidoController(CarritoService carritoService, PedidoService pedidoService) {
        this.carritoService = carritoService;
        this.pedidoService = pedidoService;
    }

    // -------------------------
    // Confirmar pedido (cliente)
    // -------------------------
    @PostMapping("/confirmar")
    public ResponseEntity<String> confirmarPedido(HttpSession session, @RequestBody ConfirmarPedidoRequestDTO dto) {
        try {
            ClienteDTO cliente = (ClienteDTO) session.getAttribute("cliente");

            if (cliente == null) {
                return ResponseEntity.status(401).body("❌ Cliente no autenticado");
            }

            dto.setUsuarioId(cliente.getIdUsuarios());

            String mensaje = carritoService.confirmarPedido(dto);
            return ResponseEntity.ok(mensaje);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error al confirmar pedido: " + e.getMessage());
        }
    }

    // -------------------------
    // Listar pedidos (admin/logística)
    // -------------------------
    @GetMapping("/listar")

    public Map<String, Object> listarPedidos(
            @RequestParam(name = "estado", required = false) EstadoPedido estado,
            HttpSession session) {

        String rol = (String) session.getAttribute("rol");

        List<PedidoDTO> pedidos = pedidoService.obtenerPedidosPorRol(rol, estado);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("rol", rol);
        response.put("pedidos", pedidos);

        return response;
    }

    @PostMapping("/{id}/aprobar")
    public ResponseEntity<String> aprobarPedido(@PathVariable Integer id) {
        boolean aprobado = pedidoService.aprobarPedido(id);

        if (aprobado) {
            return ResponseEntity.ok("ok");
        } else {
            return ResponseEntity.badRequest().body("error: no se pudo aprobar");
        }
    }

    @PostMapping("/actualizar-estado")
    public ResponseEntity<?> actualizarEstado(
            @RequestParam("id_pedido") Integer idPedido,
            @RequestParam("estado") EstadoPedido estado) {
        try {
            boolean actualizado = pedidoService.actualizarEstado(idPedido, estado);
            if (actualizado) {
                return ResponseEntity.ok(Map.of("success", true));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "No se pudo actualizar"));
            }
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/asignar")

    public ResponseEntity<Map<String, Object>> asignarPedido(@RequestParam Integer pedido_id,
                                                             @RequestParam Integer conductor_id) {
        boolean asignado = pedidoService.asignarPedido(pedido_id, conductor_id);
        if (asignado) {
            return ResponseEntity.ok(Map.of("success", true));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Conductor inválido o error al asignar"));
        }

    }
}

