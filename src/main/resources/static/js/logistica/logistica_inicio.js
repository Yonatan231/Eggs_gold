/* ============================================
   PANEL DE LOGÍSTICA - VERSION MODIFICADA
   Este archivo controla toda la funcionalidad
   de la página de logística
   ============================================ */

// ============================================
// DATOS DE EJEMPLO PARA LOS PEDIDOS
// En un proyecto real, estos vendrían del servidor
// ============================================
const pedidos = {
    101: [
        { nombre: "Huevo Azul", categoria: "A", cantidad: 10 },
        { nombre: "Huevo de Campo", categoria: "AA", cantidad: 5 },
        { nombre: "Huevo Criollo", categoria: "A", cantidad: 3 }
    ],
    102: [
        { nombre: "Huevo Cafe", categoria: "AAA", cantidad: 7 },
        { nombre: "Huevo Criollo", categoria: "A", cantidad: 5 }
    ],
    103: [
        { nombre: "Huevo Rojo", categoria: "AAA", cantidad: 24 }
    ]
};

// ============================================
// BOTÓN PARA ABRIR/CERRAR EL MENÚ
// ============================================
const botonMenu = document.querySelector('.toggle-btn');

// Cuando se hace clic en el botón del menú
botonMenu.addEventListener('click', function () {
    const menuLateral = document.getElementById('sidebar');

    // Si el menú está abierto, lo cierra. Si está cerrado, lo abre
    // toggle() significa "cambiar": si tiene la clase la quita, si no la tiene la agrega
    menuLateral.classList.toggle('active');
});

// ============================================
// CUANDO LA PÁGINA CARGA
// Ejecuta estas funciones automáticamente
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    actualizarContadores(); // Actualiza los contadores de las tarjetas
    configurarBusqueda(); // Configura la búsqueda de pedidos
});

// ============================================
// FUNCIÓN: actualizarContadores()
// Actualiza los números en las tarjetas de resumen
// ============================================
function actualizarContadores() {
    // Contar pedidos nuevos (ejemplo: pedidos con estado "Aprobado")
    // En un proyecto real, esto vendría del servidor
    const totalPedidosNuevos = 5; // Ejemplo
    document.getElementById('totalPedidosNuevos').textContent = totalPedidosNuevos;

    // Contar entradas pendientes
    // En un proyecto real, esto vendría del servidor
    const totalEntradasPendientes = 3; // Ejemplo
    document.getElementById('totalEntradasPendientes').textContent = totalEntradasPendientes;

    // Si necesitas obtener datos del servidor, descomenta este código:
    /*
    fetch("http://localhost:8080/api/pedido/listar")
        .then(response => response.json())
        .then(data => {
            if (data.success && data.pedidos) {
                // Filtrar pedidos nuevos
                const pedidosNuevos = data.pedidos.filter(pedido => pedido.estado === 'Aprobado');
                document.getElementById('totalPedidosNuevos').textContent = pedidosNuevos.length;
            }
        })
        .catch(error => {
            console.error('Error al obtener datos:', error);
        });
    */
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
// Abre el modal con los detalles del pedido
// ============================================
function abrirModal(id) {
    // Mostramos el ID del pedido en el título del modal
    document.getElementById("pedidoId").textContent = id;

    // Obtenemos la lista de productos del pedido
    const lista = document.getElementById("listaProductos");
    lista.innerHTML = ""; // Limpiamos la lista

    // Verificamos si existe el pedido en nuestros datos
    if (pedidos[id]) {
        // Agregamos cada producto a la lista
        pedidos[id].forEach(producto => {
            const li = document.createElement("li"); // Creamos un elemento de lista
            li.textContent = `${producto.nombre} — ${producto.cantidad} unidades`;
            lista.appendChild(li); // Lo agregamos a la lista
        });
    } else {
        // Si no existe el pedido, mostramos un mensaje
        const li = document.createElement("li");
        li.textContent = "No se encontraron productos para este pedido";
        li.style.color = "#999";
        lista.appendChild(li);
    }

    // Mostramos el modal
    const modal = document.getElementById("modalDetallePedido");
    modal.style.display = "flex";
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
// FUNCIÓN: marcarListo()
// Marca un pedido como listo y lo elimina de la tabla
// ============================================
function marcarListo() {
    const idPedido = document.getElementById("pedidoId").textContent;

    // Confirmamos la acción
    if (confirm(`¿Marcar el pedido #${idPedido} como listo?`)) {
        // Buscamos la fila del pedido en la tabla
        const tbody = document.getElementById("tablaPedidosBody");
        const filas = tbody.querySelectorAll("tr");

        filas.forEach(function(fila) {
            // Obtenemos el ID de la primera celda
            const idCelda = fila.querySelector("td:first-child").textContent;

            // Si coincide con el ID del pedido, eliminamos la fila
            if (idCelda === idPedido) {
                fila.remove();
            }
        });

        // Mostramos mensaje de éxito
        alert(`Pedido #${idPedido} marcado como listo correctamente`);

        // Cerramos el modal
        cerrarModal();

        // Actualizamos los contadores
        actualizarContadores();

        // Verificamos si quedan pedidos en la tabla
        const filasRestantes = tbody.querySelectorAll("tr");
        if (filasRestantes.length === 0) {
            document.getElementById("tablaPedidos").style.display = "none";
            document.getElementById("mensajeVacio").style.display = "block";
        }
    }
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