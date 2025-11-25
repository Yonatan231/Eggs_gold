package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.ConductorDTO;
import com.sena.eggs_gold.service.ConductorService;
import com.sena.eggs_gold.service.EmailService;
import com.sena.eggs_gold.service.LogisticaService;
import com.sena.eggs_gold.service.UsuarioService;
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
public class ConductorController {

    @Autowired
    private ConductorService conductorService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private LogisticaService logisticaService;

    @Autowired
    private UsuarioService usuarioService;

    // Mostrar formulario de registro de conductor
    @GetMapping("/registrar_conductor")
    public String mostrarFormulario(Model model, HttpSession session) {
        String rol = (String) session.getAttribute("rol");
        if (rol == null || !rol.equals("ADMIN")) {
            return "redirect:/acceso_denegado";
        }

        model.addAttribute("conductor", new ConductorDTO());
        return "registros/registro_conductor";
    }

    @PostMapping("/registro_conductor")
    public String registrarConductor(@ModelAttribute("conductor") ConductorDTO conductorDTO,
                                     HttpSession session,
                                     Model model) {
        String rol = (String) session.getAttribute("rol");
        if (rol == null || !rol.equals("ADMIN")) {
            return "redirect:/acceso_denegado";
        }

        // ✅ Validar que el número de documento no esté registrado
        if (usuarioService.documentoYaExistente(conductorDTO.getNumDocumento())) {
            model.addAttribute("error", "El correo electrónico o el número de documento ya está registrado");
            model.addAttribute("conductor", conductorDTO); // Mantener los datos del formulario
            return "registros/registro_conductor";
        }

        // ✅ Validar que el correo no esté registrado
        if (usuarioService.correoYaExistente(conductorDTO.getCorreo())) {
            model.addAttribute("error", "El correo electrónico o el número de documento ya está registrado");
            model.addAttribute("conductor", conductorDTO); // Mantener los datos del formulario
            return "registros/registro_conductor";
        }

        try {
            conductorService.registrarConductor(conductorDTO);
            emailService.enviarCorreoBienvenida(
                    conductorDTO.getCorreo(),
                    conductorDTO.getNombre()
            );

            // ✅ Mensaje de éxito y limpiar formulario
            model.addAttribute("mensaje", "Conductor registrado exitosamente y correo enviado");
            model.addAttribute("conductor", new ConductorDTO()); // Formulario limpio
            return "registros/registro_conductor";

        } catch (Exception e) {
            model.addAttribute("error", "Error al registrar conductor: " + e.getMessage());
            model.addAttribute("conductor", conductorDTO); // Mantener los datos del formulario
            return "registros/registro_conductor";
        }
    }

    @GetMapping("/conductor_inicio")
    public String conductorInicio(){
        return "conductor/conductor_inicio";
    }

    @GetMapping("/pedidos_asignados")
    public String mostarPedidosAsignados(){
        return "conductor/pedidos_asignados";
    }

    @GetMapping("/historial_pedidos_conductor")
    public String mostarHistorialPedidosConductor(){
        return "conductor/historial_pedidos_conductor";
    }

    // Obtener pedidos asignados al conductor
    @GetMapping("/api/conductor/pedidos-asignados")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerPedidosAsignados(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            Integer idConductor = (Integer) session.getAttribute("usuario_id");

            if (idConductor == null) {
                response.put("success", false);
                response.put("message", "Sesión no válida");
                return ResponseEntity.status(401).body(response);
            }

            List<Map<String, Object>> pedidos = conductorService.obtenerPedidosAsignados(idConductor);

            response.put("success", true);
            response.put("pedidos", pedidos);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Obtener pedidos en camino
    @GetMapping("/api/conductor/pedidos-en-camino")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerPedidosEnCamino(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            Integer idConductor = (Integer) session.getAttribute("usuario_id");

            if (idConductor == null) {
                response.put("success", false);
                response.put("message", "Sesión no válida");
                return ResponseEntity.status(401).body(response);
            }

            List<Map<String, Object>> pedidos = conductorService.obtenerPedidosEnCamino(idConductor);

            response.put("success", true);
            response.put("pedidos", pedidos);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Aceptar pedido
    @PostMapping("/api/conductor/aceptar-pedido/{idPedido}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> aceptarPedido(
            @PathVariable Integer idPedido,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            Integer idConductor = (Integer) session.getAttribute("usuario_id");

            if (idConductor == null) {
                response.put("success", false);
                response.put("message", "Sesión no válida");
                return ResponseEntity.status(401).body(response);
            }

            conductorService.aceptarPedido(idPedido, idConductor);

            response.put("success", true);
            response.put("message", "Pedido aceptado exitosamente");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Marcar pedido como entregado
    @PostMapping("/api/conductor/entregar-pedido/{idPedido}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> entregarPedido(
            @PathVariable Integer idPedido,
            @RequestBody Map<String, String> datos,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            Integer idConductor = (Integer) session.getAttribute("usuario_id");

            if (idConductor == null) {
                response.put("success", false);
                response.put("message", "Sesión no válida");
                return ResponseEntity.status(401).body(response);
            }

            // ✅ OBTENER OBSERVACIÓN DEL BODY
            String observacion = datos.get("observacion");

            conductorService.marcarPedidoEntregado(idPedido, idConductor, observacion);

            response.put("success", true);
            response.put("message", "Pedido marcado como entregado");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Obtener detalles de un pedido
    @GetMapping("/api/conductor/detalle-pedido/{idPedido}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerDetallePedido(
            @PathVariable Integer idPedido) {

        Map<String, Object> response = new HashMap<>();

        try {
            Map<String, Object> detalle = logisticaService.obtenerDetallesPedido(idPedido);

            response.put("success", true);
            response.put("detalle", detalle);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Obtener historial de pedidos entregados
    @GetMapping("/api/conductor/historial")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerHistorial(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            Integer idConductor = (Integer) session.getAttribute("usuario_id");

            if (idConductor == null) {
                response.put("success", false);
                response.put("message", "Sesión no válida");
                return ResponseEntity.status(401).body(response);
            }

            List<Map<String, Object>> pedidos = conductorService.obtenerHistorialPedidos(idConductor);

            response.put("success", true);
            response.put("pedidos", pedidos);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}