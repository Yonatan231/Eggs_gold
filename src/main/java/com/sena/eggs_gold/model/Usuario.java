package com.sena.eggs_gold.model;

import jakarta.persistence.*;

import lombok.Data;


import javax.management.relation.Role;
import java.time.LocalDate;

@Entity
@Table(name="usuarios")
@Data
public class Usuario {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name="ROL_ID", referencedColumnName="ROLES_ID")
    private Rol rol;

    @ManyToOne
    @JoinColumn(name="VEHICULO_ID", referencedColumnName="ID_VEHICULOS")
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name="RUTAS_COMPLETADAS_ID", referencedColumnName = "ID_RUTAS_COMPLETADAS")
    private Rutas rutas;


    @Column(name="NOMBRE")
    private String nombre;

    @Column(name="APELLIDO")
    private String apellido;

    @Column(name="DIRECCION_USUARIO")
    private String direccion;

    @Enumerated(EnumType.STRING)
    @Column(name="TIPO_DOCUMENTO")
    private TipoDocumento  tipoDocumento = TipoDocumento.CC;

    @Column(name="NUM_DOCUMENTO")
    private Integer numDocumento;

    @Column(name="TELEFONO")
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(name="ESTADO")
    private Estado estado = Estado.ACTIVO;

    @Column(name="CORREO")
    private String correo;

    @Column(name="PASSWORD")
    private String password;

    @Column(name="FECHA_REGISTRO")
    private LocalDate fechaRegistro;



}
