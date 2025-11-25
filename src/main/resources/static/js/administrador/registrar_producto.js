// FUNCION DEL ARCHIVO CSV

// Manejar clic en botón CSV
document.getElementById('btn-csv').addEventListener('click', function() {
    document.getElementById('input-csv').click();
});

// Manejar selección de archivo CSV
document.getElementById('input-csv').addEventListener('change', function(e) {
    const archivo = e.target.files[0];

    if (!archivo) {
        return;
    }

    // Validar extensión
    if (!archivo.name.toLowerCase().endsWith('.csv')) {
        alert('❌ Por favor selecciona un archivo .csv');
        return;
    }

    // Confirmar antes de enviar
    if (!confirm('¿Deseas cargar los productos desde el archivo ' + archivo.name + '?')) {
        e.target.value = ''; // Limpiar selección
        return;
    }

    // Crear FormData y enviar
    const formData = new FormData();
    formData.append('archivoCSV', archivo);

    // Mostrar indicador de carga
    document.getElementById('btn-csv').disabled = true;
    document.getElementById('btn-csv').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

    // Enviar petición
    fetch('/api/productos/cargar-csv', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            // Restaurar botón
            document.getElementById('btn-csv').disabled = false;
            document.getElementById('btn-csv').innerHTML = '<i class="fas fa-file-csv"></i> Cargar CSV';

            // Limpiar input
            e.target.value = '';

            // Mostrar resultado en modal
            mostrarResultado(data);
        })
        .catch(error => {
            // Restaurar botón
            document.getElementById('btn-csv').disabled = false;
            document.getElementById('btn-csv').innerHTML = '<i class="fas fa-file-csv"></i> Cargar CSV';

            alert('❌ Error al cargar el archivo: ' + error);
            console.error('Error:', error);
        });
});

// Función para mostrar resultado en modal
function mostrarResultado(data) {
    const modal = document.getElementById('modal-resultado');
    const titulo = document.getElementById('modal-titulo');
    const mensaje = document.getElementById('modal-mensaje');
    const divErrores = document.getElementById('modal-errores');
    const listaErrores = document.getElementById('lista-errores');

    // Configurar título y mensaje
    if (data.success) {
        titulo.textContent = '✅ Carga completada';
        titulo.style.color = '#27AE60';
    } else {
        titulo.textContent = '❌ Error en la carga';
        titulo.style.color = '#c62828';
    }

    mensaje.textContent = data.message;

    // Mostrar errores si existen
    if (data.errores && data.errores.length > 0) {
        divErrores.style.display = 'block';
        listaErrores.innerHTML = '';
        data.errores.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            listaErrores.appendChild(li);
        });
    } else {
        divErrores.style.display = 'none';
    }

    // Mostrar modal
    modal.style.display = 'flex';
}

// Función para cerrar modal
function cerrarModal() {
    document.getElementById('modal-resultado').style.display = 'none';
    // Recargar página para ver los nuevos productos
    location.reload();
}


// VISTA PREVIA DE LA IMAGEN
const inputFile = document.getElementById('imagenFile');
const preview = document.getElementById('preview');

inputFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            preview.src = reader.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
});

// ============================================
// VALIDACIÓN DEL FORMULARIO
// ============================================
document.querySelector('.formulario-contenedor').addEventListener('submit', function(e) {
    // Obtener valores
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const categoria = document.getElementById('categoria_producto').value;
    const imagenFile = document.getElementById('imagenFile').files[0];

    // Validar nombre
    if (!nombre) {
        alert('El nombre del producto es obligatorio');
        e.preventDefault();
        return false;
    }

    // Validar descripción
    if (!descripcion) {
        alert('La descripción es obligatoria');
        e.preventDefault();
        return false;
    }

    // Validar precio
    if (isNaN(precio) || precio <= 0) {
        alert('El precio debe ser mayor a 0');
        e.preventDefault();
        return false;
    }

    // Validar categoría
    if (!categoria) {
        alert('Debes seleccionar una categoría');
        e.preventDefault();
        return false;
    }

    // Validar imagen
    if (!imagenFile) {
        alert('Debes seleccionar una imagen del producto');
        e.preventDefault();
        return false;
    }

    // Si todo está correcto, permitir envío
    return true;
});