package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.model.entity.DetallePedido;
import com.sena.eggs_gold.model.entity.Factura;
import com.sena.eggs_gold.repository.DetallePedidoRepository;
import com.sena.eggs_gold.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    @Override
    public void enviarCorreo(String destinatario, String asunto, String contenidoHtml)
            throws MessagingException, UnsupportedEncodingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(destinatario);
        helper.setSubject(asunto);
        helper.setText(contenidoHtml, true);
        helper.setFrom("distribuidoraeggsgold@gmail.com", "Eggs Gold");

        mailSender.send(message);
        System.out.println("✅ Correo enviado a: " + destinatario);
    }

    @Override
    public void enviarCorreosMasivos(List<String> destinatarios, String asunto, String contenidoHtml)
            throws MessagingException, UnsupportedEncodingException {
        for (String email : destinatarios) {
            enviarCorreo(email, asunto, contenidoHtml);
            try {
                Thread.sleep(800);
            } catch (InterruptedException ignored) {}
        }
    }

    @Override
    public void enviarCorreoBienvenida(String para, String nombreUsuario) {
        String asunto = "¡Bienvenido a Eggs Gold!";
        String cuerpo = """
                <h2>¡Bienvenido, %s!</h2>
                <p>Gracias por unirte a <b>Eggs Gold</b>.</p>
                <p>Tu cuenta ha sido creada exitosamente. Ya puedes empezar a usar la plataforma.</p>
                <p>Atentamente,<br><b>Equipo Eggs Gold</b></p>
                """.formatted(nombreUsuario);
        try {
            enviarCorreo(para, asunto, cuerpo);
        } catch (Exception e) {
            System.err.println("Error al enviar correo de bienvenida: " + e.getMessage());
        }
    }

    @Override
    public void enviarCorreoCambioEstado(String para, String nombreUsuario, String nuevoEstado) {
        String asunto = "Actualización del estado de tu cuenta";
        String cuerpo = """
                <p>Hola <b>%s</b>,</p>
                <p>Tu cuenta ha cambiado de estado a: <b>%s</b></p>
                <p>Si tienes dudas, contacta con soporte.</p>
                <br>
                <p>Atentamente,<br><b>Equipo Eggs Gold</b></p>
                """.formatted(nombreUsuario, nuevoEstado);
        try {
            enviarCorreo(para, asunto, cuerpo);
        } catch (Exception e) {
            System.err.println("Error al enviar correo de cambio de estado: " + e.getMessage());
        }
    }

    // ✅ NUEVO: Enviar factura por correo
    @Override
    public void enviarFacturaPorCorreo(Factura factura) {
        String destinatario = factura.getPedido().getCliente().getCorreo();
        String nombreCliente = factura.getPedido().getCliente().getNombre() + " " +
                factura.getPedido().getCliente().getApellido();

        String asunto = "Factura #" + factura.getNumeroFactura() + " - Eggs Gold";

        // Obtener detalles del pedido
        List<DetallePedido> detalles = detallePedidoRepository
                .findByPedidoIdPedidos(factura.getPedido().getIdPedidos());

        // Construir tabla de productos
        StringBuilder tablaProductos = new StringBuilder();
        for (DetallePedido detalle : detalles) {
            BigDecimal subtotal = detalle.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(detalle.getCantidad()));

            tablaProductos.append(String.format("""
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">%s</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">%d</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$%,.2f</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$%,.2f</td>
                    </tr>
                    """,
                    detalle.getProducto().getNombre(),
                    detalle.getCantidad(),
                    detalle.getPrecioUnitario(),
                    subtotal
            ));
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        String cuerpoHtml = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #FFD700; padding: 20px; text-align: center; }
                        .content { padding: 20px; background-color: #f9f9f9; }
                        table { width: 100%%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #FFD700; padding: 10px; text-align: left; }
                        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🥚 Eggs Gold</h1>
                            <p>Factura de Compra</p>
                        </div>
                        
                        <div class="content">
                            <h2>¡Gracias por tu compra, %s!</h2>
                            <p><strong>Factura N°:</strong> %d</p>
                            <p><strong>Fecha:</strong> %s</p>
                            <p><strong>Método de pago:</strong> %s</p>
                            <p><strong>Dirección de entrega:</strong> %s</p>
                            
                            <table>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th style="text-align: center;">Cantidad</th>
                                        <th style="text-align: right;">Precio Unit.</th>
                                        <th style="text-align: right;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    %s
                                </tbody>
                            </table>
                            
                            <div class="total">
                                <p>TOTAL: $%,.2f</p>
                            </div>
                            
                            <p style="margin-top: 30px;">Tu pedido está siendo procesado y pronto lo recibirás.</p>
                        </div>
                        
                        <div class="footer">
                            <p>Este es un correo automático, por favor no responder.</p>
                            <p>© 2024 Eggs Gold - Todos los derechos reservados</p>
                        </div>
                    </div>
                </body>
                </html>
                """,
                nombreCliente,
                factura.getNumeroFactura(),
                factura.getFechaPago().format(formatter),
                factura.getMetodoPago(),
                factura.getPedido().getDireccion(),
                tablaProductos.toString(),
                factura.getTotalPagado()
        );

        try {
            enviarCorreo(destinatario, asunto, cuerpoHtml);
        } catch (Exception e) {
            System.err.println("Error al enviar factura por correo: " + e.getMessage());
        }
    }
}