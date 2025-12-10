// ===== EmailService.java =====
package com.sena.eggs_gold.service;

import com.sena.eggs_gold.model.entity.Factura;
import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import jakarta.mail.MessagingException;
import java.io.UnsupportedEncodingException;
import java.util.List;

public interface EmailService {
    void enviarCorreo(String destinatario, String asunto, String contenidoHtml)
            throws MessagingException, UnsupportedEncodingException;

    void enviarCorreosMasivos(List<String> destinatarios, String asunto, String contenidoHtml)
            throws MessagingException, UnsupportedEncodingException;

    void enviarCorreoBienvenida(String para, String nombreUsuario);

    // metodo unificado para cambio de estado de cuenta (activo/inactivo)
    void enviarCorreoCambioEstado(String para, String nombreUsuario, EstadoUsuario nuevoEstado);

    void enviarFacturaPorCorreo(Factura factura);

    void enviarCorreoEntregaPedido(Pedido pedido);

    // metodo para enviar correo de recuperacion de contrasena
    void enviarCorreoRecuperacion(String correo, String token);
}