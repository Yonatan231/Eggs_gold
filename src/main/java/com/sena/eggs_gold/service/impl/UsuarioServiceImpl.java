package com.sena.eggs_gold.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sena.eggs_gold.dto.ClientePedidosDTO;
import com.sena.eggs_gold.dto.ConductorDTO;
import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.UsuarioService;
import com.sena.eggs_gold.service.EmailService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;
    private final Cloudinary cloudinary;

    public UsuarioServiceImpl(
            UsuarioRepository usuarioRepository,
            EmailService emailService,
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret
    ) {
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;

        // configurar cloudinary con las credenciales
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
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

    /**
     * nuevo: guarda la foto de perfil en cloudinary (nube)
     * esto permite que las fotos persistan incluso si el servidor se reinicia
     */
    @Override
    public String guardarFotoPerfil(Integer usuarioId, MultipartFile foto) throws IOException {
        // 1. validar que se envio una imagen
        if (foto.isEmpty()) {
            throw new IOException("No se envio ninguna imagen");
        }

        try {
            // 2. subir imagen a cloudinary en la carpeta "eggs_gold/perfiles"
            Map uploadResult = cloudinary.uploader().upload(foto.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "eggs_gold/perfiles",
                            "resource_type", "image",
                            "public_id", "perfil_usuario" + usuarioId // nombre personalizado
                    ));

            // 3. obtener la url segura de la imagen
            String urlImagen = (String) uploadResult.get("secure_url");
            System.out.println("foto de perfil subida a cloudinary: " + urlImagen);

            // 4. actualizar la base de datos con la nueva url
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            usuario.setFotoPanel(urlImagen);
            usuarioRepository.save(usuario);

            return urlImagen;

        } catch (IOException e) {
            System.err.println("error al subir foto a cloudinary: " + e.getMessage());
            throw new IOException("Error al subir la foto de perfil a Cloudinary", e);
        }
    }

    // metodos para recuperacion de contrasena

    @Override
    public void solicitarRecuperacionContrasena(String correo) {
        // buscar usuario por correo
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correo);

        // solo proceder si el usuario existe
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            // generar token unico (uuid)
            String token = UUID.randomUUID().toString();

            // establecer fecha de expiracion (1 hora desde ahora)
            LocalDateTime expiracion = LocalDateTime.now().plusHours(1);

            // guardar token y expiracion en el usuario
            usuario.setTokenRecuperacion(token);
            usuario.setTokenExpiracion(expiracion);
            usuarioRepository.save(usuario);

            // enviar correo con el enlace de recuperacion
            emailService.enviarCorreoRecuperacion(correo, token);

            System.out.println("token de recuperacion generado para: " + correo);
        } else {
            // si el usuario no existe, no hacemos nada (por seguridad)
            System.out.println("intento de recuperacion para correo no registrado: " + correo);
        }
    }

    @Override
    public boolean validarToken(String token) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByTokenRecuperacion(token);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            LocalDateTime ahora = LocalDateTime.now();

            // verificar que el token no haya expirado
            return usuario.getTokenExpiracion() != null &&
                    ahora.isBefore(usuario.getTokenExpiracion());
        }

        return false;
    }

    @Override
    public void actualizarContrasena(String token, String nuevaContrasena) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByTokenRecuperacion(token);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            LocalDateTime ahora = LocalDateTime.now();

            // verificar que el token no haya expirado
            if (usuario.getTokenExpiracion() != null &&
                    ahora.isBefore(usuario.getTokenExpiracion())) {

                // encriptar la nueva contrasena
                String contrasenaEncriptada = BCrypt.hashpw(nuevaContrasena, BCrypt.gensalt());

                // actualizar contrasena
                usuario.setPassword(contrasenaEncriptada);

                // eliminar token y expiracion (para que no se pueda reutilizar)
                usuario.setTokenRecuperacion(null);
                usuario.setTokenExpiracion(null);

                // guardar cambios
                usuarioRepository.save(usuario);

                System.out.println("contrasena actualizada para usuario: " + usuario.getCorreo());
            } else {
                throw new RuntimeException("El token ha expirado");
            }
        } else {
            throw new RuntimeException("Token invalido");
        }
    }

    // nuevo metodo: cambiar estado de usuario y enviar correo automaticamente
    @Override
    public void cambiarEstadoUsuario(Integer idUsuario, EstadoUsuario nuevoEstado) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // actualizar estado en la base de datos
        usuario.setEstado(nuevoEstado);
        usuarioRepository.save(usuario);

        // enviar correo de notificacion
        // nota: este metodo se llama desde el frontend solo cuando el estado cambio
        // por lo tanto, no necesitamos verificar si cambio aqui
        String nombreCompleto = usuario.getNombre() + " " + usuario.getApellido();
        emailService.enviarCorreoCambioEstado(usuario.getCorreo(), nombreCompleto, nuevoEstado);

        System.out.println("📧 Correo de cambio de estado enviado a: " + usuario.getCorreo());
        System.out.println("   Usuario: " + nombreCompleto + " | Nuevo estado: " + nuevoEstado);
    }
}