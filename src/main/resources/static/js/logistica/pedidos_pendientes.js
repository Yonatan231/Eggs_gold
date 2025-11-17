// ============================================
// SCRIPT PARA PEDIDOS PENDIENTES
// Gestiona la visualización y toma de pedidos
// Versión básica para principiantes
// ============================================

// ============================================
// CUANDO LA PÁGINA CARGA
// Ejecuta estas funciones automáticamente
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    cargarPedidosPendientes(); // Cargar pedidos del servidor
});

// ============================================
// FUNCIÓN: cargarPedidosPendientes()
// Obtiene los pedidos PENDIENTES del servidor
// ============================================
function cargarPedidosPendientes() {
    // Hacer petición al servidor
    fetch('/api/logistica/pedidos-pendientes')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Si hay pedidos, mostrarlos en la tabla
                mostrarPedidos(data.pedidos);
            } else {
                // Si hay error, mostrarlo
                mostrarMensaje('Error al cargar pedidos: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error de conexión con el servidor', 'error');
        });
}

// ============================================
// FUNCIÓN: mostrarPedidos(pedidos)
// Muestra los pedidos en la tabla
// ============================================
function mostrarPedidos(pedidos) {
    const tbody = document.getElementById('tablaBody');
    const tablaPedidos = document.getElementById('tablaPedidos');
    const sinPedidos = document.getElementById('sin-pedidos');
    const contador = document.getElementById('contador');

    // Limpiar la tabla
    tbody.innerHTML = '';

    // Si no hay pedidos
    if (pedidos.length === 0) {
        tablaPedidos.style.display = 'none';
        sinPedidos.style.display = 'block';
        contador.textContent = '0';
        return;
    }

    // Mostrar la tabla
    tablaPedidos.style.display = 'table';
    sinPedidos.style.display = 'none';
    contador.textContent = pedidos.length;

    // Agregar cada pedido a la tabla
    pedidos.forEach(pedido => {
        const fila = document.createElement('tr');

        // Formatear la fecha
        const fecha = new Date(pedido.fechaCreacion);
        const fechaFormateada = fecha.toLocaleString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Formatear el precio total
        const precioTotal = pedido.precioTotal ? `$${pedido.precioTotal.toLocaleString('es-CO')}` : '$0';

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

// ============================================
// FUNCIÓN: tomarPedido(idPedido)
// Toma un pedido y lo asigna al usuario
// ============================================
function tomarPedido(idPedido) {
    // Confirmar acción
    if (!confirm('¿Deseas tomar el pedido #' + idPedido + '?')) {
        return;
    }

    // Hacer petición al servidor
    fetch('/api/logistica/tomar-pedido/' + idPedido, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mensaje de éxito
                mostrarMensaje(data.message, 'success');

                // Recargar pedidos
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

// ============================================
// FUNCIÓN: mostrarMensaje(texto, tipo)
// Muestra mensajes al usuario
// ============================================
function mostrarMensaje(texto, tipo) {
    let mensaje;

    if (tipo === 'success') {
        mensaje = document.getElementById('mensaje-success');
    } else {
        mensaje = document.getElementById('mensaje-error');
    }

    // Mostrar el mensaje
    mensaje.textContent = texto;
    mensaje.style.display = 'block';

    // Ocultar el mensaje después de 3 segundos
    setTimeout(function() {
        mensaje.style.display = 'none';
    }, 3000);
}

// ============================================
// FIN DEL SCRIPT
// ============================================