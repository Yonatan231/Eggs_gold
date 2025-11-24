package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.service.LogisticaService;
import com.sena.eggs_gold.service.EmailService;
import com.sena.eggs_gold.service.PedidoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class LogisticaController {

    @Autowired
    private LogisticaService logisticaService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PedidoService pedidoService;

    // Mostrar formulario de registro de logística
    @GetMapping("/registrar_logistica")
    public String mostrarFormulario(Model model, HttpSession session) {
        // Validar que el rol sea ADMIN
        String rol = (String) session.getAttribute("rol");
        if (rol == null || !rol.equals("ADMIN")) {
            return "redirect:/acceso_denegado";
        }

        model.addAttribute("logistica", new LogisticaDTO());
        return "registros/registro_logistica";
    }

    // Procesar el formulario
    @PostMapping("/registro_logistica")
    public String registrarLogistica(@ModelAttribute("logistica") LogisticaDTO logisticaDTO,
                                     HttpSession session,
                                     Model model) {
        // Validar que el rol sea ADMIN
        String rol = (String) session.getAttribute("rol");
        if (rol == null || !rol.equals("ADMIN")) {
            return "redirect:/acceso_denegado";
        }

        try {
            // Guardar en la base de datos
            logisticaService.registrarLogistica(logisticaDTO);

            // Enviar correo de bienvenida
            emailService.enviarCorreoBienvenida(
                    logisticaDTO.getCorreo(),
                    logisticaDTO.getNombre()
            );

            model.addAttribute("mensaje", "Logística registrada con éxito y correo enviado.");
        } catch (Exception e) {
            model.addAttribute("error", "Error al registrar logística: " + e.getMessage());
            return "registros/registro_logistica";
        }

        return "redirect:/administrador_inicio";
    }

    @GetMapping("/logistica_inicio")
    public String logistica(){
        return "logistica/logistica_inicio";
    }

    @GetMapping("/aprobar_entrada")
    public String vistaAprobacion() {
        return "logistica/aprobar_entrada";
    }

    @GetMapping("/pedidos_pendientes")
    public String vistaPedidosPendientes() {
        return "logistica/pedidos_pendientes";
    }

    // =====================================================
    // NUEVOS ENDPOINTS REST PARA GESTIÓN DE PEDIDOS
    // =====================================================

    // Obtener pedidos pendientes
    @GetMapping("/api/logistica/pedidos-pendientes")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerPedidosPendientes() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Map<String, Object>> pedidos = logisticaService.obtenerPedidosPendientes();

            response.put("success", true);
            response.put("pedidos", pedidos);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener pedidos: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Tomar un pedido
    @PostMapping("/api/logistica/tomar-pedido/{idPedido}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> tomarPedido(
            @PathVariable Integer idPedido,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Obtener ID del usuario logueado
            Integer idLogistica = (Integer) session.getAttribute("usuario_id");

            if (idLogistica == null) {
                response.put("success", false);
                response.put("message", "Sesión no válida");
                return ResponseEntity.status(401).body(response);
            }

            // Tomar el pedido
            logisticaService.tomarPedido(idPedido, idLogistica);

            response.put("success", true);
            response.put("message", "Pedido tomado exitosamente");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Obtener pedidos en alistamiento del usuario logueado
    @GetMapping("/api/logistica/mis-pedidos")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerMisPedidos(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Obtener ID del usuario logueado
            Integer idLogistica = (Integer) session.getAttribute("usuario_id");

            if (idLogistica == null) {
                response.put("success", false);
                response.put("message", "Sesión no válida");
                return ResponseEntity.status(401).body(response);
            }

            List<Map<String, Object>> pedidos = logisticaService.obtenerPedidosEnAlistamiento(idLogistica);

            response.put("success", true);
            response.put("pedidos", pedidos);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener pedidos: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Obtener detalles de un pedido
    @GetMapping("/api/logistica/detalle-pedido/{idPedido}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerDetallePedido(@PathVariable Integer idPedido) {
        Map<String, Object> response = new HashMap<>();

        try {
            Map<String, Object> detalle = logisticaService.obtenerDetallesPedido(idPedido);

            response.put("success", true);
            response.put("detalle", detalle);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener detalles: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Marcar pedido como listo
    @PostMapping("/api/logistica/marcar-listo/{idPedido}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> marcarPedidoListo(@PathVariable Integer idPedido) {
        Map<String, Object> response = new HashMap<>();

        try {
            logisticaService.marcarPedidoListo(idPedido);

            response.put("success", true);
            response.put("message", "Pedido marcado como listo");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // ✅ NUEVO: Obtener conductores disponibles
    @GetMapping("/api/logistica/conductores")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerConductores() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Usuario> conductores = pedidoService.obtenerConductoresDisponibles(); // ✅ CAMBIAR logisticaService por pedidoService

            List<Map<String, String>> conductoresDTO = conductores.stream()
                    .map(c -> {
                        Map<String, String> dto = new HashMap<>();
                        dto.put("id", c.getIdUsuarios().toString());
                        dto.put("nombre", c.getNombre() + " " + c.getApellido());
                        dto.put("documento", c.getNumDocumento());
                        dto.put("telefono", c.getTelefono());
                        return dto;
                    })
                    .toList();

            response.put("success", true);
            response.put("conductores", conductoresDTO);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // ✅ NUEVO: Asignar conductor a pedido
    @PostMapping("/api/logistica/asignar-conductor")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> asignarConductor(
            @RequestBody Map<String, Integer> datos) {

        Map<String, Object> response = new HashMap<>();

        try {
            Integer idPedido = datos.get("idPedido");
            Integer idConductor = datos.get("idConductor");

            if (idPedido == null || idConductor == null) {
                response.put("success", false);
                response.put("message", "Datos incompletos");
                return ResponseEntity.badRequest().body(response);
            }

            pedidoService.asignarConductor(idPedido, idConductor); // ✅ CAMBIAR logisticaService por pedidoService

            response.put("success", true);
            response.put("message", "Conductor asignado exitosamente");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

}