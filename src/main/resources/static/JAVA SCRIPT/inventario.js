fetch('/session', { credentials: 'same-origin' }) // envía la cookie JSESSIONID
    .then(res => res.json())
    .then(({ usuario_id, rol }) => {
        if (!usuario_id || !rol) {
            alert("❌ Sesión no iniciada. Redirigiendo al inicio...");
            window.location.href = '/login'; // endpoint Thymeleaf
            return;
        }

        console.log('ID de sesión:', usuario_id);
        console.log('Rol:', rol);

        if (rol === 'ADMIN') {
            cargarPedidosRecientes('PENDIENTE');
        }
    })
    .catch(error => {
        console.error("Error al obtener sesión:", error);
        window.location.href = '/login';
    });



document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM completamente cargado");

    if (document.getElementById("productos-container")) {
        cargarProductos();
    }

    if (document.getElementById("productos-carrito")) {
        mostrarCarrito();
        agregarBotonConfirmar();
    }

    actualizarContadorCarrito();
});

const clienteGuardado = JSON.parse(localStorage.getItem("cliente"));

if (clienteGuardado && clienteGuardado.nombre) {
  console.log("Nombre del cliente:", clienteGuardado.nombre);
  // tu lógica aquí...
} else {
  console.warn("Cliente no definido o incompleto");
}

const usuarioId = clienteGuardado?.idUsuarios || clienteGuardado?.id;

console.log("🧑 ID del usuario:", usuarioId);



let listaProductos = [];

function cargarProductos() {
    fetch("/inventario/disponibles")
        .then(response => response.json())
        .then(productos => {
            listaProductos = productos; // Guardar lista original
            mostrarProductos(productos);
        })
        .catch(error => console.error("❌ Error cargando los productos:", error));
}

function mostrarProductos(productos) {
    const productosContainer = document.getElementById("productos-container");
    productosContainer.innerHTML = "";


    if (!Array.isArray(productos)) {
        console.error("❌ La respuesta no es un array:", productos);
        productosContainer.innerHTML = "<p>No se pudieron cargar los productos.</p>";
        return;
    }

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
        productosContainer.innerHTML += productoHTML;
    });
}

// Escuchar clic en botones de compra
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("boton_compra")) {
        const idProducto = event.target.getAttribute("data-id");
        const precioProducto = parseFloat(event.target.getAttribute("data-precio"));
        agregarAlCarrito(idProducto, precioProducto, 1);
    }
});

// Filtro de búsqueda por nombre
document.addEventListener("DOMContentLoaded", () => {
    const buscador = document.getElementById("buscador-productos");

    buscador.addEventListener("input", () => {
        const texto = buscador.value.toLowerCase();
        const filtrados = listaProductos.filter(producto =>
            producto.nombre.toLowerCase().includes(texto)
        );
        mostrarProductos(filtrados);
    });

    cargarProductos(); // Cargar al iniciar
});


function agregarAlCarrito(idProducto, precioProducto, cantidad) {
    const formData = new FormData();

    formData.append("producto", idProducto);
    formData.append("cantidad", cantidad);

    fetch("/api/carrito/agregar", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productoId: 1, cantidad: 2 })
    })
    .then(response => response.text())
    .then(mensaje => {
        alert(mensaje);
        actualizarContadorCarrito();

        const productosCarrito = document.getElementById("productos-carrito");
        if (productosCarrito) {
            mostrarCarrito();

            const li = document.createElement("li");
            li.textContent = `🛒 Producto ID: ${idProducto} - Cantidad: ${cantidad} - $${precioProducto}`;

            const btnEliminar = document.createElement("button");
            btnEliminar.textContent = "❌ Eliminar";
            btnEliminar.style.marginLeft = "10px";

            btnEliminar.onclick = function () {
                productosCarrito.removeChild(li);
            };

            li.appendChild(btnEliminar);
            productosCarrito.appendChild(li);
        }
    })
    .catch(error => console.error("❌ Error agregando producto al carrito:", error));
}

function actualizarContadorCarrito() {
    fetch(`/api/carrito/temporal?usuario=${usuarioId}`)
        .then(response => response.json())
        .then(carrito => {
            console.log("📦 Respuesta carrito:", carrito);

            if (!Array.isArray(carrito)) {
                console.error("⚠️ El carrito no es un array:", carrito);
                return;
            }

            const totalProductos = carrito.reduce((total, producto) => total + parseInt(producto.CANTIDAD || producto.cantidad || 0), 0);
            const contadorCarrito = document.getElementById("contador-carrito");
            if (contadorCarrito) {
                contadorCarrito.textContent = totalProductos;
            }
        })
        .catch(error => console.error("❌ Error actualizando contador del carrito:", error));
}

function mostrarCarrito() {
    const listaCarrito = document.getElementById("productos-carrito");
    const totalCarrito = document.getElementById("total-carrito");

    if (!listaCarrito || !totalCarrito) return;

    fetch(`/api/carrito/temporal?usuario=${usuarioId}`)
        .then(response => response.json())
        .then(carrito => {
            listaCarrito.innerHTML = "";

            if (carrito.length === 0) {
                listaCarrito.innerHTML = "<p>🛒 Tu carrito está vacío.</p>";
                totalCarrito.textContent = "Total: $0";
                return;
            }

            let total = 0;

            carrito.forEach(item => {
                const cantidad = item.cantidad || item.cantidad || 0;
                const precioTotal = item.precio * cantidad;

                const li = document.createElement("li");
                li.innerHTML = `
                    Producto: ${item.nombre} - Cantidad: ${cantidad} -
                    Precio: $${new Intl.NumberFormat("es-CO").format(precioTotal)}
                    <button class="eliminar-item" data-id="${item.id}">🗑️ Eliminar</button>
                `;

                listaCarrito.appendChild(li);
                total += precioTotal;
            });

            totalCarrito.textContent = `Total: $${new Intl.NumberFormat("es-CO").format(total)}`;

            document.querySelectorAll(".eliminar-item").forEach(boton => {
                boton.addEventListener("click", () => {
                    const id = boton.getAttribute("data-id");

                    fetch(`/api/carrito/eliminar?id=${id}`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body: `id=${id}`
                    })
                    .then(response => response.text())
                    .then(msg => {
                        alert(msg);
                        mostrarCarrito();
                    })
                    .catch(error => console.error("❌ Error al eliminar el producto:", error));
                });
            });
        })
        .catch(error => console.error("❌ Error al obtener productos del carrito:", error));
}

function agregarBotonConfirmar() {
    const contenedor = document.getElementById("confirmar-pedido-container");
    if (!contenedor) return;

    const btnConfirmar = document.createElement("button");
    btnConfirmar.textContent = "Confirmar Pedido";
    btnConfirmar.addEventListener("click", confirmarPedido);
    contenedor.appendChild(btnConfirmar);
}

function confirmarPedido() {
    const direccion = document.getElementById("direccion").value.trim();

    if (!direccion) {
        alert("⚠️ Por favor ingresa una dirección de entrega.");
        return;
    }

     fetch(`/api/pedido/confirmar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include", // 🔑 Necesario para mantener la sesión activa
            body: JSON.stringify({
                direccion: direccion
            })
        })
    .then(response => response.text())
    .then(mensaje => {
        alert(mensaje);
        actualizarContadorCarrito();
        mostrarCarrito();
    })
    .catch(error => {
        console.error("❌ Error al confirmar el pedido:", error);
        alert("Error al confirmar el pedido.");
    });
}

/*mostrar los productos que busque*/
document.getElementById("buscador-productos").addEventListener("input", function () {
  const filtro = this.value.toLowerCase();
  const productos = document.querySelectorAll("#productos-container .producto");

  productos.forEach(producto => {
    const nombre = producto.querySelector(".nombre").textContent.toLowerCase();
    producto.style.display = nombre.includes(filtro) ? "block" : "none";
  });
});


  