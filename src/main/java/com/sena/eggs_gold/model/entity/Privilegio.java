package com.sena.eggs_gold.model.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.util.List;

/**
 * Entidad JPA para la tabla privilegios
 */
@Entity
@Table(name = "privilegios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Privilegio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PRIVILEGIOS")
    private Integer idPrivilegios;

    @Column(name = "DESCRIPCION_PRIVILEGIO", length = 45)
    private String descripcionPrivilegio;

    // Relación muchos-a-muchos con Usuarios a través de UsuarioPrivilegio
    @OneToMany(mappedBy = "privilegio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UsuarioPrivilegio> usuarioPrivilegios;
}
