// novedades.js - gestion de novedades del administrador

// filtro por estado
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

            verificarFilasVisibles();
        });
    }

    function verificarFilasVisibles() {
        const filasVisibles = Array.from(filas).filter(fila => fila.style.display !== 'none');
        const emptyRow = tabla.querySelector('.empty-row');

        if (filasVisibles.length === 0 && !emptyRow) {
            const tbody = tabla.querySelector('tbody');
            const mensajeVacio = document.createElement('tr');
            mensajeVacio.className = 'empty-row temporal';
            mensajeVacio.innerHTML = '<td colspan="9" class="empty-message">No hay novedades con este estado</td>';
            tbody.appendChild(mensajeVacio);
        } else {
            const mensajeTemporal = tabla.querySelector('.temporal');
            if (mensajeTemporal) {
                mensajeTemporal.remove();
            }
        }
    }
});

// cambio de estado
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

                    const fila = selectElement.closest('tr');
                    const badge = fila.querySelector('.estado-badge');

                    badge.textContent = estado;
                    badge.className = 'estado-badge ' + (estado === 'RESUELTO' ? 'estado-resuelto' : 'estado-pendiente');

                    fila.setAttribute('data-estado', estado);

                } else {
                    alert('Error: ' + data.message);
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

// lightbox para ver imagenes
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const botonesVerImagen = document.querySelectorAll('.btn-ver-imagen');

    botonesVerImagen.forEach(boton => {
        boton.addEventListener('click', function() {
            const rutaImagen = this.getAttribute('data-imagen');
            lightboxImg.src = rutaImagen;
            lightbox.style.display = 'flex';
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', function() {
            lightbox.style.display = 'none';
        });
    }

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.style.display === 'flex') {
            lightbox.style.display = 'none';
        }
    });
});