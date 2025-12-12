// vehiculo.js

let todosVehiculos = [];
let vehiculosFiltrados = [];
let kilometrajeActual = 0;

document.addEventListener('DOMContentLoaded', function() {
    cargarVehiculosDesdeServidor();
});

async function cargarVehiculosDesdeServidor() {
    try {
        const response = await fetch('/api/vehiculos/listar');

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            throw new Error('Error al cargar los vehiculos');
        }

        const vehiculos = await response.json();
        todosVehiculos = vehiculos;
        vehiculosFiltrados = [...vehiculos];

        mostrarVehiculosEnTabla(vehiculos);

    } catch (error) {
        mostrarError('Error al cargar los vehiculos: ' + error.message);
    }
}

function mostrarVehiculosEnTabla(vehiculos) {
    const tbody = document.getElementById("tablaVehiculos").querySelector("tbody");
    tbody.innerHTML = '';

    if (vehiculos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay vehiculos registrados</td></tr>';
        return;
    }

    vehiculos.forEach(vehiculo => {
        const fila = document.createElement("tr");

        const estadoClass = vehiculo.estado === 'ACTIVO' ? 'estado-activo' : 'estado-inactivo';
        const estadoTexto = vehiculo.estado === 'ACTIVO' ? 'Activo' : 'Inactivo';

        fila.innerHTML = `
            <td>${vehiculo.placa}</td>
            <td>${vehiculo.kilometraje}</td>
            <td><span class="${estadoClass}">${estadoTexto}</span></td>
            <td>${vehiculo.fechaRegistro}</td>
            <td><button class="btn-editar" onclick="abrirModalActualizar(${vehiculo.idVehiculos})">Editar</button></td>
        `;

        tbody.appendChild(fila);
    });
}

function validarPlaca(placa) {
    if (!placa || placa.trim() === '') {
        return { valido: false, mensaje: 'La placa es obligatoria' };
    }

    placa = placa.trim().toUpperCase();

    const formatoPlaca = /^[A-Z]{3}[0-9]{3}$/;
    if (!formatoPlaca.test(placa)) {
        return { valido: false, mensaje: 'La placa debe tener el formato ABC123 (3 letras y 3 numeros)' };
    }

    return { valido: true, valor: placa };
}

function validarColor(color) {
    if (!color || color.trim() === '') {
        return { valido: false, mensaje: 'El color es obligatorio' };
    }

    color = color.trim();

    const formatoColor = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!formatoColor.test(color)) {
        return { valido: false, mensaje: 'El color solo debe contener letras' };
    }

    if (color.length < 3) {
        return { valido: false, mensaje: 'El color debe tener al menos 3 caracteres' };
    }

    return { valido: true, valor: color };
}

function validarModelo(modelo) {
    if (!modelo || modelo.trim() === '') {
        return { valido: false, mensaje: 'El modelo es obligatorio' };
    }

    if (!/^\d+$/.test(modelo)) {
        return { valido: false, mensaje: 'El modelo debe contener solo numeros' };
    }

    if (modelo.length !== 4) {
        return { valido: false, mensaje: 'El modelo debe tener exactamente 4 digitos' };
    }

    const anio = parseInt(modelo);
    const anioActual = new Date().getFullYear();

    if (anio < 1900 || anio > anioActual + 1) {
        return { valido: false, mensaje: `El modelo debe estar entre 1900 y ${anioActual + 1}` };
    }

    return { valido: true, valor: modelo };
}

function validarMarca(marca) {
    if (!marca || marca.trim() === '') {
        return { valido: false, mensaje: 'La marca es obligatoria' };
    }

    marca = marca.trim();

    const formatoMarca = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!formatoMarca.test(marca)) {
        return { valido: false, mensaje: 'La marca solo debe contener letras y espacios' };
    }

    if (marca.length < 2) {
        return { valido: false, mensaje: 'La marca debe tener al menos 2 caracteres' };
    }

    return { valido: true, valor: marca };
}

function validarCapacidad(capacidad) {
    if (!capacidad || capacidad.trim() === '') {
        return { valido: false, mensaje: 'La capacidad de carga es obligatoria' };
    }

    const capacidadNum = parseFloat(capacidad);

    if (isNaN(capacidadNum)) {
        return { valido: false, mensaje: 'La capacidad de carga debe ser un numero' };
    }

    if (capacidadNum <= 0) {
        return { valido: false, mensaje: 'La capacidad de carga debe ser mayor a 0' };
    }

    if (capacidadNum > 50000) {
        return { valido: false, mensaje: 'La capacidad de carga no puede superar los 50,000 kg' };
    }

    return { valido: true, valor: capacidadNum };
}

function validarKilometraje(kilometraje, esActualizacion = false) {
    if (!kilometraje || kilometraje.trim() === '') {
        return { valido: false, mensaje: 'El kilometraje es obligatorio' };
    }

    const km = parseFloat(kilometraje);

    if (isNaN(km)) {
        return { valido: false, mensaje: 'El kilometraje debe ser un numero' };
    }

    if (km < 0) {
        return { valido: false, mensaje: 'El kilometraje no puede ser negativo' };
    }

    if (km > 1000000) {
        return { valido: false, mensaje: 'El kilometraje no puede superar 1,000,000 km' };
    }

    if (esActualizacion && km < kilometrajeActual) {
        return { valido: false, mensaje: `El kilometraje no puede ser menor al actual (${kilometrajeActual} km)` };
    }

    return { valido: true, valor: km };
}

function mostrarError(mensaje) {
    alert('Error:\n\n' + mensaje);
}

function mostrarExito(mensaje) {
    alert(mensaje);
}

function abrirModalCrear() {
    document.getElementById("modalCrear").style.display = "flex";
}

async function crearVehiculo() {
    const placa = document.getElementById("crear_placa").value;
    const color = document.getElementById("crear_color").value;
    const modelo = document.getElementById("crear_modelo").value;
    const marca = document.getElementById("crear_marca").value;
    const capacidad = document.getElementById("crear_capacidad").value;
    const km = document.getElementById("crear_km").value;

    const validacionPlaca = validarPlaca(placa);
    if (!validacionPlaca.valido) {
        mostrarError(validacionPlaca.mensaje);
        return;
    }

    const validacionColor = validarColor(color);
    if (!validacionColor.valido) {
        mostrarError(validacionColor.mensaje);
        return;
    }

    const validacionModelo = validarModelo(modelo);
    if (!validacionModelo.valido) {
        mostrarError(validacionModelo.mensaje);
        return;
    }

    const validacionMarca = validarMarca(marca);
    if (!validacionMarca.valido) {
        mostrarError(validacionMarca.mensaje);
        return;
    }

    const validacionCapacidad = validarCapacidad(capacidad);
    if (!validacionCapacidad.valido) {
        mostrarError(validacionCapacidad.mensaje);
        return;
    }

    const validacionKm = validarKilometraje(km);
    if (!validacionKm.valido) {
        mostrarError(validacionKm.mensaje);
        return;
    }

    const datos = {
        placa: validacionPlaca.valor,
        color: validacionColor.valor,
        modelo: validacionModelo.valor,
        marca: validacionMarca.valor,
        capacidadCarga: validacionCapacidad.valor,
        kilometraje: validacionKm.valor
    };

    try {
        const response = await fetch('/api/vehiculos/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (resultado.exito) {
            mostrarExito(resultado.mensaje);
            cerrarModal("modalCrear");
            cargarVehiculosDesdeServidor();
        } else {
            mostrarError(resultado.mensaje);
        }

    } catch (error) {
        mostrarError('Error al crear el vehiculo: ' + error.message);
    }
}

async function abrirModalActualizar(idVehiculo) {
    try {
        const response = await fetch(`/api/vehiculos/${idVehiculo}`);

        if (!response.ok) {
            throw new Error('Vehiculo no encontrado');
        }

        const vehiculo = await response.json();

        document.getElementById("upd_id").value = vehiculo.idVehiculos;
        document.getElementById("upd_placa").value = vehiculo.placa;
        document.getElementById("upd_color").value = vehiculo.color;
        document.getElementById("upd_modelo").value = vehiculo.modelo;
        document.getElementById("upd_marca").value = vehiculo.marca;
        document.getElementById("upd_capacidad").value = vehiculo.capacidadCarga;
        document.getElementById("upd_km").value = vehiculo.kilometraje;
        document.getElementById("upd_estado").value = vehiculo.estado.toLowerCase();

        kilometrajeActual = vehiculo.kilometraje;

        document.getElementById("modalActualizar").style.display = "flex";

    } catch (error) {
        mostrarError('Error al cargar el vehiculo: ' + error.message);
    }
}

async function actualizarVehiculo() {
    const idVehiculo = document.getElementById("upd_id").value;
    const placa = document.getElementById("upd_placa").value;
    const color = document.getElementById("upd_color").value;
    const modelo = document.getElementById("upd_modelo").value;
    const marca = document.getElementById("upd_marca").value;
    const capacidad = document.getElementById("upd_capacidad").value;
    const km = document.getElementById("upd_km").value;
    const estado = document.getElementById("upd_estado").value;

    const validacionPlaca = validarPlaca(placa);
    if (!validacionPlaca.valido) {
        mostrarError(validacionPlaca.mensaje);
        return;
    }

    const validacionColor = validarColor(color);
    if (!validacionColor.valido) {
        mostrarError(validacionColor.mensaje);
        return;
    }

    const validacionModelo = validarModelo(modelo);
    if (!validacionModelo.valido) {
        mostrarError(validacionModelo.mensaje);
        return;
    }

    const validacionMarca = validarMarca(marca);
    if (!validacionMarca.valido) {
        mostrarError(validacionMarca.mensaje);
        return;
    }

    const validacionCapacidad = validarCapacidad(capacidad);
    if (!validacionCapacidad.valido) {
        mostrarError(validacionCapacidad.mensaje);
        return;
    }

    const validacionKm = validarKilometraje(km, true);
    if (!validacionKm.valido) {
        mostrarError(validacionKm.mensaje);
        return;
    }

    const datos = {
        placa: validacionPlaca.valor,
        color: validacionColor.valor,
        modelo: validacionModelo.valor,
        marca: validacionMarca.valor,
        capacidadCarga: validacionCapacidad.valor,
        kilometraje: validacionKm.valor
    };

    try {
        const response = await fetch(`/api/vehiculos/actualizar/${idVehiculo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (resultado.exito) {
            const vehiculoActual = todosVehiculos.find(v => v.idVehiculos == idVehiculo);
            if (vehiculoActual && vehiculoActual.estado.toLowerCase() !== estado) {
                await cambiarEstadoVehiculo(idVehiculo);
            }

            mostrarExito(resultado.mensaje);
            cerrarModal("modalActualizar");
            cargarVehiculosDesdeServidor();
        } else {
            mostrarError(resultado.mensaje);
        }

    } catch (error) {
        mostrarError('Error al actualizar el vehiculo: ' + error.message);
    }
}

async function cambiarEstadoVehiculo(idVehiculo) {
    try {
        const response = await fetch(`/api/vehiculos/cambiar-estado/${idVehiculo}`, {
            method: 'PATCH'
        });

        const resultado = await response.json();

        if (!resultado.exito) {
            mostrarError(resultado.mensaje);
        }

    } catch (error) {
        mostrarError('Error al cambiar el estado: ' + error.message);
    }
}

function filtrarVehiculos() {
    const filtro = document.getElementById('filtro-estado-vehiculo').value;

    if (filtro === 'TODOS') {
        vehiculosFiltrados = [...todosVehiculos];
    } else {
        vehiculosFiltrados = todosVehiculos.filter(v => v.estado === filtro);
    }

    mostrarVehiculosEnTabla(vehiculosFiltrados);
}

function cerrarModal(id) {
    document.getElementById(id).style.display = "none";

    if (id === 'modalCrear') {
        document.getElementById("crear_placa").value = "";
        document.getElementById("crear_color").value = "";
        document.getElementById("crear_modelo").value = "";
        document.getElementById("crear_marca").value = "";
        document.getElementById("crear_capacidad").value = "";
        document.getElementById("crear_km").value = "";
    }
}

document.addEventListener('click', function(e) {
    const modalCrear = document.getElementById('modalCrear');
    const modalActualizar = document.getElementById('modalActualizar');

    if (e.target === modalCrear) {
        cerrarModal('modalCrear');
    }
    if (e.target === modalActualizar) {
        cerrarModal('modalActualizar');
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        cerrarModal('modalCrear');
        cerrarModal('modalActualizar');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const inputPlacaCrear = document.getElementById('crear_placa');
    const inputPlacaActualizar = document.getElementById('upd_placa');

    if (inputPlacaCrear) {
        inputPlacaCrear.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    }

    if (inputPlacaActualizar) {
        inputPlacaActualizar.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    }
});