// Array global que almacena la lista de productos con sus propiedades
let productos = [
    { id: 1, nombre: "Huevos AAA", precio: 200, precioDescuento: 180, estadoImpuesto: "Imponible", claseImpuesto: "Estándar" },
    { id: 2, nombre: "Huevos AA", precio: 180, precioDescuento: 160, estadoImpuesto: "No Imponible", claseImpuesto: "Estándar" }
];

// Referencias a los elementos del DOM
const productList = document.getElementById('product-list');
const addProductButton = document.getElementById('add-product-btn');
const productFormContainer = document.getElementById('product-form-container');
const productForm = document.getElementById('product-form');

// Función para renderizar los productos en la lista
function renderProductos() {
    // Limpia el contenedor de productos
    productList.innerHTML = '';
    // Itera sobre cada producto en el array
    productos.forEach(producto => {
        // Crea un div para cada producto
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        // Genera el HTML del producto con su información y botón de eliminar
        productItem.innerHTML = `
            <span>${producto.nombre} - $${producto.precio} (Descuento: $${producto.precioDescuento})</span>
            <button onclick="eliminarProducto(${producto.id})">Eliminar</button>
        `;
        // Agrega el producto al contenedor
        productList.appendChild(productItem);
    });
}

// Event listener para mostrar el formulario de agregar producto
addProductButton.addEventListener('click', () => {
    productFormContainer.style.display = 'block';
});

// Función para eliminar un producto del array por su ID
function eliminarProducto(id) {
    // Filtra el array eliminando el producto con el ID especificado
    productos = productos.filter(producto => producto.id !== id);
    // Re-renderiza la lista de productos
    renderProductos();
}

// Event listener para manejar el envío del formulario de producto
productForm.addEventListener('submit', (e) => {
    // Previene el envío tradicional del formulario
    e.preventDefault();

    // Obtiene los valores de los campos del formulario
    const nombre = document.getElementById('product-name').value;
    const precio = parseFloat(document.getElementById('product-price').value);
    const precioDescuento = parseFloat(document.getElementById('discounted-price').value) || precio;
    const estadoImpuesto = document.getElementById('tax-status').value;
    const claseImpuesto = document.getElementById('tax-class').value;

    // Crea un nuevo objeto producto con los datos ingresados
    const nuevoProducto = {
        id: productos.length + 1, // Genera ID basado en la longitud del array
        nombre,
        precio,
        precioDescuento,
        estadoImpuesto,
        claseImpuesto
    };

    // Agrega el nuevo producto al array
    productos.push(nuevoProducto);
    // Re-renderiza la lista de productos
    renderProductos();
    // Limpia los campos del formulario
    productForm.reset();
    // Oculta el formulario
    productFormContainer.style.display = 'none';
});

// Inicializa la renderización de los productos al cargar el script
renderProductos();


/*
 * COMENTARIO GENERAL
 *
 * ¿Qué hace el código?
 * Este código implementa un sistema básico de gestión de productos con las siguientes funcionalidades:
 * 1. Almacenamiento en memoria de productos con propiedades (nombre, precio, descuento, impuestos)
 * 2. Visualización dinámica de la lista de productos en el DOM
 * 3. Formulario para agregar nuevos productos con validación básica
 * 4. Funcionalidad para eliminar productos de la lista
 * 5. Sistema de precios con descuentos y configuración de impuestos
 * 6. Interfaz interactiva que muestra/oculta el formulario de productos
 *
 * ERRORES ENCONTRADOS:
 * 1. Generación de ID incorrecta: Usa productos.length + 1 para generar IDs. Si se elimina
 *    un producto, pueden crearse IDs duplicados.
 *    Ejemplo: [id:1, id:2, id:3] → eliminar id:2 → agregar nuevo → id será 3 (duplicado)
 *
 * 2. Sin validación de elementos DOM: No verifica que los elementos existan antes de usarlos,
 *    causará errores si falta algún elemento HTML.
 *
 * 3. Uso de onclick inline: El botón de eliminar usa onclick="eliminarProducto()" en el HTML
 *    generado, lo cual es una mala práctica y dificulta el mantenimiento.
 *
 * 4. Sin persistencia: Los datos solo existen en memoria, se pierden al recargar la página.
 *
 * 5. innerHTML en bucle: Aunque usa appendChild, genera HTML con innerHTML para cada producto,
 *    lo cual puede ser vulnerable a XSS si los datos vienen de usuarios.
 *
 * 6. Sin validación de datos: No valida que los precios sean positivos, que el nombre no esté
 *    vacío, o que el precio con descuento sea menor al precio regular.
 *
 * 7. Lógica de descuento inconsistente: Si no se ingresa precio con descuento, usa el precio
 *    regular, lo cual no tiene sentido conceptualmente.
 *
 * 8. Sin manejo de errores: parseFloat() puede retornar NaN si el input es inválido.
 *
 * MEJORAS SUGERIDAS:
 * 1. Implementar generación de IDs correcta usando Math.max() o UUID:
 *    const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
 *
 * 2. Agregar validación de existencia de elementos DOM al inicio del script
 *
 * 3. Eliminar onclick inline y usar event delegation o data attributes con addEventListener
 *
 * 4. Implementar persistencia con localStorage para mantener los datos entre sesiones
 *
 * 5. Sanitizar datos o usar textContent en lugar de innerHTML para prevenir XSS
 *
 * 6. Agregar validaciones completas:
 *    - Precio debe ser número positivo
 *    - Nombre no puede estar vacío
 *    - Precio descuento debe ser menor o igual al precio regular
 *    - Validar que los campos de impuestos tengan valores válidos
 *
 * 7. Mejorar lógica de descuento:
 *    - Hacer el campo opcional y no aplicar descuento si está vacío
 *    - O validar que siempre sea menor al precio regular
 *
 * 8. Implementar manejo de errores robusto con try-catch y validación de NaN
 *
 * 9. Agregar funcionalidad de edición de productos existentes
 *
 * 10. Implementar confirmación antes de eliminar productos
 *
 * 11. Agregar feedback visual cuando se agrega/elimina un producto (toast, animaciones)
 *
 * 12. Implementar sistema de búsqueda/filtrado de productos
 *
 * 13. Separar la lógica de negocio de la manipulación del DOM
 *
 * 14. Usar constantes para valores predeterminados (clases CSS, estados de impuestos)
 *
 * 15. Agregar botón de cancelar en el formulario para ocultarlo sin guardar
 *
 * 16. Implementar paginación o scroll infinito si la lista crece mucho
 *
 * 17. Considerar usar un framework/librería como React o Vue para mejor gestión del estado
 *
 * 18. Agregar accesibilidad (aria-labels, navegación por teclado, roles ARIA)
 */