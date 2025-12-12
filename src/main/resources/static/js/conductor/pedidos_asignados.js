document.addEventListener('DOMContentLoaded', function() {
    cargarPedidosAsignados();
});

function cargarPedidosAsignados() {
    fetch('/api/conductor/pedidos-asignados')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarPedidosEnTabla(data.pedidos);
            } else {
                console.error('Error:', data.message);
                mostrarSinPedidos();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarSinPedidos();
        });
}

function mostrarPedidosEnTabla(pedidos) {
    const tbody = document.getElementById('tablaBody');
    const tabla = document.getElementById('tablaPedidos');
    const sinPedidos = document.getElementById('sin-pedidos');

    tbody.innerHTML = '';

    if (pedidos.length === 0) {
        mostrarSinPedidos();
        return;
    }

    tabla.style.display = 'table';
    sinPedidos.style.display = 'none';

    pedidos.forEach(pedido => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${pedido.idPedido}</td>
            <td>${pedido.clienteNombre || 'Cliente'}</td>
            <td>${pedido.direccion}</td>
            <td>${pedido.clienteTelefono || 'N/A'}</td>
            <td>${pedido.tiposProductos}</td>
            <td>${pedido.cantidadTotal} unidades</td>
            <td>
                <button class="btn-accion btn-aceptar" onclick="aceptarPedido(${pedido.idPedido})">
                    Aceptar
                </button>
                <button class="btn-accion btn-ver" onclick="verDetalle(${pedido.idPedido})">
                    Ver
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });

    actualizarContador();
}

function mostrarSinPedidos() {
    document.getElementById('tablaPedidos').style.display = 'none';
    document.getElementById('sin-pedidos').style.display = 'block';
    document.getElementById('contador').textContent = '0';
}

function actualizarContador() {
    const filas = document.querySelectorAll('#tablaBody tr');
    document.getElementById('contador').textContent = filas.length;
}

function aceptarPedido(idPedido) {
    if (!confirm('¿Deseas aceptar el pedido #' + idPedido + '?')) {
        return;
    }

    fetch('/api/conductor/aceptar-pedido/' + idPedido, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje(data.message, 'success');

                // recargar pedidos despues de 1 segundo
                setTimeout(() => {
                    cargarPedidosAsignados();
                }, 1000);
            } else {
                mostrarMensaje('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error al aceptar el pedido', 'error');
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

function aceptarDesdeModal() {
    const idPedido = document.getElementById('pedidoId').textContent;
    cerrarModal();
    aceptarPedido(idPedido);
}

function mostrarMensaje(texto, tipo) {
    let mensaje;

    if (tipo === 'success') {
        mensaje = document.getElementById('mensaje-success');
    } else {
        mensaje = document.getElementById('mensaje-error');
    }

    mensaje.textContent = texto;
    mensaje.style.display = 'block';

    setTimeout(function() {
        mensaje.style.display = 'none';
    }, 3000);
}

window.addEventListener('click', function(e) {
    const modal = document.getElementById('modalDetallePedido');

    if (e.target === modal) {
        cerrarModal();
    }
});