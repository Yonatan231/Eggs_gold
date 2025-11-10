/* ============================================
   PANEL DE CONDUCTOR - VERSION SIMPLIFICADA
   Este archivo controla toda la funcionalidad
   de la página del conductor
   ============================================ */

// ============================================
// BOTÓN PARA ABRIR/CERRAR EL MENÚ
// ============================================
const botonMenu = document.querySelector('.toggle-btn');

// Cuando se hace clic en el botón del menú
botonMenu.addEventListener('click', function () {
    const menuLateral = document.getElementById('sidebar');

    // Si el menú está abierto, lo cierra. Si está cerrado, lo abre
    menuLateral.classList.toggle('active');
});


// ============================================
// CUANDO LA PÁGINA CARGA
// Ejecuta estas funciones automáticamente
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    cargarPedidosAsignados();  // Carga los pedidos
    mostrarHistorial();         // Carga el historial
    actualizarContadores();     // Actualiza los números de las tarjetas
});


// ============================================
// FUNCIÓN: cargarPedidosAsignados()
// Trae los pedidos del servidor y los muestra
// ============================================
function cargarPedidosAsignados() {

    // Pedimos los datos al servidor
    fetch("/api/pedido/conductor")
        .then(response => response.json())
        .then(data => {

            // Obtenemos el cuerpo de la tabla donde van los pedidos
            const tbody = document.querySelector("#tabla-pedidos_asignados tbody");
            const mensajeVacio = document.getElementById("mensaje-sin-pedidos");

            // Limpiamos la tabla antes de llenarla
            tbody.innerHTML = "";

            // Si hay pedidos para mostrar
            if (data.success && data.data.length > 0) {

                // Ocultamos el mensaje de "no hay pedidos"
                mensajeVacio.style.display = "none";
                tbody.parentElement.parentElement.style.display = "table";

                // Recorremos cada pedido
                data.data.forEach(function(pedido) {

                    // Creamos una nueva fila
                    const fila = document.createElement("tr");

                    // Decidimos qué botones mostrar según el estado
                    let botones = "";

                    if (pedido.estado === 'ASIGNADO') {
                        // Botones para pedido asignado
                        botones = `
                            <button class="btn-accion btn-entregado" onclick="marcarEnCamino(${pedido.idPedidos})">
                                Entregar
                            </button>
                            <button class="btn-accion btn-cancelar" onclick="rechazarPedido(${pedido.idPedidos})">
                                Rechazar
                            </button>
                        `;
                    }
                    else if (pedido.estado === 'EN_CAMINO') {
                        // Botones para pedido en camino
                        const direccion = encodeURIComponent(pedido.direccion);
                        botones = `
                            <button class="btn-accion" onclick="window.open('mapa_conductor?direccion=${direccion}', '_blank')">
                                Ver ruta
                            </button>
                            <button class="btn-accion btn-entregado" onclick="marcarEntregado(${pedido.idPedidos})">
                                Entregado
                            </button>
                        `;
                    }
                    else if (pedido.estado === 'ENTREGADO') {
                        // Solo mostramos texto si ya está entregado
                        botones = `<span style="color: green; font-weight: bold;">✓ Entregado</span>`;
                    }

                    // Creamos el HTML del estado con colores
                    let estadoHTML = '';
                    if (pedido.estado === 'ASIGNADO') {
                        estadoHTML = '<span class="estado-asignado">ASIGNADO</span>';
                    }
                    else if (pedido.estado === 'EN_CAMINO') {
                        estadoHTML = '<span class="estado-en-camino">EN CAMINO</span>';
                    }
                    else if (pedido.estado === 'ENTREGADO') {
                        estadoHTML = '<span class="estado-entregado">ENTREGADO</span>';
                    }
                    else {
                        estadoHTML = pedido.estado;
                    }

                    // Llenamos la fila con los datos del pedido
                    fila.innerHTML = `
                        <td>${pedido.idPedidos}</td>
                        <td>${pedido.nombreCliente} ${pedido.apellidoCliente}</td>
                        <td>${pedido.telefono}</td>
                        <td>${pedido.direccion}</td>
                        <td>${pedido.productos}</td>
                        <td>${estadoHTML}</td>
                        <td>${botones}</td>
                    `;

                    // Agregamos la fila a la tabla
                    tbody.appendChild(fila);
                });
            }
            else {
                // Si no hay pedidos, mostramos el mensaje
                tbody.parentElement.parentElement.style.display = "none";
                mensajeVacio.style.display = "block";
            }

            // Actualizamos los contadores
            actualizarContadores();
        })
        .catch(error => {
            console.error("Error al cargar pedidos:", error);
            alert("Error al cargar los pedidos. Recarga la página.");
        });
}


// ============================================
// FUNCIÓN: marcarEnCamino()
// Cambia el estado del pedido a "EN CAMINO"
// ============================================
function marcarEnCamino(idPedido) {

    // Enviamos la petición al servidor
    fetch('/api/pedido/actualizar-estado-conductor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idPedido: idPedido,
            estado: 'EN_CAMINO'
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("✓ Pedido marcado como EN CAMINO");
                cargarPedidosAsignados(); // Recargamos la tabla
            } else {
                alert("Error al actualizar el estado");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error al conectar con el servidor");
        });
}


// ============================================
// FUNCIÓN: rechazarPedido()
// Permite rechazar un pedido
// ============================================
function rechazarPedido(idPedido) {

    // Pedimos confirmación
    if (confirm("¿Estás seguro de rechazar este pedido?")) {
        alert("Función aún no implementada");

        // Aquí iría el código para rechazar:
        /*
        fetch('/api/pedido/rechazar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idPedido: idPedido })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Pedido rechazado");
                cargarPedidosAsignados();
            }
        });
        */
    }
}


// ============================================
// FUNCIÓN: marcarEntregado()
// Marca el pedido como entregado
// ============================================
function marcarEntregado(idPedido) {

    // Pedimos confirmación
    if (!confirm("¿Confirma que este pedido ha sido entregado?")) {
        return; // Si dice que no, no hace nada
    }

    // Enviamos la petición al servidor
    fetch('/api/pedido/actualizar-estado-conductor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idPedido: idPedido,
            estado: 'ENTREGADO'
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("✓ Pedido marcado como ENTREGADO");
                cargarPedidosAsignados(); // Recarga la tabla
                mostrarHistorial();       // Actualiza el historial
            } else {
                alert("Error al actualizar el pedido");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error al conectar con el servidor");
        });
}


// ============================================
// FUNCIÓN: mostrarHistorial()
// Muestra el historial de pedidos completados
// ============================================
function mostrarHistorial() {

    // Pedimos el historial al servidor
    fetch("/api/pedido/conductor/historial")
        .then(response => response.json())
        .then(data => {

            const tbody = document.querySelector("#tabla-pedidos tbody");
            const mensajeVacio = document.getElementById("mensaje-sin-historial");

            // Limpiamos la tabla
            tbody.innerHTML = "";

            // Si hay historial para mostrar
            if (data.success && data.data.length > 0) {

                mensajeVacio.style.display = "none";
                tbody.parentElement.parentElement.style.display = "table";

                // Recorremos cada pedido del historial
                data.data.forEach(function(pedido) {

                    const fila = document.createElement("tr");

                    // Creamos el HTML del estado
                    const estadoClase = pedido.estado.toLowerCase();
                    const estadoHTML = `<span class="estado-${estadoClase}">${pedido.estado}</span>`;

                    // Llenamos la fila
                    fila.innerHTML = `
                        <td>${pedido.idPedido}</td>
                        <td>${pedido.nombreUsuario}</td>
                        <td>${pedido.productos}</td>
                        <td>${pedido.direccion}</td>
                        <td>${pedido.totalFormateado}</td>
                        <td>${estadoHTML}</td>
                        <td>${pedido.fechaCreacion}</td>
                    `;

                    tbody.appendChild(fila);
                });
            }
            else {
                // Si no hay historial
                tbody.parentElement.parentElement.style.display = "none";
                mensajeVacio.style.display = "block";
            }
        })
        .catch(error => {
            console.error("Error al cargar historial:", error);
        });
}


// ============================================
// FUNCIÓN: actualizarContadores()
// Actualiza los números de las tarjetas
// ============================================
function actualizarContadores() {

    // Obtenemos todas las filas de pedidos
    const filas = document.querySelectorAll("#tabla-pedidos_asignados tbody tr");
    let totalAsignados = filas.length;
    let totalPendientes = 0;

    // Contamos los pendientes
    filas.forEach(function(fila) {
        const estadoTexto = fila.querySelector('td:nth-child(6)').textContent;

        if (estadoTexto.includes('ASIGNADO') || estadoTexto.includes('EN CAMINO')) {
            totalPendientes++;
        }
    });

    // Actualizamos los números en la página
    document.getElementById('totalAsignados').textContent = totalAsignados;
    document.getElementById('totalPendientes').textContent = totalPendientes;
}


// ============================================
// BÚSQUEDA DE PEDIDOS ASIGNADOS
// Filtra la tabla mientras escribes
// ============================================
document.addEventListener("DOMContentLoaded", function () {

    const inputBuscar = document.getElementById("buscar-conductor");
    const tbody = document.querySelector("#tabla-pedidos_asignados tbody");

    // Cuando el usuario escribe en el campo de búsqueda
    inputBuscar.addEventListener("keyup", function() {

        const textoBusqueda = inputBuscar.value.toLowerCase();

        // Si no hay texto, mostramos todos los pedidos
        if (textoBusqueda === "") {
            cargarPedidosAsignados();
            return;
        }

        // Obtenemos todas las filas
        const filas = tbody.querySelectorAll("tr");
        let hayResultados = false;

        // Revisamos cada fila
        filas.forEach(function(fila) {
            const contenido = fila.textContent.toLowerCase();

            if (contenido.includes(textoBusqueda)) {
                fila.style.display = ""; // Mostramos la fila
                hayResultados = true;
            } else {
                fila.style.display = "none"; // Ocultamos la fila
            }
        });

        // Si no hay resultados
        if (!hayResultados && tbody.children.length > 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">
                        No se encontraron resultados
                    </td>
                </tr>
            `;
        }
    });
});


// ============================================
// BÚSQUEDA EN HISTORIAL
// Filtra el historial mientras escribes
// ============================================
document.addEventListener("DOMContentLoaded", function () {

    const inputBuscar = document.getElementById("buscar-historial");
    const tbody = document.querySelector("#tabla-pedidos tbody");

    // Cuando el usuario escribe
    inputBuscar.addEventListener("keyup", function() {

        const textoBusqueda = inputBuscar.value.toLowerCase();

        // Si no hay texto, mostramos todo
        if (textoBusqueda === "") {
            mostrarHistorial();
            return;
        }

        // Obtenemos todas las filas
        const filas = tbody.querySelectorAll("tr");
        let hayResultados = false;

        // Revisamos cada fila
        filas.forEach(function(fila) {
            const contenido = fila.textContent.toLowerCase();

            if (contenido.includes(textoBusqueda)) {
                fila.style.display = "";
                hayResultados = true;
            } else {
                fila.style.display = "none";
            }
        });

        // Si no hay resultados
        if (!hayResultados && tbody.children.length > 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">
                        No se encontraron resultados
                    </td>
                </tr>
            `;
        }
    });
});

// Elementos del DOM relacionados con el modal
const btnNovedad = document.getElementById('btnNovedad');
const novedadModal = document.getElementById('novedadModal');
const closeModal = document.getElementById('closeModal');
const cancelNovedad = document.getElementById('cancelNovedad');
const novedadForm = document.getElementById('novedadForm');

// Modal de novedades
btnNovedad.addEventListener('click', () => {
    novedadModal.style.display = 'flex';
    // Establecer fecha actual por defecto
    document.getElementById('fecha').valueAsDate = new Date();
});

closeModal.addEventListener('click', () => {
    novedadModal.style.display = 'none';
});

cancelNovedad.addEventListener('click', () => {
    novedadModal.style.display = 'none';
});

// Cerrar modal al hacer clic fuera del contenido
window.addEventListener('click', (e) => {
    if (e.target === novedadModal) {
        novedadModal.style.display = 'none';
    }
});

// Envío del formulario de novedad
novedadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Aquí iría la lógica para enviar el formulario
    alert('Novedad reportada correctamente. Nos contactaremos pronto.');
    novedadModal.style.display = 'none';
    novedadForm.reset();
});