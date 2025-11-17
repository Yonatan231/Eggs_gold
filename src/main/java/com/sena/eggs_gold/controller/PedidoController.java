package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.PedidoDTO;
import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.service.PedidoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/pedido")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    // Validar stock antes de continuar
    @GetMapping("/api/validar-stock")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> validarStock(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            Integer idUsuario = (Integer) session.getAttribute("usuario_id");

            if (idUsuario == null) {
                response.put("success", false);
                response.put("message", "❌ Sesión no válida");
                return ResponseEntity.badRequest().body(response);
            }

            boolean stockDisponible = pedidoService.validarStockDisponible(idUsuario);

            if (stockDisponible) {
                response.put("success", true);
                response.put("message", "✅ Stock disponible");
            } else {
                response.put("success", false);
                response.put("message", "❌ No hay suficiente stock para algunos productos");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Confirmar pedido
    @PostMapping("/api/confirmar")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> confirmarPedido(
            @RequestBody PedidoDTO pedidoDTO,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            Integer idUsuario = (Integer) session.getAttribute("usuario_id");

            if (idUsuario == null) {
                response.put("success", false);
                response.put("message", "❌ Debes iniciar sesión");
                return ResponseEntity.badRequest().body(response);
            }

            // Validaciones
            if (pedidoDTO.getDireccion() == null || pedidoDTO.getDireccion().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "❌ La dirección es obligatoria");
                return ResponseEntity.badRequest().body(response);
            }

            if (pedidoDTO.getMetodoPago() == null || pedidoDTO.getMetodoPago().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "❌ Debes seleccionar un método de pago");
                return ResponseEntity.badRequest().body(response);
            }

            // Crear pedido
            Pedido pedido = pedidoService.crearPedidoDesdeCarrito(idUsuario, pedidoDTO);

            response.put("success", true);
            response.put("message", "✅ Pedido confirmado exitosamente");
            response.put("idPedido", pedido.getIdPedidos());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}