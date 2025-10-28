// Verificación de sesión del usuario al cargar la página
fetch('/session', { credentials: 'same-origin' }) // Envía la cookie JSESSIONID para mantener la sesión
    .then(res => res.json()) // Convierte la respuesta a JSON
    .then(({ usuario_id, rol }) => {
        // Verifica si el usuario tiene sesión activa
        if (!usuario_id || !rol) {
            alert("❌ Sesión no iniciada. Redirigiendo al inicio...");
            window.location.href = '/login'; // Redirige al endpoint de login de Thymeleaf
            return;
        }

        // Muestra información de la sesión en consola
        console.log('ID de sesión:', usuario_id);
        console.log('Rol:', rol);

        // Si el usuario es administrador, carga los pedidos pendientes
        if (rol === 'ADMIN') {
            cargarPedidosRecientes('PENDIENTE');
        }
    })
    .catch(error => {
        // Maneja errores en la verificación de sesión
        console.error("Error al obtener sesión:", error);
        window.location.href = '/login'; // Redirige al login en caso de error
    });



// Event listener que se ejecuta cuando el DOM está completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM completamente cargado");

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
});

// Obtiene los datos del cliente desde localStorage
const clienteGuardado = JSON.parse(localStorage.getItem("cliente"));

// Valida que el cliente exista y tenga nombre
if (clienteGuardado && clienteGuardado.nombre) {
    console.log("Nombre del cliente:", clienteGuardado.nombre);
    // tu lógica aquí...
} else {
    console.warn("Cliente no definido o incompleto");
}

// Obtiene el ID del usuario usando optional chaining
const usuarioId = clienteGuardado?.idUsuarios || clienteGuardado?.id;

console.log("🧑 ID del usuario:", usuarioId);



let listaProductos = []; // Array que almacenará la lista completa de productos

// Función para cargar productos disponibles desde el servidor
function cargarProductos() {
    fetch("/inventario/disponibles")
        .then(response => response.json())
        .then(productos => {
            listaProductos = productos; // Guarda la lista original para filtrado posterior
            mostrarProductos(productos); // Muestra los productos en el DOM
        })
        .catch(error => console.error("❌ Error cargando los productos:", error));
}

// Función para mostrar los productos en el contenedor HTML
function mostrarProductos(productos) {
    const productosContainer = document.getElementById("productos-container");
    productosContainer.innerHTML = ""; // Limpia el contenedor antes de agregar productos


    // Valida que la respuesta sea un array
    if (!Array.isArray(productos)) {
        console.error("❌ La respuesta no es un array:", productos);
        productosContainer.innerHTML = "<p>No se pudieron cargar los productos.</p>";
        return;
    }

    // Itera sobre cada producto y crea su representación HTML
    productos.forEach(producto => {
        const productoHTML = `
            <div>
                <img src="/imagenes/${producto.imagen}" class="producto1">
                <h4 class="inventarios">${producto.nombre}</h4>
                <p>${producto.categoria}</p>
                <p>${producto.descripcion}</p>
                <p>${producto.estado}</p>
                <p>Stock: ${producto.cantidad}</p>
                <h4 class="inventarios2">$${new Intl.NumberFormat("es-CO").format(producto.precio)}</h4>
                <button class="boton_compra" data-id="${producto.idProducto}" data-nombre="${producto.nombre}" data-precio="${producto.precio}">
                    Agregar al carrito
                </button>
            </div>
        `;
        productosContainer.innerHTML += productoHTML; // Agrega el producto al contenedor
    });
}

// Event listener global para capturar clics en los botones de compra
document.addEventListener("click", function (event) {
    // Verifica si el elemento clickeado es un botón de compra
    if (event.target.classList.contains("boton_compra")) {
        const idProducto = event.target.getAttribute("data-id");
        const precioProducto = parseFloat(event.target.getAttribute("data-precio"));
        agregarAlCarrito(idProducto, precioProducto, 1); // Agrega el producto al carrito
    }
});

// Filtro de búsqueda por nombre de producto
document.addEventListener("DOMContentLoaded", () => {
    const buscador = document.getElementById("buscador-productos");

    // Event listener para filtrar productos mientras el usuario escribe
    buscador.addEventListener("input", () => {
        const texto = buscador.value.toLowerCase(); // Convierte el texto a minúsculas
        // Filtra productos que contengan el texto buscado
        const filtrados = listaProductos.filter(producto =>
            producto.nombre.toLowerCase().includes(texto)
        );
        mostrarProductos(filtrados); // Muestra solo los productos filtrados
    });

    cargarProductos(); // Carga los productos al iniciar
});


// Función para agregar un producto al carrito
function agregarAlCarrito(idProducto, precioProducto, cantidad) {
    const formData = new FormData();

    // Agrega los datos del producto al FormData
    formData.append("producto", idProducto);
    formData.append("cantidad", cantidad);

    // Realiza la petición POST al servidor
    fetch("/api/carrito/agregar", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "application/json" }, // Header para JSON
        body: JSON.stringify({ productoId: 1, cantidad: 2 }) // Body en formato JSON
    })
        .then(response => response.text()) // Convierte la respuesta a texto
        .then(mensaje => {
            alert(mensaje); // Muestra mensaje de confirmación
            actualizarContadorCarrito(); // Actualiza el contador del carrito

            const productosCarrito = document.getElementById("productos-carrito");
            if (productosCarrito) {
                mostrarCarrito(); // Refresca la vista del carrito

                // Crea un elemento de lista para el producto agregado
                const li = document.createElement("li");
                li.textContent = `🛒 Producto ID: ${idProducto} - Cantidad: ${cantidad} - $${precioProducto}`;

                // Crea botón para eliminar el producto
                const btnEliminar = document.createElement("button");
                btnEliminar.textContent = "❌ Eliminar";
                btnEliminar.style.marginLeft = "10px";

                // Event listener para eliminar el producto de la lista visual
                btnEliminar.onclick = function () {
                    productosCarrito.removeChild(li);
                };

                li.appendChild(btnEliminar);
                productosCarrito.appendChild(li);
            }
        })
        .catch(error => console.error("❌ Error agregando producto al carrito:", error));
}

// Función para actualizar el contador visual del carrito
function actualizarContadorCarrito() {
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
            const totalProductos = carrito.reduce((total, producto) => total + parseInt(producto.CANTIDAD || producto.cantidad || 0), 0);
            const contadorCarrito = document.getElementById("contador-carrito");
            if (contadorCarrito) {
                contadorCarrito.textContent = totalProductos; // Actualiza el contador en el DOM
            }
        })
        .catch(error => console.error("❌ Error actualizando contador del carrito:", error));
}

// Función para mostrar los productos del carrito
function mostrarCarrito() {
    const listaCarrito = document.getElementById("productos-carrito");
    const totalCarrito = document.getElementById("total-carrito");

    // Verifica que los elementos existan en el DOM
    if (!listaCarrito || !totalCarrito) return;

    // Obtiene los productos del carrito desde el servidor
    fetch(`/api/carrito/temporal?usuario=${usuarioId}`)
        .then(response => response.json())
        .then(carrito => {
            listaCarrito.innerHTML = ""; // Limpia la lista actual

            // Verifica si el carrito está vacío
            if (carrito.length === 0) {
                listaCarrito.innerHTML = "<p>🛒 Tu carrito está vacío.</p>";
                totalCarrito.textContent = "Total: $0";
                return;
            }

            let total = 0; // Variable para acumular el total

            // Itera sobre cada item del carrito
            carrito.forEach(item => {
                const cantidad = item.cantidad || item.cantidad || 0; // Obtiene la cantidad (redundante)
                const precioTotal = item.precio * cantidad; // Calcula el precio total del item

                // Crea un elemento de lista para cada producto
                const li = document.createElement("li");
                li.innerHTML = `
                    Producto: ${item.nombre} - Cantidad: ${cantidad} -
                    Precio: $${new Intl.NumberFormat("es-CO").format(precioTotal)}
                    <button class="eliminar-item" data-id="${item.id}">🗑️ Eliminar</button>
                `;

                listaCarrito.appendChild(li);
                total += precioTotal; // Suma al total
            });

            // Muestra el total formateado
            totalCarrito.textContent = `Total: $${new Intl.NumberFormat("es-CO").format(total)}`;

            // Agrega event listeners a todos los botones de eliminar
            document.querySelectorAll(".eliminar-item").forEach(boton => {
                boton.addEventListener("click", () => {
                    const id = boton.getAttribute("data-id");

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
                            alert(msg);
                            mostrarCarrito(); // Refresca el carrito después de eliminar
                        })
                        .catch(error => console.error("❌ Error al eliminar el producto:", error));
                });
            });
        })
        .catch(error => console.error("❌ Error al obtener productos del carrito:", error));
}

// Función para agregar el botón de confirmar pedido al DOM
function agregarBotonConfirmar() {
    const contenedor = document.getElementById("confirmar-pedido-container");
    if (!contenedor) return; // Sale si el contenedor no existe

    const btnConfirmar = document.createElement("button");
    btnConfirmar.textContent = "Confirmar Pedido";
    btnConfirmar.addEventListener("click", confirmarPedido); // Asocia la función al clic
    contenedor.appendChild(btnConfirmar);
}

// Función para confirmar el pedido
function confirmarPedido() {
    const direccion = document.getElementById("direccion").value.trim();

    // Valida que se haya ingresado una dirección
    if (!direccion) {
        alert("⚠️ Por favor ingresa una dirección de entrega.");
        return;
    }

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
            alert(mensaje); // Muestra mensaje de confirmación
            actualizarContadorCarrito(); // Actualiza el contador
            mostrarCarrito(); // Refresca el carrito
        })
        .catch(error => {
            console.error("❌ Error al confirmar el pedido:", error);
            alert("Error al confirmar el pedido.");
        });
}

/*mostrar los productos que busque*/
// Event listener adicional para filtrar productos (duplicado)
document.getElementById("buscador-productos").addEventListener("input", function () {
    const filtro = this.value.toLowerCase(); // Obtiene el texto del buscador
    const productos = document.querySelectorAll("#productos-container .producto");

    // Itera sobre los productos y muestra/oculta según el filtro
    productos.forEach(producto => {
        const nombre = producto.querySelector(".nombre").textContent.toLowerCase();
        producto.style.display = nombre.includes(filtro) ? "block" : "none";
    });
});

