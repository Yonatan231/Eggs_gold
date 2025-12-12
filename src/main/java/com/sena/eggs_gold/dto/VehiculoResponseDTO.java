package com.sena.eggs_gold.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehiculoResponseDTO {

    private Integer idVehiculos;
    private String placa;
    private String color;
    private String modelo;
    private String marca;
    private Float capacidadCarga;
    private Float kilometraje;
    private String estado;
    private LocalDate fechaRegistro;

    private Integer idConductor;
    private String nombreConductor;
    private String apellidoConductor;
}