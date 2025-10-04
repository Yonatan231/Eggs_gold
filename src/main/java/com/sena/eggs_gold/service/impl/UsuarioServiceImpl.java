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

    @Override
    public String guardarFotoPerfil(Integer usuarioId, MultipartFile foto) throws IOException {
        if (foto.isEmpty()) {
            throw new IOException("No se envió ninguna imagen");
        }

        String extension = StringUtils.getFilenameExtension(foto.getOriginalFilename());
        String nombreArchivo = "perfil_" + UUID.randomUUID() + "." + extension;
        Path rutaDestino = Paths.get("src/main/resources/static/imagenes", nombreArchivo);
        Files.copy(foto.getInputStream(), rutaDestino, StandardCopyOption.REPLACE_EXISTING);

        String rutaRelativa = "imagenes/" + nombreArchivo;

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setFotoPanel(rutaRelativa);
        usuarioRepository.save(usuario);

        return rutaRelativa;
    }

}
