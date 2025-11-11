package com.sena.eggs_gold.model.entity;

import com.sena.eggs_gold.model.enums.Estado;
import com.sena.eggs_gold.model.enums.TipoDocumento;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

/**
 * Entidad JPA para la tabla usuarios
 */
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

    // Relación OneToMany con Vehiculo
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Vehiculo> vehiculos;

    @Column(name = "NOMBRE", nullable = false, length = 45)
    private String nombre;

    @Column(name = "APELLIDO", nullable = false, length = 45)
    private String apellido;

    @Column(name = "DIRECCION_USUARIO", nullable = false, length = 120)
    private String direccionUsuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_DOCUMENTO", nullable = false)
    private TipoDocumento tipoDocumento = TipoDocumento.CC;

    @Column(name = "NUM_DOCUMENTO", unique = true, nullable = false, length = 20)
    private String numDocumento;

    @Column(name = "TELEFONO", nullable = false, length = 20)
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false)
    private Estado estado = Estado.ACTIVO;

    @Column(name = "CORREO", nullable = false, length = 45)
    private String correo;

    @Column(name = "PASSWORD", nullable = false, length = 120)
    private String password;

    @Column(name = "FECHA_REGISTRO", nullable = false)
    private LocalDate fechaRegistro;

    @Column(name = "FOTO_PANEL", columnDefinition = "TEXT")
    private String fotoPanel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROL_ID", nullable = false)
    private Rol rol;

    // Relación con UsuarioPrivilegio (asumiendo tabla intermedia)
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<UsuarioPrivilegio> usuarioPrivilegios;

    // Relación con Pedido
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pedido> pedidos;

    @PrePersist
    protected void onCreate() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDate.now();
        }
    }
}