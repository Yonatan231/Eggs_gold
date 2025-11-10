window.idSesion = null;
window.rolSesion = null;

// ============================================
// PREVENIR CACHÉ DESPUÉS DE LOGOUT
// ============================================
(function() {
    // Detectar si el usuario cerró sesión previamente
    const sesionCerrada = sessionStorage.getItem('sesion_cerrada');

    if (sesionCerrada === 'true') {
        console.log('⚠️ Sesión cerrada detectada - Limpiando caché');

        // Limpiar todo
        sessionStorage.clear();
        localStorage.clear();

        // Si no estamos en login, redirigir
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
            return;
        }
    }

    // Prevenir navegación con botón "Atrás" después de logout
    window.addEventListener('pageshow', function(event) {
        // Si la página viene del caché del navegador
        if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
            // Verificar si hay sesión activa
            fetch('/session', { credentials: 'same-origin' })
                .then(res => res.json())
                .then(data => {
                    if (!data.usuario_id || !data.rol) {
                        console.log('⚠️ Sesión inválida detectada al volver atrás');
                        window.location.href = '/login';
                    }
                })
                .catch(() => {
                    window.location.href = '/login';
                });
        }
    });
})();

// ============================================
// OBTENER INFORMACIÓN DE LA SESIÓN
// ============================================
fetch('/session', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(({ usuario_id, rol }) => {
        // Si no hay usuario o rol, redirigir al login
        if (!usuario_id || !rol) {
            console.warn('⚠️ Sesión no iniciada');

            // Solo redirigir si NO estamos en páginas públicas
            const rutasPublicas = ['/login', '/registro', '/registro_cliente', '/'];
            const rutaActual = window.location.pathname;

            if (!rutasPublicas.includes(rutaActual)) {
                alert("❌ Sesión no iniciada. Redirigiendo al inicio...");
                window.location.href = '/login';
            }
            return;
        }

        console.log('✅ Sesión activa');
        console.log('   ID de sesión:', usuario_id);
        console.log('   Rol:', rol);

        // 🔥 IMPORTANTE: Exponer el ID globalmente
        window.idSesion = usuario_id;
        window.rolSesion = rol;

        // 🆕 NUEVO: También guardar en sessionStorage para compatibilidad
        sessionStorage.setItem("usuarioId", usuario_id);
        sessionStorage.setItem("rolUsuario", rol);

        // También guardar en localStorage como respaldo
        const datosCliente = {
            idUsuarios: usuario_id,
            id: usuario_id,
            rol: rol
        };
        localStorage.setItem("cliente", JSON.stringify(datosCliente));

        console.log("✅ ID de sesión disponible globalmente:", window.idSesion);
        console.log("✅ ID de sesión guardado en sessionStorage:", sessionStorage.getItem("usuarioId"));

        // Disparar evento personalizado para notificar que la sesión está lista
        window.dispatchEvent(new CustomEvent('sesionCargada', {
            detail: {
                idUsuario: usuario_id,
                rol: rol
            }
        }));
    })
    .catch(error => {
        console.error("❌ Error al obtener sesión:", error);

        // Solo redirigir si NO estamos en páginas públicas
        const rutasPublicas = ['/login', '/registro', '/registro_cliente', '/'];
        const rutaActual = window.location.pathname;

        if (!rutasPublicas.includes(rutaActual)) {
            window.location.href = '/login';
        }
    });

/* ============================================
   CERRAR SESIÓN
   Limpia datos locales y cierra la sesión
   ============================================ */
const btnCerrarSesion = document.getElementById("cerrar_sesion");
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", function(e) {
        e.preventDefault();

        // Confirmar antes de cerrar sesión
        if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
            // Marcar que la sesión fue cerrada
            sessionStorage.setItem('sesion_cerrada', 'true');

            // Limpiar datos locales
            localStorage.clear();

            // Limpiar variables globales
            window.idSesion = null;
            window.rolSesion = null;

            console.log('🚪 Cerrando sesión...');

            // Redirigir al logout del servidor
            window.location.href = "/logout";
        }
    });
} else {
    console.warn("⚠️ Botón de cerrar sesión no encontrado en esta página");
}

// prevenir acceso con el boton de atras
window.addEventListener('load', function() {
    // Deshabilitar caché de la página
    window.history.pushState(null, "", window.location.href);

    window.addEventListener('popstate', function() {
        window.history.pushState(null, "", window.location.href);
    });
});