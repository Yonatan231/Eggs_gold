/**
 * ARCHIVO COMPARTIDO PARA REPORTAR NOVEDADES
 * Utilizado por: Cliente, Conductor y Logística
 *
 * Este archivo contiene la lógica común para enviar reportes de novedades
 * independientemente del rol del usuario.
 */

/**
 * Función principal para reportar una novedad
 * @param {number} idUsuario - ID del usuario que reporta
 * @param {number} idPedido - ID del pedido relacionado
 * @param {string} tipoNovedad - Tipo de novedad (enum)
 * @param {string} descripcion - Descripción detallada
 * @param {File|null} imagen - Archivo de imagen (opcional)
 * @returns {Promise} - Promesa con la respuesta del servidor
 */

function reportarNovedad(idUsuario, idPedido, tipoNovedad, descripcion, imagen = null) {
    // Crear FormData para enviar archivos
    const formData = new FormData();
    formData.append('idUsuario', idUsuario);
    formData.append('idPedido', idPedido);
    formData.append('tipoNovedad', tipoNovedad);
    formData.append('descripcion', descripcion);

    // Agregar imagen si existe
    if (imagen) {
        formData.append('imagen', imagen);
    }

    // Enviar al servidor
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

/**
 * Validar que el ID de pedido sea un número válido
 * @param {string} idPedido - ID del pedido a validar
 * @returns {Object} - {valido: boolean, mensaje: string}
 */
function validarIdPedido(idPedido) {
    if (!idPedido || idPedido.trim() === '') {
        return { valido: false, mensaje: 'Debe ingresar un número de pedido' };
    }

    if (isNaN(idPedido) || parseInt(idPedido) <= 0) {
        return { valido: false, mensaje: 'El número de pedido debe ser un valor numérico válido' };
    }

    return { valido: true, mensaje: '' };
}

/**
 * Validar campos básicos del formulario
 * @param {string} idPedido - ID del pedido
 * @param {string} tipoNovedad - Tipo de novedad
 * @param {string} descripcion - Descripción
 * @returns {Object} - {valido: boolean, mensaje: string}
 */
function validarCamposNovedad(idPedido, tipoNovedad, descripcion) {
    if (!idPedido || !tipoNovedad || !descripcion) {
        return { valido: false, mensaje: 'Por favor complete todos los campos obligatorios' };
    }

    // Validar ID de pedido
    const validacionPedido = validarIdPedido(idPedido);
    if (!validacionPedido.valido) {
        return validacionPedido;
    }

    return { valido: true, mensaje: '' };
}

/**
 * Obtener ID de usuario desde sessionStorage
 * @returns {string|null} - ID del usuario o null si no existe
 */
function obtenerIdUsuario() {
    return sessionStorage.getItem('usuarioId');
}

/**
 * Configurar modal de novedad (abrir, cerrar, eventos)
 * @param {string} modalId - ID del modal
 * @param {string} btnAbrir - ID del botón para abrir
 * @param {string} btnCerrar - ID del botón X para cerrar
 * @param {string} btnCancelar - ID del botón cancelar
 * @param {string} formId - ID del formulario
 * @param {Function} onSubmit - Callback cuando se envía el formulario
 */
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

    // Abrir modal
    if (botonAbrir) {
        botonAbrir.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
        });
    }

    // Cerrar modal con X
    if (botonCerrar) {
        botonCerrar.addEventListener('click', () => {
            modal.style.display = 'none';
            formulario.reset();
        });
    }

    // Cerrar modal con botón Cancelar
    if (botonCancelar) {
        botonCancelar.addEventListener('click', () => {
            modal.style.display = 'none';
            formulario.reset();
        });
    }

    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            formulario.reset();
        }
    });

    // Manejar envío del formulario
    if (onSubmit) {
        formulario.addEventListener('submit', onSubmit);
    }
}