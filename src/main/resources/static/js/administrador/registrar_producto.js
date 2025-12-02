// carga de archivo csv
document.getElementById('btn-csv').addEventListener('click', function() {
    document.getElementById('input-csv').click();
});

document.getElementById('input-csv').addEventListener('change', function(e) {
    const archivo = e.target.files[0];

    if (!archivo) {
        return;
    }

    if (!archivo.name.toLowerCase().endsWith('.csv')) {
        alert('❌ Por favor selecciona un archivo .csv');
        return;
    }

    if (!confirm('¿Deseas cargar los productos desde el archivo ' + archivo.name + '?')) {
        e.target.value = '';
        return;
    }

    const formData = new FormData();
    formData.append('archivoCSV', archivo);

    document.getElementById('btn-csv').disabled = true;
    document.getElementById('btn-csv').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

    fetch('/api/productos/cargar-csv', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('btn-csv').disabled = false;
            document.getElementById('btn-csv').innerHTML = '<i class="fas fa-file-csv"></i> Cargar CSV';
            e.target.value = '';
            mostrarResultado(data);
        })
        .catch(error => {
            document.getElementById('btn-csv').disabled = false;
            document.getElementById('btn-csv').innerHTML = '<i class="fas fa-file-csv"></i> Cargar CSV';
            alert('❌ Error al cargar el archivo: ' + error);
            console.error('Error:', error);
        });
});

function mostrarResultado(data) {
    const modal = document.getElementById('modal-resultado');
    const titulo = document.getElementById('modal-titulo');
    const mensaje = document.getElementById('modal-mensaje');
    const divErrores = document.getElementById('modal-errores');
    const listaErrores = document.getElementById('lista-errores');

    if (data.success) {
        titulo.textContent = '✅ Carga completada';
        titulo.style.color = '#27AE60';
    } else {
        titulo.textContent = '❌ Error en la carga';
        titulo.style.color = '#c62828';
    }

    mensaje.textContent = data.message;

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

    modal.style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-resultado').style.display = 'none';
    location.reload();
}

// vista previa de imagen
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

// validacion del formulario
document.querySelector('.formulario-contenedor').addEventListener('submit', function(e) {
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const categoria = document.getElementById('categoria_producto').value;
    const imagenFile = document.getElementById('imagenFile').files[0];

    if (!nombre) {
        alert('El nombre del producto es obligatorio');
        e.preventDefault();
        return false;
    }

    if (!descripcion) {
        alert('La descripción es obligatoria');
        e.preventDefault();
        return false;
    }

    if (isNaN(precio) || precio <= 0) {
        alert('El precio debe ser mayor a 0');
        e.preventDefault();
        return false;
    }

    if (!categoria) {
        alert('Debes seleccionar una categoría');
        e.preventDefault();
        return false;
    }

    if (!imagenFile) {
        alert('Debes seleccionar una imagen del producto');
        e.preventDefault();
        return false;
    }

    return true;
});