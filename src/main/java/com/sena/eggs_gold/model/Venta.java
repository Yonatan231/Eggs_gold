package com.sena.eggs_gold.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;


@Entity
@Table(name="ventas")
@Data
public class Venta {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Column(name="ID_VEHICULOS")
    private Long id;

    @ManyToOne
    @JoinColumn(name="CLIENTE_ID", referencedColumnName="ID_USUARIO")
    private Usuario cliente;

    @ManyToOne
    @JoinColumn(name="VEHICULOS_ID", referencedColumnName="ID_VEHICULOS")
    private Vehiculo vehiculo;

    @Column(name="FECHA")
    private LocalDate fecha;

    @Column(name="METODO_PAGO")
    private Pago metodoPago;

    @Column(name="ESTADO")
    private EstadoPago estadoPago;
}
