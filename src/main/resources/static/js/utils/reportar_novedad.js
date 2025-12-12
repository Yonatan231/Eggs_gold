function reportarNovedad(idUsuario, idPedido, tipoNovedad, descripcion, imagen = null) {
    const formData = new FormData();
    formData.append('idUsuario', idUsuario);
    formData.append('idPedido', idPedido);
    formData.append('tipoNovedad', tipoNovedad);
    formData.append('descripcion', descripcion);

    if (imagen) {
        formData.append('imagen', imagen);
    }

    return fetch('/api/novedades/crear', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        })
        .catch(error => {
            console.error('Error al enviar novedad:', error);
            return { success: false, message: 'Error al enviar la novedad. Intente nuevamente.' };
        });
}

function validarIdPedido(idPedido) {
    if (!idPedido || idPedido.trim() === '') {
        return { valido: false, mensaje: 'Debe ingresar un número de pedido' };
    }

    if (isNaN(idPedido) || parseInt(idPedido) <= 0) {
        return { valido: false, mensaje: 'El número de pedido debe ser un valor numérico válido' };
    }

    return { valido: true, mensaje: '' };
}

function validarCamposNovedad(idPedido, tipoNovedad, descripcion) {
    if (!idPedido || !tipoNovedad || !descripcion) {
        return { valido: false, mensaje: 'Por favor complete todos los campos obligatorios' };
    }

    const validacionPedido = validarIdPedido(idPedido);
    if (!validacionPedido.valido) {
        return validacionPedido;
    }

    return { valido: true, mensaje: '' };
}

function obtenerIdUsuario() {
    return sessionStorage.getItem('usuarioId');
}

function configurarModalNovedad(modalId, btnAbrir, btnCerrar, btnCancelar, formId, onSubmit) {
    const modal = document.getElementById(modalId);
    const botonAbrir = document.getElementById(btnAbrir);
    const botonCerrar = document.getElementById(btnCerrar);
    const botonCancelar = document.getElementById(btnCancelar);
    const formulario = document.getElementById(formId);

    if (!modal || !formulario) {
        console.warn('Modal o formulario de novedad no encontrado');
        return;
    }

    if (botonAbrir) {
        botonAbrir.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
        });
    }

    if (botonCerrar) {
        botonCerrar.addEventListener('click', () => {
            modal.style.display = 'none';
            formulario.reset();
        });
    }

    if (botonCancelar) {
        botonCancelar.addEventListener('click', () => {
            modal.style.display = 'none';
            formulario.reset();
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            formulario.reset();
        }
    });

    if (onSubmit) {
        formulario.addEventListener('submit', onSubmit);
    }
}