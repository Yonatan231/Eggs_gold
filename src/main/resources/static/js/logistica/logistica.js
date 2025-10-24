/* ============================================
   VERIFICACIÓN DE SESIÓN AL CARGAR LA PÁGINA
   ============================================ */

// Obtiene la sesión del usuario desde el servidor
fetch('/session', { credentials: 'same-origin' }) // Envía la cookie JSESSIONID
    .then(res => res.json())
    .then(({ usuario_id, rol }) => {
        // Verifica si el usuario ha iniciado sesión
        if (!usuario_id || !rol) {
            alert("❌ Sesión no iniciada. Redirigiendo al inicio...");
            window.location.href = '/login'; // Redirige al login
            return;
        }

        // Muestra información de la sesión en consola
        console.log('ID de sesión:', usuario_id);
        console.log('Rol:', rol);

        // Si el usuario es ADMIN, carga los pedidos pendientes
        if (rol === 'ADMIN') {
            cargarPedidosRecientes('PENDIENTE');
        }
    })
    .catch(error => {
        console.error("Error al obtener sesión:", error);
        window.location.href = '/login';
    });

/* ============================================
   TOGGLE DEL MENÚ LATERAL (SIDEBAR)
   ============================================ */

// Obtiene el botón de toggle
const btntoggle = document.querySelector('.toggle-btn');

// Agrega evento de clic al botón
btntoggle.addEventListener('click', function () {
    // Alterna la clase 'active' en el sidebar
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');

    // Actualiza el atributo aria-expanded para accesibilidad
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !isExpanded);
});

/* ============================================
   FUNCIÓN: CARGAR PEDIDOS POR ESTADO
   ============================================ */

// Se ejecuta cuando el DOM está completamente cargado
document.addEventListener("DOMContentLoaded", cargarPedidosRecientes);

/**
 * Carga los pedidos desde el servidor y los muestra en la tabla
 * @param {string} estado - Estado de los pedidos a filtrar (opcional)
 */
function cargarPedidosRecientes(estado = '') {
    // Hace una petición al servidor para obtener los pedidos
    fetch("http://localhost:8080/api/pedido/listar")
        .then(response => response.json())
        .then(data => {
            // Verifica si la respuesta fue exitosa
            if (!data.success) {
                alert("No se pudieron cargar los pedidos.");
                return;
            }

            const pedidos = data.pedidos;
            const rol = data.rol;
            const tbody = document.querySelector('#tabla-pedidos tbody');
            tbody.innerHTML = ""; // Limpia la tabla

            // Si no hay pedidos, muestra un mensaje
            if (pedidos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9">No hay pedidos para mostrar.</td></tr>';
                return;
            }

            // Recorre cada pedido y crea una fila en la tabla
            pedidos.forEach(p => {
                const fila = document.createElement('tr');

                // Crea la celda de acción según el rol y estado del pedido
                const tdAccion = document.createElement('td');

                // Si es logística y el pedido está aprobado, muestra botón de asignar
                if (rol === "LOGISTICA" && p.estado === 'Aprobado') {
                    tdAccion.innerHTML = `<button onclick="asignarPedido(${p.idPedidos})">Asignar</button>`;
                }
                // Si ya está asignado, muestra un mensaje
                else if (rol === "LOGISTICA" && p.estado === 'Asignado') {
                    tdAccion.innerHTML = `<span style="color: green; font-weight: bold;">✓ ASIGNADO</span>`;
                }
                // Si está en camino, muestra otro mensaje
                else if (rol === "LOGISTICA" && p.estado === 'En_camino') {
                    tdAccion.innerHTML = `<span style="color: green; font-weight: bold;">✓ EN CAMINO</span>`;
                }
                // En otros casos, muestra un guion
                else {
                    tdAccion.innerHTML = "—";
                }

                // Crea la fila con todos los datos del pedido
                fila.innerHTML = `
                    <td>${p.idPedidos}</td>
                    <td>${p.nombreUsuario}</td>
                    <td colspan="2">${p.productos}</td>
                    <td>${p.direccion}</td>
                    <td>${p.total}</td>
                    <td>${p.estado}</td>
                    <td>${p.fechaCreacion}</td>
                `;

                // Agrega la celda de acción a la fila
                fila.appendChild(tdAccion);
                // Agrega la fila al cuerpo de la tabla
                tbody.appendChild(fila);
            });
        })
        .catch(error => {
            console.error('❌ Error al cargar pedidos:', error);
            document.querySelector('#tabla-pedidos tbody').innerHTML =
                '<tr><td colspan="9">Error al cargar los pedidos.</td></tr>';
        });
}

/* ============================================
   FUNCIÓN: CARGAR INVENTARIO
   ============================================ */

/**
 * Carga el inventario desde el servidor y lo muestra en la tabla
 * @param {string} busqueda - Término de búsqueda para filtrar (opcional)
 */
function cargarInventario(busqueda = "") {
    // Hace una petición al servidor para obtener el inventario
    fetch("http://localhost:8080/inventario/detalle")
        .then(res => res.json())
        .then(data => {
            const tabla = document.querySelector('#tabla-productos tbody');
            tabla.innerHTML = ''; // Limpia la tabla

            // Verifica si hay datos
            if (Array.isArray(data) && data.length > 0) {
                // Si hay búsqueda, filtra los productos
                const inventarioFiltrado = busqueda
                    ? data.filter(item =>
                        Object.values(item).some(valor =>
                            String(valor).toLowerCase().includes(busqueda.toLowerCase())
                        )
                    )
                    : data;

                // Si no hay resultados después del filtro
                if (inventarioFiltrado.length === 0) {
                    tabla.innerHTML = `<tr><td colspan="13">❌ No se encontraron resultados</td></tr>`;
                    return;
                }

                // Recorre cada producto del inventario
                inventarioFiltrado.forEach(producto => {
                    // Crea una fila con los datos del producto
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
                            <td><button onclick="actualizarProducto(${producto.idInventario})">Actualizar</button></td>
                            <td><button onclick="eliminarProducto(${producto.idInventario})">Eliminar</button></td>
                        </tr>`;
                    tabla.innerHTML += fila;
                });
            } else {
                tabla.innerHTML = `<tr><td colspan="13">❌ No hay productos en el inventario</td></tr>`;
            }
        })
        .catch(err => {
            console.error("❌ Error cargando inventario:", err);
        });
}

// Carga el inventario cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    cargarInventario();
});

/* ============================================
   MODAL DE ASIGNACIÓN DE PEDIDOS
   ============================================ */

/**
 * Abre el modal para asignar un pedido a un conductor
 * @param {number} idPedido - ID del pedido a asignar
 */
function asignarPedido(idPedido) {
    // Muestra el modal
    document.getElementById('modal-asignar').style.display = 'flex';
    // Guarda el ID del pedido en el campo oculto
    document.getElementById('asignar_id_pedido').value = idPedido;

    // Obtiene la lista de conductores disponibles
    fetch('/entregados')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('select-conductor');
            select.innerHTML = '<option value="">Seleccione un conductor</option>';

            // Agrega cada conductor al selector
            data.forEach(conductor => {
                select.innerHTML += `<option value="${conductor.idUsuarios}">${conductor.nombre} ${conductor.apellido}</option>`;
            });
        });
}

/**
 * Cierra el modal de asignación
 */
function cerrarModalAsignar() {
    document.getElementById('modal-asignar').style.display = 'none';
    document.getElementById('form-asignar').reset(); // Limpia el formulario
}

// Maneja el envío del formulario de asignación
document.getElementById('form-asignar').addEventListener('submit', function (e) {
    e.preventDefault(); // Evita que se recargue la página

    const formData = new FormData(this);
    console.log("ID Pedido:", formData.get("pedido_id"));
    console.log("ID Conductor:", formData.get("conductor_id"));

    // Envía la asignación al servidor
    fetch('/api/pedido/asignar', {
        method: 'POST',
        body: formData
    })
        .then(res => res.text())
        .then(text => {
            console.log("Respuesta cruda:", text);
            return JSON.parse(text);
        })
        .then(data => {
            if (data.success) {
                alert("✅ Pedido asignado correctamente");
                cerrarModalAsignar();
                cargarPedidosRecientes(); // Recarga la tabla de pedidos
            } else {
                alert("❌ Error: " + data.message);
            }
        })
        .catch(err => {
            console.error("❌ Error al procesar JSON:", err);
        });
});

/* ============================================
   MODAL DE EDICIÓN DE PRODUCTOS
   ============================================ */

/**
 * Abre el modal para editar un producto del inventario
 * @param {number} id - ID del producto a editar
 */
function actualizarProducto(id) {
    // Valida que se haya proporcionado un ID
    if (!id) {
        console.error("❌ ID de inventario no proporcionado");
        return;
    }

    // Obtiene los datos del producto desde el servidor
    fetch(`/inventario/${id}`)
        .then(response => {
            if (!response.ok) throw new Error("No se pudo obtener el producto");
            return response.json();
        })
        .then(data => {
            // Rellena los campos del formulario con los datos del producto
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

            // Muestra el modal
            const modal = document.getElementById('modal-editar-producto');
            if (modal) {
                modal.style.display = 'flex';
            } else {
                console.error("No se encontró el modal con ID 'modal-editar-producto'");
            }
        })
        .catch(error => {
            console.error('Error al obtener el producto:', error);
        });
}

/**
 * Cierra el modal de edición de productos
 */
function cerrarModal() {
    const modal = document.getElementById("modal-editar-producto");
    if (modal) {
        modal.style.display = "none";
        document.getElementById('form-editar-producto').reset(); // Limpia el formulario
    }
}

// Maneja el envío del formulario de edición
document.getElementById('form-editar-producto').addEventListener('submit', function (e) {
    e.preventDefault(); // Evita que se recargue la página

    const formData = new FormData(this);

    // Envía los datos actualizados al servidor
    fetch('/inventario/actualizar', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Producto actualizado correctamente");
                cerrarModal();
                cargarInventario(); // Recarga el inventario
            } else {
                alert("Error al actualizar: " + (data.message || "Error desconocido"));
            }
        })
        .catch(error => {
            console.error("Error al enviar los datos:", error);
        });
});

/* ============================================
   FUNCIÓN: ELIMINAR PRODUCTO
   ============================================ */

/**
 * Elimina un producto del inventario
 * @param {number} id - ID del producto a eliminar
 */
function eliminarProducto(id) {
    // Pide confirmación al usuario
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    // Envía la petición de eliminación al servidor
    fetch("http://localhost:8080/inventario/eliminar", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
    })
        .then(res => {
            if (!res.ok) throw new Error("Error en la respuesta del servidor");
            return res.json();
        })
        .then(data => {
            alert(data.message);
            if (data.success) {
                cargarInventario(); // Recarga el inventario después de eliminar
            }
        })
        .catch(error => {
            console.error("❌ Error al eliminar:", error);
            alert("❌ No se pudo eliminar el producto.");
        });
}

/* ============================================
   BÚSQUEDA DE PEDIDOS
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
    const inputBuscar = document.getElementById("buscar");
    const form = document.getElementById("form-busqueda");
    const tbody = document.querySelector("#tabla-pedidos tbody");

    /**
     * Busca pedidos según el valor ingresado
     * @param {string} valor - Término de búsqueda
     */
    function buscarPedidos(valor) {
        const texto = valor.trim();

        // Si no hay texto, muestra un mensaje
        if (texto === "") {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center;">⚠️ Escriba algo para buscar</td>
                </tr>`;
            return;
        }

        // Envía la búsqueda al servidor
        fetch("/api/pedidos/buscar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ buscar: texto })
        })
            .then(res => {
                if (!res.ok) throw new Error("Error en la respuesta del servidor");
                return res.json();
            })
            .then(data => {
                tbody.innerHTML = "";

                // Si no hay resultados
                if (data.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="9" style="text-align: center;">❌ No se encontraron resultados</td>
                        </tr>`;
                    return;
                }

                // Muestra los resultados
                data.forEach(pedido => {
                    const fila = `
                        <tr>
                            <td>${pedido.idPedido}</td>
                            <td>${pedido.nombreUsuario}</td>
                            <td>${pedido.nombreProducto}</td>
                            <td>${pedido.cantidad}</td>
                            <td>${pedido.direccion}</td>
                            <td>${pedido.estado}</td>
                            <td>${pedido.fechaCreacion}</td>
                            <td>$${pedido.total}</td>
                            <td><span style="color: green;">✓ EN CAMINO</span></td>
                        </tr>`;
                    tbody.innerHTML += fila;
                });
            })
            .catch(error => {
                console.error("❌ Error:", error);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" style="text-align: center; color: red;">Error al buscar pedidos</td>
                    </tr>`;
            });
    }

    // Buscar mientras el usuario escribe
    inputBuscar.addEventListener("keyup", () => {
        buscarPedidos(inputBuscar.value);
    });

    // Evitar que el botón recargue la página
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        buscarPedidos(inputBuscar.value);
    });
});

/* ============================================
   BÚSQUEDA DE INVENTARIO
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
    const inputBuscar = document.getElementById("buscar-inventario");
    const form = document.getElementById("form-busqueda-inventario");
    const tbody = document.querySelector("#tabla-productos tbody");

    /**
     * Busca productos en el inventario
     * @param {string} valor - Término de búsqueda
     */
    function buscarInventario(valor) {
        const texto = valor.trim();

        // Si no hay texto, muestra un mensaje
        if (texto === "") {
            tbody.innerHTML = `
                <tr>
                    <td colspan="13" style="text-align: center;">⚠️ Escriba algo para buscar</td>
                </tr>`;
            return;
        }

        // Envía la búsqueda al servidor
        fetch("/api/inventario/buscar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ buscar: texto })
        })
            .then(res => {
                if (!res.ok) throw new Error("Error en la respuesta del servidor");
                return res.json();
            })
            .then(data => {
                tbody.innerHTML = "";

                // Si no hay resultados
                if (data.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="13" style="text-align: center;">❌ No se encontraron resultados</td>
                        </tr>`;
                    return;
                }

                // Muestra los resultados
                data.forEach(inventario => {
                    const fila = `
                        <tr>
                            <td>${inventario.idInventario}</td>
                            <td>${inventario.nombre}</td>
                            <td>${inventario.precio}</td>
                            <td>${inventario.categoria}</td>
                            <td>${inventario.descripcion}</td>
                            <td>${inventario.estado}</td>
                            <td>${inventario.cantidadDisponible}</td>
                            <td>${inventario.ubicacion}</td>
                            <td><img src="/proyecto/imagenes/${inventario.imagen}" width="50" alt="imagen"></td>
                            <td>${inventario.fechaCaducidad}</td>
                            <td>${inventario.fechaActualizacion}</td>
                            <td><button class="actualizar" onclick="actualizarProducto(${inventario.idInventario})">Actualizar</button></td>
                            <td><button class="eliminar" onclick="eliminarProducto(${inventario.idInventario})">Eliminar</button></td>
                        </tr>`;
                    tbody.innerHTML += fila;
                });
            })
            .catch(error => {
                console.error("❌ Error:", error);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="13" style="text-align: center; color: red;">⚠️ Error al buscar</td>
                    </tr>`;
            });
    }

    // Buscar mientras el usuario escribe
    inputBuscar.addEventListener("keyup", () => {
        buscarInventario(inputBuscar.value);
    });

    // Evitar que el botón recargue la página
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        buscarInventario(inputBuscar.value);
    });
});

/* ============================================
   GESTIÓN DE FOTO DE PERFIL
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
    const avatarImg = document.getElementById("avatar-imagen");
    const avatarIniciales = document.getElementById("avatar-iniciales");
    const inputFoto = document.getElementById("input-foto");

    // Obtiene el ID del usuario de sessionStorage
    const usuarioId = sessionStorage.getItem("usuarioId") || 1;

    // Obtiene la foto del usuario desde el servidor
    fetch(`/usuarios/${usuarioId}/foto`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.ruta) {
                // Si hay foto, la muestra
                avatarImg.src = data.ruta;
                avatarImg.style.display = "block";
                avatarIniciales.style.display = "none";
            } else {
                // Si no hay foto, muestra las iniciales
                const iniciales = data.iniciales || "AD";
                avatarIniciales.textContent = iniciales;
                avatarImg.style.display = "none";
                avatarIniciales.style.display = "flex";
            }
        })
        .catch(error => {
            console.error("❌ Error obteniendo foto:", error);
        });

    // Maneja la subida de nueva foto
    inputFoto.addEventListener("change", () => {
        const archivo = inputFoto.files[0];
        if (!archivo) return;

        const formData = new FormData();
        formData.append("foto", archivo);

        // Envía la foto al servidor
        fetch(`/usuarios/${usuarioId}/foto`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Actualiza la imagen
                    avatarImg.src = data.ruta;
                    avatarImg.style.display = "block";
                    avatarIniciales.style.display = "none";
                } else {
                    alert("❌ " + data.message);
                }
            })
            .catch(error => {
                console.error("❌ Error subiendo imagen:", error);
            });
    });
});

/* ============================================
   CERRAR SESIÓN
   ============================================ */

document.getElementById("cerrar_sesion").addEventListener("click", function(e) {
    e.preventDefault();
    localStorage.clear(); // Limpia datos locales
    window.location.href = "/logout"; // Llama al endpoint de Spring
});

/* ============================================
   CERRAR MODALES AL HACER CLIC FUERA
   ============================================ */

// Cierra los modales si se hace clic fuera de ellos
window.onclick = function(event) {
    const modalAsignar = document.getElementById('modal-asignar');
    const modalEditar = document.getElementById('modal-editar-producto');

    if (event.target === modalAsignar) {
        modalAsignar.style.display = 'none';
    }

    if (event.target === modalEditar) {
        modalEditar.style.display = 'none';
    }
}