package com.sena.eggs_gold.model.entity;

import com.sena.eggs_gold.model.enums.EstadoNovedad;
import com.sena.eggs_gold.model.enums.TipoNovedad;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "novedades")
public class Novedad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_NOVEDAD")
    private Integer ID_NOVEDAD;

    @ManyToOne
    @JoinColumn(name = "ID_USUARIO", nullable = false)
    private Usuario ID_USUARIO;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_NOVEDAD", nullable = false)
    private TipoNovedad TIPO_NOVEDAD;

    @Column(name = "DESCRIPCION", columnDefinition = "TEXT")
    private String DESCRIPCION;

    @Column(name = "IMAGEN", length = 255)
    private String IMAGEN;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false)
    private EstadoNovedad ESTADO = EstadoNovedad.PENDIENTE;

    @Column(name = "FECHA_CREACION")
    private LocalDateTime FECHA_CREACION;

    @Column(name = "FECHA_RESOLUCION")
    private LocalDateTime FECHA_RESOLUCION;

    @PrePersist
    public void prePersist() {
        this.FECHA_CREACION = LocalDateTime.now();
    }

}
