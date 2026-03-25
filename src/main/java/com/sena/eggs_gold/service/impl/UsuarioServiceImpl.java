package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.ClientePedidosDTO;
import com.sena.eggs_gold.dto.ConductorDTO;
import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.UsuarioService;
import com.sena.eggs_gold.service.EmailService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;

    private static final String DIRECTORIO_UPLOADS = "C:/eggs_gold_uploads/perfil";

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
    }

    @Override
    public boolean documentoYaExistente(String numDocumento) {
        return usuarioRepository.existsByNumDocumento(numDocumento);
    }

    @Override
    public boolean correoYaExistente(String correo) {
        return usuarioRepository.existsByCorreo(correo);
    }

    @Override
    public List<ClientePedidosDTO> obtenerClientesConPedidos() {
        return usuarioRepository.findClientesConPedidos();
    }

    @Override
    public List<ConductorDTO> obtenerConductoresConPedidosEntregados() {
        return usuarioRepository.findConductoresConPedidosEntregados();
    }

    @Override
    public List<LogisticaDTO> obtenerLogistica() {
        return usuarioRepository.findAllLogistica();
    }

    @Override
    public Optional<Usuario> actualizarUsuario(Integer idUsuarios, Usuario datosActualizados) {
        return usuarioRepository.findById(idUsuarios).map(usuario -> {
            usuario.setNombre(datosActualizados.getNombre());
            usuario.setApellido(datosActualizados.getApellido());
            usuario.setNumDocumento(datosActualizados.getNumDocumento());
            usuario.setDireccionUsuario(datosActualizados.getDireccionUsuario());
            usuario.setTelefono(datosActualizados.getTelefono());
            return usuarioRepository.save(usuario);
        });
    }

    @Override
    public List<Usuario> listarActivos() {
        return usuarioRepository.findByEstado(EstadoUsuario.ACTIVO);
    }

    @Override
    public void eliminarLogico(Integer idUsuarios) {
        Usuario usuario = usuarioRepository.findById(idUsuarios)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setEstado(EstadoUsuario.INACTIVO);
        usuarioRepository.save(usuario);
    }

    @Override
    public List<Usuario> buscarClientePorEstado(String buscar, EstadoUsuario estado) {
        return usuarioRepository.buscarClientePorEstado(buscar, estado);
    }

    @Override
    public List<Usuario> buscarConductorPorEstado(String buscar, EstadoUsuario estado) {
        return usuarioRepository.buscarConductorPorEstado(buscar, estado);
    }

    @Override
    public List<Usuario> buscarLogisticaPorEstado(String buscar, EstadoUsuario estado) {
        return usuarioRepository.buscarLogisticaPorEstado(buscar, estado);
    }

    @Override
    public String guardarFotoPerfil(Integer usuarioId, MultipartFile foto) throws IOException {
        if (foto.isEmpty()) {
            throw new IOException("No se envio ninguna imagen");
        }

        Path directorioUploads = Paths.get(DIRECTORIO_UPLOADS);
        if (!Files.exists(directorioUploads)) {
            Files.createDirectories(directorioUploads);
        }

        String extension = StringUtils.getFilenameExtension(foto.getOriginalFilename());
        String nombreArchivo = "perfil_usuario" + usuarioId + "_" + UUID.randomUUID() + "." + extension;

        Path rutaCompleta = directorioUploads.resolve(nombreArchivo);
        Files.copy(foto.getInputStream(), rutaCompleta, StandardCopyOption.REPLACE_EXISTING);

        String rutaRelativa = "/uploads/perfil/" + nombreArchivo;

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getFotoPanel() != null && !usuario.getFotoPanel().isBlank()) {
            eliminarFotoAnterior(usuario.getFotoPanel());
        }

        usuario.setFotoPanel(rutaRelativa);
        usuarioRepository.save(usuario);

        return rutaRelativa;
    }

    private void eliminarFotoAnterior(String rutaRelativa) {
        try {
            String nombreArchivo = rutaRelativa.substring(rutaRelativa.lastIndexOf("/") + 1);
            Path rutaArchivo = Paths.get(DIRECTORIO_UPLOADS, nombreArchivo);
            if (Files.exists(rutaArchivo)) {
                Files.delete(rutaArchivo);
            }
        } catch (IOException e) {
            System.err.println("Error al eliminar foto anterior: " + e.getMessage());
        }
    }

    @Override
    public void solicitarRecuperacionContrasena(String correo) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correo);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            String token = UUID.randomUUID().toString();
            LocalDateTime expiracion = LocalDateTime.now().plusHours(1);
            usuario.setTokenRecuperacion(token);
            usuario.setTokenExpiracion(expiracion);
            usuarioRepository.save(usuario);
            emailService.enviarCorreoRecuperacion(correo, token);
        }
    }

    @Override
    public boolean validarToken(String token) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByTokenRecuperacion(token);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            return usuario.getTokenExpiracion() != null &&
                    LocalDateTime.now().isBefore(usuario.getTokenExpiracion());
        }
        return false;
    }

    @Override
    public void actualizarContrasena(String token, String nuevaContrasena) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByTokenRecuperacion(token);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (usuario.getTokenExpiracion() != null &&
                    LocalDateTime.now().isBefore(usuario.getTokenExpiracion())) {
                usuario.setPassword(BCrypt.hashpw(nuevaContrasena, BCrypt.gensalt()));
                usuario.setTokenRecuperacion(null);
                usuario.setTokenExpiracion(null);
                usuarioRepository.save(usuario);
            } else {
                throw new RuntimeException("El token ha expirado");
            }
        } else {
            throw new RuntimeException("Token invalido");
        }
    }

    @Override
    public void cambiarEstadoUsuario(Integer idUsuario, EstadoUsuario nuevoEstado) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setEstado(nuevoEstado);
        usuarioRepository.save(usuario);
        String nombreCompleto = usuario.getNombre() + " " + usuario.getApellido();
        emailService.enviarCorreoCambioEstado(usuario.getCorreo(), nombreCompleto, nuevoEstado);
    }
}