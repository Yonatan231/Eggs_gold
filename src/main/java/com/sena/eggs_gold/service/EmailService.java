// ===== EmailService.java =====
package com.sena.eggs_gold.service;

import com.sena.eggs_gold.model.entity.Factura;
import com.sena.eggs_gold.model.entity.Pedido;
import jakarta.mail.MessagingException;
import java.io.UnsupportedEncodingException;
import java.util.List;

public interface EmailService {
    void enviarCorreo(String destinatario, String asunto, String contenidoHtml)
            throws MessagingException, UnsupportedEncodingException;

    void enviarCorreosMasivos(List<String> destinatarios, String asunto, String contenidoHtml)
            throws MessagingException, UnsupportedEncodingException;

    void enviarCorreoBienvenida(String para, String nombreUsuario);

    void enviarCorreoCambioEstado(String para, String nombreUsuario, String nuevoEstado);

    void enviarFacturaPorCorreo(Factura factura);

    // ✅ NUEVO: Correo de confirmación de entrega
    void enviarCorreoEntregaPedido(Pedido pedido);
}