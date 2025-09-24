package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.model.entity.Logistica;
import com.sena.eggs_gold.model.entity.Rol;
import com.sena.eggs_gold.repository.LogisticaRepository;
import com.sena.eggs_gold.repository.RolRepository;
import com.sena.eggs_gold.service.LogisticaService;
import org.springframework.stereotype.Service;

@Service
public class LogisticaServiceImpl implements LogisticaService {

    private final LogisticaRepository logisticaRepository;
    private final RolRepository rolRepository;

    public LogisticaServiceImpl(LogisticaRepository logisticaRepository, RolRepository rolRepository) {
        this.logisticaRepository = logisticaRepository;
        this.rolRepository = rolRepository;
    }

    @Override
    public void registrarLogistica(LogisticaDTO dto) {
        // Crear instancia de Logistica; JPA asigna tipo_usuario automáticamente
        Logistica logistica = new Logistica();
        logistica.setNombre(dto.getNombre());
        logistica.setApellido(dto.getApellido());
        logistica.setDireccionUsuario(dto.getDireccionUsuario());
        logistica.setNumDocumento(dto.getNumDocumento());
        logistica.setTelefono(dto.getTelefono());
        logistica.setCorreo(dto.getCorreo());
        logistica.setPassword(dto.getPassword());

        // Asignar el rol de logística (ajusta el ID según tu base de datos)
        Rol rol = rolRepository.findById(2) // ejemplo: 2 = logística
                .orElseThrow(() -> new RuntimeException("Rol Logística no encontrado"));
        logistica.setRol(rol);

        // Guardar en la base de datos
        logisticaRepository.save(logistica);
    }

    @Override
    public LogisticaDTO login(String numDocumento, String password) {
        return logisticaRepository.findByNumDocumentoAndPassword(numDocumento, password)
                .map(logistica -> {
                    LogisticaDTO dto = new LogisticaDTO();
                    dto.setIdUsuarios(logistica.getIdUsuarios());
                    dto.setNombre(logistica.getNombre());
                    dto.setApellido(logistica.getApellido());
                    dto.setDireccionUsuario(logistica.getDireccionUsuario());
                    dto.setNumDocumento(logistica.getNumDocumento());
                    dto.setTelefono(logistica.getTelefono());
                    dto.setCorreo(logistica.getCorreo());
                    dto.setPassword(logistica.getPassword());
                    return dto;
                })
                .orElse(null);
    }
}


