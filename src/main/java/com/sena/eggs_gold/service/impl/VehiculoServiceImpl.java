package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.VehiculoDTO;
import com.sena.eggs_gold.model.entity.Conductor;
import com.sena.eggs_gold.model.entity.Vehiculo;
import com.sena.eggs_gold.model.enums.Estado;
import com.sena.eggs_gold.repository.ConductorRepository;
import com.sena.eggs_gold.repository.VehiculoRepository;
import com.sena.eggs_gold.service.VehiculoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
        vehiculo.setFechaRegistro(dto.getFechaRegistro());

        // Campos fijos
        vehiculo.setEstado(Estado.ACTIVO);

        // Relación con el conductor
        vehiculo.setConductores(List.of(conductor));

        // Guardar en BD
        return vehiculoRepository.save(vehiculo);
    }
}
