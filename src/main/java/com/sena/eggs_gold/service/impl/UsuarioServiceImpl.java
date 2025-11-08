package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.ClientePedidosDTO;
import com.sena.eggs_gold.dto.ClienteRegistroDTO;
import com.sena.eggs_gold.dto.ConductorPedidosDTO;
import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.model.entity.Rol;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.enums.Estado;
import com.sena.eggs_gold.repository.RolRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;

    // RUTA DONDE SE GUARDARÁN LAS FOTOS DE PERFIL (FUERA DEL PROYECTO)
    // Esta carpeta se crea automáticamente si no existe
    private static final String DIRECTORIO_UPLOADS = "C:/eggs-gold-uploads/fotos";

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public boolean documentoYaExistente(String numDocumento) {
        return usuarioRepository.existsByNumDocumento(numDocumento);
    }

    @Override
    public List<ClientePedidosDTO> obtenerClientesConPedidos() {
        return usuarioRepository.findClientesConPedidos();
    }

    public List<ConductorPedidosDTO> obtenerConductoresConPedidosEntregados() {
        List<Object[]> resultados = usuarioRepository.findConductoresConPedidosEntregados();

        return resultados.stream().map(r -> new ConductorPedidosDTO(
                ((Number) r[0]).intValue(),  // ID_USUARIOS
                (String) r[1],                // NOMBRE
                (String) r[2],                // APELLIDO
                (String) r[3],                // NUM_DOCUMENTO
                (String) r[4],                // DIRECCION_USUARIO
                (String) r[5],                // TELEFONO
                ((Number) r[6]).longValue()    // pedidos_entregados
        )).toList();
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
        return usuarioRepository.findByEstado(Estado.ACTIVO);
    }

    @Override
    public void eliminarLogico(Integer idUsuarios) {
        Usuario usuario = usuarioRepository.findById(idUsuarios)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setEstado(Estado.INACTIVO);
        usuarioRepository.save(usuario);
    }

    @Override
    public List<Usuario> buscarClientePorEstado(String buscar, Estado estado) {
        return usuarioRepository.buscarClientePorEstado(buscar, estado);
    }

    @Override
    public List<Usuario> buscarConductorPorEstado(String buscar, Estado estado) {
        return usuarioRepository.buscarConductorPorEstado(buscar, estado);
    }

    @Override
    public List<Usuario> buscarLogisticaPorEstado(String buscar, Estado estado) {
        return usuarioRepository.buscarLogisticaPorEstado(buscar, estado);
    }

    /**
     * MÉTODO CORREGIDO: Guarda la foto de perfil en una carpeta EXTERNA al proyecto
     * Esto permite que las fotos se vean inmediatamente sin reiniciar el servidor
     *
     * @param usuarioId ID del usuario
     * @param foto Archivo de imagen a subir
     * @return Ruta relativa de la foto guardada
     * @throws IOException Si hay error al guardar el archivo
     */
    @Override
    public String guardarFotoPerfil(Integer usuarioId, MultipartFile foto) throws IOException {
        // 1. VALIDAR que se envió una imagen
        if (foto.isEmpty()) {
            throw new IOException("No se envió ninguna imagen");
        }

        // 2. CREAR la carpeta de uploads si no existe
        Path directorioUploads = Paths.get(DIRECTORIO_UPLOADS);
        if (!Files.exists(directorioUploads)) {
            Files.createDirectories(directorioUploads);
            System.out.println("✅ Carpeta de uploads creada: " + DIRECTORIO_UPLOADS);
        }

        // 3. GENERAR un nombre único para el archivo
        // Formato: perfil_usuario123_uuid.jpg
        String extension = StringUtils.getFilenameExtension(foto.getOriginalFilename());
        String nombreArchivo = "perfil_usuario" + usuarioId + "_" + UUID.randomUUID() + "." + extension;

        // 4. GUARDAR el archivo en la carpeta externa
        Path rutaCompleta = directorioUploads.resolve(nombreArchivo);
        Files.copy(foto.getInputStream(), rutaCompleta, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("✅ Foto guardada en: " + rutaCompleta);

        // 5. CREAR la ruta relativa que se guardará en la base de datos
        // Esta ruta es la que usará el navegador para cargar la imagen
        String rutaRelativa = "/uploads/fotos/" + nombreArchivo;

        // 6. ACTUALIZAR la base de datos con la nueva ruta
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Si el usuario ya tenía una foto anterior, la eliminamos
        if (usuario.getFotoPanel() != null && !usuario.getFotoPanel().isBlank()) {
            eliminarFotoAnterior(usuario.getFotoPanel());
        }

        usuario.setFotoPanel(rutaRelativa);
        usuarioRepository.save(usuario);

        return rutaRelativa;
    }

    /**
     * MÉTODO AUXILIAR: Elimina la foto anterior del usuario
     * Esto evita que se acumulen fotos viejas
     *
     * @param rutaRelativa Ruta de la foto a eliminar (ej: /uploads/fotos/perfil_123.jpg)
     */
    private void eliminarFotoAnterior(String rutaRelativa) {
        try {
            // Extraemos solo el nombre del archivo de la ruta
            // Ejemplo: /uploads/fotos/perfil_123.jpg -> perfil_123.jpg
            String nombreArchivo = rutaRelativa.substring(rutaRelativa.lastIndexOf("/") + 1);
            Path rutaArchivo = Paths.get(DIRECTORIO_UPLOADS, nombreArchivo);

            // Eliminamos el archivo si existe
            if (Files.exists(rutaArchivo)) {
                Files.delete(rutaArchivo);
                System.out.println("🗑️ Foto anterior eliminada: " + nombreArchivo);
            }
        } catch (IOException e) {
            // Si hay error al eliminar, solo lo registramos pero no detenemos el proceso
            System.err.println("⚠️ Error al eliminar foto anterior: " + e.getMessage());
        }
    }
}