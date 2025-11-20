/**
 * SCRIPT PARA GESTIÓN DE NOVEDADES DEL ADMINISTRADOR
 * Funcionalidades: Filtro por estado, cambio de estado, lightbox para imágenes
 */


console.log(`
====================================
   Bienvenido a la consola :)
   No toques nada si no sabes.
====================================
`);
// ============================================
// FILTRO POR ESTADO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const filtroEstado = document.getElementById('filtroEstado');
    const tabla = document.getElementById('tablaNovedades');
    const filas = tabla.querySelectorAll('tbody tr:not(.empty-row)');

    if (filtroEstado) {
        filtroEstado.addEventListener('change', function() {
            const estadoSeleccionado = this.value;

            filas.forEach(fila => {
                const estadoFila = fila.getAttribute('data-estado');

                if (estadoSeleccionado === 'TODOS') {
                    fila.style.display = '';
                } else if (estadoFila === estadoSeleccionado) {
                    fila.style.display = '';
                } else {
                    fila.style.display = 'none';
                }
            });

            // Verificar si hay filas visibles
            verificarFilasVisibles();
        });
    }

    // Verificar si hay filas visibles para mostrar mensaje
    function verificarFilasVisibles() {
        const filasVisibles = Array.from(filas).filter(fila => fila.style.display !== 'none');
        const emptyRow = tabla.querySelector('.empty-row');

        if (filasVisibles.length === 0 && !emptyRow) {
            const tbody = tabla.querySelector('tbody');
            const mensajeVacio = document.createElement('tr');
            mensajeVacio.className = 'empty-row temporal';
            mensajeVacio.innerHTML = '<td colspan="10" class="empty-message">No hay novedades con este estado</td>';
            tbody.appendChild(mensajeVacio);
        } else {
            const mensajeTemporal = tabla.querySelector('.temporal');
            if (mensajeTemporal) {
                mensajeTemporal.remove();
            }
        }
    }
});

// ============================================
// CAMBIO DE ESTADO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const selectsEstado = document.querySelectorAll('.cambiar-estado');

    selectsEstado.forEach(select => {
        select.addEventListener('change', function() {
            const idNovedad = this.getAttribute('data-id');
            const nuevoEstado = this.value;
            const estadoAnterior = this.querySelector('option:not(:checked)').value;

            if (confirm('¿Está seguro de cambiar el estado de esta novedad?')) {
                cambiarEstadoNovedad(idNovedad, nuevoEstado, this);
            } else {
                // Revertir selección
                this.value = estadoAnterior;
            }
        });
    });

    function cambiarEstadoNovedad(id, estado, selectElement) {
        const formData = new URLSearchParams();
        formData.append('estado', estado);

        fetch('/api/novedades/cambiar-estado/' + id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);

                    // Actualizar badge de estado visualmente
                    const fila = selectElement.closest('tr');
                    const badge = fila.querySelector('.estado-badge');

                    badge.textContent = estado;
                    badge.className = 'estado-badge ' + (estado === 'RESUELTO' ? 'estado-resuelto' : 'estado-pendiente');

                    // Actualizar data-estado de la fila
                    fila.setAttribute('data-estado', estado);

                } else {
                    alert('Error: ' + data.message);
                    // Revertir cambio
                    location.reload();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al cambiar el estado. Intente nuevamente.');
                location.reload();
            });
    }
});

// ============================================
// LIGHTBOX PARA VER IMÁGENES
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const botonesVerImagen = document.querySelectorAll('.btn-ver-imagen');

    // Abrir lightbox al hacer clic en "Ver"
    botonesVerImagen.forEach(boton => {
        boton.addEventListener('click', function() {
            const rutaImagen = this.getAttribute('data-imagen');
            lightboxImg.src = rutaImagen;
            lightbox.style.display = 'flex';
        });
    });

    // Cerrar lightbox con X
    if (lightboxClose) {
        lightboxClose.addEventListener('click', function() {
            lightbox.style.display = 'none';
        });
    }

    // Cerrar lightbox al hacer clic fuera de la imagen
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });

    // Cerrar lightbox con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.style.display === 'flex') {
            lightbox.style.display = 'none';
        }
    });
});