document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.toggle-btn');
    const headerHamburger = document.querySelector('.header-hamburger');

    // Crear overlay para cerrar sidebar en móviles si no existe
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    // Función para abrir sidebar
    function abrirSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Función para cerrar sidebar
    function cerrarSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Toggle desde botón flotante (legacy)
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (sidebar.classList.contains('active')) {
                cerrarSidebar();
            } else {
                abrirSidebar();
            }
        });
    }

    // Toggle desde header responsive
    if (headerHamburger) {
        headerHamburger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (sidebar.classList.contains('active')) {
                cerrarSidebar();
            } else {
                abrirSidebar();
            }
        });
    }

    // Cerrar sidebar al hacer clic en el overlay
    overlay.addEventListener('click', cerrarSidebar);

    // Cerrar sidebar al hacer clic en un enlace del menú (solo en móviles)
    const menuLinks = sidebar.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                cerrarSidebar();
            }
        });
    });

    // Cerrar sidebar al redimensionar a desktop
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                cerrarSidebar();
            }
        }, 250);
    });

    // ============================================
    // TOUCH GESTURES PARA MÓVILES
    // ============================================
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        if (window.innerWidth > 768) return;

        const swipeDistance = touchEndX - touchStartX;

        // Swipe desde la izquierda para abrir (mínimo 50px)
        if (touchStartX < 50 && swipeDistance > 50 && !sidebar.classList.contains('active')) {
            abrirSidebar();
        }

        // Swipe hacia la izquierda para cerrar (mínimo 50px)
        if (sidebar.classList.contains('active') && swipeDistance < -50) {
            cerrarSidebar();
        }
    }
});

// ============================================
// GESTIÓN DE FOTO DE PERFIL
// Integrado desde foto_panel.js
// ============================================

/**
 * Inicializa el sistema de gestión de foto de perfil
 */
window.addEventListener('sesionCargada', (e) => {
    inicializarGestionFotoPerfil(e.detail.idUsuario);
});

function inicializarGestionFotoPerfil(usuarioId) {
    // Si no hay usuarioId, intentar obtenerlo de diferentes fuentes
    if (!usuarioId) {
        usuarioId = window.idSesion || sessionStorage.getItem("usuarioId");
    }

    if (!usuarioId) {
        console.error("Usuario no definido. No se puede gestionar la foto.");
        return;
    }

    console.log("📸 ID de usuario obtenido para gestión de foto:", usuarioId);

    // Obtener elementos del DOM
    const avatarImg = document.getElementById("avatar-imagen");
    const avatarIniciales = document.getElementById("avatar-iniciales");
    const inputFoto = document.getElementById("input-foto");

    // Verificar que los elementos existan
    if (!avatarImg || !avatarIniciales || !inputFoto) {
        console.error("Error: No se encontraron los elementos necesarios para la gestión de foto");
        return;
    }

    // ============================================
    // CARGAR FOTO EXISTENTE DEL SERVIDOR
    // ============================================
    cargarFotoPerfil();

    function cargarFotoPerfil() {
        fetch(`/usuarios/${usuarioId}/foto`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.ruta) {
                    // ✅ CORRECCIÓN: Ya no necesitamos timestamp porque Cloudinary maneja el caché
                    // La URL de Cloudinary ya es única y siempre apunta a la última versión
                    avatarImg.src = data.ruta; // URL completa de Cloudinary
                    avatarImg.style.display = "block";
                    avatarIniciales.style.display = "none";
                } else {
                    // Si no tiene foto, mostrar iniciales
                    const iniciales = data.iniciales || "US";
                    avatarIniciales.textContent = iniciales;
                    avatarImg.style.display = "none";
                    avatarIniciales.style.display = "flex";
                }
            })
            .catch(error => {
                console.error("Error al cargar foto:", error);
                avatarIniciales.textContent = "US";
                avatarImg.style.display = "none";
                avatarIniciales.style.display = "flex";
            });
    }

    // ============================================
    // SUBIR NUEVA FOTO
    // ============================================
    inputFoto.addEventListener("change", function() {
        const archivo = inputFoto.files[0];

        if (!archivo) {
            return;
        }

        // VALIDACIÓN 1: Verificar que sea una imagen
        if (!archivo.type.startsWith('image/')) {
            alert("❌ Por favor selecciona una imagen válida (JPG, PNG, etc.)");
            inputFoto.value = "";
            return;
        }

        // VALIDACIÓN 2: Verificar el tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB en bytes
        if (archivo.size > maxSize) {
            alert("❌ La imagen es muy grande. El tamaño máximo es 5MB");
            inputFoto.value = "";
            return;
        }

        // Crear FormData para enviar el archivo
        const formData = new FormData();
        formData.append("foto", archivo);

        // Mostrar "Cargando..."
        avatarIniciales.textContent = "...";
        avatarIniciales.style.display = "flex";
        avatarImg.style.display = "none";

        // Enviar la foto al servidor
        fetch(`/usuarios/${usuarioId}/foto`, {
            method: "POST",
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // ✅ CORRECCIÓN: Ya no necesitamos timestamp
                    // Cloudinary ya maneja las versiones automáticamente
                    avatarImg.src = data.ruta; // URL completa de Cloudinary
                    avatarImg.style.display = "block";
                    avatarIniciales.style.display = "none";

                    alert("✅ Foto actualizada correctamente");
                    inputFoto.value = "";
                } else {
                    alert("❌ Error: " + data.message);
                    cargarFotoPerfil();
                }
            })
            .catch(error => {
                console.error("Error al subir foto:", error);
                alert("❌ Error al subir la foto. Intenta de nuevo.");
                cargarFotoPerfil();
            });
    });

    // ============================================
    // FUNCIÓN PÚBLICA PARA RECARGAR LA FOTO
    // ============================================
    window.recargarFotoPerfil = function() {
        cargarFotoPerfil();
    };
}

// ============================================
// AUTO-INICIALIZACIÓN
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    inicializarGestionFotoPerfil();
});