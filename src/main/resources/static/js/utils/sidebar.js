document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.toggle-btn');
    const headerHamburger = document.querySelector('.header-hamburger');

    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    function abrirSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function cerrarSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

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

    overlay.addEventListener('click', cerrarSidebar);

    const menuLinks = sidebar.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                cerrarSidebar();
            }
        });
    });

    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                cerrarSidebar();
            }
        }, 250);
    });

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

        if (touchStartX < 50 && swipeDistance > 50 && !sidebar.classList.contains('active')) {
            abrirSidebar();
        }

        if (sidebar.classList.contains('active') && swipeDistance < -50) {
            cerrarSidebar();
        }
    }
});

window.addEventListener('sesionCargada', (e) => {
    inicializarGestionFotoPerfil(e.detail.idUsuario);
});

function inicializarGestionFotoPerfil(usuarioId) {
    if (!usuarioId) {
        usuarioId = window.idSesion || sessionStorage.getItem("usuarioId");
    }

    if (!usuarioId) {
        console.error("Usuario no definido. No se puede gestionar la foto.");
        return;
    }


    const avatarImg = document.getElementById("avatar-imagen");
    const avatarIniciales = document.getElementById("avatar-iniciales");
    const inputFoto = document.getElementById("input-foto");

    if (!avatarImg || !avatarIniciales || !inputFoto) {
        console.error("Error: No se encontraron los elementos necesarios para la gestión de foto");
        return;
    }

    cargarFotoPerfil();

    function cargarFotoPerfil() {
        fetch(`/usuarios/${usuarioId}/foto`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.ruta) {
                    avatarImg.src = data.ruta;
                    avatarImg.style.display = "block";
                    avatarIniciales.style.display = "none";
                } else {
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

    inputFoto.addEventListener("change", function() {
        const archivo = inputFoto.files[0];

        if (!archivo) {
            return;
        }

        if (!archivo.type.startsWith('image/')) {
            alert("❌ Por favor selecciona una imagen válida (JPG, PNG, etc.)");
            inputFoto.value = "";
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB en bytes
        if (archivo.size > maxSize) {
            alert("❌ La imagen es muy grande. El tamaño máximo es 5MB");
            inputFoto.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("foto", archivo);

        avatarIniciales.textContent = "...";
        avatarIniciales.style.display = "flex";
        avatarImg.style.display = "none";

        fetch(`/usuarios/${usuarioId}/foto`, {
            method: "POST",
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    avatarImg.src = data.ruta;
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

    window.recargarFotoPerfil = function() {
        cargarFotoPerfil();
    };
}

document.addEventListener("DOMContentLoaded", function() {
    inicializarGestionFotoPerfil();
});