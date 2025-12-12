package com.sena.eggs_gold.model.entity;

import com.sena.eggs_gold.model.enums.EstadoUsuario;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "vehiculos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_VEHICULOS")
    private Integer idVehiculos;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "PLACA", nullable = false, length = 20)
    private String placa;

    @Column(name = "COLOR", nullable = false, length = 45)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false)
    private EstadoUsuario estado;

    @Column(name = "MODELO", nullable = false, length = 55)
    private String modelo;

    @Column(name = "MARCA", nullable = false, length = 45)
    private String marca;

    @Column(name = "CAPACIDAD_CARGA", nullable = false)
    private Float capacidadCarga;

    @Column(name = "KILOMETRAJE", nullable = false)
    private Float kilometraje;

    @Column(name = "FECHA_REGISTRO", nullable = false)
    private LocalDate fechaRegistro;

    @PrePersist
    protected void onCreate() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDate.now();
        }
    }
}