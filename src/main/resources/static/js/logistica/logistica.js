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
    menuLateral.classList.toggle('active');
});


// ============================================
// CUANDO LA PÁGINA CARGA
// Ejecuta estas funciones automáticamente
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    cargarPedidosRecientes();  // Carga los pedidos
    cargarInventario();         // Carga el inventario
});


// ============================================
// FUNCIÓN: cargarPedidosRecientes()
// Trae los pedidos del servidor y los muestra
// ============================================
function cargarPedidosRecientes() {

    // Pedimos los datos al servidor
    fetch("http://localhost:8080/api/pedido/listar")
        .then(response => response.json())
        .then(data => {

            // Verificamos si la respuesta fue exitosa
            if (!data.success) {
                alert("No se pudieron cargar los pedidos.");
                return;
            }

            const pedidos = data.pedidos;
            const rol = data.rol;
            const tbody = document.querySelector('#tabla-pedidos tbody');

            // Limpiamos la tabla antes de llenarla
            tbody.innerHTML = "";

            // Si no hay pedidos, mostramos un mensaje
            if (pedidos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9">No hay pedidos para mostrar.</td></tr>';
                return;
            }

            // Recorremos cada pedido
            pedidos.forEach(function(pedido) {

                // Creamos una nueva fila
                const fila = document.createElement('tr');

                // Decidimos qué botón mostrar según el estado
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
                    // En otros casos
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
        })
        .catch(error => {
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
        .then(response => response.json())
        .then(data => {

            const tabla = document.querySelector('#tabla-productos tbody');

            // Limpiamos la tabla
            tabla.innerHTML = '';

            // Si hay productos
            if (Array.isArray(data) && data.length > 0) {

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
                            <td><img src="imagenes/${producto.imagen}" width="50" alt="${producto.nombre}"></td>
                            <td>${producto.fechaCaducidad || ''}</td>
                            <td>${producto.fechaActualizacion}</td>
                            <td><button class="btn-actualizar" onclick="actualizarProducto(${producto.idInventario})">Actualizar</button></td>
                            <td><button class="btn-eliminar" onclick="eliminarProducto(${producto.idInventario})">Eliminar</button></td>
                        </tr>
                    `;

                    tabla.innerHTML += fila;
                });
            }
            else {
                // Si no hay productos
                tabla.innerHTML = `<tr><td colspan="13">No hay productos en el inventario</td></tr>`;
            }
        })
        .catch(error => {
            console.error("Error cargando inventario:", error);
        });
}


// ============================================
// FUNCIÓN: asignarPedido()
// Abre el modal para asignar un pedido
// ============================================
function asignarPedido(idPedido) {

    // Mostramos el modal
    document.getElementById('modal-asignar').style.display = 'flex';

    // Guardamos el ID del pedido en el campo oculto
    document.getElementById('asignar_id_pedido').value = idPedido;

    // Obtenemos la lista de conductores
    fetch('/entregados')
        .then(response => response.json())
        .then(data => {

            const select = document.getElementById('select-conductor');
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
// Cierra el modal de asignación
// ============================================
function cerrarModalAsignar() {
    document.getElementById('modal-asignar').style.display = 'none';
    document.getElementById('form-asignar').reset();
}


// ============================================
// ENVIAR ASIGNACIÓN DE PEDIDO
// ============================================
document.getElementById('form-asignar').addEventListener('submit', function (e) {
    e.preventDefault(); // Evita que se recargue la página

    const formData = new FormData(this);

    // Enviamos la asignación al servidor
    fetch('/api/pedido/asignar', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {

            if (data.success) {
                alert("✓ Pedido asignado correctamente");
                cerrarModalAsignar();
                cargarPedidosRecientes(); // Recargamos la tabla
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

    // Obtenemos los datos del producto
    fetch(`/inventario/${id}`)
        .then(response => response.json())
        .then(data => {

            // Llenamos los campos del formulario
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
// Cierra el modal de edición
// ============================================
function cerrarModal() {
    document.getElementById("modal-editar-producto").style.display = "none";
    document.getElementById('form-editar-producto').reset();
}


// ============================================
// ENVIAR ACTUALIZACIÓN DE PRODUCTO
// ============================================
document.getElementById('form-editar-producto').addEventListener('submit', function (e) {
    e.preventDefault(); // Evita que se recargue la página

    const formData = new FormData(this);

    // Enviamos los datos actualizados
    fetch('/inventario/actualizar', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {

            if (data.success) {
                alert("Producto actualizado correctamente");
                cerrarModal();
                cargarInventario(); // Recargamos el inventario
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

    // Pedimos confirmación
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        return;
    }

    // Enviamos la petición de eliminación
    fetch("http://localhost:8080/inventario/eliminar", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
    })
        .then(response => response.json())
        .then(data => {

            alert(data.message);

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
// Filtra la tabla mientras escribes
// ============================================
document.addEventListener("DOMContentLoaded", function () {

    const inputBuscar = document.getElementById("buscar");
    const tbody = document.querySelector("#tabla-pedidos tbody");

    // Cuando el usuario escribe
    inputBuscar.addEventListener("keyup", function() {

        const textoBusqueda = inputBuscar.value.toLowerCase();

        // Si no hay texto, mostramos todos los pedidos
        if (textoBusqueda === "") {
            cargarPedidosRecientes();
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
// Filtra la tabla mientras escribes
// ============================================
document.addEventListener("DOMContentLoaded", function () {

    const inputBuscar = document.getElementById("buscar-inventario");
    const tbody = document.querySelector("#tabla-productos tbody");

    // Cuando el usuario escribe
    inputBuscar.addEventListener("keyup", function() {

        const textoBusqueda = inputBuscar.value.toLowerCase();

        // Si no hay texto, mostramos todo
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
// GESTIÓN DE FOTO DE PERFIL
// Permite subir y mostrar la foto
// ============================================
document.addEventListener("DOMContentLoaded", function() {

    const avatarImg = document.getElementById("avatar-imagen");
    const avatarIniciales = document.getElementById("avatar-iniciales");
    const inputFoto = document.getElementById("input-foto");

    // Obtenemos el ID del usuario
    const usuarioId = sessionStorage.getItem("usuarioId") || 1;

    // Cargamos la foto del servidor (si existe)
    fetch(`/usuarios/${usuarioId}/foto`)
        .then(response => response.json())
        .then(data => {

            if (data.success && data.ruta) {
                // Si tiene foto, la mostramos
                avatarImg.src = data.ruta;
                avatarImg.style.display = "block";
                avatarIniciales.style.display = "none";
            } else {
                // Si no tiene foto, mostramos las iniciales
                const iniciales = data.iniciales || "AD";
                avatarIniciales.textContent = iniciales;
                avatarImg.style.display = "none";
                avatarIniciales.style.display = "flex";
            }
        })
        .catch(error => {
            console.error("Error al cargar foto:", error);
        });

    // Cuando el usuario selecciona una foto nueva
    inputFoto.addEventListener("change", function() {

        const archivo = inputFoto.files[0];

        if (!archivo) {
            return;
        }

        // Validamos que sea una imagen
        if (!archivo.type.startsWith('image/')) {
            alert("Por favor selecciona una imagen válida");
            inputFoto.value = "";
            return;
        }

        // Validamos el tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (archivo.size > maxSize) {
            alert("La imagen es muy grande. Máximo 5MB");
            inputFoto.value = "";
            return;
        }

        // Creamos el FormData
        const formData = new FormData();
        formData.append("foto", archivo);

        // Enviamos la foto al servidor
        fetch(`/usuarios/${usuarioId}/foto`, {
            method: "POST",
            body: formData
        })
            .then(response => response.json())
            .then(data => {

                if (data.success) {
                    // Actualizamos la imagen
                    avatarImg.src = data.ruta;
                    avatarImg.style.display = "block";
                    avatarIniciales.style.display = "none";
                    alert("✓ Foto actualizada correctamente");
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Error al subir la foto");
            });
    });
});


// ============================================
// CERRAR MODALES AL HACER CLIC FUERA
// ============================================
window.onclick = function(event) {
    const modalAsignar = document.getElementById('modal-asignar');
    const modalEditar = document.getElementById('modal-editar-producto');

    // Si se hace clic fuera del modal, lo cerramos
    if (event.target === modalAsignar) {
        modalAsignar.style.display = 'none';
    }

    if (event.target === modalEditar) {
        modalEditar.style.display = 'none';
    }
}


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