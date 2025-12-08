// pedidos_pendientes.js - funcionalidad especifica

// cuando la pagina carga
document.addEventListener('DOMContentLoaded', function() {
    cargarPedidosPendientes();
});

// obtener pedidos pendientes del servidor
function cargarPedidosPendientes() {
    fetch('/api/logistica/pedidos-pendientes')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarPedidos(data.pedidos);
            } else {
                mostrarMensaje('Error al cargar pedidos: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error de conexión con el servidor', 'error');
        });
}

// mostrar pedidos en la tabla
function mostrarPedidos(pedidos) {
    const tbody = document.getElementById('tablaBody');
    const tablaPedidos = document.getElementById('tablaPedidos');
    const sinPedidos = document.getElementById('sin-pedidos');
    const contador = document.getElementById('contador');

    tbody.innerHTML = '';

    if (pedidos.length === 0) {
        tablaPedidos.style.display = 'none';
        sinPedidos.style.display = 'block';
        contador.textContent = '0';
        return;
    }

    tablaPedidos.style.display = 'table';
    sinPedidos.style.display = 'none';
    contador.textContent = pedidos.length;

    // invertir orden: mas antiguos arriba, mas recientes abajo (cola fifo)
    const pedidosOrdenados = [...pedidos].reverse();

    pedidosOrdenados.forEach(pedido => {
        const fila = document.createElement('tr');

        const fecha = new Date(pedido.fechaCreacion);
        const fechaFormateada = fecha.toLocaleString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        fila.innerHTML = `
            <td>${pedido.idPedido}</td>
            <td>${fechaFormateada}</td>
            <td>${pedido.cliente || 'Cliente'}</td>
            <td>${pedido.cantidadTotal}</td>
            <td>${pedido.tiposProductos}</td>
            <td>
                <button class="btn-tomar" onclick="tomarPedido(${pedido.idPedido})">
                    Tomar
                </button>
            </td>
        `;

        tbody.appendChild(fila);
    });
}

// tomar un pedido
function tomarPedido(idPedido) {
    if (!confirm('¿Deseas tomar el pedido #' + idPedido + '?')) {
        return;
    }

    fetch('/api/logistica/tomar-pedido/' + idPedido, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje(data.message, 'success');

                setTimeout(() => {
                    cargarPedidosPendientes();
                }, 500);
            } else {
                mostrarMensaje(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error al tomar el pedido', 'error');
        });
}

// mostrar mensajes al usuario
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