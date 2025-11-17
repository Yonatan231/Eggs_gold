package com.sena.eggs_gold.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RoleInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        String uri = request.getRequestURI();
        HttpSession session = request.getSession(false);

        // Si no hay sesión activa
        if (session == null || session.getAttribute("usuario_id") == null) {
            // Permitir acceso solo a páginas públicas
            if (isPublicUrl(uri)) {
                return true;
            }
            // Redirigir a login si intenta acceder a páginas protegidas
            response.sendRedirect("/login");
            return false;
        }

        // Obtener el rol del usuario
        String rol = (String) session.getAttribute("rol");

        // Validar acceso según rol y URL
        if (!tienePermiso(uri, rol)) {
            System.out.println("❌ Acceso denegado - Usuario con rol: " + rol + " intentó acceder a: " + uri);
            response.sendRedirect("/error_403");
            return false;
        }

        System.out.println("✅ Acceso permitido - Rol: " + rol + " → " + uri);
        return true;
    }

    // vistas publicas
    private boolean isPublicUrl(String uri) {
        return uri.equals("/") ||
                uri.equals("/login") ||
                uri.equals("/inicio") ||
                uri.equals("/contacto") ||
                uri.equals("/registro") ||
                uri.equals("/registro_cliente") ||
                uri.startsWith("/css/") ||
                uri.startsWith("/js/") ||
                uri.startsWith("/imagenes/") ||
                uri.startsWith("/uploads/") ||
                uri.startsWith("/usuarios/") ||
                uri.startsWith("/error/");
    }

    private boolean tienePermiso(String uri, String rol) {

        // Si no tiene rol, denegar acceso
        if (rol == null) {
            return false;
        }

        // vistas para admin
        if (uri.startsWith("/administrador") ||
                uri.startsWith("/registrar_producto") ||
                uri.startsWith("/registrar_logistica") ||
                uri.startsWith("/registrar_conductor") ||
                uri.startsWith("/correos") ||
                uri.startsWith("/admin/") ||
                uri.startsWith("/novedades") ||
                uri.equals("/clientes/pedidos") ||
                uri.equals("/logistica/ver") ||
                uri.equals("/conductores/pedidos-entregados") ||
                uri.startsWith("/eliminar/")) {
            return "ADMIN".equals(rol) || "LOGISTICA".equals(rol);
        }

        // vistas para logistica
        if (uri.startsWith("/logistica") ||
                uri.startsWith("/inventariol") ||
                uri.equals("/inventario/producto") ||
                uri.equals("/inventario/agregar") ||
                uri.startsWith("/inventario/detalle")) {
            return "LOGISTICA".equals(rol) || "ADMIN".equals(rol);
        }

        // vistas para conductos
        if (uri.startsWith("/conductor") ||
                uri.startsWith("/historial_pedidos_conductor") ||
                uri.startsWith("/registrar_vehiculo")){
            return "CONDUCTOR".equals(rol);
        }

        // vistas cliente
        if (uri.startsWith("/cliente") ||
                uri.startsWith("/mi_perfil") ||
                uri.startsWith("/carrito") ||
                uri.startsWith("/historial_pedidos") ||
                uri.startsWith("/inventario/")){
            return "CLIENTE".equals(rol);
        }

        // rutas generales
        if (uri.equals("/session") ||
                uri.equals("/logout") ||
                uri.startsWith("/api/pedido/listar")) {
            return true; // Cualquier usuario con sesión activa
        }

        // Por defecto, permitir acceso
        // (puedes cambiar a false si prefieres denegar por defecto)
        return true;
    }
}
