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
    private TipoDocumento tipoDocumento;

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

    // Relaciones JPA - Many to One (un usuario tiene un rol)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROLES_ID_ROLES")
    private Rol rol;

    // Many to One (un usuario tiene un vehículo)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VEHICULOS_ID_VEHICULOS") // ahora puede ser null
    private Vehiculo vehiculo;

    // Many to One (un usuario puede o no tener una ruta completada)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RUTAS_COMPLETADAS_ID_RUTAS_COMPLETADAS") // cliente no requiere ruta
    private RutaCompletada rutaCompletada;

    // Relación muchos-a-muchos con Privilegios a través de UsuarioPrivilegio
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UsuarioPrivilegio> usuarioPrivilegios;

    /**
     * Se ejecuta antes de persistir un usuario
     */
    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDate.now(); // guarda la fecha actual
        }
        if (this.rol == null) {
            this.rol = new Rol();
            this.rol.setIdRoles(4); // 👈 rol cliente por defecto
        }
        if (this.rol.getIdRoles() == 4) {
            this.rutaCompletada = null; // 👈 cliente no tiene ruta
            this.vehiculo = null;       // 👈 cliente tampoco necesita vehículo
        }
    }
}

