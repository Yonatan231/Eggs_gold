let pedidoAEntregar = null;

document.addEventListener("DOMContentLoaded", function() {
    cargarDashboard();
    cargarPedidosEnCamino();
    configurarBusqueda();
    configurarModalNovedad();
    inicializarActualizacionAutomatica();
});

async function cargarDashboard() {
    try {
        const response = await fetch('/api/conductor/dashboard/resumen');

        if (!response.ok) {
            throw new Error('Error al cargar dashboard');
        }

        const datos = await response.json();

        const contadorAsignados = document.getElementById('totalAsignados');
        if (contadorAsignados) {
            contadorAsignados.textContent = datos.pedidosAsignados;
        }

        const contadorPendientes = document.getElementById('totalPendientes');
        if (contadorPendientes) {
            contadorPendientes.textContent = datos.pedidosPendientes;
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

function cargarPedidosEnCamino() {
    fetch('/api/conductor/pedidos-en-camino')
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
    const tbody = document.getElementById('tablaPedidosDiaBody');
    const tabla = document.getElementById('tablaPedidosDia');
    const mensajeVacio = document.getElementById('mensajeVacio');

    tbody.innerHTML = '';

    if (pedidos.length === 0) {
        mostrarMensajeVacio();
        return;
    }

    tabla.style.display = 'table';
    mensajeVacio.style.display = 'none';

    pedidos.forEach(pedido => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${pedido.idPedido}</td>
            <td>${pedido.clienteNombre || 'Cliente'}</td>
            <td>${pedido.direccion}</td>
            <td>${pedido.clienteTelefono || 'N/A'}</td>
            <td>${pedido.detalleCliente || 'Ninguno'}</td>
            <td>${pedido.tiposProductos}</td>
            <td>${pedido.cantidadTotal} unidades</td>
            <td>
                <button class="btn-accion-tabla btn-ruta" onclick="verRuta('${pedido.direccion}')">
                    Ver Ruta
                </button>
                <button class="btn-accion-tabla btn-entregado" onclick="marcarEntregado(${pedido.idPedido})">
                    Entregar
                </button>
                <button class="btn-accion-tabla btn-ver-pedido" onclick="verDetalle(${pedido.idPedido})">
                    Ver
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

function mostrarMensajeVacio() {
    document.getElementById('tablaPedidosDia').style.display = 'none';
    document.getElementById('mensajeVacio').style.display = 'block';
}

function marcarEntregado(idPedido) {
    pedidoAEntregar = idPedido;
    document.getElementById('pedidoIdEntrega').textContent = idPedido;
    document.getElementById('observacionEntrega').value = '';
    document.getElementById('modalEntregarPedido').style.display = 'flex';
}

function confirmarEntrega() {
    const observacion = document.getElementById('observacionEntrega').value;

    fetch('/api/conductor/entregar-pedido/' + pedidoAEntregar, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            observacion: observacion
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("✓ " + data.message);
                cerrarModalEntrega();
                cargarPedidosEnCamino();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al marcar el pedido como entregado');
        });
}

function cerrarModalEntrega() {
    document.getElementById('modalEntregarPedido').style.display = 'none';
    pedidoAEntregar = null;
}

function configurarBusqueda() {
    const inputBuscar = document.getElementById("buscarPedido");
    const tbody = document.getElementById("tablaPedidosDiaBody");

    if (!inputBuscar || !tbody) return;

    inputBuscar.addEventListener("keyup", function() {
        const textoBusqueda = inputBuscar.value.toLowerCase();
        const filas = tbody.querySelectorAll("tr");

        filas.forEach(function(fila) {
            const contenido = fila.textContent.toLowerCase();

            if (contenido.includes(textoBusqueda)) {
                fila.style.display = "";
            } else {
                fila.style.display = "none";
            }
        });
    });
}

function verDetalle(idPedido) {
    document.getElementById('pedidoId').textContent = idPedido;

    fetch('/api/conductor/detalle-pedido/' + idPedido)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const detalle = data.detalle;

                document.getElementById('clienteNombre').textContent = detalle.clienteNombre || 'N/A';
                document.getElementById('clienteDireccion').textContent = detalle.direccion || 'N/A';
                document.getElementById('clienteTelefono').textContent = detalle.clienteTelefono || 'N/A';
                document.getElementById('clienteComentario').textContent = detalle.detalleCliente || 'Ninguno';

                const lista = document.getElementById('listaProductos');
                lista.innerHTML = '';

                detalle.productos.forEach(producto => {
                    const li = document.createElement('li');
                    li.textContent = `${producto.nombre} - Categoria: ${producto.categoria} - ${producto.cantidad} unidades`;
                    lista.appendChild(li);
                });

                document.getElementById('modalDetallePedido').style.display = 'flex';
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
    const modal = document.getElementById('modalDetallePedido');
    modal.style.display = 'none';
}

function verRuta(direccion) {
    const direccionCodificada = encodeURIComponent(direccion);
    const urlMaps = 'https://www.google.com/maps/search/?api=1&query=' + direccionCodificada;
    window.open(urlMaps, '_blank');
}

window.addEventListener('click', function(e) {
    const modal = document.getElementById('modalDetallePedido');
    const novedadModal = document.getElementById('novedadModal');
    const modalEntrega = document.getElementById('modalEntregarPedido');

    if (e.target === modal) {
        cerrarModal();
    }

    if (e.target === novedadModal) {
        novedadModal.style.display = 'none';
    }

    if (e.target === modalEntrega) {
        cerrarModalEntrega();
    }
});

function configurarModalNovedad() {
    const novedadForm = document.getElementById('novedadForm');

    if (novedadForm) {
        novedadForm.addEventListener('submit', (e) => {
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
                alert('Error: No se pudo obtener la informacion de usuario. Recargue la pagina.');
                return;
            }

            reportarNovedad(idUsuario, parseInt(idPedido), tipoNovedad, descripcion, imagenFile)
                .then(resultado => {
                    if (resultado.success) {
                        alert(resultado.message);
                        document.getElementById('novedadModal').style.display = 'none';
                        novedadForm.reset();
                    } else {
                        alert('Error: ' + resultado.message);
                    }
                });
        });
    }

    const btnNovedad = document.getElementById('btnNovedad');
    const novedadModal = document.getElementById('novedadModal');
    const closeModal = document.getElementById('closeModal');
    const cancelNovedad = document.getElementById('cancelNovedad');

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
}