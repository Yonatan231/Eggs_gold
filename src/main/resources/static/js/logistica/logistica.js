/* ============================================
   PANEL DE LOGÍSTICA - VERSION SIMPLIFICADA
   Este archivo controla toda la funcionalidad
   de la página de logística
   ============================================ */

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
    cargarPedidosRecientes();  // Carga los pedidos
    cargarInventario();         // Carga el inventario
    actualizarContadorPedidosPendientes(); // Actualiza el contador de pedidos pendientes (NUEVO)
});


// ============================================
// FUNCIÓN: actualizarContadorPedidosPendientes() (NUEVA)
// Cuenta los pedidos con estado "Aprobado" y actualiza la tarjeta
// ============================================
function actualizarContadorPedidosPendientes() {
    // Pedimos los datos al servidor
    fetch("http://localhost:8080/api/pedido/listar")
        .then(response => response.json())
        .then(data => {
            // Verificamos si la respuesta fue exitosa
            if (data.success && data.pedidos) {
                // Filtramos solo los pedidos que están "Aprobados" (pendientes de asignar)
                const pedidosPendientes = data.pedidos.filter(pedido => pedido.estado === 'Aprobado');

                // Actualizamos el número en la tarjeta
                const contadorElement = document.getElementById('totalPedidosPendientes');
                if (contadorElement) {
                    contadorElement.textContent = pedidosPendientes.length;
                }
            }
        })
        .catch(error => {
            console.error('Error al actualizar contador de pedidos pendientes:', error);
        });
}


// ============================================
// FUNCIÓN: cargarPedidosRecientes()
// Trae los pedidos del servidor y los muestra
// ============================================
function cargarPedidosRecientes() {

    // Pedimos los datos al servidor usando fetch (es como pedir información)
    fetch("http://localhost:8080/api/pedido/listar")
        .then(response => response.json()) // Convertimos la respuesta a formato JSON
        .then(data => {

            // Verificamos si la respuesta fue exitosa
            if (!data.success) {
                alert("No se pudieron cargar los pedidos.");
                return; // Salimos de la función
            }

            const pedidos = data.pedidos; // Los pedidos que nos envió el servidor
            const rol = data.rol; // El rol del usuario (LOGISTICA, CONDUCTOR, etc.)
            const tbody = document.querySelector('#tabla-pedidos tbody'); // Cuerpo de la tabla

            // Limpiamos la tabla antes de llenarla (eliminamos filas anteriores)
            tbody.innerHTML = "";

            // Si no hay pedidos, mostramos un mensaje
            if (pedidos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9">No hay pedidos para mostrar.</td></tr>';
                return;
            }

            // Recorremos cada pedido (forEach es como un bucle "para cada")
            pedidos.forEach(function(pedido) {

                // Creamos una nueva fila <tr> para el pedido
                const fila = document.createElement('tr');

                // Decidimos qué botón mostrar según el estado del pedido
                let accionHTML = "";

                if (rol === "LOGISTICA" && pedido.estado === 'Aprobado') {
                    // Si está aprobado, mostramos botón de asignar
                    accionHTML = `
                        <button class="btn-asignar" onclick="asignarPedido(${pedido.idPedidos})">
                            Asignar
                        </button>
                    `;
                }
                else if (rol === "LOGISTICA" && pedido.estado === 'Asignado') {
                    // Si ya está asignado
                    accionHTML = `<span style="color: green; font-weight: bold;">✓ ASIGNADO</span>`;
                }
                else if (rol === "LOGISTICA" && pedido.estado === 'En_camino') {
                    // Si está en camino
                    accionHTML = `<span style="color: green; font-weight: bold;">✓ EN CAMINO</span>`;
                }
                else {
                    // En otros casos, mostramos un guión
                    accionHTML = "—";
                }

                // Llenamos la fila con los datos del pedido
                fila.innerHTML = `
                    <td>${pedido.idPedidos}</td>
                    <td>${pedido.nombreUsuario}</td>
                    <td colspan="2">${pedido.productos}</td>
                    <td>${pedido.direccion}</td>
                    <td>${pedido.total}</td>
                    <td>${pedido.estado}</td>
                    <td>${pedido.fechaCreacion}</td>
                    <td>${accionHTML}</td>
                `;

                // Agregamos la fila a la tabla
                tbody.appendChild(fila);
            });

            // Actualizamos el contador de pedidos pendientes después de cargar
            actualizarContadorPedidosPendientes();
        })
        .catch(error => {
            // Si hay un error, lo mostramos en la consola
            console.error('Error al cargar pedidos:', error);
            document.querySelector('#tabla-pedidos tbody').innerHTML =
                '<tr><td colspan="9">Error al cargar los pedidos.</td></tr>';
        });
}


// ============================================
// FUNCIÓN: cargarInventario()
// Trae el inventario del servidor y lo muestra
// ============================================
function cargarInventario() {

    // Pedimos el inventario al servidor
    fetch("http://localhost:8080/inventario/detalle")
        .then(response => response.json()) // Convertimos la respuesta a JSON
        .then(data => {

            const tabla = document.querySelector('#tabla-productos tbody'); // Cuerpo de la tabla

            // Limpiamos la tabla
            tabla.innerHTML = '';

            // Si hay productos en el inventario
            if (Array.isArray(data) && data.length > 0) {

                // Actualizamos el contador de productos en la tarjeta
                const contadorProductos = document.getElementById('totalProductos');
                if (contadorProductos) {
                    contadorProductos.textContent = data.length;
                }

                // Recorremos cada producto
                data.forEach(function(producto) {

                    // Creamos una fila con los datos del producto
                    const fila = `
                        <tr>
                            <td>${producto.idInventario}</td>
                            <td>${producto.nombre}</td>
                            <td>${producto.precio}</td>
                            <td>${producto.categoria}</td>
                            <td>${producto.descripcion}</td>
                            <td>${producto.estado}</td>
                            <td>${producto.cantidadDisponible}</td>
                            <td>${producto.ubicacion}</td>
                            <td><img src="/uploads/productos/${producto.imagen}" width="50" alt="${producto.nombre}"></td>
                            <td>${producto.fechaCaducidad || ''}</td>
                            <td>${producto.fechaActualizacion}</td>
                            <td><button class="btn-actualizar" onclick="actualizarProducto(${producto.idInventario})">Actualizar</button></td>
                            <td><button class="btn-eliminar" onclick="eliminarProducto(${producto.idInventario})">Eliminar</button></td>
                        </tr>
                    `;

                    // Agregamos la fila a la tabla
                    tabla.innerHTML += fila;
                });
            }
            else {
                // Si no hay productos
                tabla.innerHTML = `<tr><td colspan="13">No hay productos en el inventario</td></tr>`;

                // Ponemos el contador en 0
                const contadorProductos = document.getElementById('totalProductos');
                if (contadorProductos) {
                    contadorProductos.textContent = '0';
                }
            }
        })
        .catch(error => {
            console.error("Error cargando inventario:", error);
        });
}


// ============================================
// FUNCIÓN: asignarPedido()
// Abre el modal para asignar un pedido a un conductor
// ============================================
function asignarPedido(idPedido) {

    // Mostramos el modal (cambiamos display a 'flex')
    document.getElementById('modal-asignar').style.display = 'flex';

    // Guardamos el ID del pedido en el campo oculto del formulario
    document.getElementById('asignar_id_pedido').value = idPedido;

    // Obtenemos la lista de conductores disponibles
    fetch('/entregados')
        .then(response => response.json())
        .then(data => {

            const select = document.getElementById('select-conductor');
            // Limpiamos el selector y agregamos la opción por defecto
            select.innerHTML = '<option value="">Seleccione un conductor</option>';

            // Agregamos cada conductor al selector
            data.forEach(function(conductor) {
                select.innerHTML += `
                    <option value="${conductor.idUsuarios}">
                        ${conductor.nombre} ${conductor.apellido}
                    </option>
                `;
            });
        })
        .catch(error => {
            console.error("Error al cargar conductores:", error);
        });
}


// ============================================
// FUNCIÓN: cerrarModalAsignar()
// Cierra el modal de asignación y limpia el formulario
// ============================================
function cerrarModalAsignar() {
    document.getElementById('modal-asignar').style.display = 'none';
    document.getElementById('form-asignar').reset(); // Limpia los campos del formulario
}


// ============================================
// ENVIAR ASIGNACIÓN DE PEDIDO
// Cuando el usuario envía el formulario de asignación
// ============================================
document.getElementById('form-asignar').addEventListener('submit', function (e) {
    e.preventDefault(); // Evita que se recargue la página (comportamiento por defecto)

    const formData = new FormData(this); // Obtenemos todos los datos del formulario

    // Enviamos la asignación al servidor
    fetch('/api/pedido/asignar', {
        method: 'POST', // Método POST para enviar datos
        body: formData // Los datos del formulario
    })
        .then(response => response.json())
        .then(data => {

            if (data.success) {
                alert("✓ Pedido asignado correctamente");
                cerrarModalAsignar();
                cargarPedidosRecientes(); // Recargamos la tabla para ver los cambios
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error al asignar:", error);
            alert("Error al asignar el pedido");
        });
});


// ============================================
// FUNCIÓN: actualizarProducto()
// Abre el modal para editar un producto
// ============================================
function actualizarProducto(id) {

    // Verificamos que haya un ID
    if (!id) {
        console.error("ID de inventario no proporcionado");
        return;
    }

    // Obtenemos los datos del producto desde el servidor
    fetch(`/inventario/${id}`)
        .then(response => response.json())
        .then(data => {

            // Llenamos los campos del formulario con los datos del producto
            document.getElementById('editar_id_inventario').value = data.idInventario;
            document.getElementById('editar_id_producto').value = data.producto.idProducto;
            document.getElementById('editar_nombre').value = data.producto.nombre;
            document.getElementById('editar_precio').value = data.producto.precio;
            document.getElementById('editar_categoria').value = data.producto.categoria;
            document.getElementById('editar_descripcion').value = data.producto.descripcion;
            document.getElementById('editar_estado').value = data.estado;
            document.getElementById('editar_cantidad').value = data.cantidadDisponible;
            document.getElementById('editar_ubicacion').value = data.ubicacion;
            document.getElementById('editar_fecha_caducidad').value = data.fechaCaducidad;

            // Mostramos el modal
            document.getElementById('modal-editar-producto').style.display = 'flex';
        })
        .catch(error => {
            console.error('Error al obtener el producto:', error);
        });
}


// ============================================
// FUNCIÓN: cerrarModal()
// Cierra el modal de edición de productos
// ============================================
function cerrarModal() {
    document.getElementById("modal-editar-producto").style.display = "none";
    document.getElementById('form-editar-producto').reset(); // Limpia el formulario
}


// ============================================
// ENVIAR ACTUALIZACIÓN DE PRODUCTO
// Cuando el usuario envía el formulario de edición
// ============================================
document.getElementById('form-editar-producto').addEventListener('submit', function (e) {
    e.preventDefault(); // Evita que se recargue la página

    const formData = new FormData(this); // Obtenemos los datos del formulario

    // Enviamos los datos actualizados al servidor
    fetch('/inventario/actualizar', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {

            if (data.success) {
                alert("Producto actualizado correctamente");
                cerrarModal();
                cargarInventario(); // Recargamos el inventario para ver los cambios
            } else {
                alert("Error al actualizar: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error al enviar los datos:", error);
        });
});


// ============================================
// FUNCIÓN: eliminarProducto()
// Elimina un producto del inventario
// ============================================
function eliminarProducto(id) {

    // Pedimos confirmación al usuario
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        return; // Si cancela, salimos de la función
    }

    // Enviamos la petición de eliminación al servidor
    fetch("http://localhost:8080/inventario/eliminar", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Indicamos que enviamos JSON
        },
        body: JSON.stringify({ id: id }) // Convertimos el ID a formato JSON
    })
        .then(response => response.json())
        .then(data => {

            alert(data.message); // Mostramos el mensaje del servidor

            if (data.success) {
                cargarInventario(); // Recargamos el inventario
            }
        })
        .catch(error => {
            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar el producto.");
        });
}


// ============================================
// BÚSQUEDA DE PEDIDOS
// Filtra la tabla mientras el usuario escribe
// ============================================
document.addEventListener("DOMContentLoaded", function () {

    const inputBuscar = document.getElementById("buscar");
    const tbody = document.querySelector("#tabla-pedidos tbody");

    // Cuando el usuario escribe en el campo de búsqueda
    inputBuscar.addEventListener("keyup", function() {

        const textoBusqueda = inputBuscar.value.toLowerCase(); // Convertimos a minúsculas

        // Si no hay texto, mostramos todos los pedidos
        if (textoBusqueda === "") {
            cargarPedidosRecientes();
            return;
        }

        // Obtenemos todas las filas de la tabla
        const filas = tbody.querySelectorAll("tr");
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

        // Si no hay resultados, mostramos un mensaje
        if (!hayResultados && tbody.children.length > 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 20px;">
                        No se encontraron resultados
                    </td>
                </tr>
            `;
        }
    });
});


// ============================================
// BÚSQUEDA DE INVENTARIO
// Filtra la tabla de productos mientras el usuario escribe
// ============================================
document.addEventListener("DOMContentLoaded", function () {

    const inputBuscar = document.getElementById("buscar-inventario");
    const tbody = document.querySelector("#tabla-productos tbody");

    // Cuando el usuario escribe
    inputBuscar.addEventListener("keyup", function() {

        const textoBusqueda = inputBuscar.value.toLowerCase();

        // Si no hay texto, mostramos todo el inventario
        if (textoBusqueda === "") {
            cargarInventario();
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
                    <td colspan="13" style="text-align: center; padding: 20px;">
                        No se encontraron resultados
                    </td>
                </tr>
            `;
        }
    });
});



// ============================================
// CERRAR MODALES AL HACER CLIC FUERA
// Si el usuario hace clic fuera del cuadro, se cierra
// ============================================
window.onclick = function(event) {
    const modalAsignar = document.getElementById('modal-asignar');
    const modalEditar = document.getElementById('modal-editar-producto');

    // Si se hace clic en el fondo oscuro (fuera del modal), lo cerramos
    if (event.target === modalAsignar) {
        modalAsignar.style.display = 'none';
    }

    if (event.target === modalEditar) {
        modalEditar.style.display = 'none';
    }
}


// ============================================
// MODAL DE NOVEDADES - REPORTAR NOVEDAD
// ============================================

// Obtenemos los elementos del DOM (Document Object Model - el HTML)
const btnNovedad = document.getElementById('btnNovedad');
const novedadModal = document.getElementById('novedadModal');
const closeModal = document.getElementById('closeModal');
const cancelNovedad = document.getElementById('cancelNovedad');
const novedadForm = document.getElementById('novedadForm');

// Cuando se hace clic en el botón "Reportar Novedad"
btnNovedad.addEventListener('click', () => {
    novedadModal.style.display = 'flex'; // Mostramos el modal

    // Establecemos la fecha actual por defecto en el campo de fecha
    document.getElementById('fecha').valueAsDate = new Date();
});

// Cuando se hace clic en el botón de cerrar (X)
closeModal.addEventListener('click', () => {
    novedadModal.style.display = 'none'; // Ocultamos el modal
});

// Cuando se hace clic en el botón "Cancelar"
cancelNovedad.addEventListener('click', () => {
    novedadModal.style.display = 'none'; // Ocultamos el modal
});

// Cerrar modal al hacer clic fuera del contenido (en el fondo oscuro)
window.addEventListener('click', (e) => {
    if (e.target === novedadModal) {
        novedadModal.style.display = 'none';
    }
});

// Envío del formulario de novedad
novedadForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evitamos que se recargue la página

    // Aquí iría la lógica para enviar el formulario al servidor
    // Por ahora solo mostramos un mensaje de confirmación
    alert('Novedad reportada correctamente. Nos contactaremos pronto.');
    novedadModal.style.display = 'none'; // Cerramos el modal
    novedadForm.reset(); // Limpiamos el formulario
});