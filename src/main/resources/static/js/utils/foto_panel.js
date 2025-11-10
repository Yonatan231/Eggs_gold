const usuarioId = window.idSesion || sessionStorage.getItem("usuarioId") ;


console.log("🔍 ID de usuario obtenido para gestión de foto:", usuarioId);
/**
 * Inicializa el sistema de gestión de foto de perfil
 * Esta función se puede llamar desde cualquier página
 */
window.addEventListener('sesionCargada', (e) => {
    inicializarGestionFotoPerfil(e.detail.idUsuario);
});
function inicializarGestionFotoPerfil(usuarioId) {
    if (!usuarioId) {
        console.error("Usuario no definido. No se puede gestionar la foto.");
        return;
    }
    {

        // Obtenemos los elementos del DOM
        const avatarImg = document.getElementById("avatar-imagen");
        const avatarIniciales = document.getElementById("avatar-iniciales");
        const inputFoto = document.getElementById("input-foto");

        // Verificamos que los elementos existan en la página
        if (!avatarImg || !avatarIniciales || !inputFoto) {
            console.error("Error: No se encontraron los elementos necesarios para la gestión de foto");
            return;
        }

        // Obtenemos el ID del usuario de tres formas posibles (en orden de prioridad):
        // 1. Variable global window.idSesion (más rápida y confiable)
        // 2. sessionStorage (respaldo estándar)
        // 3. Valor por defecto 1 (último recurso)


        // ============================================
        // CARGAR FOTO EXISTENTE DEL SERVIDOR
        // ============================================
        cargarFotoPerfil();

        /**
         * Función interna para cargar la foto del servidor
         * SOLUCIÓN AL PROBLEMA DE CACHÉ: Agregamos timestamp a la URL
         */
        function cargarFotoPerfil() {
            fetch(`/usuarios/${usuarioId}/foto`)
                .then(response => response.json())
                .then(data => {

                    if (data.success && data.ruta) {
                        // Si tiene foto, la mostramos
                        // IMPORTANTE: Agregamos ?t= con la fecha actual para evitar caché del navegador
                        const timestamp = new Date().getTime(); // Milisegundos desde 1970
                        avatarImg.src = data.ruta + '?t=' + timestamp;
                        avatarImg.style.display = "block";
                        avatarIniciales.style.display = "none";
                    } else {
                        // Si no tiene foto, mostramos las iniciales
                        const iniciales = data.iniciales || "US"; // US = Usuario
                        avatarIniciales.textContent = iniciales;
                        avatarImg.style.display = "none";
                        avatarIniciales.style.display = "flex";
                    }
                })
                .catch(error => {
                    console.error("Error al cargar foto:", error);
                    // En caso de error, mostramos las iniciales por defecto
                    avatarIniciales.textContent = "US";
                    avatarImg.style.display = "none";
                    avatarIniciales.style.display = "flex";
                });
        }

        // ============================================
        // SUBIR NUEVA FOTO
        // ============================================

        // Cuando el usuario selecciona una foto nueva
        inputFoto.addEventListener("change", function () {

            const archivo = inputFoto.files[0]; // El archivo que seleccionó

            // Si no hay archivo, salimos de la función
            if (!archivo) {
                return;
            }

            // VALIDACIÓN 1: Verificamos que sea una imagen
            if (!archivo.type.startsWith('image/')) {
                alert("❌ Por favor selecciona una imagen válida (JPG, PNG, etc.)");
                inputFoto.value = ""; // Limpiamos el input
                return;
            }

            // VALIDACIÓN 2: Verificamos el tamaño (máximo 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB en bytes
            if (archivo.size > maxSize) {
                alert("❌ La imagen es muy grande. El tamaño máximo es 5MB");
                inputFoto.value = ""; // Limpiamos el input
                return;
            }

            // Creamos el FormData para enviar el archivo al servidor
            const formData = new FormData();
            formData.append("foto", archivo);

            // Mostramos un mensaje de "Cargando..." (opcional)
            avatarIniciales.textContent = "...";
            avatarIniciales.style.display = "flex";
            avatarImg.style.display = "none";

            // Enviamos la foto al servidor
            fetch(`/usuarios/${usuarioId}/foto`, {
                method: "POST",
                body: formData
            })
                .then(response => response.json())
                .then(data => {

                    if (data.success) {
                        // ✅ FOTO SUBIDA EXITOSAMENTE

                        // SOLUCIÓN AL PROBLEMA: Agregamos timestamp para forzar recarga
                        const timestamp = new Date().getTime();
                        avatarImg.src = data.ruta + '?t=' + timestamp;
                        avatarImg.style.display = "block";
                        avatarIniciales.style.display = "none";

                        alert("✅ Foto actualizada correctamente");

                        // Limpiamos el input para permitir subir la misma foto otra vez si se desea
                        inputFoto.value = "";
                    } else {
                        // Error del servidor
                        alert("❌ Error: " + data.message);
                        cargarFotoPerfil(); // Recargamos la foto anterior
                    }
                })
                .catch(error => {
                    console.error("Error al subir foto:", error);
                    alert("❌ Error al subir la foto. Intenta de nuevo.");
                    cargarFotoPerfil(); // Recargamos la foto anterior
                });
        });

        // ============================================
        // FUNCIÓN PÚBLICA PARA RECARGAR LA FOTO
        // Por si necesitas recargarla desde otro lugar
        // ============================================
        window.recargarFotoPerfil = function () {
            cargarFotoPerfil();
        };
    }
}

// ============================================
// AUTO-INICIALIZACIÓN CUANDO EL DOM ESTÉ LISTO
// ============================================
document.addEventListener("DOMContentLoaded", function () {
    inicializarGestionFotoPerfil();
});
