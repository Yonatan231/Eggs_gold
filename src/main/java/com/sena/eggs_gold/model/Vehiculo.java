package com.sena.eggs_gold.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name="vehiculos")
@Data
public class Vehiculo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="ID_VEHICULOS")
    private Long id;

    @Column(name="PLACA")
    private String placa;

    @Column(name="COLOR")
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(name="ESTADO")
    private Estado estado;

    @Column(name="MODELO")
    private String modelo;

    @Column(name="MARCA")
    private String marca;

    @Column(name="CAPACIDAD_CARGA")
    private float capacidad_carga;

    @Column(name="KILOMETRAJE")
    private float kilometraje;

    @Column(name="FECHA_REGISTRO")
    private LocalDate fecha_registro;

}
