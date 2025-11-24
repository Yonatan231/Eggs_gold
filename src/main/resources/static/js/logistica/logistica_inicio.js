/* ============================================
   PANEL DE LOGÍSTICA - VERSIÓN CON SERVIDOR
   Este archivo controla toda la funcionalidad
   de la página de logística con conexión real al backend
   ============================================ */

// ============================================
// BOTÓN PARA ABRIR/CERRAR EL MENÚ
// ============================================
const botonMenu = document.querySelector('.toggle-btn');

// Cuando se hace clic en el botón del menú
botonMenu.addEventListener('click', function () {
    const menuLateral = document.getElementById('sidebar');
    menuLateral.classList.toggle('active');
});

// ============================================
// CUANDO LA PÁGINA CARGA
// Ejecuta estas funciones automáticamente
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    cargarDashboard(); // Cargar tarjetas de resumen
    cargarPedidosEnAlistamiento(); // Cargar pedidos que el usuario tomó
    actualizarContadores(); // Actualizar contadores de tarjetas
    configurarBusqueda(); // Configurar búsqueda
    inicializarActualizacionAutomatica(); // Actualizar cada minuto
});

// ============================================
// FUNCIONES PARA EL DASHBOARD (TARJETAS DE RESUMEN)
// ============================================

/**
 * Carga los datos del dashboard: pedidos nuevos y entradas pendientes
 */
async function cargarDashboard() {
    try {
        const response = await fetch('/api/logistica/dashboard/resumen');

        if (!response.ok) {
            throw new Error('Error al cargar dashboard');
        }

        const datos = await response.json();

        // Actualizar contador de pedidos nuevos
        const contadorPedidosNuevos = document.getElementById('totalPedidosNuevos');
        if (contadorPedidosNuevos) {
            contadorPedidosNuevos.textContent = datos.pedidosNuevos;
        }

        // Actualizar contador de entradas pendientes
        const contadorEntradasPendientes = document.getElementById('totalEntradasPendientes');
        if (contadorEntradasPendientes) {
            contadorEntradasPendientes.textContent = datos.entradasPendientes;
        }

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

/**
 * Inicializa la actualización automática del dashboard
 * Se actualiza cada minuto
 */
function inicializarActualizacionAutomatica() {
    // Actualizar cada 60 segundos
    setInterval(() => {
        cargarDashboard();
    }, 60000);
}

// ============================================
// FUNCIÓN: cargarPedidosEnAlistamiento()
// Obtiene los pedidos EN_ALISTAMIENTO del usuario
// ============================================
function cargarPedidosEnAlistamiento() {
    fetch('/api/logistica/mis-pedidos')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarPedidosEnTabla(data.pedidos);
            } else {
                console.error('Error:', data.message);
                mostrarMensajeVacio();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensajeVacio();
        });
}

// ============================================
// FUNCIÓN: mostrarPedidosEnTabla(pedidos)
// Muestra los pedidos en la tabla principal
// ============================================
function mostrarPedidosEnTabla(pedidos) {
    const tbody = document.getElementById('tablaPedidosBody');
    const tabla = document.getElementById('tablaPedidos');
    const mensajeVacio = document.getElementById('mensajeVacio');

    tbody.innerHTML = '';

    if (pedidos.length === 0) {
        tabla.style.display = 'none';
        mensajeVacio.style.display = 'block';
        return;
    }

    tabla.style.display = 'table';
    mensajeVacio.style.display = 'none';

    pedidos.forEach(pedido => {
        const fila = document.createElement('tr');
        const fecha = new Date(pedido.fechaCreacion);
        const fechaFormateada = fecha.toLocaleDateString('es-CO');

        fila.setAttribute('data-pedido-id', pedido.idPedido);

        // ✅ DETECTAR EL ESTADO DEL PEDIDO
        const estado = pedido.estado || 'EN_ALISTAMIENTO';
        fila.setAttribute('data-estado', estado.toLowerCase());

        const precioTotal = pedido.precioTotal ? `$${pedido.precioTotal.toLocaleString('es-CO')}` : '$0';

        // ✅ CAMBIAR EL BOTÓN SEGÚN EL ESTADO
        let botonAccion = '';
        if (estado === 'EN_ALISTAMIENTO') {
            botonAccion = `<button onclick="marcarComoListo(this, ${pedido.idPedido})" class="btn-listo">Marcar como Listo</button>`;
        } else if (estado === 'LISTO') {
            botonAccion = `<button onclick="abrirModalAsignarConductor(${pedido.idPedido})" class="btn-asignar">Asignar Conductor</button>`;
        }

        fila.innerHTML = `
            <td>${pedido.idPedido}</td>
            <td>${fechaFormateada}</td>
            <td>${pedido.cliente || 'Cliente'}</td>
            <td>${pedido.cantidadTotal}</td>
            <td>${pedido.tiposProductos}</td>
            <td>
                <button onclick="abrirModal(${pedido.idPedido})" class="btn-ver">Ver</button>
                ${botonAccion}
            </td>
        `;

        tbody.appendChild(fila);
    });
}

// ============================================
// FUNCIÓN: mostrarMensajeVacio()
// Muestra mensaje cuando no hay pedidos
// ============================================
function mostrarMensajeVacio() {
    const tabla = document.getElementById('tablaPedidos');
    const mensajeVacio = document.getElementById('mensajeVacio');

    tabla.style.display = 'none';
    mensajeVacio.style.display = 'block';
}

// ============================================
// FUNCIÓN: actualizarContadores()
// Actualiza los números en las tarjetas de resumen
// ============================================
function actualizarContadores() {
    // Obtener total de pedidos nuevos (PENDIENTES)
    fetch('/api/logistica/pedidos-pendientes')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalPedidosNuevos').textContent = data.pedidos.length;
            }
        })
        .catch(error => console.error('Error:', error));

    // Obtener total de entradas pendientes (puedes ajustar esto según tu lógica)
    // Por ahora lo dejamos en 0 o implementar según necesites
    document.getElementById('totalEntradasPendientes').textContent = '0';
}

// ============================================
// FUNCIÓN: configurarBusqueda()
// Configura la barra de búsqueda de pedidos
// ============================================
function configurarBusqueda() {
    const inputBuscar = document.getElementById("buscar");
    const tbody = document.getElementById("tablaPedidosBody");

    // Cuando el usuario escribe en el campo de búsqueda
    inputBuscar.addEventListener("keyup", function() {
        const textoBusqueda = inputBuscar.value.toLowerCase(); // Convertimos a minúsculas
        const filas = tbody.querySelectorAll("tr"); // Obtenemos todas las filas
        let hayResultados = false; // Variable para saber si encontramos algo

        // Revisamos cada fila
        filas.forEach(function(fila) {
            const contenido = fila.textContent.toLowerCase(); // Texto de la fila en minúsculas

            // Si el texto de búsqueda está en la fila, la mostramos
            if (contenido.includes(textoBusqueda)) {
                fila.style.display = ""; // Mostramos la fila
                hayResultados = true;
            } else {
                fila.style.display = "none"; // Ocultamos la fila
            }
        });

        // Si no hay resultados, mostramos el mensaje vacío
        const mensajeVacio = document.getElementById("mensajeVacio");
        const tablaPedidos = document.getElementById("tablaPedidos");

        if (!hayResultados) {
            tablaPedidos.style.display = "none"; // Ocultamos la tabla
            mensajeVacio.style.display = "block"; // Mostramos el mensaje
        } else {
            tablaPedidos.style.display = "table"; // Mostramos la tabla
            mensajeVacio.style.display = "none"; // Ocultamos el mensaje
        }
    });
}

// ============================================
// FUNCIÓN: abrirModal(id)
// Abre el modal con los detalles del pedido desde el servidor
// ============================================
function abrirModal(id) {
    // Mostrar el ID del pedido en el título del modal
    document.getElementById("pedidoId").textContent = id;

    // Obtener detalles del pedido desde el servidor
    fetch('/api/logistica/detalle-pedido/' + id)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const detalle = data.detalle;
                const lista = document.getElementById("listaProductos");
                lista.innerHTML = ''; // Limpiar la lista

                // Agregar cada producto a la lista
                detalle.productos.forEach(producto => {
                    const li = document.createElement("li");
                    li.textContent = `${producto.nombre} - Categoría: ${producto.categoria} - ${producto.cantidad} unidades`;
                    lista.appendChild(li);
                });

                // Mostrar el modal
                const modal = document.getElementById("modalDetallePedido");
                modal.style.display = "flex";
            } else {
                alert('Error al cargar detalles: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar los detalles del pedido');
        });
}

// ============================================
// FUNCIÓN: cerrarModal()
// Cierra el modal de detalles del pedido
// ============================================
function cerrarModal() {
    const modal = document.getElementById("modalDetallePedido");
    modal.style.display = "none"; // Ocultamos el modal
}

// ============================================
// FUNCIÓN: marcarComoListo(btn, idPedido)
// Marca un pedido como listo y cambia el botón
// ============================================
function marcarComoListo(btn, idPedido) {
    if (!confirm(`¿Marcar el pedido #${idPedido} como listo?`)) {
        return;
    }

    fetch('/api/logistica/marcar-listo/' + idPedido, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Cambiar el botón a "Asignar Conductor"
                btn.textContent = 'Asignar Conductor';
                btn.classList.remove('btn-listo');
                btn.classList.add('btn-asignar');
                btn.onclick = function() { abrirModalAsignarConductor(idPedido); };

                // Cambiar el estado de la fila
                const fila = btn.closest('tr');
                fila.setAttribute('data-estado', 'listo');

                alert(data.message);
                actualizarContadores();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al marcar el pedido como listo');
        });
}

// ============================================
// FUNCIÓN: abrirModalAsignarConductor(idPedido)
// Abre el modal para seleccionar conductor
// ============================================
function abrirModalAsignarConductor(idPedido) {
    document.getElementById('pedidoIdAsignar').textContent = idPedido;

    // Cargar conductores disponibles
    fetch('/api/logistica/conductores')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarConductores(data.conductores, idPedido);

                // Mostrar modal
                const modal = document.getElementById('modalAsignarConductor');
                modal.style.display = 'flex';

                // Configurar búsqueda
                configurarBusquedaConductor();
            } else {
                alert('Error al cargar conductores: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar conductores');
        });
}

// ============================================
// FUNCIÓN: mostrarConductores(conductores, idPedido)
// Muestra la lista de conductores en el modal
// ============================================
function mostrarConductores(conductores, idPedido) {
    const lista = document.getElementById('listaConductores');
    lista.innerHTML = '';

    if (conductores.length === 0) {
        lista.innerHTML = '<p class="sin-conductores">No hay conductores disponibles</p>';
        return;
    }

    conductores.forEach(conductor => {
        const div = document.createElement('div');
        div.className = 'conductor-item';
        div.setAttribute('data-nombre', conductor.nombre.toLowerCase());
        div.setAttribute('data-documento', conductor.documento);

        div.innerHTML = `
            <div class="conductor-info">
                <h4>${conductor.nombre}</h4>
                <p>Doc: ${conductor.documento}</p>
                <p>Tel: ${conductor.telefono}</p>
            </div>
            <button onclick="confirmarAsignacion(${idPedido}, ${conductor.id}, '${conductor.nombre}')" class="btn-seleccionar">
                Seleccionar
            </button>
        `;

        lista.appendChild(div);
    });
}

// ============================================
// FUNCIÓN: confirmarAsignacion(idPedido, idConductor, nombreConductor)
// Asigna el conductor al pedido
// ============================================
function confirmarAsignacion(idPedido, idConductor, nombreConductor) {
    if (!confirm(`¿Asignar el pedido #${idPedido} a ${nombreConductor}?`)) {
        return;
    }

    fetch('/api/logistica/asignar-conductor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idPedido: idPedido,
            idConductor: idConductor
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                cerrarModalConductor();

                // Eliminar la fila del pedido (ya no está en logística)
                const fila = document.querySelector(`tr[data-pedido-id="${idPedido}"]`);
                if (fila) {
                    fila.remove();
                }

                // Recargar pedidos
                cargarPedidosEnAlistamiento();
                actualizarContadores();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al asignar conductor');
        });
}

// ============================================
// FUNCIÓN: cerrarModalConductor()
// Cierra el modal de asignar conductor
// ============================================
function cerrarModalConductor() {
    const modal = document.getElementById('modalAsignarConductor');
    modal.style.display = 'none';
    document.getElementById('buscarConductor').value = '';
}

// ============================================
// FUNCIÓN: configurarBusquedaConductor()
// Configura búsqueda en tiempo real de conductores
// ============================================
function configurarBusquedaConductor() {
    const inputBuscar = document.getElementById('buscarConductor');

    inputBuscar.addEventListener('keyup', function() {
        const texto = inputBuscar.value.toLowerCase();
        const items = document.querySelectorAll('.conductor-item');

        items.forEach(item => {
            const nombre = item.getAttribute('data-nombre');
            const documento = item.getAttribute('data-documento');

            if (nombre.includes(texto) || documento.includes(texto)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// ============================================
// CERRAR MODAL AL HACER CLIC FUERA
// Si el usuario hace clic fuera del contenido del modal, se cierra
// ============================================
window.addEventListener('click', function(e) {
    const modalDetalle = document.getElementById('modalDetallePedido');
    const modalNovedad = document.getElementById('novedadModal');
    const modalConductor = document.getElementById('modalAsignarConductor');

    // Si se hace clic en el fondo oscuro (fuera del contenido), cerramos
    if (e.target === modalDetalle) {
        cerrarModal();
    }

    if (e.target === modalNovedad) {
        modalNovedad.style.display = 'none';
    }

    if (e.target === modalConductor) {
        cerrarModalConductor();
    }
});

// ============================================
// MODAL DE NOVEDADES - REPORTAR NOVEDAD
// ============================================

// Obtenemos los elementos del DOM
// ============================================
// MODAL DE NOVEDAD - Usando funciones compartidas
// ============================================
const btnNovedad = document.getElementById('btnNovedad');
const novedadModal = document.getElementById('novedadModal');
const closeModal = document.getElementById('closeModal');
const cancelNovedad = document.getElementById('cancelNovedad');
const novedadForm = document.getElementById('novedadForm');

// Abrir modal
if (btnNovedad) {
    btnNovedad.addEventListener('click', function(e) {
        e.preventDefault();
        novedadModal.style.display = 'flex';
    });
}

// Cerrar modal con X
if (closeModal) {
    closeModal.addEventListener('click', function() {
        novedadModal.style.display = 'none';
        novedadForm.reset();
    });
}

// Cerrar modal con botón Cancelar
if (cancelNovedad) {
    cancelNovedad.addEventListener('click', function() {
        novedadModal.style.display = 'none';
        novedadForm.reset();
    });
}

// Envío del formulario usando funciones compartidas
if (novedadForm) {
    novedadForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const idPedido = document.getElementById('orderNumber').value.trim();
        const tipoNovedad = document.getElementById('tipoNovedad').value;
        const descripcion = document.getElementById('descripcion').value.trim();
        const imagenFile = document.getElementById('evidencia').files[0];

        // Validar campos usando función compartida
        const validacion = validarCamposNovedad(idPedido, tipoNovedad, descripcion);
        if (!validacion.valido) {
            alert(validacion.mensaje);
            return;
        }

        // Obtener ID de usuario
        const idUsuario = obtenerIdUsuario();
        if (!idUsuario) {
            alert('Error: No se pudo obtener la información de usuario. Recargue la página.');
            return;
        }

        // Reportar novedad usando función compartida
        reportarNovedad(idUsuario, parseInt(idPedido), tipoNovedad, descripcion, imagenFile)
            .then(resultado => {
                if (resultado.success) {
                    alert(resultado.message);
                    novedadModal.style.display = 'none';
                    novedadForm.reset();
                } else {
                    alert('Error: ' + resultado.message);
                }
            });
    });
}