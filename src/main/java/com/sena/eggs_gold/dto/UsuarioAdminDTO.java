package com.sena.eggs_gold.dto;

import com.sena.eggs_gold.model.enums.EstadoUsuario;
import com.sena.eggs_gold.model.enums.TipoDocumento;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAdminDTO {

    private Integer idUsuario;
    private String nombre;
    private String apellido;
    private String direccion;
    private TipoDocumento tipoDocumento;
    private String numDocumento;
    private String telefono;
    private EstadoUsuario estado;
    private String correo;
    private LocalDate fechaRegistro;
    private String fotoPanel;

    // Información del rol
    private Integer idRol;
    private String nombreRol;
}