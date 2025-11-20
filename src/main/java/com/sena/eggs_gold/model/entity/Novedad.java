package com.sena.eggs_gold.model.entity;

import com.sena.eggs_gold.model.enums.EstadoNovedad;
import com.sena.eggs_gold.model.enums.TipoNovedad;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "novedades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Novedad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_NOVEDAD")
    private Integer idNovedad;

    @ManyToOne
    @JoinColumn(name = "ID_USUARIO", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "ID_PEDIDO", nullable = false)
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_NOVEDAD", nullable = false)
    private TipoNovedad tipoNovedad;

    @Column(name = "DESCRIPCION", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "IMAGEN", length = 255)
    private String imagen;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false)
    private EstadoNovedad estado;

    @Column(name = "FECHA_CREACION", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "FECHA_RESOLUCION")
    private LocalDateTime fechaResolucion;
}
