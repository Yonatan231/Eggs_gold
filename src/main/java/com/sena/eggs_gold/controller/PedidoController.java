package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.dto.ConfirmarPedidoRequestDTO;
import com.sena.eggs_gold.service.CarritoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pedido")
public class PedidoController {
    private final CarritoService carritoService;

    public PedidoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    @PostMapping("/confirmar")
    public ResponseEntity<String> confirmarPedido(HttpSession session, @RequestBody ConfirmarPedidoRequestDTO dto) {
        try {
            // Extraer el cliente desde la sesión
            ClienteDTO cliente = (ClienteDTO) session.getAttribute("cliente");

            if (cliente == null) {
                return ResponseEntity.status(401).body("❌ Cliente no autenticado");
            }

            // Inyectar el ID del cliente en el DTO
            dto.setUsuarioId(cliente.getIdUsuarios());

            // Confirmar el pedido con el cliente autenticado
            String mensaje = carritoService.confirmarPedido(dto);
            return ResponseEntity.ok(mensaje);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error al confirmar pedido: " + e.getMessage());
        }
    }

}
