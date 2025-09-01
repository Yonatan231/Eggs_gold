let productos = [
    { id: 1, nombre: "Huevos AAA", precio: 200, precioDescuento: 180, estadoImpuesto: "Imponible", claseImpuesto: "Estándar" },
    { id: 2, nombre: "Huevos AA", precio: 180, precioDescuento: 160, estadoImpuesto: "No Imponible", claseImpuesto: "Estándar" }
];

const productList = document.getElementById('product-list');
const addProductButton = document.getElementById('add-product-btn');
const productFormContainer = document.getElementById('product-form-container');
const productForm = document.getElementById('product-form');

// Función para renderizar los productos en la lista
function renderProductos() {
    productList.innerHTML = '';
    productos.forEach(producto => {
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        productItem.innerHTML = `
            <span>${producto.nombre} - $${producto.precio} (Descuento: $${producto.precioDescuento})</span>
            <button onclick="eliminarProducto(${producto.id})">Eliminar</button>
        `;
        productList.appendChild(productItem);
    });
}

// Función para agregar un producto
addProductButton.addEventListener('click', () => {
    productFormContainer.style.display = 'block';
});

// Función para eliminar un producto
function eliminarProducto(id) {
    productos = productos.filter(producto => producto.id !== id);
    renderProductos();
}

// Función para guardar el producto
productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('product-name').value;
    const precio = parseFloat(document.getElementById('product-price').value);
    const precioDescuento = parseFloat(document.getElementById('discounted-price').value) || precio;
    const estadoImpuesto = document.getElementById('tax-status').value;
    const claseImpuesto = document.getElementById('tax-class').value;

    const nuevoProducto = {
        id: productos.length + 1,
        nombre,
        precio,
        precioDescuento,
        estadoImpuesto,
        claseImpuesto
    };

    productos.push(nuevoProducto);
    renderProductos();
    productForm.reset();
    productFormContainer.style.display = 'none';
});

// Inicializamos la renderización de los productos
renderProductos();

      
