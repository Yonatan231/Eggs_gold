package com.sena.eggs_gold.model.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.util.List;

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

    @OneToMany(mappedBy = "privilegio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UsuarioPrivilegio> usuarioPrivilegios;
}
