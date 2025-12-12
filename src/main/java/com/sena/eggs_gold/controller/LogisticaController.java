package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.service.LogisticaService;
import com.sena.eggs_gold.service.EmailService;
import com.sena.eggs_gold.service.PedidoService;
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
public class LogisticaController {

    @Autowired
    private LogisticaService logisticaService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/registrar_logistica")
    public String mostrarFormulario(Model model, HttpSession session) {
        String rol = (String) session.getAttribute("rol");
        if (rol == null || !rol.equals("ADMIN")) {
            return "redirect:/acceso_denegado";
        }

        model.addAttribute("logistica", new LogisticaDTO());
        return "registros/registro_logistica";
    }

    @PostMapping("/registro_logistica")
    public String registrarLogistica(@ModelAttribute("logistica") LogisticaDTO logisticaDTO,
                                     HttpSession session,
                                     Model model) {
        String rol = (String) session.getAttribute("rol");
        if (rol == null || !rol.equals("ADMIN")) {
            return "redirect:/acceso_denegado";
        }

        if (usuarioService.documentoYaExistente(logisticaDTO.getNumDocumento())) {
            model.addAttribute("error", "El correo electrónico o el número de documento ya está registrado");
            model.addAttribute("logistica", logisticaDTO); // Mantener los datos del formulario
            return "registros/registro_logistica";
        }

        if (usuarioService.correoYaExistente(logisticaDTO.getCorreo())) {
            model.addAttribute("error", "El correo electrónico o el número de documento ya está registrado");
            model.addAttribute("logistica", logisticaDTO); // Mantener los datos del formulario
            return "registros/registro_logistica";
        }

        try {
            logisticaService.registrarLogistica(logisticaDTO);

            emailService.enviarCorreoBienvenida(
                    logisticaDTO.getCorreo(),
                    logisticaDTO.getNombre()
            );

            model.addAttribute("mensaje", "Logística registrada exitosamente y correo enviado");
            model.addAttribute("logistica", new LogisticaDTO()); // Formulario limpio
            return "registros/registro_logistica";

        } catch (Exception e) {
            model.addAttribute("error", "Error al registrar logística: " + e.getMessage());
            model.addAttribute("logistica", logisticaDTO); // Mantener los datos del formulario
            return "registros/registro_logistica";
        }
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

    @PostMapping("/api/logistica/tomar-pedido/{idPedido}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> tomarPedido(
            @PathVariable Integer idPedido,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            Integer idLogistica = (Integer) session.getAttribute("usuario_id");

            if (idLogistica == null) {
                response.put("success", false);
                response.put("message", "Sesión no válida");
                return ResponseEntity.status(401).body(response);
            }

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

    @GetMapping("/api/logistica/mis-pedidos")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerMisPedidos(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
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

    @GetMapping("/api/logistica/conductores")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerConductores() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Usuario> conductores = pedidoService.obtenerConductoresDisponibles();

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

            pedidoService.asignarConductor(idPedido, idConductor);

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