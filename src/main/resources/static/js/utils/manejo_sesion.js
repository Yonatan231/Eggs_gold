window.idSesion = null;
window.rolSesion = null;

(function() {
    const sesionCerrada = sessionStorage.getItem('sesion_cerrada');

    if (sesionCerrada === 'true') {
        console.log('⚠️ Sesión cerrada detectada - Limpiando caché');

        sessionStorage.clear();
        localStorage.clear();

        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
            return;
        }
    }

    // prevenir que se pueda volver al cerrar la sesion
    window.addEventListener('pageshow', function(event) {
        if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
            fetch('/session', { credentials: 'same-origin' })
                .then(res => res.json())
                .then(data => {
                    if (!data.usuario_id || !data.rol) {
                        console.log(' Sesión inválida detectada al volver atrás');
                        window.location.href = '/login';
                    }
                })
                .catch(() => {
                    window.location.href = '/login';
                });
        }
    });
})();

// obtener informacion de la sesion
fetch('/session', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(({ usuario_id, rol }) => {
        if (!usuario_id || !rol) {
            console.warn(' Sesión no iniciada');

            const rutasPublicas = ['/login', '/registro', '/registro_cliente', '/'];
            const rutaActual = window.location.pathname;

            if (!rutasPublicas.includes(rutaActual)) {
                alert(" Sesión no iniciada. Redirigiendo al inicio...");
                window.location.href = '/login';
            }
            return;
        }

        console.log(' Sesión activa');
        console.log('   ID de sesión:', usuario_id);
        console.log('   Rol:', rol);

        window.idSesion = usuario_id;
        window.rolSesion = rol;

        sessionStorage.setItem("usuarioId", usuario_id);
        sessionStorage.setItem("rolUsuario", rol);

        const datosCliente = {
            idUsuarios: usuario_id,
            id: usuario_id,
            rol: rol
        };
        localStorage.setItem("cliente", JSON.stringify(datosCliente));

        console.log(" ID de sesión disponible globalmente:", window.idSesion);
        console.log(" ID de sesión guardado en sessionStorage:", sessionStorage.getItem("usuarioId"));

        window.dispatchEvent(new CustomEvent('sesionCargada', {
            detail: {
                idUsuario: usuario_id,
                rol: rol
            }
        }));
    })
    .catch(error => {
        console.error("❌ Error al obtener sesión:", error);

        const rutasPublicas = ['/login', '/registro', '/registro_cliente', '/'];
        const rutaActual = window.location.pathname;

        if (!rutasPublicas.includes(rutaActual)) {
            window.location.href = '/login';
        }
    });

// cerrar la sesion y limpiar los datos
const btnCerrarSesion = document.getElementById("cerrar_sesion");
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", function(e) {
        e.preventDefault();

        if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
            sessionStorage.setItem('sesion_cerrada', 'true');

            localStorage.clear();

            window.idSesion = null;
            window.rolSesion = null;

            console.log(' Cerrando sesión...');

            window.location.href = "/logout";
        }
    });
} else {
    console.warn("️ Botón de cerrar sesión no encontrado en esta página");
}

// prevenir acceso con el boton de atras
window.addEventListener('load', function() {
    window.history.pushState(null, "", window.location.href);

    window.addEventListener('popstate', function() {
        window.history.pushState(null, "", window.location.href);
    });
});