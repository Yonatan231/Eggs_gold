

// Seleccionar el botón de menú (hamburguesa)
const btntoggle = document.querySelector('.toggle-btn');

// Al hacer clic, mostrar u ocultar el menú
btntoggle.addEventListener('click', function() {
    // Toggle agrega o quita la clase 'active'
    document.getElementById('sidebar').classList.toggle('active');
});


/* ============================================
   CARGAR PEDIDOS EN LA TABLA
   Función principal que obtiene todos los pedidos
   y los muestra según el rol del usuario
   ============================================ */

// Ejecutar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", cargarPedidosRecientes);

function cargarPedidosRecientes() {
    // Hacer petición al servidor para obtener pedidos
    fetch("http://localhost:8080/api/pedido/listar")
        .then(response => response.json())
        .then(data => {
            // Verificar si la petición fue exitosa
            if (!data.success) {
                alert("No se pudieron cargar los pedidos.");
                return;
            }

            // Obtener el rol del usuario y la lista de pedidos
            const rol = data.rol;
            const pedidos = data.pedidos;
            const tbody = document.querySelector("#tabla-pedidos tbody");

            // Limpiar tabla antes de agregar nuevos datos
            tbody.innerHTML = "";

            // Si no hay pedidos, mostrar mensaje
            if (pedidos.length === 0) {
                const fila = document.createElement("tr");
                fila.innerHTML = `<td colspan="9">No hay pedidos para mostrar.</td>`;
                tbody.appendChild(fila);
                return;
            }

            // Recorrer cada pedido y crear una fila en la tabla
            pedidos.forEach(p => {
                const fila = document.createElement("tr");

                // Llenar las celdas con la información del pedido
                fila.innerHTML = `
                    <td>${p.idPedidos}</td>
                    <td>${p.nombreUsuario}</td>
                    <td colspan="2">${p.productos.join(", ")}</td>
                    <td>${p.direccion}</td>
                    <td>${p.estado}</td>
                    <td>${new Date(p.fechaCreacion).toLocaleString()}</td>
                    <td>$${p.total}</td>
                `;

                // Crear celda de acciones según el rol y estado
                const tdAccion = document.createElement("td");

                // ADMIN puede aprobar o rechazar pedidos pendientes
                if (rol === 'ADMIN' && p.estado === 'Pendiente') {
                    tdAccion.innerHTML = `
                        <button class="btn-accion btn-success" onclick="actualizarEstado(${p.idPedidos}, 'APROBADO')">Aceptar</button>
                        <button class="btn-accion btn-danger" onclick="actualizarEstado(${p.idPedidos}, 'RECHAZADO')">Denegar</button>
                    `;
                }
                // LOGISTICA puede asignar pedidos aprobados
                else if (rol == "LOGISTICA" && p.estado === 'Aprobado') {
                    tdAccion.innerHTML = `<button class="btn-accion btn-primary" onclick="asignarPedido(${p.idPedidos})">Asignar</button>`;
                }
                // Mostrar estado si ya está procesado
                else if (rol == "ADMIN" && p.estado === 'Aprobado') {
                    tdAccion.innerHTML = `<span class="estado-aprobado">✓ Aprobado</span>`;
                } else if (rol == "ADMIN" && p.estado === 'Rechazado') {
                    tdAccion.innerHTML = `<span class="estado-rechazado">✖ Rechazado</span>`;
                } else if (rol == "ADMIN" && p.estado === 'En_camino') {
                    tdAccion.innerHTML = `<span class="estado-en-camino">✓ En camino</span>`;
                } else if (rol == "ADMIN" && p.estado === 'Asignado') {
                    tdAccion.innerHTML = `<span class="estado-aprobado">✓ Asignado</span>`;
                } else {
                    tdAccion.innerHTML = "—";
                }

                // Agregar celda de acción a la fila
                fila.appendChild(tdAccion);

                // Agregar fila completa a la tabla
                tbody.appendChild(fila);
            });
        })
        .catch(err => {
            console.error("Error al cargar pedidos:", err);
        });
}


/* ============================================
   ACTUALIZAR ESTADO DE PEDIDO
   Permite aprobar o rechazar pedidos
   ============================================ */

function actualizarEstado(idPedido, nuevoEstado) {
    // Crear formulario con los datos
    const formData = new FormData();
    formData.append('id_pedido', idPedido);
    formData.append('estado', nuevoEstado);

    // Enviar petición al servidor
    fetch('/api/pedido/actualizar-estado', {
        method: 'POST',
        body: formData
    })
        .then(resp => resp.json())
        .then(data => {
            if (data.success) {
                alert("✅ Pedido actualizado correctamente");
                // Recargar la tabla de pedidos
                cargarPedidosRecientes();
            } else {
                alert("❌ Error al actualizar: " + (data.error || "desconocido"));
            }
        })
        .catch(error => {
            console.error('❌ Error al actualizar estado:', error);
            alert("❌ Error técnico. Ver consola.");
        });
}

/* ============================================
   CARGAR PRODUCTOS EN LA TABLA
   Muestra todos los productos
   ============================================ */

function cargarProductos() {
    fetch("/api/productos")
        .then(response => response.json())
        .then(productos => {
            const tabla = document.querySelector("#tabla-productos tbody");
            tabla.innerHTML = "";

            productos.forEach(producto => {
                const fila = document.createElement("tr");

                // Crear celdas con la información del producto
                const id = document.createElement("td");
                id.textContent = producto.idProducto;

                const nombre = document.createElement("td");
                nombre.textContent = producto.nombre;

                const precio = document.createElement("td");
                precio.textContent = `$${parseInt(producto.precio).toLocaleString("es-CO")}`;

                const categoria = document.createElement("td");
                categoria.textContent = producto.categoria;

                const descripcion = document.createElement("td");
                descripcion.textContent = producto.descripcion;

                const estado = document.createElement("td");
                estado.textContent = producto.estado;

                // Crear celda con imagen del producto
                const imagen = document.createElement("td");
                const imgTag = document.createElement("img");

                // ✅ CORREGIDO: Validar que la imagen existe antes de mostrarla
                if (producto.imagen && producto.imagen.trim() !== '') {
                    imgTag.src = `/uploads/productos/${producto.imagen.trim()}`;
                    imgTag.alt = producto.nombre;
                    imgTag.width = 50;
                    imgTag.height = 50;
                } else {
                    // Imagen por defecto si no hay imagen
                    imgTag.src = '/uploads/productos/default.png';
                    imgTag.alt = 'Sin imagen';
                    imgTag.width = 50;
                    imgTag.height = 50;
                }
                imagen.appendChild(imgTag);

                // Botón para actualizar producto
                const tdActualizar = document.createElement("td");
                const btnActualizar = document.createElement("button");
                btnActualizar.textContent = "✏️ Actualizar";
                btnActualizar.className = "btn-accion btn-primary";
                btnActualizar.onclick = () => abrirModalActualizar(producto);
                tdActualizar.appendChild(btnActualizar);

                // Botón para descontinuar producto
                const tdEliminar = document.createElement("td");
                const btnEliminar = document.createElement("button");
                btnEliminar.textContent = "🗑️ Descontinuar";
                btnEliminar.className = "btn-accion btn-danger";
                btnEliminar.onclick = () => eliminarProducto(producto.idProducto);
                tdEliminar.appendChild(btnEliminar);

                fila.appendChild(id);
                fila.appendChild(nombre);
                fila.appendChild(precio);
                fila.appendChild(categoria);
                fila.appendChild(descripcion);
                fila.appendChild(estado);
                fila.appendChild(imagen);
                fila.appendChild(tdActualizar);

                // Agregar fila completa a la tabla
                tabla.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("❌ Error al cargar productos:", error);
            alert("❌ No se pudieron cargar los productos.");
        });
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", cargarProductos);
/* ============================================
   CARGAR CLIENTES EN LA TABLA
   Muestra todos los usuarios con rol CLIENTE
   ============================================ */

function cargarProductosCliente() {
    fetch("http://localhost:8080/clientes/pedidos")
        .then(resultado => resultado.json())
        .then(datos => {
            const clientes = datos;
            const tabla = document.querySelector("#tabla-clientes tbody");
            tabla.innerHTML = ""; // Limpiar tabla

            // Recorrer cada cliente
            clientes.forEach(cliente => {
                const fila = document.createElement("tr");

                // Crear celdas con información del cliente
                const id = document.createElement("td");
                id.textContent = cliente.idUsuarios;

                const nombre = document.createElement("td");
                nombre.textContent = cliente.nombre;

                const apellido = document.createElement("td");
                apellido.textContent = cliente.apellido;

                const documento = document.createElement("td");
                documento.textContent = cliente.numDocumento;

                const direccion = document.createElement("td");
                direccion.textContent = cliente.direccionUsuario;

                const telefono = document.createElement("td");
                telefono.textContent = cliente.telefono;

                // Botón para actualizar cliente
                const actualizar = document.createElement("td");
                const btnActualizar = document.createElement("button");
                btnActualizar.textContent = "✏️ Actualizar";
                btnActualizar.className = "btn-accion btn-primary";
                btnActualizar.onclick = () => abrirModalActualizarCliente(cliente);
                actualizar.appendChild(btnActualizar);

                // Botón para eliminar cliente
                const eliminarBtn = document.createElement("button");
                eliminarBtn.textContent = "🗑️ Eliminar";
                eliminarBtn.className = "btn-accion btn-danger";
                eliminarBtn.addEventListener("click", () => eliminarProductoCliente(cliente.idUsuarios));

                const tdEliminar = document.createElement("td");
                tdEliminar.appendChild(eliminarBtn);

                // Agregar todas las celdas a la fila
                fila.appendChild(id);
                fila.appendChild(nombre);
                fila.appendChild(apellido);
                fila.appendChild(documento);
                fila.appendChild(direccion);
                fila.appendChild(telefono);
                fila.appendChild(actualizar);
                fila.appendChild(tdEliminar);

                // Agregar fila a la tabla
                tabla.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("✖️ Error al cargar los clientes", error);
            alert("✖️ Error al cargar los clientes");
        });
}

// Ejecutar al cargar la página
cargarProductosCliente();


/* ============================================
   CARGAR CONDUCTORES EN LA TABLA
   Muestra todos los conductores registrados
   ============================================ */

function cargarProductosConductores() {
    fetch("http://localhost:8080/conductores/pedidos-entregados")
        .then(respuesta => respuesta.json())
        .then(datos => {
            const conductores = datos;
            const tabla = document.querySelector("#tabla-conductores tbody");
            tabla.innerHTML = ""; // Limpiar tabla

            // Recorrer cada conductor
            conductores.forEach(conductor => {
                const fila = document.createElement("tr");

                // Crear celdas con información del conductor
                const id = document.createElement("td");
                id.textContent = conductor.idConductor;

                const nombre = document.createElement("td");
                nombre.textContent = conductor.nombre;

                const apellido = document.createElement("td");
                apellido.textContent = conductor.apellido;

                const documento = document.createElement("td");
                documento.textContent = conductor.numDocumento;

                const direccion = document.createElement("td");
                direccion.textContent = conductor.direccionUsuario;

                const telefono = document.createElement("td");
                telefono.textContent = conductor.telefono;

                // Botón para actualizar conductor
                const actualizar = document.createElement("td");
                const btnActualizar = document.createElement("button");
                btnActualizar.textContent = "✏️ Actualizar";
                btnActualizar.className = "btn-accion btn-primary";
                btnActualizar.onclick = () => abrirModalActualizarConductores(conductor);
                actualizar.appendChild(btnActualizar);

                // Botón para eliminar conductor
                const eliminarBtn = document.createElement("button");
                eliminarBtn.textContent = "🗑️ Eliminar";
                eliminarBtn.className = "btn-accion btn-danger";
                eliminarBtn.addEventListener("click", () =>
                    eliminarProductoConductores(conductor.idUsuarios || conductor.idConductor)
                );

                const tdEliminar = document.createElement("td");
                tdEliminar.appendChild(eliminarBtn);

                // Agregar todas las celdas a la fila
                fila.appendChild(id);
                fila.appendChild(nombre);
                fila.appendChild(apellido);
                fila.appendChild(documento);
                fila.appendChild(direccion);
                fila.appendChild(telefono);
                fila.appendChild(actualizar);
                fila.appendChild(tdEliminar);

                // Agregar fila a la tabla
                tabla.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("✖️ Error al cargar los conductores", error);
            alert("✖️ Error al cargar los conductores");
        });
}

// Ejecutar al cargar la página
cargarProductosConductores();


/* ============================================
   CARGAR PERSONAL DE LOGÍSTICA EN LA TABLA
   Muestra todo el personal de logística
   ============================================ */

function cargarProductosLogistica() {
    fetch("http://localhost:8080/logistica/ver")
        .then(respuesta => respuesta.json())
        .then(datos => {
            const logistica = datos;
            const tabla = document.querySelector("#tabla-logistica tbody");
            tabla.innerHTML = ""; // Limpiar tabla

            // Recorrer cada persona de logística
            logistica.forEach(logistica => {
                const fila = document.createElement("tr");

                // Crear celdas con información
                const id = document.createElement("td");
                id.textContent = logistica.idUsuarios;

                const nombre = document.createElement("td");
                nombre.textContent = logistica.nombre;

                const apellido = document.createElement("td");
                apellido.textContent = logistica.apellido;

                const documento = document.createElement("td");
                documento.textContent = logistica.numDocumento;

                const direccion = document.createElement("td");
                direccion.textContent = logistica.direccionUsuario;

                const telefono = document.createElement("td");
                telefono.textContent = logistica.telefono;

                // Botón para actualizar
                const actualizar = document.createElement("td");
                const btnActualizar = document.createElement("button");
                btnActualizar.textContent = "✏️ Actualizar";
                btnActualizar.className = "btn-accion btn-primary";
                btnActualizar.onclick = () => abrirModalActualizarLogistica(logistica);
                actualizar.appendChild(btnActualizar);

                // Botón para eliminar
                const eliminarBtn = document.createElement("button");
                eliminarBtn.textContent = "🗑️ Eliminar";
                eliminarBtn.className = "btn-accion btn-danger";
                eliminarBtn.addEventListener("click", () => eliminarLogistica(logistica.idUsuarios));

                const tdEliminar = document.createElement("td");
                tdEliminar.appendChild(eliminarBtn);

                // Agregar todas las celdas a la fila
                fila.appendChild(id);
                fila.appendChild(nombre);
                fila.appendChild(apellido);
                fila.appendChild(documento);
                fila.appendChild(direccion);
                fila.appendChild(telefono);
                fila.appendChild(actualizar);
                fila.appendChild(tdEliminar);

                // Agregar fila a la tabla
                tabla.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("✖️ Error al cargar logística", error);
            alert("✖️ Error al cargar logística");
        });
}

// Ejecutar al cargar la página
cargarProductosLogistica();


/* ============================================
   MODALES - ACTUALIZAR PRODUCTOS
   ============================================ */

// Abrir modal y llenar con datos del producto
function abrirModalActualizar(producto) {
    document.getElementById("update-id").value = producto.idProducto;
    document.getElementById("update-nombre").value = producto.nombre;
    document.getElementById("update-precio").value = producto.precio;
    document.getElementById("update-categoria").value = producto.categoria;
    document.getElementById("update-descripcion").value = producto.descripcion;
    document.getElementById("update-estado").value = producto.estado;

    // Mostrar el modal
    document.getElementById("modalActualizar").style.display = "block";
}

// Cerrar modal
function cerrarModal() {
    document.getElementById("modalActualizar").style.display = "none";
}

// Enviar formulario de actualización de producto
document.getElementById("formActualizarProducto").addEventListener("submit", function(e) {
    e.preventDefault();

    const id = document.getElementById("update-id").value;

    // Construir objeto con los datos del producto (sin cantidad)
    const producto = {
        nombre: document.getElementById("update-nombre").value,
        precio: parseFloat(document.getElementById("update-precio").value),
        categoria: document.getElementById("update-categoria").value,
        descripcion: document.getElementById("update-descripcion").value,
        estado: document.getElementById("update-estado").value
    };

    console.log("📦 Enviando producto:", producto);

    // ✅ CORREGIDO: Endpoint actualizado
    fetch(`/api/productos/actualizar/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(producto)
    })
        .then(resp => resp.json())
        .then(data => {
            if (data.success) {
                alert("✅ Producto actualizado correctamente.");
                cerrarModal();
                cargarProductos();
            } else {
                alert("❌ Error al actualizar: " + (data.error || "desconocido"));
            }
        })
        .catch(error => {
            console.error("❌ Error en la solicitud:", error);
            alert("❌ Fallo en la conexión.");
        });
});


/* ============================================
   ELIMINAR PRODUCTO
   ============================================ */

function eliminarProducto(id) {
    if (confirm("¿Estás seguro de que quieres marcar este producto como DESCONTINUADO?")) {
        // ✅ CORREGIDO: Endpoint actualizado
        fetch(`/api/productos/descontinuar?id=${id}`, {
            method: "PUT"
        })
            .then(response => response.text())
            .then(data => {
                alert(data);
                cargarProductos();
            })
            .catch(error => {
                console.error("❌ Error al descontinuar el producto:", error);
                alert("❌ No se pudo descontinuar el producto.");
            });
    }
}


/* ============================================
   MODALES - ACTUALIZAR CLIENTES
   ============================================ */

// Abrir modal y llenar con datos del cliente
function abrirModalActualizarCliente(cliente) {
    document.getElementById("updatec-id").value = cliente.idUsuarios;
    console.log("🆔 ID asignado al input:", document.getElementById("updatec-id").value);
    console.log("📄 Cliente recibido:", cliente);

    document.getElementById("updatec-nombre").value = cliente.nombre;
    document.getElementById("updatec-apellido").value = cliente.apellido;
    document.getElementById("updatec-documento").value = cliente.numDocumento;
    document.getElementById("updatec-direccion").value = cliente.direccionUsuario;
    document.getElementById("updatec-telefono").value = cliente.telefono;

    // Mostrar el modal
    document.getElementById("modalActualizarClientes").style.display = "block";
}

// Cerrar modal
function cerrarModalCliente() {
    document.getElementById("modalActualizarClientes").style.display = "none";
}

// Enviar formulario de actualización de cliente
document.getElementById("formActualizarClientes").addEventListener("submit", function(e) {
    e.preventDefault();

    // Construir objeto con los datos del usuario
    const usuario = {
        nombre: document.getElementById("updatec-nombre").value,
        apellido: document.getElementById("updatec-apellido").value,
        numDocumento: document.getElementById("updatec-documento").value,
        direccionUsuario: document.getElementById("updatec-direccion").value,
        telefono: document.getElementById("updatec-telefono").value
    };

    const id = document.getElementById("updatec-id").value;

    // Enviar petición PUT al servidor
    fetch(`http://localhost:8080/usuarios/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usuario)
    })
        .then(resp => resp.json())
        .then(data => {
            if (data.success) {
                alert("✅ Cliente actualizado correctamente.");
                cerrarModalCliente();
                cargarProductosCliente(); // Recargar tabla
            } else {
                alert("❌ Error al actualizar: " + (data.error || "desconocido"));
            }
        })
        .catch(error => {
            console.error("❌ Error en la solicitud:", error);
            alert("❌ Fallo en la conexión.");
        });
});


/* ============================================
   ELIMINAR CLIENTE
   ============================================ */

function eliminarProductoCliente(id) {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
        fetch(`/eliminar/${id}`, {
            method: "PUT"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error en la petición al backend");
                }
                return response.text();
            })
            .then(data => {
                alert(data);
                location.reload(); // Recargar página
            })
            .catch(error => {
                console.error("❌ Error al eliminar el cliente:", error);
                alert("❌ No se pudo eliminar el cliente.");
            });
    }
}


/* ============================================
   MODALES - ACTUALIZAR CONDUCTORES
   ============================================ */

// Abrir modal y llenar con datos del conductor
function abrirModalActualizarConductores(conductor) {
    document.getElementById("updateco-id").value = conductor.idUsuarios || conductor.idConductor;
    console.log("🆔 ID asignado al input:", document.getElementById("updateco-id").value);
    console.log("📄 Conductor recibido:", conductor);

    document.getElementById("updateco-nombre").value = conductor.nombre;
    document.getElementById("updateco-apellido").value = conductor.apellido;
    document.getElementById("updateco-documento").value = conductor.numDocumento;
    document.getElementById("updateco-direccion").value = conductor.direccionUsuario;
    document.getElementById("updateco-telefono").value = conductor.telefono;

    // Mostrar el modal
    document.getElementById("modalActualizarConductores").style.display = "block";
}

// Cerrar modal
function cerrarModalConductores() {
    document.getElementById("modalActualizarConductores").style.display = "none";
}

// Enviar formulario de actualización de conductor
document.getElementById("formActualizarConductores").addEventListener("submit", function(e) {
    e.preventDefault();

    const usuario = {
        nombre: document.getElementById("updateco-nombre").value,
        apellido: document.getElementById("updateco-apellido").value,
        numDocumento: document.getElementById("updateco-documento").value,
        direccionUsuario: document.getElementById("updateco-direccion").value,
        telefono: document.getElementById("updateco-telefono").value
    };

    const id = document.getElementById("updateco-id").value;

    fetch(`http://localhost:8080/usuarios/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usuario)
    })
        .then(resp => resp.json())
        .then(data => {
            if (data.success) {
                alert("✅ Conductor actualizado correctamente.");
                cerrarModalConductores();
                cargarProductosConductores();
            } else {
                alert("❌ Error al actualizar: " + (data.error || "desconocido"));
            }
        })
        .catch(error => {
            console.error("❌ Error en la solicitud:", error);
            alert("❌ Fallo en la conexión.");
        });
});


/* ============================================
   ELIMINAR CONDUCTOR
   ============================================ */

function eliminarProductoConductores(id) {
    if (confirm("¿Estás seguro de que quieres eliminar este conductor?")) {
        fetch(`/eliminar/${id}`, {
            method: "PUT"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error en la petición al backend");
                }
                return response.text();
            })
            .then(data => {
                alert(data);
                location.reload();
            })
            .catch(error => {
                console.error("❌ Error al eliminar el conductor:", error);
                alert("❌ No se pudo eliminar el conductor.");
            });
    }
}


/* ============================================
   MODALES - ACTUALIZAR LOGÍSTICA
   ============================================ */

// Abrir modal y llenar con datos
function abrirModalActualizarLogistica(logistica) {
    document.getElementById("updateL-id").value = logistica.idUsuarios;
    console.log("🆔 ID asignado al input:", document.getElementById("updateL-id").value);
    console.log("📄 Logística recibido:", logistica);

    document.getElementById("updateL-nombre").value = logistica.nombre;
    document.getElementById("updateL-apellido").value = logistica.apellido;
    document.getElementById("updateL-documento").value = logistica.numDocumento;
    document.getElementById("updateL-direccion").value = logistica.direccionUsuario;
    document.getElementById("updateL-telefono").value = logistica.telefono;

    // Mostrar el modal
    document.getElementById("modalActualizarLogistica").style.display = "block";
}

// Cerrar modal
function cerrarModalLogistica() {
    document.getElementById("modalActualizarLogistica").style.display = "none";
}

// Enviar formulario
document.getElementById("formActualizarLogistica").addEventListener("submit", function(e) {
    e.preventDefault();

    const usuario = {
        nombre: document.getElementById("updateL-nombre").value,
        apellido: document.getElementById("updateL-apellido").value,
        numDocumento: document.getElementById("updateL-documento").value,
        direccionUsuario: document.getElementById("updateL-direccion").value,
        telefono: document.getElementById("updateL-telefono").value
    };

    const id = document.getElementById("updateL-id").value;

    fetch(`http://localhost:8080/usuarios/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usuario)
    })
        .then(resp => resp.json())
        .then(data => {
            if (data.success) {
                alert("✅ Logística actualizado correctamente.");
                cerrarModalLogistica();
                cargarProductosLogistica();
            } else {
                alert("❌ Error al actualizar: " + (data.error || "desconocido"));
            }
        })
        .catch(error => {
            console.error("❌ Error en la solicitud:", error);
            alert("❌ Fallo en la conexión.");
        });
});


/* ============================================
   ELIMINAR PERSONAL DE LOGÍSTICA
   ============================================ */

function eliminarLogistica(id) {
    if (confirm("¿Estás seguro de que quieres eliminar logística?")) {
        fetch(`/eliminar/${id}`, {
            method: "PUT"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error en la petición al backend");
                }
                return response.text();
            })
            .then(data => {
                alert(data);
                location.reload();
            })
            .catch(error => {
                console.error("❌ Error al eliminar logística:", error);
                alert("❌ No se pudo eliminar logística");
            });
    }
}


/* ============================================
   FUNCIÓN PARA RENDERIZAR ESTADO DE PEDIDO
   Devuelve HTML con colores según el estado
   ============================================ */

function renderEstadoPedido(estado) {
    switch (estado) {
        case 'DISPONIBLE':
            return `<span style="color: green;">✓ DISPONIBLE</span>`;
        case 'EN CAMINO':
            return `<span style="color: orange;">🚚 EN CAMINO</span>`;
        case 'ENTREGADO':
            return `<span style="color: blue;">📦 ENTREGADO</span>`;
        case 'ASIGNADO':
            return `<span style="color: teal;">📌 ASIGNADO</span>`;
        case 'PENDIENTE':
            return `<span style="color: gray;">⏳ PENDIENTE</span>`;
        case 'APROBADO':
            return `<span style="color: darkgreen;">✅ APROBADO</span>`;
        case 'RECHAZADO':
            return `<span style="color: red;">❌ RECHAZADO</span>`;
        default:
            return `<span>${estado}</span>`;
    }
}


/* ============================================
   BÚSQUEDA DE PEDIDOS
   Busca pedidos por ID, cliente o estado
   ============================================ */

document.addEventListener("DOMContentLoaded", function() {
    const inputBuscar = document.getElementById("buscar");
    const form = document.getElementById("form-busqueda-pedidos");
    const tbody = document.querySelector("#tabla-pedidos tbody");

    function buscarPedidos(valor) {
        const texto = valor.trim();

        // Si está vacío, mostrar todos los pedidos
        if (texto === "") {
            cargarPedidosRecientes();
            return;
        }

        // Enviar búsqueda al servidor
        fetch("/api/pedidos/buscar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ buscar: texto })
        })
            .then(res => res.json())
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

                // Mostrar resultados
                data.forEach(pedido => {
                    const fila = `
                    <tr>
                        <td>${pedido.idPedidos}</td>
                        <td>${pedido.nombreUsuario}</td>
                        <td>${pedido.nombreProducto}</td>
                        <td>${pedido.cantidad}</td>
                        <td>${pedido.direccion}</td>
                        <td>${pedido.estado}</td>
                        <td>${pedido.fechaCreacion}</td>
                        <td>${pedido.total}</td>           
                        <td>${renderEstadoPedido(pedido.estado)}</td>
                    </tr>`;
                    tbody.innerHTML += fila;
                });
            })
            .catch(error => {
                console.error("❌ Error:", error);
                tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center;">❌ Error al buscar pedidos</td>
                </tr>`;
            });
    }

    // Buscar mientras escribe
    inputBuscar.addEventListener("keyup", () => {
        buscarPedidos(inputBuscar.value);
    });

    // Buscar al enviar formulario
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        buscarPedidos(inputBuscar.value);
    });
});


/* ============================================
   BÚSQUEDA DE PRODUCTOS
   ============================================ */

document.addEventListener("DOMContentLoaded", function() {
    const inputBuscar = document.getElementById("buscar_producto");
    const form = document.getElementById("form-busqueda-productos");
    const tbody = document.querySelector("#tabla-productos tbody");

    function buscarProductos(valor) {
        const texto = valor.trim();

        if (texto === "") {
            cargarProductos();
            return;
        }

        fetch("/api/productos/buscar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ buscar: texto })
        })
            .then(res => res.json())
            .then(data => {
                tbody.innerHTML = "";

                if (data.length === 0) {
                    tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center;">❌ No se encontraron resultados</td>
                    </tr>`;
                    return;
                }

                data.forEach(producto => {
                    const fila = document.createElement("tr");

                    // Crear todas las celdas (sin cantidad)
                    const tdId = document.createElement("td");
                    tdId.textContent = producto.idProducto;

                    const tdNombre = document.createElement("td");
                    tdNombre.textContent = producto.nombre;

                    const tdPrecio = document.createElement("td");
                    tdPrecio.textContent = `$${parseInt(producto.precio).toLocaleString("es-CO")}`;

                    const tdCategoria = document.createElement("td");
                    tdCategoria.textContent = producto.categoria;

                    const tdDescripcion = document.createElement("td");
                    tdDescripcion.textContent = producto.descripcion;

                    const tdEstado = document.createElement("td");
                    tdEstado.textContent = producto.estado;

                    const tdImagen = document.createElement("td");
                    const img = document.createElement("img");
                    img.src = `/uploads/productos/${producto.imagen}`;
                    img.width = 50;
                    img.alt = "Producto";
                    tdImagen.appendChild(img);

                    // Botones
                    const tdActualizar = document.createElement("td");
                    const btnActualizar = document.createElement("button");
                    btnActualizar.textContent = "✏️ Actualizar";
                    btnActualizar.className = "btn-accion btn-primary";
                    btnActualizar.onclick = () => abrirModalActualizar(producto);
                    tdActualizar.appendChild(btnActualizar);

                    const tdEliminar = document.createElement("td");
                    const btnEliminar = document.createElement("button");
                    btnEliminar.textContent = "🗑️ Eliminar";
                    btnEliminar.className = "btn-accion btn-danger";
                    btnEliminar.onclick = () => eliminarProducto(producto.idProducto);
                    tdEliminar.appendChild(btnEliminar);

                    // Agregar todas las celdas (sin cantidad)
                    fila.appendChild(tdId);
                    fila.appendChild(tdNombre);
                    fila.appendChild(tdPrecio);
                    fila.appendChild(tdCategoria);
                    fila.appendChild(tdDescripcion);
                    fila.appendChild(tdEstado);
                    fila.appendChild(tdImagen);
                    fila.appendChild(tdActualizar);
                    fila.appendChild(tdEliminar);

                    tbody.appendChild(fila);
                });
            })
            .catch(error => {
                console.error("❌ Error:", error);
                tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center;">❌ Error al buscar productos</td>
                </tr>`;
            });
    }

    inputBuscar.addEventListener("keyup", () => {
        buscarProductos(inputBuscar.value);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        buscarProductos(inputBuscar.value);
    });
});

/* ============================================
   BÚSQUEDA DE CLIENTES
   ============================================ */

document.addEventListener("DOMContentLoaded", function() {
    const inputBuscar = document.getElementById("buscar_cliente");
    const form = document.getElementById("form-busqueda-clientes");
    const tbody = document.querySelector("#tabla-clientes tbody");

    function buscarClientes(valor) {
        const texto = valor.trim();

        if (texto === "") {
            cargarProductosCliente();
            return;
        }

        // Llamada al endpoint con query param
        fetch(`http://localhost:8080/clientes/activos?buscar=${encodeURIComponent(texto)}`)
            .then(res => res.json())
            .then(data => {
                tbody.innerHTML = "";

                if (data.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="8" style="text-align: center;">❌ No se encontraron resultados</td>
                        </tr>`;
                    return;
                }

                data.forEach(cliente => {
                    const tr = document.createElement("tr");

                    tr.innerHTML = `
                        <td>${cliente.idUsuarios}</td>
                        <td>${cliente.nombre}</td>
                        <td>${cliente.apellido}</td>
                        <td>${cliente.numDocumento}</td>
                        <td>${cliente.direccionUsuario}</td>
                        <td>${cliente.telefono}</td>
                    `;

                    // Botón Actualizar
                    const tdActualizar = document.createElement("td");
                    const btnActualizar = document.createElement("button");
                    btnActualizar.textContent = "✏️ Actualizar";
                    btnActualizar.className = "btn-accion btn-primary";
                    btnActualizar.onclick = () => abrirModalActualizarCliente(cliente);
                    tdActualizar.appendChild(btnActualizar);

                    // Botón Eliminar
                    const tdEliminar = document.createElement("td");
                    const btnEliminar = document.createElement("button");
                    btnEliminar.textContent = "🗑️ Eliminar";
                    btnEliminar.className = "btn-accion btn-danger";
                    btnEliminar.addEventListener("click", () => eliminarProductoCliente(cliente.idUsuarios));
                    tdEliminar.appendChild(btnEliminar);

                    // Agregar botones a la fila
                    tr.appendChild(tdActualizar);
                    tr.appendChild(tdEliminar);

                    // Agregar fila completa
                    tbody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error("❌ Error:", error);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; color: red;">⚠️ Error al conectar con el servidor</td>
                    </tr>`;
            });
    }

    // Buscar mientras escribe
    inputBuscar.addEventListener("keyup", () => {
        buscarClientes(inputBuscar.value);
    });

    // Buscar al enviar formulario
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        buscarClientes(inputBuscar.value);
    });
});


/* ============================================
   BÚSQUEDA DE CONDUCTORES
   ============================================ */

document.addEventListener("DOMContentLoaded", function() {
    const inputBuscar = document.getElementById("buscar_conductor");
    const form = document.getElementById("form-busqueda-conductores");
    const tbody = document.querySelector("#tabla-conductores tbody");

    function buscarConductores(valor) {
        const texto = valor.trim();

        if (texto === "") {
            cargarProductosConductores();
            return;
        }

        fetch(`http://localhost:8080/conductores/activos?buscar=${encodeURIComponent(texto)}`)
            .then(res => res.json())
            .then(data => {
                tbody.innerHTML = "";

                if (!Array.isArray(data) || data.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="8" style="text-align: center;">❌ No se encontraron resultados</td>
                        </tr>`;
                    return;
                }

                data.forEach(conductor => {
                    const tr = document.createElement("tr");

                    tr.innerHTML = `
                        <td>${conductor.idUsuarios}</td>
                        <td>${conductor.nombre}</td>
                        <td>${conductor.apellido}</td>
                        <td>${conductor.numDocumento}</td>
                        <td>${conductor.direccionUsuario}</td>
                        <td>${conductor.telefono}</td>
                    `;

                    // Botón Actualizar
                    const tdActualizar = document.createElement("td");
                    const btnActualizar = document.createElement("button");
                    btnActualizar.textContent = "✏️ Actualizar";
                    btnActualizar.className = "btn-accion btn-primary";
                    btnActualizar.onclick = () => abrirModalActualizarConductores(conductor);
                    tdActualizar.appendChild(btnActualizar);

                    // Botón Eliminar
                    const tdEliminar = document.createElement("td");
                    const btnEliminar = document.createElement("button");
                    btnEliminar.textContent = "🗑️ Eliminar";
                    btnEliminar.className = "btn-accion btn-danger";
                    btnEliminar.addEventListener("click", () =>
                        eliminarProductoConductores(conductor.idUsuarios || conductor.idConductor)
                    );
                    tdEliminar.appendChild(btnEliminar);

                    // Agregar botones a la fila
                    tr.appendChild(tdActualizar);
                    tr.appendChild(tdEliminar);

                    // Agregar fila completa
                    tbody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error("❌ Error al buscar conductores:", error);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; color: red;">⚠️ Error al conectar con el servidor</td>
                    </tr>`;
            });
    }

    // Evento: al escribir en el campo
    inputBuscar.addEventListener("input", function() {
        const valor = this.value;
        buscarConductores(valor);
    });

    // Evento: al enviar el formulario
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        buscarConductores(inputBuscar.value);
    });
});


/* ============================================
   BÚSQUEDA DE LOGÍSTICA
   ============================================ */

document.addEventListener("DOMContentLoaded", function() {
    const inputBuscar = document.getElementById("buscar_logistica");
    const form = document.getElementById("form-busqueda-logistica");
    const tbody = document.querySelector("#tabla-logistica tbody");

    function buscarLogistica(valor) {
        const texto = valor.trim();

        if (texto === "") {
            cargarProductosLogistica();
            return;
        }

        fetch(`http://localhost:8080/logistica/activos?buscar=${encodeURIComponent(texto)}`)
            .then(res => res.json())
            .then(data => {
                tbody.innerHTML = "";

                if (!Array.isArray(data) || data.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="8" style="text-align: center;">❌ No se encontraron resultados</td>
                        </tr>`;
                    return;
                }

                data.forEach(logistica => {
                    const tr = document.createElement("tr");

                    tr.innerHTML = `
                        <td>${logistica.idUsuarios}</td>
                        <td>${logistica.nombre}</td>
                        <td>${logistica.apellido}</td>
                        <td>${logistica.numDocumento}</td>
                        <td>${logistica.direccionUsuario}</td>
                        <td>${logistica.telefono}</td>
                    `;

                    // Botón Actualizar
                    const tdActualizar = document.createElement("td");
                    const btnActualizar = document.createElement("button");
                    btnActualizar.textContent = "✏️ Actualizar";
                    btnActualizar.className = "btn-accion btn-primary";
                    btnActualizar.onclick = () => abrirModalActualizarLogistica(logistica);
                    tdActualizar.appendChild(btnActualizar);

                    // Botón Eliminar
                    const tdEliminar = document.createElement("td");
                    const btnEliminar = document.createElement("button");
                    btnEliminar.textContent = "🗑️ Eliminar";
                    btnEliminar.className = "btn-accion btn-danger";
                    btnEliminar.addEventListener("click", () => eliminarLogistica(logistica.idUsuarios));
                    tdEliminar.appendChild(btnEliminar);

                    // Agregar botones a la fila
                    tr.appendChild(tdActualizar);
                    tr.appendChild(tdEliminar);

                    // Agregar fila completa
                    tbody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error("❌ Error al buscar conductores:", error);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; color: red;">⚠️ Error al conectar con el servidor</td>
                    </tr>`;
            });
    }

    // Evento: al escribir en el campo
    inputBuscar.addEventListener("input", function() {
        const valor = this.value;
        buscarLogistica(valor);
    });

    // Evento: al enviar el formulario
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        buscarLogistica(inputBuscar.value);
    });
});

    /* ============================================
       CARGAR ESTADÍSTICAS DEL DASHBOARD
       Muestra en las tarjetas superiores:
       - Total de usuarios registrados
       - Ventas del día
       - Productos en stock
       ============================================ */

    document.addEventListener("DOMContentLoaded", () => {
        fetch("/api/dashboard")
            .then(response => response.json())
            .then(data => {
                // Actualizar contenido de las tarjetas
                document.getElementById("totalUsuarios").textContent = data.usuarios;
                document.getElementById("totalVentas").textContent = `${data.ventas}`;
                document.getElementById("totalProductos").textContent = data.productos;
            })
            .catch(error => {
                console.error("❌ Error cargando resumen:", error);
            });
    });


    /* ============================================
       DESCARGAR REPORTE PDF
       Abre el PDF en una nueva pestaña
       ============================================ */

// Si existe el botón de ver PDF
    const btnVerPdf = document.getElementById("btn-ver-pdf");
    if (btnVerPdf) {
        btnVerPdf.addEventListener("click", function () {
            window.open("/admin/reportes/pedidos-usuarios", "_blank");
        });
        // === GRÁFICO DE PEDIDOS POR MES ===
        fetch("/admin/api/graficas/pedidos")
            .then(res => res.json())
            .then(data => {
                new Chart(document.getElementById("graficoPedidos"), {
                    type: "bar",
                    data: {
                        labels: data.meses,
                        datasets: [{
                            label: "Pedidos",
                            data: data.valores,
                            borderWidth: 1
                        }]
                    }
                });
            });

// === GRÁFICO DE PRODUCTOS MÁS VENDIDOS ===
        fetch("/admin/api/graficas/productos")
            .then(res => res.json())
            .then(data => {
                new Chart(document.getElementById("graficoProductos"), {
                    type: "pie",
                    data: {
                        labels: data.productos,
                        datasets: [{
                            data: data.cantidades,
                            borderWidth: 1
                        }]
                    }
                });
            });

    }








