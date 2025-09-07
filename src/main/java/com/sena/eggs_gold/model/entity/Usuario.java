package com.sena.eggs_gold.model.entity;

import com.sena.eggs_gold.model.enums.Estado;
import com.sena.eggs_gold.model.enums.TipoDocumento;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;


@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_usuario", discriminatorType = DiscriminatorType.STRING)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_USUARIOS")
    private Integer idUsuarios;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "APELLIDO")
    private String apellido;

    @Column(name = "DIRECCION_USUARIO")
    private String direccionUsuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_DOCUMENTO")
    private TipoDocumento tipoDocumento = TipoDocumento.CC ;

    @Column(name = "NUM_DOCUMENTO")
    private String numDocumento;

    @Column(name = "TELEFONO")
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO")
    private Estado estado = Estado.ACTIVO;

    @Column(name = "CORREO")
    private String correo;

    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "FECHA_REGISTRO")
    private LocalDate fechaRegistro;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROL_ID")
    private Rol rol;

    @OneToMany()
    private List<UsuarioPrivilegio> usuarioPrivilegios;

    @PrePersist
    protected void onCreate() {
        this.fechaRegistro = LocalDate.now();
    }
}

