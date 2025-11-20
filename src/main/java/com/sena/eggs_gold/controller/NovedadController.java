package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.model.entity.Novedad;
import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.enums.EstadoNovedad;
import com.sena.eggs_gold.model.enums.TipoNovedad;
import com.sena.eggs_gold.repository.NovedadRepository;
import com.sena.eggs_gold.repository.PedidoRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Controlador para gestionar novedades
 * Maneja la creación, listado y cambio de estado de novedades
 * Soporta subida de imágenes como evidencia
 */
@Controller
public class NovedadController {

    private final NovedadRepository novedadRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;

    // Ruta donde se guardarán las imágenes de novedades
    private static final String UPLOAD_DIR = "C:/eggs_gold_uploads/novedades/";

    public NovedadController(NovedadRepository novedadRepository, PedidoRepository pedidoRepository, UsuarioRepository usuarioRepository) {
        this.novedadRepository = novedadRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;

        // Crear directorio si no existe
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            System.err.println("Error al crear directorio de novedades: " + e.getMessage());
        }
    }

    /**
     * Endpoint para crear una novedad desde el cliente
     * Valida que el pedido exista y pertenezca al cliente logueado
     */
    @PostMapping("/api/novedades/crear")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> crearNovedad(
            @RequestParam("idUsuario") Integer idUsuario,
            @RequestParam("idPedido") Integer idPedido,
            @RequestParam("tipoNovedad") String tipoNovedad,
            @RequestParam("descripcion") String descripcion,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Buscar usuario por ID
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(idUsuario);
            if (usuarioOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Usuario no encontrado");
                return ResponseEntity.badRequest().body(response);
            }

            Usuario usuario = usuarioOpt.get();

            // Validar que el pedido existe
            Optional<Pedido> pedidoOpt = pedidoRepository.findById(idPedido);
            if (pedidoOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "El pedido #" + idPedido + " no existe");
                return ResponseEntity.badRequest().body(response);
            }

            Pedido pedido = pedidoOpt.get();

            // Validar que el pedido pertenece al usuario según su rol
            String rolUsuario = usuario.getRol().getNombreRol();
            boolean perteneceAlUsuario = false;

            switch (rolUsuario) {
                case "cliente":
                    // Validar que el pedido pertenece al cliente
                    perteneceAlUsuario = pedido.getCliente() != null &&
                            pedido.getCliente().getIdUsuarios().equals(usuario.getIdUsuarios());
                    break;

                case "conductor":
                    // Validar que el pedido está asignado al conductor
                    perteneceAlUsuario = pedido.getConductor() != null &&
                            pedido.getConductor().getIdUsuarios().equals(usuario.getIdUsuarios());
                    break;

                case "logistica":
                    // Validar que el pedido fue procesado por este usuario de logística
                    perteneceAlUsuario = pedido.getLogistica() != null &&
                            pedido.getLogistica().getIdUsuarios().equals(usuario.getIdUsuarios());
                    break;

                default:
                    perteneceAlUsuario = false;
            }

            if (!perteneceAlUsuario) {
                response.put("success", false);
                response.put("message", "El pedido #" + idPedido + " no está asociado a su usuario");
                return ResponseEntity.badRequest().body(response);
            }

            // Crear la novedad
            Novedad novedad = new Novedad();
            novedad.setUsuario(usuario);
            novedad.setPedido(pedido);
            novedad.setTipoNovedad(TipoNovedad.valueOf(tipoNovedad));
            novedad.setDescripcion(descripcion);
            novedad.setEstado(EstadoNovedad.PENDIENTE);
            novedad.setFechaCreacion(LocalDateTime.now());

            // Guardar imagen si existe
            if (imagen != null && !imagen.isEmpty()) {
                String nombreImagen = guardarImagen(imagen);
                novedad.setImagen(nombreImagen);
            }

            // Guardar en base de datos
            novedadRepository.save(novedad);

            response.put("success", true);
            response.put("message", "Novedad reportada correctamente. Nos contactaremos pronto.");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "Tipo de novedad inválido");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al reportar novedad: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Vista para administrador: lista todas las novedades
     */
    @GetMapping("/novedades")
    public String vistaNovedades(Model model) {
        List<Novedad> novedades = novedadRepository.findAllByOrderByFechaCreacionDesc();
        model.addAttribute("novedades", novedades);
        return "administrador/novedades";
    }

    /**
     * Endpoint para cambiar estado de novedad (admin)
     */

    @PostMapping("/api/novedades/cambiar-estado/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cambiarEstado(
            @PathVariable Integer id,
            @RequestParam("estado") String estado,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 🔥 CAMBIO: Obtener el ID del usuario de la sesión
            Integer usuarioId = (Integer) session.getAttribute("usuario_id");
            String rol = (String) session.getAttribute("rol");

            // Validar que exista sesión
            if (usuarioId == null || rol == null) {
                response.put("success", false);
                response.put("message", "Sesión no válida");
                return ResponseEntity.status(401).body(response);
            }

            // Validar que sea administrador
            if (!rol.equals("ADMIN")) {
                response.put("success", false);
                response.put("message", "No tiene permisos para realizar esta acción. Rol actual: " + rol);
                return ResponseEntity.status(403).body(response);
            }

            // Buscar novedad
            Optional<Novedad> novedadOpt = novedadRepository.findById(id);
            if (novedadOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Novedad no encontrada");
                return ResponseEntity.badRequest().body(response);
            }

            Novedad novedad = novedadOpt.get();
            EstadoNovedad nuevoEstado = EstadoNovedad.valueOf(estado);
            novedad.setEstado(nuevoEstado);

            if (nuevoEstado == EstadoNovedad.RESUELTO) {
                novedad.setFechaResolucion(LocalDateTime.now());
            }

            novedadRepository.save(novedad);

            response.put("success", true);
            response.put("message", "Estado actualizado correctamente");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "Estado inválido");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al cambiar estado: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Método auxiliar para guardar imagen de novedad
     * Genera nombre único con timestamp
     */
    private String guardarImagen(MultipartFile imagen) throws IOException {
        if (imagen.isEmpty()) {
            return null;
        }

        // Generar nombre único con timestamp
        String timestamp = String.valueOf(System.currentTimeMillis());
        String extension = obtenerExtension(imagen.getOriginalFilename());
        String nombreArchivo = "novedad_" + timestamp + extension;

        // Ruta completa del archivo
        Path rutaArchivo = Paths.get(UPLOAD_DIR + nombreArchivo);

        // Guardar archivo
        Files.copy(imagen.getInputStream(), rutaArchivo, StandardCopyOption.REPLACE_EXISTING);

        return nombreArchivo;
    }

    /**
     * Obtener extensión de archivo
     */
    private String obtenerExtension(String nombreArchivo) {
        if (nombreArchivo == null || !nombreArchivo.contains(".")) {
            return ".jpg"; // Extensión por defecto
        }
        return nombreArchivo.substring(nombreArchivo.lastIndexOf("."));
    }
}