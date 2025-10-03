package com.sena.eggs_gold.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConductorDTO {
    private Integer idUsuarios;
    private String nombre;
    private String apellido;
    private String direccionUsuario;
    private String numDocumento;
    private String telefono;
    private String correo;
    private String password;
    private String tipoUsuario;
    private LocalDate fechaRegistro;

    private Long pedidosEntregados;

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
