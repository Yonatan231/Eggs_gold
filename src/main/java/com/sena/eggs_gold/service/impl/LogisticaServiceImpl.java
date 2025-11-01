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
    public LogisticaDTO login(String numDocumento, String password) {
        return logisticaRepository.findByNumDocumentoAndPassword(numDocumento, password)
                .map(logistica -> new LogisticaDTO(
                        logistica.getIdUsuarios(),
                        logistica.getNombre(),
                        logistica.getApellido(),
                        logistica.getDireccionUsuario(),
                        logistica.getNumDocumento(),
                        logistica.getTelefono(),
                        logistica.getCorreo(),
                        logistica.getPassword(),
                        "LOGISTICA"
                ))
                .orElse(null);
    }

    @Override
    public void registrarLogistica(LogisticaDTO dto) {
        // Tu implementación actual
        Logistica logistica = new Logistica();
        logistica.setNombre(dto.getNombre());
        logistica.setApellido(dto.getApellido());
        logistica.setDireccionUsuario(dto.getDireccionUsuario());
        logistica.setNumDocumento(dto.getNumDocumento());
        logistica.setTelefono(dto.getTelefono());
        logistica.setCorreo(dto.getCorreo());
        logistica.setPassword(dto.getPassword());

        Rol rol = rolRepository.findById(2)
                .orElseThrow(() -> new RuntimeException("Rol Logística no encontrado"));
        logistica.setRol(rol);

        logisticaRepository.save(logistica);
    }
}