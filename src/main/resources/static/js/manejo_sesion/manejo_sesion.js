/* ============================================
   VERIFICACIÓN DE SESIÓN
   Se ejecuta al cargar la página para verificar
   que el usuario esté logueado y tenga permisos
   ============================================ */

// Variable global para almacenar el ID de sesión
window.idSesion = null;
window.rolSesion = null;

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

        // 🔥 IMPORTANTE: Exponer el ID globalmente
        window.idSesion = usuario_id;
        window.rolSesion = rol;

        // También guardar en localStorage como respaldo
        const datosCliente = {
            idUsuarios: usuario_id,
            id: usuario_id,
            rol: rol
        };
        localStorage.setItem("cliente", JSON.stringify(datosCliente));

        console.log("✅ ID de sesión disponible globalmente:", window.idSesion);

        // Disparar evento personalizado para notificar que la sesión está lista
        window.dispatchEvent(new CustomEvent('sesionCargada', {
            detail: {
                idUsuario: usuario_id,
                rol: rol
            }
        }));
    })
    .catch(error => {
        console.error("Error al obtener sesión:", error);
        window.location.href = '/login';
    });



/* ============================================
   CERRAR SESIÓN
   Limpia datos locales y cierra la sesión
   ============================================ */
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
            // Limpiar datos locales
            localStorage.clear();
            sessionStorage.clear();

            // Limpiar variables globales
            window.idSesion = null;
            window.rolSesion = null;

            // Redirigir al logout del servidor
            window.location.href = "/logout";
        }
    });
} else {
    console.warn("⚠️ Botón de cerrar sesión no encontrado en esta página");
}