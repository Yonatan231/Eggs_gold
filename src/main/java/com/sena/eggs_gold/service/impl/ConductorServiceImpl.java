package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.ConductorDTO;
import com.sena.eggs_gold.model.entity.Conductor;
import com.sena.eggs_gold.model.entity.Rol;
import com.sena.eggs_gold.repository.ConductorRepository;
import com.sena.eggs_gold.repository.RolRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.ConductorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ConductorServiceImpl implements ConductorService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    private final ConductorRepository conductorRepository;
    private final RolRepository rolRepository;

    public ConductorServiceImpl(ConductorRepository conductorRepository, RolRepository rolRepository) {
        this.conductorRepository = conductorRepository;
        this.rolRepository = rolRepository;
    }

    @Override
    public void registrarConductor(ConductorDTO dto) {
        Conductor conductor = new Conductor();
        conductor.setNombre(dto.getNombre());
        conductor.setApellido(dto.getApellido());
        conductor.setDireccionUsuario(dto.getDireccionUsuario());
        conductor.setNumDocumento(dto.getNumDocumento());
        conductor.setTelefono(dto.getTelefono());
        conductor.setCorreo(dto.getCorreo());
        conductor.setPassword(dto.getPassword());
        conductor.setFechaRegistro(LocalDate.now());

        // Asignar el rol de conductor
        Rol rol = rolRepository.findById(3)
                .orElseThrow(() -> new RuntimeException("Rol Conductor no encontrado"));
        conductor.setRol(rol);

        // Guardar en la base de datos
        conductorRepository.save(conductor);
    }

    @Override
    public ConductorDTO login(String numDocumento, String password) {
        return conductorRepository.findByNumDocumentoAndPassword(numDocumento, password)
                .map(conductor -> {
                    ConductorDTO dto = new ConductorDTO();
                    dto.setIdUsuarios(conductor.getIdUsuarios());
                    dto.setNombre(conductor.getNombre());
                    dto.setApellido(conductor.getApellido());
                    dto.setDireccionUsuario(conductor.getDireccionUsuario());
                    dto.setNumDocumento(conductor.getNumDocumento());
                    dto.setTelefono(conductor.getTelefono());
                    dto.setCorreo(conductor.getCorreo());
                    dto.setPassword(conductor.getPassword());
                  //  dto.setTipoUsuario("Conductor");
                    dto.setFechaRegistro(conductor.getFechaRegistro());
                    return dto;
                })
                .orElse(null);
    }

    @Override
    public List<ConductorDTO> obtenerConductoresConPedidosEntregados() {
        return usuarioRepository.listarConductoresConPedidosEntregados();



    }
}

