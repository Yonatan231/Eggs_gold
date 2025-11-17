// ============================================
// SCRIPT PARA HISTORIAL DE PEDIDOS ENTREGADOS
// ============================================

// ============================================
// BOTÓN PARA ABRIR/CERRAR EL MENÚ
// ============================================
const botonMenu = document.querySelector('.toggle-btn');

if (botonMenu) {
    botonMenu.addEventListener('click', function () {
        const menuLateral = document.getElementById('sidebar');
        menuLateral.classList.toggle('active');
    });
}

// ============================================
// CUANDO LA PÁGINA CARGA
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    cargarHistorialPedidos();
});

// ============================================
// FUNCIÓN: cargarHistorialPedidos()
// Obtiene el historial desde el servidor
// ============================================
function cargarHistorialPedidos() {
    fetch('/api/conductor/historial')
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

// ============================================
// FUNCIÓN: mostrarPedidosEnTabla(pedidos)
// Muestra los pedidos en la tabla
// ============================================
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

        // Formatear fecha
        const fecha = new Date(pedido.fechaEntrega);
        const fechaFormateada = fecha.toLocaleDateString('es-CO');

        fila.innerHTML = `
            <td>${pedido.idPedido}</td>
            <td>${fechaFormateada}</td>
            <td>${pedido.clienteNombre || 'Cliente'}</td>
            <td>${pedido.direccion}</td>
            <td>${pedido.tiposProductos}</td>
            <td>${pedido.cantidadTotal} unidades</td>
            <td>
                <button class="btn-accion btn-ver" onclick="verDetalle(${pedido.idPedido})">
                    <i class="fas fa-eye"></i> Ver
                </button>
            </td>
        `;

        tbody.appendChild(fila);
    });
}

// ============================================
// FUNCIÓN: mostrarSinPedidos()
// Muestra mensaje cuando no hay pedidos
// ============================================
function mostrarSinPedidos() {
    document.getElementById('tablaPedidos').style.display = 'none';
    document.getElementById('sin-pedidos').style.display = 'block';
}

// ============================================
// FUNCIÓN: filtrarPedidos()
// Filtra los pedidos según el texto de búsqueda
// ============================================
function filtrarPedidos() {
    const textoBusqueda = document.getElementById('busqueda').value.toLowerCase();
    const filas = document.querySelectorAll('#tablaBody tr');

    filas.forEach(function(fila) {
        const contenidoFila = fila.textContent.toLowerCase();

        if (contenidoFila.includes(textoBusqueda)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

// ============================================
// FUNCIÓN: verDetalle(idPedido)
// Abre el modal con los detalles del pedido
// ============================================
function verDetalle(idPedido) {
    document.getElementById('pedidoId').textContent = idPedido;

    // Obtener detalles del pedido
    fetch('/api/conductor/detalle-pedido/' + idPedido)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const detalle = data.detalle;

                // Información del cliente
                document.getElementById('clienteNombre').textContent = detalle.clienteNombre || 'N/A';
                document.getElementById('clienteDireccion').textContent = detalle.direccion || 'N/A';

                // Fecha de entrega
                if (detalle.fechaEntrega) {
                    const fecha = new Date(detalle.fechaEntrega);
                    document.getElementById('fechaEntrega').textContent = fecha.toLocaleString('es-CO');
                }

                // Comentarios
                document.getElementById('comentarioCliente').textContent = detalle.detalleCliente || 'Sin comentarios';
                document.getElementById('comentarioConductor').textContent = detalle.observacionConductor || 'Sin observaciones';

                // Productos
                const lista = document.getElementById('listaProductos');
                lista.innerHTML = '';

                detalle.productos.forEach(producto => {
                    const li = document.createElement('li');
                    li.textContent = `${producto.nombre} - Categoría: ${producto.categoria} - ${producto.cantidad} unidades`;
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

// ============================================
// FUNCIÓN: cerrarModal()
// Cierra el modal de detalles
// ============================================
function cerrarModal() {
    const modal = document.getElementById('modalDetallePedido');
    modal.style.display = 'none';
}

// ============================================
// CERRAR MODAL AL HACER CLIC FUERA
// ============================================
window.addEventListener('click', function(e) {
    const modal = document.getElementById('modalDetallePedido');

    if (e.target === modal) {
        cerrarModal();
    }
});