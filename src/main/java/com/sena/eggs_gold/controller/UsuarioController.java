package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.ClientePedidosDTO;
import com.sena.eggs_gold.dto.ConductorPedidosDTO;
import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.model.enums.Estado;
import com.sena.eggs_gold.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.service.UsuarioService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;


@Controller
public class UsuarioController {
    private UsuarioRepository usuarioRepository;
    private UsuarioService usuarioService;

    public UsuarioController(UsuarioRepository usuarioRepository, UsuarioService usuarioService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
    }
    public void registrarUsuario(Usuario nuevoUsuario) {
        if (usuarioRepository.existsByNumDocumento(nuevoUsuario.getNumDocumento())) {
            throw new IllegalArgumentException("El documento ya está registrado.");
        }
        usuarioRepository.save(nuevoUsuario);
    }
    @GetMapping("/clientes/pedidos")
    @ResponseBody
    public List<ClientePedidosDTO> obtenerClientesConPedidos() {
        return usuarioService.obtenerClientesConPedidos();
    }

    @GetMapping("/conductores/pedidos-entregados")
    @ResponseBody
    public List<ConductorPedidosDTO> obtenerConductoresConPedidosEntregados() {
        return usuarioService.obtenerConductoresConPedidosEntregados();
    }
    @GetMapping("logistica/ver")
    @ResponseBody
    public List<LogisticaDTO> listarLogistica() {
        return usuarioService.obtenerLogistica();
    }

    @PutMapping("/usuarios/{idUsuarios}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Integer idUsuarios, @RequestBody Usuario usuario) {
        return usuarioService.actualizarUsuario(idUsuarios, usuario)
                .map(u -> ResponseEntity.ok().body("{\"success\":true}"))
                .orElse(ResponseEntity.badRequest().body("{\"success\":false, \"error\":\"ID NO ENCONTRADO\"}"));
    }


    @GetMapping("/usuarios/activos")
    public List<Usuario> listarActivos() {
        return usuarioService.listarActivos();
    }

    @PutMapping("/eliminar/{id}")
    public ResponseEntity<String> eliminarLogico(@PathVariable Integer id) {
        usuarioService.eliminarLogico(id);
        return ResponseEntity.ok("✅ Usuario eliminado");
    }

    @GetMapping("clientes/activos")
    @ResponseBody
    public List<Usuario> getClientesActivos(@RequestParam(defaultValue = "") String buscar) {
        return usuarioService.buscarClientePorEstado(buscar, Estado.ACTIVO);
    }

    @GetMapping("conductores/activos")
    @ResponseBody
    public List<Usuario> getConductoresActivos(@RequestParam(defaultValue = "") String buscar) {
        return usuarioService.buscarConductorPorEstado(buscar, Estado.ACTIVO);
    }

    @GetMapping("logistica/activos")
    @ResponseBody
    public List<Usuario> getLogisticaActivos(@RequestParam(defaultValue = "") String buscar) {
        return usuarioService.buscarLogisticaPorEstado(buscar, Estado.ACTIVO);
    }

    @PostMapping("/usuarios/{id}/foto")
    public ResponseEntity<?> subirFotoPerfil(
            @PathVariable Integer id,
            @RequestParam("foto") MultipartFile foto,
            HttpSession session
    ) {
        try {
            String rutaFoto = usuarioService.guardarFotoPerfil(id, foto);
            session.setAttribute("foto_usuario_" + id, rutaFoto);
            return ResponseEntity.ok(Map.of("success", true, "ruta", rutaFoto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/usuarios/{id}/foto")

    public ResponseEntity<?> obtenerFotoPerfil(@PathVariable Integer id) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Usuario no encontrado"));
        }

        Usuario usuario = usuarioOpt.get();
        String rutaFoto = usuario.getFotoPanel();

        if (rutaFoto != null && !rutaFoto.isBlank()) {
            return ResponseEntity.ok(Map.of("success", true, "ruta", rutaFoto));
        } else {
            // Si no hay foto, puedes devolver iniciales como alternativa visual
            String iniciales = usuario.getNombre().substring(0, 1).toUpperCase() +
                    usuario.getApellido().substring(0, 1).toUpperCase();
            return ResponseEntity.ok(Map.of("success", false, "iniciales", iniciales));
        }
    }


}



