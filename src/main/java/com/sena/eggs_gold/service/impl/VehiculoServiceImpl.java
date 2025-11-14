package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.VehiculoDTO;
import com.sena.eggs_gold.model.entity.Conductor;
import com.sena.eggs_gold.model.entity.Vehiculo;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import com.sena.eggs_gold.repository.ConductorRepository;
import com.sena.eggs_gold.repository.VehiculoRepository;
import com.sena.eggs_gold.service.VehiculoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class VehiculoServiceImpl implements VehiculoService {

    @Autowired
    private VehiculoRepository vehiculoRepository;

    @Autowired
    private ConductorRepository conductorRepository;

    @Override
    public Vehiculo registrarVehiculo(VehiculoDTO dto, Integer idConductor) {
        // Validar placa duplicada
        if (vehiculoRepository.existsByPlaca(dto.getPlaca())) {
            return null; // No guarda nada
        }

        // Buscar el conductor
        Conductor conductor = conductorRepository.findById(idConductor)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));

        // Mapear DTO -> Entity
        Vehiculo vehiculo = new Vehiculo();
        vehiculo.setPlaca(dto.getPlaca());
        vehiculo.setColor(dto.getColor());
        vehiculo.setModelo(dto.getModelo());
        vehiculo.setMarca(dto.getMarca());
        vehiculo.setCapacidadCarga(dto.getCapacidadCarga());
        vehiculo.setKilometraje(dto.getKilometraje());
        if (vehiculo.getFechaRegistro() == null) {
            vehiculo.setFechaRegistro(LocalDate.now());
        }

        // Campos fijos
        vehiculo.setEstado(EstadoUsuario.ACTIVO);

        vehiculo.setUsuario(conductor);

        // Guardar en BD
        return vehiculoRepository.save(vehiculo);
    }
}
