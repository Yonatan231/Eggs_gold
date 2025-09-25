package com.sena.eggs_gold.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class VehiculoDTO {
    private String placa;
    private String color;
    private String modelo;
    private String marca;
    private Float capacidadCarga;
    private Float kilometraje;
    private LocalDate fechaRegistro;
}
