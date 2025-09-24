package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.CarritoTemporalDTO;
import com.sena.eggs_gold.dto.ItemCarritoRequestDTO;
import com.sena.eggs_gold.service.CarritoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/carrito")
public class CarritoController {

    @Autowired
    private CarritoService carritoService;

    @PostMapping("/agregar")
    public ResponseEntity<String> agregarItem(
            @ModelAttribute ItemCarritoRequestDTO request,
            HttpSession session) {
        try {
            // Recuperar usuario desde la sesión
            Integer usuarioId = (Integer) session.getAttribute("usuario_id");
            if (usuarioId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("⚠️ Usuario no autenticado");
            }

            request.setUsuario(usuarioId); // 👈 forzamos el id de sesión

            String mensaje = carritoService.AgregarOactualizarItem(request);
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error: " + e.getMessage());
        }
    }


    @GetMapping("/temporal")
    public ResponseEntity<?> obtenerCarritoTemporal(HttpSession session) {
        Integer usuarioId = (Integer) session.getAttribute("usuario_id");
        if (usuarioId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Usuario no autenticado"));
        }

        List<CarritoTemporalDTO> carrito = carritoService.obtenerCarritoPorUsuario(usuarioId);
        return ResponseEntity.ok(carrito);
    }


    @DeleteMapping("/eliminar")
    public ResponseEntity<String> eliminarItem(@RequestParam Integer id) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body("❌ ID no válido.");
        }

        try {
            carritoService.eliminarItemPorId(id);
            return ResponseEntity.ok("✅ Producto eliminado del carrito.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error al eliminar: " + e.getMessage());
        }
    }


}


