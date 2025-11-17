package com.sena.eggs_gold.dto;

import com.sena.eggs_gold.model.enums.TipoDocumento;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConductorDTO {
    private Integer idUsuarios;
    private String nombre;
    private String apellido;
    private String numDocumento;
    private String direccionUsuario;
    private String telefono;
    private String correo;
    private String password;
    private LocalDate fechaRegistro;
    private Long pedidosEntregados; // Para estadísticas

    // ✅ NUEVO: Campo para tipo de documento
    private TipoDocumento tipoDocumento;

    // Constructor para queries que incluyen pedidos entregados
    public ConductorDTO(Integer idUsuarios, String nombre, String apellido, String numDocumento,
                        String direccionUsuario, String telefono, Long pedidosEntregados) {
        this.idUsuarios = idUsuarios;
        this.nombre = nombre;
        this.apellido = apellido;
        this.numDocumento = numDocumento;
        this.direccionUsuario = direccionUsuario;
        this.telefono = telefono;
        this.pedidosEntregados = pedidosEntregados;
    }
}