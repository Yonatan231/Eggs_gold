package com.sena.eggs_gold.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sena.eggs_gold.model.enums.TipoDocumento;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

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

    @Column(name = "NOMBRE", nullable = false, length = 45)
    private String nombre;

    @Column(name = "APELLIDO", nullable = false, length = 45)
    private String apellido;

    @Column(name = "DIRECCION_USUARIO", nullable = false, length = 120)
    private String direccionUsuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_DOCUMENTO", nullable = false)
    private TipoDocumento tipoDocumento;

    @Column(name = "NUM_DOCUMENTO", nullable = false, length = 20)
    private String numDocumento;

    @Column(name = "TELEFONO", nullable = false, length = 20)
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false)
    private EstadoUsuario estado;

    @Column(name = "CORREO", nullable = false, length = 45)
    private String correo;

    @Column(name = "PASSWORD", nullable = false, length = 120)
    private String password;

    @Column(name = "FECHA_REGISTRO", nullable = false)
    private LocalDate fechaRegistro;

    @Column(name = "FOTO_PANEL", columnDefinition = "TEXT")
    private String fotoPanel;

    @Column(name = "token_recuperacion", length = 255)
    private String tokenRecuperacion;

    @Column(name = "token_expiracion")
    private LocalDateTime tokenExpiracion;


    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROL_ID", nullable = false)
    private Rol rol;
}