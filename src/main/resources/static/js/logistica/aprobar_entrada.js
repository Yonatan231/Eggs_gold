/* ============================================
   CARGAR ENTRADAS PENDIENTES
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    cargarEntradas();
});

// Referencias a elementos del DOM
const tablaBody = document.getElementById("tablaBody");
const contador = document.getElementById("contador");
const sinEntradas = document.getElementById("sin-entradas");

/**
 * Carga las entradas pendientes desde el backend
 */
function cargarEntradas() {
    fetch("/entrada-stock/api/pendientes")
        .then(response => response.json())
        .then(entradas => {
            // Limpiar tabla
            tablaBody.innerHTML = "";

            // Actualizar contador
            contador.textContent = entradas.length;

            // Si no hay entradas, mostrar mensaje
            if (entradas.length === 0) {
                sinEntradas.style.display = 'block';
                document.querySelector('.tabla-wrapper table').style.display = 'none';
                return;
            }

            sinEntradas.style.display = 'none';
            document.querySelector('.tabla-wrapper table').style.display = 'table';

            // Renderizar cada entrada
            entradas.forEach(entrada => {
                const fila = crearFilaEntrada(entrada);
                tablaBody.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("❌ Error al cargar entradas:", error);
            mostrarMensaje("Error al cargar las entradas pendientes", "error");
        });
}

/**
 * Crea una fila HTML para una entrada
 */
function crearFilaEntrada(entrada) {
    const fila = document.createElement("tr");
    fila.id = `fila-${entrada.id}`;

    fila.innerHTML = `
        <td><strong>#${entrada.id}</strong></td>
        <td>${entrada.nombreProducto}</td>
        <td>
            <input type="number" 
                   id="cantidad-${entrada.id}" 
                   value="${entrada.cantidad}" 
                   min="1" 
                   class="input-cantidad">
        </td>
        <td>${entrada.proveedor}</td>
        <td>${entrada.fechaRegistro}</td>
        <td>
            <input type="text" 
                   id="observacion-${entrada.id}" 
                   placeholder="Agregar observación..."
                   class="input-comentario">
        </td>
        <td>
            <button class="btn-approve" onclick="aprobar(${entrada.id})">
                <i class="fas fa-check"></i>
                Aprobar
            </button>
        </td>
    `;

    return fila;
}

/**
 * Muestra un mensaje de éxito o error
 */
function mostrarMensaje(texto, tipo) {
    const mensajeSuccess = document.getElementById("mensaje-success");
    const mensajeError = document.getElementById("mensaje-error");

    // Ocultar ambos mensajes primero
    mensajeSuccess.style.display = 'none';
    mensajeError.style.display = 'none';

    if (tipo === 'success') {
        mensajeSuccess.innerHTML = `<i class="fas fa-check-circle"></i> ${texto}`;
        mensajeSuccess.style.display = 'block';

        setTimeout(() => {
            mensajeSuccess.style.display = 'none';
        }, 4000);
    } else if (tipo === 'error') {
        mensajeError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${texto}`;
        mensajeError.style.display = 'block';

        setTimeout(() => {
            mensajeError.style.display = 'none';
        }, 4000);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Aprueba una entrada específica
 */
function aprobar(id) {
    // Obtener valores actualizados
    const inputCantidad = document.getElementById(`cantidad-${id}`);
    const inputObservacion = document.getElementById(`observacion-${id}`);

    const cantidad = parseInt(inputCantidad.value);
    const observacion = inputObservacion.value.trim();

    // Validar cantidad
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarMensaje("La cantidad debe ser un número mayor a 0", "error");
        inputCantidad.focus();
        return;
    }

    // Confirmar aprobación
    if (!confirm(`¿Confirmas la aprobación de la entrada #${id}?`)) {
        return;
    }

    // Enviar aprobación al servidor
    const datos = {
        idEntrada: id,
        cantidad: cantidad,
        observacion: observacion
    };

    fetch('/entrada-stock/api/aprobar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje(data.message, "success");

                // Animar y eliminar la fila
                const fila = document.getElementById(`fila-${id}`);
                if (fila) {
                    fila.style.opacity = '0';
                    fila.style.transition = 'opacity 0.5s';

                    setTimeout(() => {
                        cargarEntradas(); // Recargar tabla
                    }, 500);
                }
            } else {
                mostrarMensaje(data.message, "error");
            }
        })
        .catch(error => {
            console.error("❌ Error:", error);
            mostrarMensaje("Error al aprobar la entrada. Por favor, intenta nuevamente.", "error");
        });
}

/**
 * Validación en tiempo real de los inputs de cantidad
 */
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('input-cantidad')) {
        const valor = parseInt(e.target.value);

        if (isNaN(valor) || valor <= 0) {
            e.target.style.borderColor = '#c62828';
        } else {
            e.target.style.borderColor = '#27AE60';
        }
    }
});