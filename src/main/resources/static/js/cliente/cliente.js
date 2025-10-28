
// ========== INICIALIZACIÓN AL CARGAR EL DOM ==========
// Event listener que se ejecuta cuando el DOM está completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM completamente cargado");

    // Verifica si existe el contenedor de productos y los carga
    if (document.getElementById("productos-container")) {
        cargarProductos(); // Llama a la función para cargar productos
    }

    // Verifica si existe el contenedor del carrito y lo muestra
    if (document.getElementById("productos-carrito")) {
        mostrarCarrito(); // Muestra los productos del carrito
        agregarBotonConfirmar(); // Agrega el botón de confirmar pedido
    }

    // Actualiza el contador de productos en el carrito
    actualizarContadorCarrito();
});

// ========== OBTENER DATOS DEL CLIENTE ==========
// Obtiene los datos del cliente desde localStorage
const clienteGuardado = JSON.parse(localStorage.getItem("cliente"));

// Valida que el cliente exista y tenga nombre
if (clienteGuardado && clienteGuardado.nombre) {
    console.log("👤 Nombre del cliente:", clienteGuardado.nombre);
} else {
    console.warn("⚠️ Cliente no definido o incompleto");
}

// Obtiene el ID del usuario usando optional chaining (evita errores si no existe)
const usuarioId = clienteGuardado?.idUsuarios || clienteGuardado?.id;
console.log("🆔 ID del usuario:", usuarioId);

// ========== VARIABLES GLOBALES ==========
let listaProductos = []; // Array que almacenará la lista completa de productos

// ========== CARGAR PRODUCTOS DISPONIBLES ==========
// Función para cargar productos disponibles desde el servidor
function cargarProductos() {
    console.log("🔄 Cargando productos...");

    fetch("/inventario/disponibles") // Hace petición al backend
        .then(response => response.json()) // Convierte respuesta a JSON
        .then(productos => {
            console.log("✅ Productos cargados:", productos.length);
            listaProductos = productos; // Guarda la lista original para filtrado posterior
            mostrarProductos(productos); // Muestra los productos en el DOM
        })
        .catch(error => {
            console.error("❌ Error cargando los productos:", error);
            // Muestra mensaje de error al usuario
            const productosContainer = document.getElementById("productos-container");
            productosContainer.innerHTML = "<p style='text-align: center; padding: 20px;'>❌ Error al cargar los productos. Por favor, recarga la página.</p>";
        });
}

// ========== MOSTRAR PRODUCTOS EN EL DOM ==========
// Función para mostrar los productos en el contenedor HTML
function mostrarProductos(productos) {
    const productosContainer = document.getElementById("productos-container");
    productosContainer.innerHTML = ""; // Limpia el contenedor antes de agregar productos

    // Valida que la respuesta sea un array
    if (!Array.isArray(productos)) {
        console.error("❌ La respuesta no es un array:", productos);
        productosContainer.innerHTML = "<p style='text-align: center; padding: 20px;'>No se pudieron cargar los productos.</p>";
        return;
    }

    // Si no hay productos disponibles
    if (productos.length === 0) {
        productosContainer.innerHTML = "<p style='text-align: center; padding: 20px;'>No hay productos disponibles en este momento.</p>";
        return;
    }

    // Itera sobre cada producto y crea su representación HTML
    productos.forEach(producto => {
        const productoHTML = `
            <div>
                <img src="/imagenes/${producto.imagen}" class="producto1" alt="${producto.nombre}">
                <h4 class="inventarios">${producto.nombre}</h4>
                <p>${producto.categoria}</p>
                <p>${producto.descripcion}</p>
                <p><strong>Estado:</strong> ${producto.estado}</p>
                <p><strong>Stock:</strong> ${producto.cantidad} unidades</p>
                <h4 class="inventarios2">$${new Intl.NumberFormat("es-CO").format(producto.precio)}</h4>
                <button class="boton_compra" 
                        data-id="${producto.idProducto}" 
                        data-nombre="${producto.nombre}" 
                        data-precio="${producto.precio}">
                    🛒 Agregar al carrito
                </button>
            </div>
        `;
        productosContainer.innerHTML += productoHTML; // Agrega el producto al contenedor
    });

    console.log("✅ Productos mostrados en pantalla");
}

// ========== EVENT LISTENER PARA BOTONES DE COMPRA ==========
// Event listener global para capturar clics en los botones de compra
document.addEventListener("click", function (event) {
    // Verifica si el elemento clickeado es un botón de compra
    if (event.target.classList.contains("boton_compra")) {
        const idProducto = event.target.getAttribute("data-id");
        const nombreProducto = event.target.getAttribute("data-nombre");
        const precioProducto = parseFloat(event.target.getAttribute("data-precio"));

        console.log(`🛒 Agregando al carrito: ${nombreProducto}`);

        // Llama a la función para agregar al carrito
        agregarAlCarrito(idProducto, precioProducto, 1);

        // Efecto visual en el botón
        const botonOriginal = event.target.textContent;
        event.target.textContent = "✅ ¡Agregado!";
        event.target.style.backgroundColor = "#32CD32";

        // Restaura el botón después de 1.5 segundos
        setTimeout(() => {
            event.target.textContent = botonOriginal;
            event.target.style.backgroundColor = "#F7DC6F";
        }, 1500);
    }
});

// ========== FILTRO DE BÚSQUEDA ==========
// Event listener para filtrar productos mientras el usuario escribe
document.addEventListener("DOMContentLoaded", () => {
    const buscador = document.getElementById("buscador-productos");

    buscador.addEventListener("input", () => {
        const texto = buscador.value.toLowerCase(); // Convierte el texto a minúsculas

        // Filtra productos que contengan el texto buscado en el nombre
        const filtrados = listaProductos.filter(producto =>
            producto.nombre.toLowerCase().includes(texto)
        );

        console.log(`🔍 Búsqueda: "${texto}" - ${filtrados.length} resultados`);
        mostrarProductos(filtrados); // Muestra solo los productos filtrados
    });
});

// ========== AGREGAR PRODUCTO AL CARRITO ==========
// Función para agregar un producto al carrito
function agregarAlCarrito(idProducto, precioProducto, cantidad) {
    console.log(`➕ Agregando producto ${idProducto} al carrito...`);

    // Crea el objeto con los datos del producto
    const datosProducto = {
        productoId: idProducto,
        cantidad: cantidad
    };

    // Realiza la petición POST al servidor
    fetch("/api/carrito/agregar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json" // Indica que enviamos JSON
        },
        body: JSON.stringify(datosProducto) // Convierte el objeto a JSON
    })
        .then(response => response.text()) // Convierte la respuesta a texto
        .then(mensaje => {
            console.log("✅ Respuesta del servidor:", mensaje);
            alert(mensaje); // Muestra mensaje de confirmación al usuario
            actualizarContadorCarrito(); // Actualiza el contador del carrito

            // Si estamos en la página del carrito, lo refresca
            const productosCarrito = document.getElementById("productos-carrito");
            if (productosCarrito) {
                mostrarCarrito(); // Refresca la vista del carrito
            }
        })
        .catch(error => {
            console.error("❌ Error agregando producto al carrito:", error);
            alert("Error al agregar el producto. Por favor, intenta nuevamente.");
        });
}

// ========== ACTUALIZAR CONTADOR DEL CARRITO ==========
// Función para actualizar el contador visual del carrito
function actualizarContadorCarrito() {
    // Si no hay usuario ID, no puede actualizar el contador
    if (!usuarioId) {
        console.warn("⚠️ No hay ID de usuario para actualizar el carrito");
        return;
    }

    fetch(`/api/carrito/temporal?usuario=${usuarioId}`)
        .then(response => response.json())
        .then(carrito => {
            console.log("📦 Respuesta carrito:", carrito);

            // Valida que el carrito sea un array
            if (!Array.isArray(carrito)) {
                console.error("⚠️ El carrito no es un array:", carrito);
                return;
            }

            // Suma la cantidad total de productos en el carrito
            const totalProductos = carrito.reduce((total, producto) => {
                // Maneja diferentes nombres de propiedades (CANTIDAD o cantidad)
                const cant = parseInt(producto.CANTIDAD || producto.cantidad || 0);
                return total + cant;
            }, 0);

            // Actualiza el contador en el DOM
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
// Función para mostrar los productos del carrito en la página del carrito
function mostrarCarrito() {
    const listaCarrito = document.getElementById("productos-carrito");
    const totalCarrito = document.getElementById("total-carrito");

    // Verifica que los elementos existan en el DOM
    if (!listaCarrito || !totalCarrito) {
        console.log("ℹ️ No estamos en la página del carrito");
        return;
    }

    console.log("🔄 Cargando carrito...");

    // Obtiene los productos del carrito desde el servidor
    fetch(`/api/carrito/temporal?usuario=${usuarioId}`)
        .then(response => response.json())
        .then(carrito => {
            listaCarrito.innerHTML = ""; // Limpia la lista actual

            // Verifica si el carrito está vacío
            if (carrito.length === 0) {
                listaCarrito.innerHTML = "<p style='text-align: center; padding: 20px;'>🛒 Tu carrito está vacío.</p>";
                totalCarrito.textContent = "Total: $0";
                console.log("ℹ️ Carrito vacío");
                return;
            }

            let total = 0; // Variable para acumular el total

            // Itera sobre cada item del carrito
            carrito.forEach(item => {
                // Obtiene la cantidad (maneja diferentes nombres de propiedad)
                const cantidad = item.cantidad || item.CANTIDAD || 0;
                const precioTotal = item.precio * cantidad; // Calcula el precio total del item

                // Crea un elemento de lista para cada producto
                const li = document.createElement("li");
                li.innerHTML = `
                    <strong>${item.nombre}</strong> - 
                    Cantidad: ${cantidad} - 
                    Precio unitario: ${new Intl.NumberFormat("es-CO").format(item.precio)} - 
                    Subtotal: ${new Intl.NumberFormat("es-CO").format(precioTotal)}
                    <button class="eliminar-item" data-id="${item.id}">🗑️ Eliminar</button>
                `;

                listaCarrito.appendChild(li);
                total += precioTotal; // Suma al total
            });

            // Muestra el total formateado
            totalCarrito.textContent = `Total: ${new Intl.NumberFormat("es-CO").format(total)}`;
            console.log(`✅ Carrito cargado. Total: ${total}`);

            // Agrega event listeners a todos los botones de eliminar
            document.querySelectorAll(".eliminar-item").forEach(boton => {
                boton.addEventListener("click", () => {
                    const id = boton.getAttribute("data-id");
                    eliminarDelCarrito(id); // Llama a la función para eliminar
                });
            });
        })
        .catch(error => {
            console.error("❌ Error al obtener productos del carrito:", error);
            listaCarrito.innerHTML = "<p style='text-align: center; padding: 20px; color: red;'>❌ Error al cargar el carrito.</p>";
        });
}

// ========== ELIMINAR PRODUCTO DEL CARRITO ==========
// Función para eliminar un producto del carrito
function eliminarDelCarrito(id) {
    console.log(`🗑️ Eliminando producto ${id} del carrito...`);

    // Realiza petición DELETE para eliminar el producto
    fetch(`/api/carrito/eliminar?id=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `id=${id}` // Envía el ID en el body
    })
        .then(response => response.text())
        .then(msg => {
            console.log("✅", msg);
            alert(msg);
            mostrarCarrito(); // Refresca el carrito después de eliminar
            actualizarContadorCarrito(); // Actualiza el contador
        })
        .catch(error => {
            console.error("❌ Error al eliminar el producto:", error);
            alert("Error al eliminar el producto. Por favor, intenta nuevamente.");
        });
}

// ========== AGREGAR BOTÓN DE CONFIRMAR PEDIDO ==========
// Función para agregar el botón de confirmar pedido al DOM
function agregarBotonConfirmar() {
    const contenedor = document.getElementById("confirmar-pedido-container");
    if (!contenedor) {
        console.log("ℹ️ No existe contenedor para botón de confirmar");
        return; // Sale si el contenedor no existe
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

    // Asocia la función al clic
    btnConfirmar.addEventListener("click", confirmarPedido);
    contenedor.appendChild(btnConfirmar);

    console.log("✅ Botón de confirmar pedido agregado");
}

// ========== CONFIRMAR PEDIDO ==========
// Función para confirmar el pedido
function confirmarPedido() {
    const direccion = document.getElementById("direccion")?.value.trim();

    // Valida que se haya ingresado una dirección
    if (!direccion) {
        alert("⚠️ Por favor ingresa una dirección de entrega.");
        return;
    }

    console.log("📦 Confirmando pedido con dirección:", direccion);

    // Realiza petición POST para confirmar el pedido
    fetch(`/api/pedido/confirmar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include", // 🔒 Necesario para mantener la sesión activa
        body: JSON.stringify({
            direccion: direccion // Envía la dirección en formato JSON
        })
    })
        .then(response => response.text())
        .then(mensaje => {
            console.log("✅ Pedido confirmado:", mensaje);
            alert(mensaje); // Muestra mensaje de confirmación
            actualizarContadorCarrito(); // Actualiza el contador
            mostrarCarrito(); // Refresca el carrito (debería estar vacío)

            // Limpia el campo de dirección
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

// ========== INICIALIZACIÓN ADICIONAL ==========
// Llama a cargarProductos cuando la página carga (backup por si DOMContentLoaded no se ejecuta)
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargarProductos);
} else {
    // Si el DOM ya está cargado, ejecuta inmediatamente
    if (document.getElementById("productos-container")) {
        cargarProductos();
    }
}

console.log("🎉 Script de inventario cargado correctamente");