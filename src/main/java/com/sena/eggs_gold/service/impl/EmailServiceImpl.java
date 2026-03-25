package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.model.entity.DetallePedido;
import com.sena.eggs_gold.model.entity.Factura;
import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import com.sena.eggs_gold.repository.DetallePedidoRepository;
import com.sena.eggs_gold.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
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
        System.out.println("Correo enviado a: " + destinatario);
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

    @Async
    @Override
    public void enviarCorreoBienvenida(String para, String nombreUsuario) {
        String asunto = "Bienvenido a Eggs Gold";
        String cuerpo = """
                <h2>Bienvenido, %s</h2>
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

    @Async
    @Override
    public void enviarCorreoCambioEstado(String para, String nombreUsuario, EstadoUsuario nuevoEstado) {
        String asunto;
        String cuerpoHtml;

        if (nuevoEstado == EstadoUsuario.INACTIVO) {
            asunto = "Cuenta Suspendida - Eggs Gold";
            cuerpoHtml = String.format("""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            body { font-family: Arial, sans-serif; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background-color: #dc3545; padding: 20px; text-align: center; color: white; }
                            .content { padding: 20px; background-color: #f9f9f9; }
                            .warning-box {
                                background-color: #fff3cd; 
                                border-left: 4px solid #ffc107; 
                                padding: 15px; 
                                margin: 20px 0; 
                            }
                            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Eggs Gold</h1>
                                <h2>Notificacion de Cuenta</h2>
                            </div>
                            
                            <div class="content">
                                <h2>Hola %s</h2>
                                <p>Te informamos que tu cuenta ha sido <strong>suspendida</strong> por el administrador.</p>
                                
                                <div class="warning-box">
                                    <p><strong>⚠️ Importante:</strong></p>
                                    <p>No podras acceder al sistema hasta que tu cuenta sea reactivada.</p>
                                </div>
                                
                                <p style="margin-top: 20px;">
                                    Si consideras que esto es un error o deseas mas informacion, 
                                    por favor contacta con el administrador del sistema.
                                </p>
                                
                                <p style="margin-top: 30px;">
                                    Atentamente,<br>
                                    <strong>Equipo Eggs Gold</strong>
                                </p>
                            </div>
                            
                            <div class="footer">
                                <p>Este es un correo automatico, por favor no responder.</p>
                                <p>© 2024 Eggs Gold - Todos los derechos reservados</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    """, nombreUsuario);
        } else {
            asunto = "Cuenta Activada - Eggs Gold";
            cuerpoHtml = String.format("""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            body { font-family: Arial, sans-serif; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background-color: #27AE60; padding: 20px; text-align: center; color: white; }
                            .content { padding: 20px; background-color: #f9f9f9; }
                            .success-box {
                                background-color: #d4edda; 
                                border-left: 4px solid #28a745; 
                                padding: 15px; 
                                margin: 20px 0; 
                            }
                            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Eggs Gold</h1>
                                <h2>Notificacion de Cuenta</h2>
                            </div>
                            
                            <div class="content">
                                <h2>¡Buenas noticias %s!</h2>
                                <p>Tu cuenta ha sido <strong>reactivada</strong> por el administrador.</p>
                                
                                <div class="success-box">
                                    <p><strong>✓ Tu cuenta esta activa:</strong></p>
                                    <p>Ya puedes acceder nuevamente al sistema y continuar usando todos los servicios.</p>
                                </div>
                                
                                <p style="margin-top: 20px;">
                                    Puedes iniciar sesion con tus credenciales habituales.
                                </p>
                                
                                <p style="margin-top: 30px;">
                                    Atentamente,<br>
                                    <strong>Equipo Eggs Gold</strong>
                                </p>
                            </div>
                            
                            <div class="footer">
                                <p>Este es un correo automatico, por favor no responder.</p>
                                <p>© 2024 Eggs Gold - Todos los derechos reservados</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    """, nombreUsuario);
        }

        try {
            enviarCorreo(para, asunto, cuerpoHtml);
            System.out.println("Correo de cambio de estado (" + nuevoEstado + ") enviado a: " + para);
        } catch (Exception e) {
            System.err.println("Error al enviar correo de cambio de estado: " + e.getMessage());
        }
    }

    @Override
    public void enviarFacturaPorCorreo(Factura factura) {
        String destinatario = factura.getPedido().getCliente().getCorreo();
        String nombreCliente = factura.getPedido().getCliente().getNombre() + " " +
                factura.getPedido().getCliente().getApellido();

        String asunto = "Factura #" + factura.getNumeroFactura() + " - Eggs Gold";

        List<DetallePedido> detalles = detallePedidoRepository
                .findByPedidoIdPedidos(factura.getPedido().getIdPedidos());

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
                            <h1>Eggs Gold</h1>
                            <p>Factura de Compra</p>
                        </div>
                
                        <div class="content">
                            <h2>Gracias por tu compra, %s</h2>
                            <p><strong>Factura N:</strong> %d</p>
                            <p><strong>Fecha:</strong> %s</p>
                            <p><strong>Metodo de pago:</strong> %s</p>
                            <p><strong>Direccion de entrega:</strong> %s</p>
                            
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
                            
                            <p class="total">TOTAL: $%,.2f</p>
                            
                            <p style="margin-top: 20px; font-size: 14px;">
                                Tu pedido sera entregado en la direccion especificada.
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p>Este es un correo automatico, por favor no responder.</p>
                            <p>2024 Eggs Gold - Todos los derechos reservados</p>
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

    @Async
    @Override
    public void enviarCorreoEntregaPedido(Pedido pedido) {
        String destinatario = pedido.getCliente().getCorreo();
        String nombreCliente = pedido.getCliente().getNombre() + " " + pedido.getCliente().getApellido();
        String asunto = "Pedido #" + pedido.getIdPedidos() + " Entregado - Eggs Gold";

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String fechaEntrega = pedido.getFechaEntrega() != null ?
                pedido.getFechaEntrega().format(formatter) : "No especificada";

        String nombreConductor = pedido.getConductor() != null ?
                pedido.getConductor().getNombre() + " " + pedido.getConductor().getApellido() : "No asignado";

        String seccionObservaciones = "";
        if (pedido.getObservacionConductor() != null && !pedido.getObservacionConductor().isEmpty()) {
            seccionObservaciones = String.format("""
                    <div style="background-color: #e8f4f8; padding: 15px; border-left: 4px solid #3498db; margin-top: 20px;">
                        <p style="margin: 0; font-weight: bold;">Observacion del conductor:</p>
                        <p style="margin: 5px 0 0 0;">%s</p>
                    </div>
                    """, pedido.getObservacionConductor());
        }

        String cuerpoHtml = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #27AE60; padding: 20px; text-align: center; color: white; }
                        .content { padding: 20px; background-color: #f9f9f9; }
                        .success-box {
                            background-color: #d4edda;
                            border-left: 4px solid #28a745;
                            padding: 15px;
                            margin: 20px 0;
                        }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Eggs Gold</h1>
                            <h2>Pedido Entregado</h2>
                        </div>
                        
                        <div class="content">
                            <h2>¡Hola %s!</h2>
                            
                            <div class="success-box">
                                <p><strong>Tu pedido #%d ha sido entregado exitosamente</strong></p>
                            </div>
                            
                            <p><strong>Fecha de entrega:</strong> %s</p>
                            <p><strong>Direccion:</strong> %s</p>
                            <p><strong>Conductor:</strong> %s</p>
                            
                            %s
                            
                            <p style="margin-top: 30px;">Esperamos que disfrutes de tus productos. Gracias por confiar en nosotros</p>
                            
                            <p style="margin-top: 20px; font-size: 14px; color: #666;">
                                Si tienes algun problema con tu pedido, por favor contactanos lo antes posible.
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p>Este es un correo automatico, por favor no responder.</p>
                            <p>2024 Eggs Gold - Todos los derechos reservados</p>
                        </div>
                    </div>
                </body>
                </html>
                """,
                nombreCliente,
                pedido.getIdPedidos(),
                fechaEntrega,
                pedido.getDireccion(),
                nombreConductor,
                seccionObservaciones
        );

        try {
            enviarCorreo(destinatario, asunto, cuerpoHtml);
        } catch (Exception e) {
            System.err.println("Error al enviar correo de entrega: " + e.getMessage());
        }
    }

    @Override
    public void enviarCorreoRecuperacion(String correo, String token) {
        String asunto = "Recuperacion de contrasena - Eggs Gold";

        String enlaceRecuperacion = "http://localhost:8080/reset-password?token=" + token;

        String cuerpoHtml = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #F7DC6F; padding: 20px; text-align: center; }
                        .content { padding: 20px; background-color: #f9f9f9; }
                        .button {
                            display: inline-block; 
                            padding: 15px 30px; 
                            background-color: #27AE60; 
                            color: white; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            margin: 20px 0;
                        }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Eggs Gold</h1>
                            <p>Recuperación de Contraseña</p>
                        </div>
                        
                        <div class="content">
                            <h2>Has solicitado recuperar tu contraseña</h2>
                            <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
                            
                            <div style="text-align: center;">
                                <a href="%s" class="button">Restablecer Contraseña</a>
                            </div>
                            
                            <p style="margin-top: 20px; font-size: 14px; color: #666;">
                                Si no solicitaste este cambio, ignora este correo. El enlace expira en 1 hora.
                            </p>
                            
                            <p style="font-size: 12px; color: #999; margin-top: 20px;">
                                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                                <span style="color: #27AE60;">%s</span>
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p>Este es un correo automatico, por favor no responder.</p>
                            <p>2024 Eggs Gold - Todos los derechos reservados</p>
                        </div>
                    </div>
                </body>
                </html>
                """, enlaceRecuperacion, enlaceRecuperacion);

        try {
            enviarCorreo(correo, asunto, cuerpoHtml);
        } catch (Exception e) {
            System.err.println("Error al enviar correo de recuperación: " + e.getMessage());
        }
    }
}