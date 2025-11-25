package com.sena.eggs_gold.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LogisticaDTO {
    private Integer idUsuarios;
    private String nombre;
    private String apellido;
    private String direccionUsuario;
    private String numDocumento;
    private String telefono;
    private String correo;
    private String password;
    private String tipoUsuario; // el último campo '' de la query
    private Integer edad; // ✅ Campo edad agregado

    // 🔹 Este constructor coincide con la query en UsuarioRepository
    public LogisticaDTO(Integer idUsuarios, String nombre, String apellido,
                        String direccionUsuario, String numDocumento,
                        String telefono, String correo, String password,
                        String tipoUsuario) {
        this.idUsuarios = idUsuarios;
        this.nombre = nombre;
        this.apellido = apellido;
        this.direccionUsuario = direccionUsuario;
        this.numDocumento = numDocumento;
        this.telefono = telefono;
        this.correo = correo;
        this.password = password;
        this.tipoUsuario = tipoUsuario;
    }
}