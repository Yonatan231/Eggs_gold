document.addEventListener("DOMContentLoaded", function() {
    cargarDashboard();
    cargarPedidosEnAlistamiento();
    actualizarContadores();
    configurarBusqueda();
    inicializarActualizacionAutomatica();
});

async function cargarDashboard() {
    try {
        const response = await fetch('/api/logistica/dashboard/resumen');

        if (!response.ok) {
            throw new Error('Error al cargar dashboard');
        }

        const datos = await response.json();

        const contadorPedidosNuevos = document.getElementById('totalPedidosNuevos');
        if (contadorPedidosNuevos) {
            contadorPedidosNuevos.textContent = datos.pedidosNuevos;
        }

        const contadorEntradasPendientes = document.getElementById('totalEntradasPendientes');
        if (contadorEntradasPendientes) {
            contadorEntradasPendientes.textContent = datos.entradasPendientes;
        }

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

function inicializarActualizacionAutomatica() {
    setInterval(() => {
        cargarDashboard();
    }, 60000);
}

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

        const estado = pedido.estado || 'EN_ALISTAMIENTO';
        fila.setAttribute('data-estado', estado.toLowerCase());

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

function mostrarMensajeVacio() {
    const tabla = document.getElementById('tablaPedidos');
    const mensajeVacio = document.getElementById('mensajeVacio');

    tabla.style.display = 'none';
    mensajeVacio.style.display = 'block';
}

function actualizarContadores() {
    fetch('/api/logistica/pedidos-pendientes')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalPedidosNuevos').textContent = data.pedidos.length;
            }
        })
        .catch(error => console.error('Error:', error));

    document.getElementById('totalEntradasPendientes').textContent = '0';
}

function configurarBusqueda() {
    const inputBuscar = document.getElementById("buscar");
    const tbody = document.getElementById("tablaPedidosBody");

    inputBuscar.addEventListener("keyup", function() {
        const textoBusqueda = inputBuscar.value.toLowerCase();
        const filas = tbody.querySelectorAll("tr");
        let hayResultados = false;

        filas.forEach(function(fila) {
            const contenido = fila.textContent.toLowerCase();

            if (contenido.includes(textoBusqueda)) {
                fila.style.display = "";
                hayResultados = true;
            } else {
                fila.style.display = "none";
            }
        });

        const mensajeVacio = document.getElementById("mensajeVacio");
        const tablaPedidos = document.getElementById("tablaPedidos");

        if (!hayResultados) {
            tablaPedidos.style.display = "none";
            mensajeVacio.style.display = "block";
        } else {
            tablaPedidos.style.display = "table";
            mensajeVacio.style.display = "none";
        }
    });
}

function abrirModal(id) {
    document.getElementById("pedidoId").textContent = id;

    fetch('/api/logistica/detalle-pedido/' + id)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const detalle = data.detalle;
                const lista = document.getElementById("listaProductos");
                lista.innerHTML = '';

                detalle.productos.forEach(producto => {
                    const li = document.createElement("li");
                    li.textContent = `${producto.nombre} - Categoría: ${producto.categoria} - ${producto.cantidad} unidades`;
                    lista.appendChild(li);
                });

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

function cerrarModal() {
    const modal = document.getElementById("modalDetallePedido");
    modal.style.display = "none";
}

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
                btn.textContent = 'Asignar Conductor';
                btn.classList.remove('btn-listo');
                btn.classList.add('btn-asignar');
                btn.onclick = function() { abrirModalAsignarConductor(idPedido); };

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

function abrirModalAsignarConductor(idPedido) {
    document.getElementById('pedidoIdAsignar').textContent = idPedido;

    fetch('/api/logistica/conductores')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarConductores(data.conductores, idPedido);

                const modal = document.getElementById('modalAsignarConductor');
                modal.style.display = 'flex';

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

                const fila = document.querySelector(`tr[data-pedido-id="${idPedido}"]`);
                if (fila) {
                    fila.remove();
                }

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

function cerrarModalConductor() {
    const modal = document.getElementById('modalAsignarConductor');
    modal.style.display = 'none';
    document.getElementById('buscarConductor').value = '';
}

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

window.addEventListener('click', function(e) {
    const modalDetalle = document.getElementById('modalDetallePedido');
    const modalNovedad = document.getElementById('novedadModal');
    const modalConductor = document.getElementById('modalAsignarConductor');

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

const btnNovedad = document.getElementById('btnNovedad');
const novedadModal = document.getElementById('novedadModal');
const closeModal = document.getElementById('closeModal');
const cancelNovedad = document.getElementById('cancelNovedad');
const novedadForm = document.getElementById('novedadForm');

if (btnNovedad) {
    btnNovedad.addEventListener('click', function(e) {
        e.preventDefault();
        novedadModal.style.display = 'flex';
    });
}

if (closeModal) {
    closeModal.addEventListener('click', function() {
        novedadModal.style.display = 'none';
        novedadForm.reset();
    });
}

if (cancelNovedad) {
    cancelNovedad.addEventListener('click', function() {
        novedadModal.style.display = 'none';
        novedadForm.reset();
    });
}

if (novedadForm) {
    novedadForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const idPedido = document.getElementById('orderNumber').value.trim();
        const tipoNovedad = document.getElementById('tipoNovedad').value;
        const descripcion = document.getElementById('descripcion').value.trim();
        const imagenFile = document.getElementById('evidencia').files[0];

        const validacion = validarCamposNovedad(idPedido, tipoNovedad, descripcion);
        if (!validacion.valido) {
            alert(validacion.mensaje);
            return;
        }

        const idUsuario = obtenerIdUsuario();
        if (!idUsuario) {
            alert('Error: No se pudo obtener la información de usuario. Recargue la página.');
            return;
        }

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