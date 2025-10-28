/* ============================================
   VERIFICACIÓN DE SESIÓN
   Se ejecuta al cargar la página para verificar
   que el usuario esté logueado y tenga permisos
   ============================================ */

// Obtener información de la sesión desde el servidor
fetch('/session', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(({ usuario_id, rol }) => {
        // Si no hay usuario o rol, redirigir al login
        if (!usuario_id || !rol) {
            alert("❌ Sesión no iniciada. Redirigiendo al inicio...");
            window.location.href = '/login';
            return;
        }

        console.log('ID de sesión:', usuario_id);
        console.log('Rol:', rol);

        // Si es administrador, cargar pedidos pendientes
        if (rol === 'ADMIN') {
            cargarPedidosRecientes('PENDIENTE');
        }
    })
    .catch(error => {
        console.error("Error al obtener sesión:", error);
        window.location.href = '/login';
    });



/* ============================================
   CERRAR SESIÓN
   Limpia datos locales y cierra la sesión
   ============================================ */

document.getElementById("cerrar_sesion").addEventListener("click", function(e) {
    e.preventDefault();

    // Confirmar antes de cerrar sesión
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
        // Limpiar datos locales
        localStorage.clear();
        sessionStorage.clear();

        // Redirigir al logout del servidor
        window.location.href = "/logout";
    }
});