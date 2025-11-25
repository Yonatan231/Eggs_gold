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

    // RUTA DONDE SE GUARDARAN LAS FOTOS DE PERFIL (FUERA DEL PROYECTO)
    // Esta carpeta se crea automaticamente si no existe
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

    /**
     * METODO: Guarda la foto de perfil en una carpeta EXTERNA al proyecto
     * Esto permite que las fotos se vean inmediatamente sin reiniciar el servidor
     */
    @Override
    public String guardarFotoPerfil(Integer usuarioId, MultipartFile foto) throws IOException {
        // 1. VALIDAR que se envio una imagen
        if (foto.isEmpty()) {
            throw new IOException("No se envio ninguna imagen");
        }

        // 2. CREAR la carpeta de uploads si no existe
        Path directorioUploads = Paths.get(DIRECTORIO_UPLOADS);
        if (!Files.exists(directorioUploads)) {
            Files.createDirectories(directorioUploads);
            System.out.println("Carpeta de uploads creada: " + DIRECTORIO_UPLOADS);
        }

        // 3. GENERAR un nombre unico para el archivo
        // Formato: perfil_usuario123_uuid.jpg
        String extension = StringUtils.getFilenameExtension(foto.getOriginalFilename());
        String nombreArchivo = "perfil_usuario" + usuarioId + "_" + UUID.randomUUID() + "." + extension;

        // 4. GUARDAR el archivo en la carpeta externa
        Path rutaCompleta = directorioUploads.resolve(nombreArchivo);
        Files.copy(foto.getInputStream(), rutaCompleta, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("Foto guardada en: " + rutaCompleta);

        // 5. CREAR la ruta relativa que se guardara en la base de datos
        // Esta ruta es la que usara el navegador para cargar la imagen
        String rutaRelativa = "/uploads/perfil/" + nombreArchivo;

        // 6. ACTUALIZAR la base de datos con la nueva ruta
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Si el usuario ya tenia una foto anterior, la eliminamos
        if (usuario.getFotoPanel() != null && !usuario.getFotoPanel().isBlank()) {
            eliminarFotoAnterior(usuario.getFotoPanel());
        }

        usuario.setFotoPanel(rutaRelativa);
        usuarioRepository.save(usuario);

        return rutaRelativa;
    }

    /**
     * METODO AUXILIAR: Elimina la foto anterior del usuario
     * Esto evita que se acumulen fotos viejas
     */
    private void eliminarFotoAnterior(String rutaRelativa) {
        try {
            // Extraemos solo el nombre del archivo de la ruta
            String nombreArchivo = rutaRelativa.substring(rutaRelativa.lastIndexOf("/") + 1);
            Path rutaArchivo = Paths.get(DIRECTORIO_UPLOADS, nombreArchivo);

            // Eliminamos el archivo si existe
            if (Files.exists(rutaArchivo)) {
                Files.delete(rutaArchivo);
                System.out.println("Foto anterior eliminada: " + nombreArchivo);
            }
        } catch (IOException e) {
            // Si hay error al eliminar, solo lo registramos pero no detenemos el proceso
            System.err.println("Error al eliminar foto anterior: " + e.getMessage());
        }
    }

    // ========== METODOS PARA RECUPERACION DE CONTRASENA ==========

    /**
     * METODO: Solicitar recuperacion de contrasena
     * 1. Busca el usuario por correo
     * 2. Si existe, genera un token unico
     * 3. Guarda el token y su fecha de expiracion (1 hora)
     * 4. Envia un correo con el enlace de recuperacion
     */
    @Override
    public void solicitarRecuperacionContrasena(String correo) {
        // Buscar usuario por correo
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correo);

        // Solo proceder si el usuario existe
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            // Generar token unico (UUID)
            String token = UUID.randomUUID().toString();

            // Establecer fecha de expiracion (1 hora desde ahora)
            LocalDateTime expiracion = LocalDateTime.now().plusHours(1);

            // Guardar token y expiracion en el usuario
            usuario.setTokenRecuperacion(token);
            usuario.setTokenExpiracion(expiracion);
            usuarioRepository.save(usuario);

            // Enviar correo con el enlace de recuperacion
            emailService.enviarCorreoRecuperacion(correo, token);

            System.out.println("Token de recuperacion generado para: " + correo);
        } else {
            // Si el usuario no existe, no hacemos nada (por seguridad)
            // No queremos revelar si un correo existe o no en la base de datos
            System.out.println("Intento de recuperacion para correo no registrado: " + correo);
        }
    }

    /**
     * METODO: Validar si un token es valido
     * Un token es valido si:
     * 1. Existe en la base de datos
     * 2. No ha expirado (la fecha actual es menor a la fecha de expiracion)
     */
    @Override
    public boolean validarToken(String token) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByTokenRecuperacion(token);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            LocalDateTime ahora = LocalDateTime.now();

            // Verificar que el token no haya expirado
            return usuario.getTokenExpiracion() != null &&
                    ahora.isBefore(usuario.getTokenExpiracion());
        }

        return false;
    }

    /**
     * METODO: Actualizar contrasena del usuario
     * 1. Busca el usuario por token
     * 2. Valida que el token no haya expirado
     * 3. Actualiza la contrasena (encriptada)
     * 4. Elimina el token y su expiracion (para que no se pueda usar de nuevo)
     */
    @Override
    public void actualizarContrasena(String token, String nuevaContrasena) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByTokenRecuperacion(token);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            LocalDateTime ahora = LocalDateTime.now();

            // Verificar que el token no haya expirado
            if (usuario.getTokenExpiracion() != null &&
                    ahora.isBefore(usuario.getTokenExpiracion())) {

                // Encriptar la nueva contrasena
                String contrasenaEncriptada = BCrypt.hashpw(nuevaContrasena, BCrypt.gensalt());

                // Actualizar contrasena
                usuario.setPassword(contrasenaEncriptada);

                // Eliminar token y expiracion (para que no se pueda reutilizar)
                usuario.setTokenRecuperacion(null);
                usuario.setTokenExpiracion(null);

                // Guardar cambios
                usuarioRepository.save(usuario);

                System.out.println("Contrasena actualizada para usuario: " + usuario.getCorreo());
            } else {
                throw new RuntimeException("El token ha expirado");
            }
        } else {
            throw new RuntimeException("Token invalido");
        }
    }
}