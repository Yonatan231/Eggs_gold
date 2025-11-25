package com.sena.eggs_gold.model.entity;

import com.sena.eggs_gold.dto.VehiculoResponseDTO;
import com.sena.eggs_gold.model.entity.Vehiculo;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Clase que convierte entre Entidad Vehiculo y VehiculoResponseDTO
 * Evita el problema de referencias circulares
 */
@Component
public class VehiculoMapper {

    /**
     * Convierte una entidad Vehiculo a VehiculoResponseDTO
     * Solo incluye los datos necesarios, sin referencias circulares
     */
    public VehiculoResponseDTO toResponseDTO(Vehiculo vehiculo) {
        if (vehiculo == null) {
            return null;
        }

        VehiculoResponseDTO dto = new VehiculoResponseDTO();

        // Datos del vehículo
        dto.setIdVehiculos(vehiculo.getIdVehiculos());
        dto.setPlaca(vehiculo.getPlaca());
        dto.setColor(vehiculo.getColor());
        dto.setModelo(vehiculo.getModelo());
        dto.setMarca(vehiculo.getMarca());
        dto.setCapacidadCarga(vehiculo.getCapacidadCarga());
        dto.setKilometraje(vehiculo.getKilometraje());
        dto.setEstado(vehiculo.getEstado().name()); // Convierte el enum a String
        dto.setFechaRegistro(vehiculo.getFechaRegistro());

        // Datos básicos del conductor (si existe)
        if (vehiculo.getUsuario() != null) {
            dto.setIdConductor(vehiculo.getUsuario().getIdUsuarios());
            dto.setNombreConductor(vehiculo.getUsuario().getNombre());
            dto.setApellidoConductor(vehiculo.getUsuario().getApellido());
        }

        return dto;
    }

    /**
     * Convierte una lista de Vehiculos a una lista de VehiculoResponseDTO
     */
    public List<VehiculoResponseDTO> toResponseDTOList(List<Vehiculo> vehiculos) {
        if (vehiculos == null) {
            return null;
        }

        return vehiculos.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }
}