document.addEventListener("DOMContentLoaded", function () {
    const contenedorProductos = document.getElementById("productos-container");

    fetch("PHP/mostrar_producto.php") // Solicita los datos al servidor
        .then(response => response.json()) // Convierte la respuesta a JSON
        .then(productos => {
            productos.forEach(producto => {
                const productoHTML = `
                    <div class="producto">
                        <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
                        <p>${producto.nombre} - $${producto.precio}</p>
                    </div>
                `;
                contenedorProductos.innerHTML += productoHTML; // Agrega al HTML
            });
        })
        .catch(error => console.error("Error al cargar los productos:", error));
});
