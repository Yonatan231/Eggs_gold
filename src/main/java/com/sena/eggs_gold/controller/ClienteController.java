package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.ClienteService;
import com.sena.eggs_gold.service.EmailService;
import com.sena.eggs_gold.service.InventarioService;
import com.sena.eggs_gold.service.UsuarioService;
import com.sena.eggs_gold.service.FacturaPDFService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ClienteController {

    private final ClienteService clienteService;
    private final UsuarioService usuarioService;
    private final InventarioService inventarioService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private FacturaPDFService facturaPDFService;

    public ClienteController(ClienteService clienteService,
                             UsuarioService usuarioService,
                             UsuarioRepository usuarioRepository,
                             InventarioService inventarioService) {
        this.clienteService = clienteService;
        this.usuarioService = usuarioService;
        this.inventarioService = inventarioService;
    }

    @GetMapping("/registro_cliente")
    public String mostrarFormularioRegistro(Model model) {
        model.addAttribute("clienteDTO", new ClienteDTO());
        return "registros/registro_cliente";
    }

    @PostMapping("/registro_cliente")
    public String registrarCliente(@Valid @ModelAttribute("clienteDTO") ClienteDTO clienteDTO,
                                   BindingResult result,
                                   Model model) {

        if (result.hasErrors()) {
            model.addAttribute("errores", result.getFieldErrors());
            return "registros/registro_cliente";
        }

        if (usuarioService.documentoYaExistente(clienteDTO.getNumDocumento())) {
            model.addAttribute("error", "El número de documento ya está registrado");
            return "registros/registro_cliente";
        }

        try {
            emailService.enviarCorreoBienvenida(
                    clienteDTO.getCorreo(),
                    clienteDTO.getNombre()
            );
            clienteService.registrarCliente(clienteDTO);
            model.addAttribute("mensaje", "Cliente registrado exitosamente");
            return "redirect:/iniciar_sesion";
        } catch (Exception e) {
            model.addAttribute("error", "Error al registrar cliente: " + e.getMessage());
            return "registros/registro_cliente";
        }
    }

    @GetMapping("/mi_perfil")
    public String mostrarDatosCuenta() {
        return "cliente/datos_cuenta";
    }

    @GetMapping("/historial_pedidos_cliente")
    public String mostrarHistorialPedidos() {
        return "cliente/historial_pedidos_cliente";
    }

    @GetMapping("/inicio_cliente")
    public String mostrarVistaCliente(HttpSession session, Model model) {
        ClienteDTO cliente = (ClienteDTO) session.getAttribute("cliente");

        if (cliente == null) {
            return "redirect:/login";
        }

        model.addAttribute("cliente", cliente);
        return "cliente/inicio_cliente";
    }

    @GetMapping("/cliente/api/productos")
    @ResponseBody
    public ResponseEntity<List<ProductoDisponibleDTO>> obtenerProductosDisponibles() {
        List<ProductoDisponibleDTO> productos = inventarioService.obtenerProductosDisponibles();
        return ResponseEntity.ok(productos);
    }

    // ============================================
    // ✅ NUEVOS ENDPOINTS PARA HISTORIAL
    // ============================================

    // Obtener todos los pedidos del cliente
    @GetMapping("/api/cliente/mis-pedidos")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerMisPedidos(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            Integer idCliente = (Integer) session.getAttribute("usuario_id");

            if (idCliente == null) {
                response.put("success", false);
                response.put("message", "Sesión no válida");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            List<Map<String, Object>> pedidos = clienteService.obtenerMisPedidos(idCliente);

            response.put("success", true);
            response.put("pedidos", pedidos);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Obtener factura de un pedido
    @GetMapping("/api/cliente/factura/{idPedido}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerFactura(
            @PathVariable Integer idPedido,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            Integer idCliente = (Integer) session.getAttribute("usuario_id");

            if (idCliente == null) {
                response.put("success", false);
                response.put("message", "Sesión no válida");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Map<String, Object> factura = clienteService.obtenerFacturaPorPedido(idPedido, idCliente);

            response.put("success", true);
            response.put("factura", factura);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Descargar factura en PDF
    @GetMapping("/api/cliente/factura/{idPedido}/pdf")
    public ResponseEntity<byte[]> descargarFacturaPDF(
            @PathVariable Integer idPedido,
            HttpSession session) {

        try {
            Integer idCliente = (Integer) session.getAttribute("usuario_id");

            if (idCliente == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Map<String, Object> factura = clienteService.obtenerFacturaPorPedido(idPedido, idCliente);
            byte[] pdfBytes = facturaPDFService.generarFacturaPDF(factura);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Factura_" + factura.get("numeroFactura") + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}