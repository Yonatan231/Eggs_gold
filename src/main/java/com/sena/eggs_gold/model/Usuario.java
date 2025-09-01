package com.sena.eggs_gold.model;

import jakarta.persistence.*;

import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name="usuarios")
@Data
public class Usuario {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Integer id;

    @Column(name="NOMBRE")
    private String nombre;

    @Column(name="APELLIDO")
    private String apellido;

    @Column(name="DIRECCION_USUARIO")
    private String direccion;

    @Enumerated(EnumType.STRING)
    @Column(name="TIPO_DOCUMENTO")
    private TipoDocumento tipoDocumento;

    @Column(name="NUM_DOCUMENTO")
    private Integer numDocumento;

    @Column(name="TELEFONO")
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(name="ESTADO")
    private Estado estado;

    @Column(name="CORREO")
    private String correo;

    @Column(name="PASSWORD")
    private String password;

    @Column(name="FECHA_REGISTRO")
    private LocalDate fechaRegistro;



}
