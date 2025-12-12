package com.sena.eggs_gold.model.entity;

import com.sena.eggs_gold.dto.VehiculoResponseDTO;
import com.sena.eggs_gold.model.entity.Vehiculo;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class VehiculoMapper {

    public VehiculoResponseDTO toResponseDTO(Vehiculo vehiculo) {
        if (vehiculo == null) {
            return null;
        }

        VehiculoResponseDTO dto = new VehiculoResponseDTO();

        dto.setIdVehiculos(vehiculo.getIdVehiculos());
        dto.setPlaca(vehiculo.getPlaca());
        dto.setColor(vehiculo.getColor());
        dto.setModelo(vehiculo.getModelo());
        dto.setMarca(vehiculo.getMarca());
        dto.setCapacidadCarga(vehiculo.getCapacidadCarga());
        dto.setKilometraje(vehiculo.getKilometraje());
        dto.setEstado(vehiculo.getEstado().name());
        dto.setFechaRegistro(vehiculo.getFechaRegistro());

        if (vehiculo.getUsuario() != null) {
            dto.setIdConductor(vehiculo.getUsuario().getIdUsuarios());
            dto.setNombreConductor(vehiculo.getUsuario().getNombre());
            dto.setApellidoConductor(vehiculo.getUsuario().getApellido());
        }

        return dto;
    }

    public List<VehiculoResponseDTO> toResponseDTOList(List<Vehiculo> vehiculos) {
        if (vehiculos == null) {
            return null;
        }

        return vehiculos.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }
}