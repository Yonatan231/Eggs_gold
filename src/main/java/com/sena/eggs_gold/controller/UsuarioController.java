package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.ClientePedidosDTO;
import com.sena.eggs_gold.dto.ConductorPedidosDTO;
import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;


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

}



