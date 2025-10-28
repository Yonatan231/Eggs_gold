// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", function () {
    // Obtiene la referencia al contenedor donde se mostrarán los productos
    const contenedorProductos = document.getElementById("productos-container");

    // Realiza una petición HTTP al archivo PHP que devuelve los productos
    fetch("PHP/mostrar_producto.php") // Solicita los datos al servidor
        .then(response => response.json()) // Convierte la respuesta a JSON
        .then(productos => {
            // Itera sobre cada producto recibido del servidor
            productos.forEach(producto => {
                // Crea una plantilla HTML para cada producto con su imagen, nombre y precio
                const productoHTML = `
                    <div class="producto">
                        <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
                        <p>${producto.nombre} - $${producto.precio}</p>
                    </div>
                `;
                // Concatena el HTML del producto al contenedor existente
                contenedorProductos.innerHTML += productoHTML; // Agrega al HTML
            });
        })
        // Captura y muestra en consola cualquier error que ocurra durante la petición
        .catch(error => console.error("Error al cargar los productos:", error));
});

/*
 * COMENTARIO GENERAL
 *
 * ¿Qué hace el código?
 * Este código carga dinámicamente una lista de productos desde un servidor PHP.
 * Espera a que la página termine de cargar, realiza una petición fetch a un endpoint PHP,
 * recibe un array de productos en formato JSON, y genera dinámicamente elementos HTML
 * para mostrar cada producto con su imagen, nombre y precio.
 *
 * ERRORES ENCONTRADOS:
 * 1. Uso de innerHTML +=: Este es el error más crítico. Cada iteración reconstruye
 *    todo el HTML del contenedor, lo que causa:
 *    - Pérdida de event listeners adjuntos a elementos previos
 *    - Re-renderizado innecesario del DOM en cada iteración
 *    - Problemas de rendimiento con muchos productos
 *
 * 2. Falta de validación: No verifica si contenedorProductos existe antes de usarlo,
 *    lo que causaría un error si el elemento no se encuentra.
 *
 * 3. Sin manejo de estado vacío: No hay feedback visual si no hay productos o si
 *    la petición falla.
 *
 * 4. Vulnerabilidad XSS: Los datos del servidor se insertan directamente sin
 *    sanitización, permitiendo inyección de código malicioso.
 *
 * MEJORAS SUGERIDAS:
 * 1. Usar insertAdjacentHTML() o crear elementos con createElement() en lugar de innerHTML +=
 * 2. Agregar validación del contenedor antes de usarlo
 * 3. Mostrar un mensaje o spinner de carga mientras se obtienen los datos
 * 4. Implementar mensajes para estados vacíos o de error
 * 5. Sanitizar los datos antes de insertarlos en el DOM
 * 6. Considerar usar template literals más seguros o frameworks que escapen automáticamente
 * 7. Agregar manejo de errores HTTP específicos (404, 500, etc.)
 * 8. Verificar que la respuesta sea exitosa antes de parsear el JSON (response.ok)
 */
