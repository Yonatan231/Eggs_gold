package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.ClienteService;
import com.sena.eggs_gold.service.EmailService;
import com.sena.eggs_gold.service.InventarioService;
import com.sena.eggs_gold.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class ClienteController {

    private final ClienteService clienteService;
    private final UsuarioService usuarioService;
    private final InventarioService inventarioService;  // ✅ AGREGADO

    @Autowired
    private EmailService emailService;

    public ClienteController(ClienteService clienteService,
                             UsuarioService usuarioService,
                             UsuarioRepository usuarioRepository,
                             InventarioService inventarioService) {  // ✅ AGREGADO
        this.clienteService = clienteService;
        this.usuarioService = usuarioService;
        this.inventarioService = inventarioService;  // ✅ AGREGADO
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

    @GetMapping("/historial_pedidos")
    public String mostrarHistorialPedidos() {
        return "cliente/historial_pedidos";
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

    // ✅ NUEVO: Endpoint para obtener productos disponibles (API REST)
    @GetMapping("/cliente/api/productos")
    @ResponseBody
    public ResponseEntity<List<ProductoDisponibleDTO>> obtenerProductosDisponibles() {
        List<ProductoDisponibleDTO> productos = inventarioService.obtenerProductosDisponibles();
        return ResponseEntity.ok(productos);
    }
}