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
    cargarPedidosEnAlistamiento(); // Cargar pedidos que el usuario tomó
    actualizarContadores(); // Actualizar contadores de tarjetas
    configurarBusqueda(); // Configurar búsqueda
});

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

    // Limpiar tabla
    tbody.innerHTML = '';

    // Si no hay pedidos
    if (pedidos.length === 0) {
        tabla.style.display = 'none';
        mensajeVacio.style.display = 'block';
        return;
    }

    // Mostrar tabla
    tabla.style.display = 'table';
    mensajeVacio.style.display = 'none';

    // Agregar cada pedido
    pedidos.forEach(pedido => {
        const fila = document.createElement('tr');

        const fecha = new Date(pedido.fechaCreacion);
        const fechaFormateada = fecha.toLocaleDateString('es-CO');

        fila.setAttribute('data-estado', 'en_alistamiento');

        // Formatear el precio total
        const precioTotal = pedido.precioTotal ? `$${pedido.precioTotal.toLocaleString('es-CO')}` : '$0';

        fila.innerHTML = `
            <td>${pedido.idPedido}</td>
            <td>${fechaFormateada}</td>
            <td>${pedido.cliente || 'Cliente'}</td>
            <td>${pedido.cantidadTotal}</td>
            <td>${pedido.tiposProductos}</td>
            <td>
                <button onclick="abrirModal(${pedido.idPedido})" class="btn-ver">Ver</button>
                <button onclick="marcarComoListo(this, ${pedido.idPedido})" class="btn-listo">Marcar como Listo</button>
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
// Marca un pedido como listo y cambia el botón a "Asignar Conductor"
// ============================================
function marcarComoListo(btn, idPedido) {
    // Confirmar acción
    if (!confirm(`¿Marcar el pedido #${idPedido} como listo?`)) {
        return;
    }

    // Cambiar el botón a "Asignar Conductor"
    btn.textContent = 'Asignar Conductor';
    btn.classList.remove('btn-listo');
    btn.classList.add('btn-asignar');
    btn.onclick = null; // Quitar la funcionalidad de clic

    // Cambiar el estado de la fila
    const fila = btn.closest('tr');
    fila.setAttribute('data-estado', 'listo');

    // Enviar petición al servidor (opcional)
    fetch('/api/logistica/marcar-listo/' + idPedido, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mensaje de éxito
                alert(data.message);

                // Actualizar contadores
                actualizarContadores();
            } else {
                alert('Error: ' + data.message);
                // Revertir el cambio si hay error
                btn.textContent = 'Marcar como Listo';
                btn.classList.remove('btn-asignar');
                btn.classList.add('btn-listo');
                btn.onclick = function() { marcarComoListo(btn, idPedido); };
                fila.setAttribute('data-estado', 'en_alistamiento');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al marcar el pedido como listo');
            // Revertir el cambio si hay error
            btn.textContent = 'Marcar como Listo';
            btn.classList.remove('btn-asignar');
            btn.classList.add('btn-listo');
            btn.onclick = function() { marcarComoListo(btn, idPedido); };
            fila.setAttribute('data-estado', 'en_alistamiento');
        });
}

// ============================================
// CERRAR MODAL AL HACER CLIC FUERA
// Si el usuario hace clic fuera del contenido del modal, se cierra
// ============================================
window.addEventListener('click', function(e) {
    const modalDetalle = document.getElementById('modalDetallePedido');
    const modalNovedad = document.getElementById('novedadModal');

    // Si se hace clic en el fondo oscuro (fuera del contenido), cerramos
    if (e.target === modalDetalle) {
        cerrarModal();
    }

    if (e.target === modalNovedad) {
        modalNovedad.style.display = 'none';
    }
});

// ============================================
// MODAL DE NOVEDADES - REPORTAR NOVEDAD
// ============================================

// Obtenemos los elementos del DOM
const btnNovedad = document.getElementById('btnNovedad');
const novedadModal = document.getElementById('novedadModal');
const closeModal = document.getElementById('closeModal');
const cancelNovedad = document.getElementById('cancelNovedad');
const novedadForm = document.getElementById('novedadForm');

// Cuando se hace clic en el botón "Reportar Novedad"
if (btnNovedad) {
    btnNovedad.addEventListener('click', function(e) {
        e.preventDefault(); // Evitamos que el enlace navegue
        novedadModal.style.display = 'flex'; // Mostramos el modal

        // Establecemos la fecha actual por defecto en el campo de fecha
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) {
            fechaInput.valueAsDate = new Date();
        }
    });
}

// Cuando se hace clic en el botón de cerrar (X)
if (closeModal) {
    closeModal.addEventListener('click', function() {
        novedadModal.style.display = 'none'; // Ocultamos el modal
    });
}

// Cuando se hace clic en el botón "Cancelar"
if (cancelNovedad) {
    cancelNovedad.addEventListener('click', function() {
        novedadModal.style.display = 'none'; // Ocultamos el modal
    });
}

// Envío del formulario de novedad
if (novedadForm) {
    novedadForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Evitamos que se recargue la página

        // Aquí iría la lógica para enviar el formulario al servidor
        // Por ahora solo mostramos un mensaje de confirmación
        alert('Novedad reportada correctamente. Nos contactaremos pronto.');
        novedadModal.style.display = 'none'; // Cerramos el modal
        novedadForm.reset(); // Limpiamos el formulario
    });
}

// ============================================
// NOTA IMPORTANTE PARA PRINCIPIANTES
// ============================================
/*
Este archivo JavaScript controla:

1. El menú lateral (abrir/cerrar en móviles)
2. Los contadores de las tarjetas
3. La búsqueda de pedidos en la tabla
4. El modal para ver detalles de pedidos
5. Marcar pedidos como listos
6. El modal para reportar novedades

Para conectar con un servidor real:
- Reemplaza los datos de ejemplo con llamadas fetch()
- Usa las URLs de tu API
- Maneja los errores apropiadamente

Ejemplo de llamada al servidor:
fetch('http://localhost:8080/api/pedidos')
    .then(response => response.json())
    .then(data => {
        // Aquí procesas los datos recibidos
        console.log(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
*/