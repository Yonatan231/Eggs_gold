package com.sena.eggs_gold.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
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
}
