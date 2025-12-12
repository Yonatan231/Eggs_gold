package com.sena.eggs_gold.model.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios_has_privilegios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioPrivilegio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PRIVILEGIOS_USUARIOS")
    private Integer idPrivilegiosUsuarios;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USUARIOS_ID_USUARIOS", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRIVILEGIOS_ID_PRIVILEGIOS", nullable = false)
    private Privilegio privilegio;
}