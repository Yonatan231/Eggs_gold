package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.model.entity.Logistica;
import com.sena.eggs_gold.model.entity.Rol;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import com.sena.eggs_gold.model.enums.TipoDocumento;
import com.sena.eggs_gold.repository.LogisticaRepository;
import com.sena.eggs_gold.repository.RolRepository;
import com.sena.eggs_gold.service.LogisticaService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

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
        // ✅ Crear nueva instancia de Logística
        Logistica logistica = new Logistica();
        logistica.setNombre(dto.getNombre());
        logistica.setApellido(dto.getApellido());
        logistica.setDireccionUsuario(dto.getDireccionUsuario());
        logistica.setNumDocumento(dto.getNumDocumento());
        logistica.setTelefono(dto.getTelefono());
        logistica.setCorreo(dto.getCorreo());
        logistica.setPassword(dto.getPassword());

        // ✅ CAMPO OBLIGATORIO: Asignar ESTADO como ACTIVO
        logistica.setEstado(EstadoUsuario.ACTIVO);

        // ✅ CAMPO OBLIGATORIO: Asignar TIPO_DOCUMENTO (por defecto CEDULA_CIUDADANIA)
        logistica.setTipoDocumento(TipoDocumento.CC);

        // ✅ CAMPO OBLIGATORIO: Asignar FECHA_REGISTRO con la fecha actual
        logistica.setFechaRegistro(LocalDate.now());

        // ✅ Asignar el ROL de Logística (ID = 2)
        Rol rol = rolRepository.findById(2)
                .orElseThrow(() -> new RuntimeException("Rol Logística no encontrado"));
        logistica.setRol(rol);

        // ✅ Guardar en la base de datos
        logisticaRepository.save(logistica);
    }
}