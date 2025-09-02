package com.sena.eggs_gold.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="roles")
@Data
public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="ROLES_ID")
    private Integer id;

    @Column(name="NOMBRE_ROL")
    private String nombre_rol;
}
