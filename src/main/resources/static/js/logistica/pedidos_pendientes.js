// Archivo: pedidos_pendientes.js
// Script básico para gestionar pedidos pendientes

// Función que se ejecuta cuando la página carga
document.addEventListener('DOMContentLoaded', function() {
    actualizarContador();
});

// Función para actualizar el contador de pedidos pendientes
function actualizarContador() {
    // Cuenta las filas de la tabla (sin contar el thead)
    const filas = document.querySelectorAll('#tablaBody tr');
    const totalPedidos = filas.length;

    // Actualiza el número en el contador
    document.getElementById('contador').textContent = totalPedidos;

    // Si no hay pedidos, muestra el mensaje
    if (totalPedidos === 0) {
        document.getElementById('tablaPedidos').style.display = 'none';
        document.getElementById('sin-pedidos').style.display = 'block';
    } else {
        document.getElementById('tablaPedidos').style.display = 'table';
        document.getElementById('sin-pedidos').style.display = 'none';
    }
}

// Función para tomar un pedido
function tomarPedido(idPedido) {
    // Confirmar acción
    if (confirm('¿Deseas tomar el pedido #' + idPedido + '?')) {
        // Encuentra la fila del pedido
        const filas = document.querySelectorAll('#tablaBody tr');
        let filaEliminar = null;

        filas.forEach(function(fila) {
            const idCelda = fila.querySelector('td:first-child').textContent;
            if (idCelda === idPedido.toString()) {
                filaEliminar = fila;
            }
        });

        if (filaEliminar) {
            // Añade animación de salida
            filaEliminar.classList.add('row-removing');

            // Espera a que termine la animación antes de eliminar
            setTimeout(function() {
                filaEliminar.remove();
                actualizarContador();
                mostrarMensaje('Pedido #' + idPedido + ' tomado correctamente', 'success');
            }, 500);
        }
    }
}

// Función para mostrar mensajes al usuario
function mostrarMensaje(texto, tipo) {
    let mensaje;

    if (tipo === 'success') {
        mensaje = document.getElementById('mensaje-success');
    } else {
        mensaje = document.getElementById('mensaje-error');
    }

    // Muestra el mensaje
    mensaje.textContent = texto;
    mensaje.style.display = 'block';

    // Oculta el mensaje después de 3 segundos
    setTimeout(function() {
        mensaje.style.display = 'none';
    }, 3000);
}

// NOTA: En un proyecto real, aquí cargarías los pedidos desde el servidor
// Ejemplo de cómo cargar pedidos dinámicamente:
/*
function cargarPedidos() {
    fetch('/api/pedidos/pendientes')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('tablaBody');
            tbody.innerHTML = '';

            data.forEach(pedido => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${pedido.id}</td>
                    <td>${pedido.totalUnidades}</td>
                    <td>${pedido.tiposProductos}</td>
                    <td>${pedido.fechaCreacion}</td>
                    <td><button class="btn-tomar" onclick="tomarPedido(${pedido.id})">
                        <i class="fas fa-hand-paper"></i> Tomar
                    </button></td>
                `;
                tbody.appendChild(fila);
            });

            actualizarContador();
        })
        .catch(error => {
            console.error('Error al cargar pedidos:', error);
            mostrarMensaje('Error al cargar los pedidos', 'error');
        });
}
*/