// ========== VARIABLES GLOBALES ==========
let listaProductos = []; // Array que almacenará la lista completa de productos
let usuarioId = null; // Se inicializa como null y se obtiene después
let appInicializada = false; // Bandera para evitar inicialización múltiple

// ========== OBTENER ID DEL USUARIO ==========
// Función para obtener el ID del usuario desde diferentes fuentes
function obtenerUsuarioId() {
    // Opción 1: Desde variable global de manejo_sesion.js
    if (window.idSesion) {
        usuarioId = window.idSesion;
        console.log("🆔 ID del usuario desde sesión global:", usuarioId);
        return usuarioId;
    }

    // Opción 2: Desde localStorage
    try {
        const clienteGuardado = JSON.parse(localStorage.getItem("cliente"));
        usuarioId = clienteGuardado?.idUsuarios || clienteGuardado?.id;
        console.log("🆔 ID del usuario desde localStorage:", usuarioId);
        return usuarioId;
    } catch (error) {
        console.error("❌ Error obteniendo ID de usuario:", error);
    }

    // Opción 3: Desde atributo data del body (si lo tienes)
    const bodyUserId = document.body.getAttribute('data-usuario-id');
    if (bodyUserId) {
        usuarioId = parseInt(bodyUserId);
        console.log("🆔 ID del usuario desde body:", usuarioId);
        return usuarioId;
    }

    console.warn("⚠️ No se pudo obtener el ID del usuario");
    return null;
}

// ========== INICIALIZACIÓN AL CARGAR EL DOM ==========
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM completamente cargado");

    // Intenta obtener el ID inmediatamente
    obtenerUsuarioId();

    // Si ya tiene el ID, inicializa
    if (usuarioId) {
        ejecutarInicializacion();
    }
    // Si no, espera al evento de sesión cargada (se maneja abajo)
});

// Escucha el evento de sesión cargada desde manejo_sesion.js
window.addEventListener('sesionCargada', (event) => {
    console.log("🔔 Evento sesionCargada recibido");

    // Actualiza el ID desde el evento
    usuarioId = event.detail.idUsuario;
    console.log("🆔 ID actualizado desde evento:", usuarioId);

    // Solo inicializa si no se ha hecho antes
    if (!appInicializada && usuarioId) {
        ejecutarInicializacion();
    }
});

// Función que ejecuta la inicialización cuando el ID está disponible
function ejecutarInicializacion() {
    // Previene ejecuciones múltiples
    if (appInicializada) {
        console.log("ℹ️ App ya inicializada, omitiendo...");
        return;
    }

    if (!usuarioId) {
        console.warn("⚠️ No se pudo obtener el ID del usuario");
        return;
    }

    console.log("🚀 Iniciando aplicación con usuario:", usuarioId);
    appInicializada = true; // Marca como inicializada

    // Verifica si existe el contenedor de productos y los carga
    if (document.getElementById("productos-container")) {
        cargarProductos();
    }

    // Verifica si existe el contenedor del carrito y lo muestra
    if (document.getElementById("productos-carrito")) {
        mostrarCarrito();
        agregarBotonConfirmar();
    }

    // Actualiza el contador de productos en el carrito
    actualizarContadorCarrito();
}

// ========== CARGAR PRODUCTOS DISPONIBLES ==========
function cargarProductos() {
    console.log("🔄 Cargando productos...");

    fetch("/inventario/disponibles")
        .then(response => response.json())
        .then(productos => {
            console.log("✅ Productos cargados:", productos.length);
            listaProductos = productos;
            mostrarProductos(productos);
        })
        .catch(error => {
            console.error("❌ Error cargando los productos:", error);
            const productosContainer = document.getElementById("productos-container");
            productosContainer.innerHTML = "<p style='text-align: center; padding: 20px;'>❌ Error al cargar los productos. Por favor, recarga la página.</p>";
        });
}

// ========== MOSTRAR PRODUCTOS EN EL DOM ==========
function mostrarProductos(productos) {
    const productosContainer = document.getElementById("productos-container");
    productosContainer.innerHTML = "";

    if (!Array.isArray(productos)) {
        console.error("❌ La respuesta no es un array:", productos);
        productosContainer.innerHTML = "<p style='text-align: center; padding: 20px;'>No se pudieron cargar los productos.</p>";
        return;
    }

    if (productos.length === 0) {
        productosContainer.innerHTML = "<p style='text-align: center; padding: 20px;'>No hay productos disponibles en este momento.</p>";
        return;
    }

    productos.forEach(producto => {
        const productoHTML = `
            <div>
                <img src="/uploads/productos/${producto.imagen.trim()}"  
                     class="producto1" 
                     alt="${producto.nombre}" 
                     onerror="this.style.display='none'">
                <h4 class="inventarios">${producto.nombre}</h4>
                <p>${producto.categoria}</p>
                <p>${producto.descripcion}</p>
                <p><strong>Estado:</strong> ${producto.estado}</p>
                <p><strong>Stock:</strong> ${producto.cantidad} unidades</p>
                <h4 class="inventarios2">${new Intl.NumberFormat("es-CO").format(producto.precio)}</h4>
                <button class="boton_compra" 
                        data-id="${producto.idProducto}" 
                        data-nombre="${producto.nombre}" 
                        data-precio="${producto.precio}">
                    🛒 Agregar al carrito
                </button>
            </div>
        `;
        productosContainer.innerHTML += productoHTML;
    });

    console.log("✅ Productos mostrados en pantalla");
}

// ========== EVENT LISTENER PARA BOTONES DE COMPRA ==========
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("boton_compra")) {
        const idProducto = event.target.getAttribute("data-id");
        const nombreProducto = event.target.getAttribute("data-nombre");
        const precioProducto = parseFloat(event.target.getAttribute("data-precio"));

        console.log(`🛒 Agregando al carrito: ${nombreProducto}`);
        agregarAlCarrito(idProducto, precioProducto, 1);

        const botonOriginal = event.target.textContent;
        event.target.textContent = "✅ ¡Agregado!";
        event.target.style.backgroundColor = "#32CD32";

        setTimeout(() => {
            event.target.textContent = botonOriginal;
            event.target.style.backgroundColor = "#F7DC6F";
        }, 1500);
    }
});

// ========== FILTRO DE BÚSQUEDA ==========
document.addEventListener("DOMContentLoaded", () => {
    const buscador = document.getElementById("buscador-productos");
    if (!buscador) return;

    buscador.addEventListener("input", () => {
        const texto = buscador.value.toLowerCase();
        const filtrados = listaProductos.filter(producto =>
            producto.nombre.toLowerCase().includes(texto)
        );
        console.log(`🔍 Búsqueda: "${texto}" - ${filtrados.length} resultados`);
        mostrarProductos(filtrados);
    });
});

// ========== AGREGAR PRODUCTO AL CARRITO ==========
function agregarAlCarrito(idProducto, precioProducto, cantidad) {
    // Verifica que tengamos el ID del usuario
    if (!usuarioId) {
        obtenerUsuarioId(); // Intenta obtenerlo de nuevo
    }

    if (!usuarioId) {
        alert("⚠️ Error: No se pudo identificar el usuario. Por favor, recarga la página.");
        console.error("❌ No hay usuarioId disponible");
        return;
    }

    console.log(`➕ Agregando producto ${idProducto} al carrito (Usuario: ${usuarioId})...`);

    // ⬇️ Crear FormData en lugar de JSON
    const formData = new FormData();
    formData.append("producto", idProducto);
    formData.append("cantidad", cantidad);
    formData.append("precio", precioProducto);
    // NO envíes usuarioId, el servidor lo toma de la sesión

    console.log("📤 Enviando datos:", {
        producto: idProducto,
        cantidad: cantidad,
        precio: precioProducto
    });

    fetch("/api/carrito/agregar", {
        method: "POST",
        credentials: "include", // ⬅️ IMPORTANTE: mantiene la sesión
        body: formData // ⬅️ Enviar FormData, NO JSON
        // ⚠️ NO incluyas Content-Type, el navegador lo configura automáticamente
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(mensaje => {
            console.log("✅ Respuesta del servidor:", mensaje);
            alert(mensaje);
            actualizarContadorCarrito();

            const productosCarrito = document.getElementById("productos-carrito");
            if (productosCarrito) {
                mostrarCarrito();
            }
        })
        .catch(error => {
            console.error("❌ Error agregando producto al carrito:", error);
            alert("Error al agregar el producto. Por favor, intenta nuevamente.");
        });
}


// ========== ACTUALIZAR CONTADOR DEL CARRITO ==========
function actualizarContadorCarrito() {
    if (!usuarioId) {
        console.warn("⚠️ No hay ID de usuario para actualizar el carrito");
        // Intenta obtenerlo de nuevo
        obtenerUsuarioId();
        if (!usuarioId) {
            return; // Si aún no hay ID, sale de la función
        }
    }

    fetch(`/api/carrito/temporal?usuario=${usuarioId}`)
        .then(response => response.json())
        .then(carrito => {
            console.log("📦 Respuesta carrito:", carrito);

            if (!Array.isArray(carrito)) {
                console.error("⚠️ El carrito no es un array:", carrito);
                return;
            }

            const totalProductos = carrito.reduce((total, producto) => {
                const cant = parseInt(producto.CANTIDAD || producto.cantidad || 0);
                return total + cant;
            }, 0);

            const contadorCarrito = document.getElementById("contador-carrito");
            if (contadorCarrito) {
                contadorCarrito.textContent = totalProductos;
                console.log(`🛒 Contador actualizado: ${totalProductos} productos`);
            }
        })
        .catch(error => {
            console.error("❌ Error actualizando contador del carrito:", error);
        });
}

// ========== MOSTRAR PRODUCTOS DEL CARRITO ==========
function mostrarCarrito() {
    const listaCarrito = document.getElementById("productos-carrito");
    const totalCarrito = document.getElementById("total-carrito");

    if (!listaCarrito || !totalCarrito) {
        console.log("ℹ️ No estamos en la página del carrito");
        return;
    }

    if (!usuarioId) {
        obtenerUsuarioId();
        if (!usuarioId) {
            listaCarrito.innerHTML = "<p style='text-align: center; padding: 20px; color: red;'>⚠️ Error: No se pudo identificar el usuario.</p>";
            return;
        }
    }

    console.log("🔄 Cargando carrito...");

    fetch(`/api/carrito/temporal?usuario=${usuarioId}`)
        .then(response => response.json())
        .then(carrito => {
            listaCarrito.innerHTML = "";

            if (carrito.length === 0) {
                listaCarrito.innerHTML = "<p style='text-align: center; padding: 20px;'>🛒 Tu carrito está vacío.</p>";
                totalCarrito.textContent = "Total: $0";
                console.log("ℹ️ Carrito vacío");
                return;
            }

            let total = 0;

            carrito.forEach(item => {
                const cantidad = item.cantidad || item.CANTIDAD || 0;
                const precioTotal = item.precio * cantidad;

                const li = document.createElement("li");
                li.innerHTML = `
                    <strong>${item.nombre}</strong> - 
                    Cantidad: ${cantidad} - 
                    Precio unitario: $${new Intl.NumberFormat("es-CO").format(item.precio)} - 
                    Subtotal: $${new Intl.NumberFormat("es-CO").format(precioTotal)}
                    <button class="eliminar-item" data-id="${item.id}">🗑️ Eliminar</button>
                `;

                listaCarrito.appendChild(li);
                total += precioTotal;
            });

            totalCarrito.textContent = `Total: $${new Intl.NumberFormat("es-CO").format(total)}`;
            console.log(`✅ Carrito cargado. Total: ${total}`);

            document.querySelectorAll(".eliminar-item").forEach(boton => {
                boton.addEventListener("click", () => {
                    const id = boton.getAttribute("data-id");
                    eliminarDelCarrito(id);
                });
            });
        })
        .catch(error => {
            console.error("❌ Error al obtener productos del carrito:", error);
            listaCarrito.innerHTML = "<p style='text-align: center; padding: 20px; color: red;'>❌ Error al cargar el carrito.</p>";
        });
}

// ========== ELIMINAR PRODUCTO DEL CARRITO ==========
function eliminarDelCarrito(id) {
    console.log(`🗑️ Eliminando producto ${id} del carrito...`);

    fetch(`/api/carrito/eliminar?id=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `id=${id}`
    })
        .then(response => response.text())
        .then(msg => {
            console.log("✅", msg);
            alert(msg);
            mostrarCarrito();
            actualizarContadorCarrito();
        })
        .catch(error => {
            console.error("❌ Error al eliminar el producto:", error);
            alert("Error al eliminar el producto. Por favor, intenta nuevamente.");
        });
}

// ========== AGREGAR BOTÓN DE CONFIRMAR PEDIDO ==========
function agregarBotonConfirmar() {
    const contenedor = document.getElementById("confirmar-pedido-container");
    if (!contenedor) {
        console.log("ℹ️ No existe contenedor para botón de confirmar");
        return;
    }

    const btnConfirmar = document.createElement("button");
    btnConfirmar.textContent = "✅ Confirmar Pedido";
    btnConfirmar.style.backgroundColor = "#27AE60";
    btnConfirmar.style.color = "white";
    btnConfirmar.style.padding = "10px 20px";
    btnConfirmar.style.border = "none";
    btnConfirmar.style.borderRadius = "5px";
    btnConfirmar.style.cursor = "pointer";
    btnConfirmar.style.fontWeight = "bold";
    btnConfirmar.style.fontSize = "1rem";

    btnConfirmar.addEventListener("click", confirmarPedido);
    contenedor.appendChild(btnConfirmar);

    console.log("✅ Botón de confirmar pedido agregado");
}

// ========== CONFIRMAR PEDIDO ==========
function confirmarPedido() {
    const direccion = document.getElementById("direccion")?.value.trim();

    if (!direccion) {
        alert("⚠️ Por favor ingresa una dirección de entrega.");
        return;
    }

    console.log("📦 Confirmando pedido con dirección:", direccion);

    fetch(`/api/pedido/confirmar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            direccion: direccion
        })
    })
        .then(response => response.text())
        .then(mensaje => {
            console.log("✅ Pedido confirmado:", mensaje);
            alert(mensaje);
            actualizarContadorCarrito();
            mostrarCarrito();

            const campoDireccion = document.getElementById("direccion");
            if (campoDireccion) {
                campoDireccion.value = "";
            }
        })
        .catch(error => {
            console.error("❌ Error al confirmar el pedido:", error);
            alert("Error al confirmar el pedido. Por favor, intenta nuevamente.");
        });
}

console.log("🎉 Script de inventario cargado correctamente");