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

        if (rol === 'CLIENTE') {
            cargarPedidosRecientes('PENDIENTE');
        } else if (rol === 'ADMIN') {
            cargarPedidosRecientes('APROBADO');
        }
    })
    .catch(error => {
        console.error("Error al obtener sesión:", error);
        window.location.href = '/login';
    });




// Mostrar/ocultar menú lateral
const btntoggle = document.querySelector('.toggle-btn');
btntoggle.addEventListener('click', function(){
    document.getElementById('sidebar').classList.toggle('active');
});

// Cargar pedidos 
document.addEventListener("DOMContentLoaded", cargarPedidosRecientes);

function cargarPedidosRecientes() {
  fetch("/api/pedido/listar")
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        alert("No se pudieron cargar los pedidos.");
        return;
      }

      const rol = data.rol;
      const pedidos = data.pedidos;
      const tbody = document.querySelector("#tabla-pedidos tbody");
      tbody.innerHTML = "";

      if (pedidos.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="9">No hay pedidos para mostrar.</td>`;
        tbody.appendChild(fila);
        return;
      }

      pedidos.forEach(p => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${p.ID_PEDIDOS}</td>
          <td>${p.nombre_usuario}</td>
          <td colspan="2">${p.productos.join(", ")}</td> <!-- ✅ Aquí unimos nombre y cantidad -->
          <td>${p.DIRECCION}</td>
          <td>${p.ESTADO}</td>
           <td>${new Date(p.fechaCreacion).toLocaleString()}</td>
          <td>$${p.TOTAL}</td>
        `;

        const tdAccion = document.createElement("td");

        if (rol == 1 && p.ESTADO === 'PENDIENTE') {
          tdAccion.innerHTML = `
            <button onclick="actualizarEstado(${p.ID_PEDIDOS}, 'APROBADO')">Aceptar</button>
            <button onclick="actualizarEstado(${p.ID_PEDIDOS}, 'RECHAZADO')">Denegar</button>
          `;
        } else if (rol == 3 && p.ESTADO === 'APROBADO') {
          tdAccion.innerHTML = `<button onclick="asignarPedido(${p.ID_PEDIDOS})">Asignar</button>`;
        } else if (rol == 1 && p.ESTADO === 'APROBADO') {
          tdAccion.innerHTML = `<span style="color: green; font-weight: bold;">✔ Aprobado</span>`;
        } else if (rol == 1 && p.ESTADO === 'RECHAZADO') {
          tdAccion.innerHTML = `<span style="color: red; font-weight: bold;">✖ Rechazado</span>`;
        } else if (rol == 1 && p.ESTADO === 'EN CAMINO') {
          tdAccion.innerHTML = `<span style="color: green; font-weight: bold;">✔ EN CAMINO</span>`;
        } else {
          tdAccion.innerHTML = "—";
        }

        fila.appendChild(tdAccion);
        tbody.appendChild(fila);
      });
    })
    .catch(err => {
      console.error("Error al cargar pedidos:", err);
    });
}


// Actualizar estado de pedido
function actualizarEstado(idPedido, nuevoEstado) {
    const formData = new FormData();
    formData.append('id_pedido', idPedido);
    formData.append('estado', nuevoEstado);  // CAMBIO AQUÍ: debe coincidir con el nombre en PHP

    fetch('PHP/actualizar_estado_pedido.php', {
        method: 'POST',
        body: formData
    })
    .then(resp => resp.json()) // CAMBIO AQUÍ
    .then(data => {
        if (data.success) {
            alert("✅ Pedido actualizado correctamente");
            cargarPedidosRecientes();
        } else {
            alert("❌ Error al actualizar: " + (data.error || "desconocido"));
        }
    })
    .catch(error => {
        console.error('❌ Error al actualizar estado:', error);
        alert("❌ Error técnico. Ver consola.");
    });
}


// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', cargarPedidosRecientes);

// Eliminar pedido desde botón
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('ver')) {
        const id = e.target.getAttribute('data-id');

        if (confirm("¿Seguro que deseas eliminar este pedido?")) {
            fetch(`PHP/eliminar_pedido.php?id=${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert("Pedido eliminado con éxito");
                        e.target.closest("tr").remove();
                    } else {
                        alert("Error al eliminar: " + data.error);
                    }
                })
                .catch(error => {
                    console.error("Error al conectar con el servidor", error);
                });
        }
    }
});

// Aceptar o Denegar pedido
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("aceptar")) {
    const id = e.target.dataset.id;
    fetch("PHP/aceptar_pedido.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `id=${id}`
    })
    .then(res => res.text())
    .then(() => {
      alert("✅ Pedido aceptado");
      cargarPedidosRecientes(); // ✅ Actualiza la tabla sin eliminar filas manualmente
    });
  }

  if (e.target.classList.contains("denegar")) {
    const id = e.target.dataset.id;
    fetch("PHP/denegar_pedido.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `id=${id}`
    })
    .then(res => res.text())
    .then(() => {
      alert("❌ Pedido denegado");
      cargarPedidosRecientes(); // ✅ Igual aquí
    });
  }
});



/*mostrar productos*/
function cargarProductos(){
fetch("PHP/mostrar_producto.php")
  .then(response => response.json())
  .then(html => {
    const productos = html;
    const tabla = document.querySelector("#tabla-productos tbody");

    tabla.innerHTML = "";

    productos.forEach(producto => {
      const fila = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = producto.id;

      const nombre = document.createElement("td");
      nombre.textContent = producto.nombre;

      const precio = document.createElement("td");
      precio.textContent = producto.precio;

      const categoria = document.createElement("td");
      categoria.textContent = producto.categoria;

      const descripcion = document.createElement("td");
      descripcion.textContent = producto.descripcion;

      const estado = document.createElement("td");
      estado.textContent = producto.estado;

      const cantidad = document.createElement("td");
      cantidad.textContent = producto.cantidad;

      const imagen = document.createElement("td");
      const imgTag = document.createElement("img");
      imgTag.src = `imagenes/${producto.imagen.trim()}`;
      imgTag.alt = producto.nombre;
      imgTag.width = 50;
      imgTag.height = 50;
      console.log("🔍 Imagen recibida:", producto.imagen);

        const actualizar = document.createElement("td");
     

  const btnActualizar = document.createElement("button");
  btnActualizar.textContent = "Actualizar";
  
  btnActualizar.onclick = () => abrirModalActualizar(producto);
  actualizar.appendChild(btnActualizar);


  const actualizarBtn = document.createElement("button");
actualizarBtn.textContent = "Actualizar";
actualizarBtn.addEventListener("click", () => abrirModalActualizar(producto));

// NUEVO: Botón Eliminar productos//
const eliminarBtn = document.createElement("button");
eliminarBtn.textContent = "Eliminar";
eliminarBtn.addEventListener("click", () => eliminarProducto(producto.id));

const tdEliminar = document.createElement("td");
tdEliminar.appendChild(eliminarBtn);

      

      fila.appendChild(id);
      fila.appendChild(nombre);
      fila.appendChild(precio);
      fila.appendChild(categoria);
      fila.appendChild(descripcion);
      fila.appendChild(estado);
      fila.appendChild(cantidad);
      imagen.appendChild(imgTag);
      fila.appendChild(imagen);
      fila.appendChild(actualizar);
      fila.appendChild(tdEliminar);
      tabla.appendChild(fila);
       
    });
  })
  .catch(error => {
    console.error("❌ Error al cargar productos:", error);
    alert("❌ No se pudieron cargar los productos.");
  });

}
cargarProductos();
/*mostrar clientes*/
function cargarProductosCliente(){
fetch("PHP/mostrar_clientes.php")
  .then(resultado => resultado.json())
  .then(datos => {
    const clientes = datos;
    const tabla = document.querySelector("#tabla-clientes tbody");

    tabla.innerHTML = "";

    clientes.forEach(cliente => {
      const fila = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = cliente.ID_USUARIOS;

      const nombre = document.createElement("td");
      nombre.textContent = cliente.NOMBRE;

      const apellido = document.createElement("td");
      apellido.textContent = cliente.APELLIDO;

      const documento = document.createElement("td");
      documento.textContent = cliente.NUM_DOCUMENTO;

      const direccion = document.createElement("td");
      direccion.textContent = cliente.DIRECCION_USUARIO;

      const telefono = document.createElement("td");
      telefono.textContent = cliente.TELEFONO;

       const actualizar = document.createElement("td");

      const btnActualizar = document.createElement("button");
      btnActualizar.textContent = "Actualizar";
     
       btnActualizar.onclick = () => abrirModalActualizarCliente(cliente);
       actualizar.appendChild(btnActualizar)
       //boton eliminar clientes //
       const eliminarBtn = document.createElement("button");
eliminarBtn.textContent = "Eliminar";
eliminarBtn.addEventListener("click", () => eliminarProductoCliente(cliente.ID_USUARIOS));

const tdEliminar = document.createElement("td");
tdEliminar.appendChild(eliminarBtn);


      fila.appendChild(id);
      fila.appendChild(nombre);
      fila.appendChild(apellido);
      fila.appendChild(documento);
      fila.appendChild(direccion);
      fila.appendChild(telefono);
      fila.appendChild(actualizar);
      fila.appendChild(tdEliminar);
      tabla.appendChild(fila);
    });
  })
  .catch(error => {
    console.error("✖️error al cargar los clientes", error);
    alert("✖️Error al cargar los clientes");
  });
}
cargarProductosCliente();
/*mostrar conductores*/
function cargarProductosConductores(){
fetch("PHP/obtener_conductores.php")
  .then(respuesta => respuesta.json())
  .then(datos => {
    const conductores = datos;
    const tabla = document.querySelector("#tabla-conductores tbody");

    tabla.innerHTML = "";

    conductores.forEach(conductor => {
      const fila = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = conductor.ID_USUARIOS;

      const nombre = document.createElement("td");
      nombre.textContent = conductor.NOMBRE;

      const apellido = document.createElement("td");
      apellido.textContent = conductor.APELLIDO;

      const documento = document.createElement("td");
      documento.textContent = conductor.NUM_DOCUMENTO;

       const direccion = document.createElement("td");
       direccion.textContent = conductor.DIRECCION_USUARIO;

       const telefono = document.createElement("td");
       telefono.textContent = conductor.TELEFONO;

        const actualizar = document.createElement("td");

      const btnActualizar = document.createElement("button");
      btnActualizar.textContent = "Actualizar";
     
       btnActualizar.onclick = () => abrirModalActualizarConductores(conductor);
       actualizar.appendChild(btnActualizar)

        //boton eliminar conductores //
       const eliminarBtn = document.createElement("button");
eliminarBtn.textContent = "Eliminar";
eliminarBtn.addEventListener("click", () => eliminarProductoConductores(conductor.ID_USUARIOS));

const tdEliminar = document.createElement("td");
tdEliminar.appendChild(eliminarBtn);


      
      

      fila.appendChild(id);
      fila.appendChild(nombre);
      fila.appendChild(apellido);
      fila.appendChild(documento);
      fila.appendChild(direccion);
      fila.appendChild(telefono);
      fila.appendChild(actualizar);
      fila.appendChild(tdEliminar);
      tabla.appendChild(fila);
    });
  })
  .catch(error => {
    console.error("✖️Error al cargar los cconductores", error);
    alert("✖️Error al cargar los conductores");
  });

}
cargarProductosConductores();

/*mostrar logistica*/
function cargarProductosLogistica(){
fetch("PHP/mostrar_logistica.php")
  .then(respuesta => respuesta.json())
  .then(datos => {
    const logistica = datos;
    const tabla = document.querySelector("#tabla-Logistica tbody");

    tabla.innerHTML = "";

    logistica.forEach(logistica => {
      const fila = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = logistica.ID_USUARIOS;

      const nombre = document.createElement("td");
      nombre.textContent = logistica.NOMBRE;

      const apellido = document.createElement("td");
      apellido.textContent = logistica.APELLIDO;

      const documento = document.createElement("td");
      documento.textContent = logistica.NUM_DOCUMENTO;

       const direccion = document.createElement("td");
       direccion.textContent = logistica.DIRECCION_USUARIO;

       const telefono = document.createElement("td");
       telefono.textContent = logistica.TELEFONO;

        const actualizar = document.createElement("td");

      const btnActualizar = document.createElement("button");
      btnActualizar.textContent = "Actualizar";
     
       btnActualizar.onclick = () => abrirModalActualizarLogistica(logistica);
       actualizar.appendChild(btnActualizar)

        //boton eliminar conductores //
       const eliminarBtn = document.createElement("button");
eliminarBtn.textContent = "Eliminar";
eliminarBtn.addEventListener("click", () => eliminarLogistica(logistica.ID_USUARIOS));

const tdEliminar = document.createElement("td");
tdEliminar.appendChild(eliminarBtn);


      
      

      fila.appendChild(id);
      fila.appendChild(nombre);
      fila.appendChild(apellido);
      fila.appendChild(documento);
      fila.appendChild(direccion);
      fila.appendChild(telefono);
      fila.appendChild(actualizar);
      fila.appendChild(tdEliminar);
      tabla.appendChild(fila);
    });
  })
  .catch(error => {
    console.error("✖️Error al cargar los cconductores", error);
    alert("✖️Error al cargar logistica");
  });

}
cargarProductosLogistica();


  //funcion abrir modal actualizar productos//
  function abrirModalActualizar(producto) {
    
  document.getElementById("update-id").value = producto.id;
    console.log("🆔 ID asignado al input:", document.getElementById("update-id").value);

    console.log("🔍 Producto recibido:", producto);

  document.getElementById("update-nombre").value = producto.nombre;
  document.getElementById("update-precio").value = producto.precio;
  document.getElementById("update-categoria").value = producto.categoria;
  document.getElementById("update-descripcion").value = producto.descripcion;
  document.getElementById("update-estado").value = producto.estado;
  document.getElementById("update-cantidad").value = producto.cantidad;
  


  // Mostrar el modal
  document.getElementById("modalActualizar").style.display = "block";
}
//funcion cerrar modal//
function cerrarModal() {
  document.getElementById("modalActualizar").style.display = "none";
}

document.getElementById("formActualizarProducto").addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = new FormData(this);

  for (let [key, value] of formData.entries()) {
  console.log(`${key}: ${value}`);
}
  fetch("PHP/actualizar_producto.php", {
    method: "POST",
    body: formData
  })
  .then(resp => resp.json())
  .then(data => {
    if (data.success) {
      alert("✅ Producto actualizado correctamente.");
      cerrarModal();
      // Recargar la tabla
      cargarProductos(); // Asegúrate de tener esta función
    } else {
      alert("❌ Error al actualizar: " + (data.error || "desconocido"));
    }
  })
  .catch(error => {
    console.error("❌ Error en la solicitud:", error);
    alert("❌ Fallo en la conexión.");
  });
});


 //funcion para eliminar un producto en admin//
function eliminarProducto(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    fetch(`PHP/eliminar_producto.php?id=${id}`, {
      method: "GET"
    })
    .then(response => response.text())
    .then(data => {
      alert(data); // Muestra el mensaje de PHP
      fetch('PHP/mostrar_producto_pagina.php') // Vuelve a cargar la tabla
        .then(response => response.text())
        .then(html => {
          document.getElementById('tabla-productos').innerHTML = html;
        });
    })
    .catch(error => {
      console.error("❌ Error al eliminar el producto:", error);
      alert("❌ No se pudo eliminar el producto.");
    });
  }
}


//funcion abrir modal actualizar cliente//
  function abrirModalActualizarCliente(cliente) {
    
  document.getElementById("updatec-id").value = cliente.ID_USUARIOS;
    console.log("🆔 ID asignado al input:", document.getElementById("updatec-id").value);

    console.log("🔍 Producto recibido:", cliente);

  document.getElementById("updatec-nombre").value = cliente.NOMBRE;
  document.getElementById("updatec-apellido").value = cliente.APELLIDO;
  document.getElementById("updatec-documento").value = cliente.NUM_DOCUMENTO;
  document.getElementById("updatec-direccion").value = cliente.DIRECCION_USUARIO;
  document.getElementById("updatec-telefono").value = cliente.TELEFONO;
  


  // Mostrar el modal
  document.getElementById("modalActualizarClientes").style.display = "block";
}
//funcion cerrar modal//
function cerrarModalCliente() {
  document.getElementById("modalActualizarClientes").style.display = "none";
}

document.getElementById("formActualizarClientes").addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = new FormData(this);

  for (let [key, value] of formData.entries()) {
  console.log(`${key}: ${value}`);
}
  fetch("PHP/actualizar_clientes.php", {
    method: "POST",
    body: formData
  })
  .then(resp => resp.json())
  .then(data => {
    if (data.success) {
      alert("✅ Producto actualizado correctamente.");
      cerrarModalCliente();
      // Recargar la tabla
      cargarProductosCliente(); // Asegúrate de tener esta función
    } else {
      alert("❌ Error al actualizar: " + (data.error || "desconocido"));
    }
  })
  .catch(error => {
    console.error("❌ Error en la solicitud:", error);
    alert("❌ Fallo en la conexión.");
  });
});

//funcion de eliminar  clientes//
 function eliminarProductoCliente(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    fetch(`PHP/eliminar_clientes.php?id=${id}`, {
      method: "GET",
    })
    .then(response => response.text())
    .then(data => {
      alert(data); // Muestra el mensaje que venga de PHP
      location.reload(); // Recarga la tabla
    })
    .catch(error => {
      console.error("❌ Error al eliminar el producto:", error);
      alert("❌ No se pudo eliminar el producto.");
    });
  }
}

//funcion abrir modal actualizar conductores//
  function abrirModalActualizarConductores(conductor) {
    
  document.getElementById("updateco-id").value = conductor.ID_USUARIOS;
    console.log("🆔 ID asignado al input:", document.getElementById("updateco-id").value);

    console.log("🔍 Producto recibido:", conductor);

  document.getElementById("updateco-nombre").value = conductor.NOMBRE;
  document.getElementById("updateco-apellido").value = conductor.APELLIDO;
  document.getElementById("updateco-documento").value = conductor.NUM_DOCUMENTO;
  document.getElementById("updateco-direccion").value = conductor.DIRECCION_USUARIO;
  document.getElementById("updateco-telefono").value = conductor.TELEFONO;
  


  // Mostrar el modal
  document.getElementById("modalActualizarConductores").style.display = "block";
}
//funcion cerrar modal//
function cerrarModalConductores() {
  document.getElementById("modalActualizarConductores").style.display = "none";
}

document.getElementById("formActualizarConductores").addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = new FormData(this);

  for (let [key, value] of formData.entries()) {
  console.log(`${key}: ${value}`);
}
  fetch("PHP/actualizar_conductores.php", {
    method: "POST",
    body: formData
  })
  .then(resp => resp.json())
  .then(data => {
    if (data.success) {
      alert("✅ Producto actualizado correctamente.");
      cerrarModalConductores();
      // Recargar la tabla
      cargarProductosConductores(); // Asegúrate de tener esta función
    } else {
      alert("❌ Error al actualizar: " + (data.error || "desconocido"));
    }
  })
  .catch(error => {
    console.error("❌ Error en la solicitud:", error);
    alert("❌ Fallo en la conexión.");
  });
});


//funcion de eliminar  conductores//
 function eliminarProductoConductores(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    fetch(`PHP/eliminar_conductores.php?id=${id}`, {
      method: "GET",
    })
    .then(response => response.text())
    .then(data => {
      alert(data); // Muestra el mensaje que venga de PHP
      location.reload(); // Recarga la tabla
    })
    .catch(error => {
      console.error("❌ Error al eliminar el producto:", error);
      alert("❌ No se pudo eliminar el producto.");
    });
  }
}

//funcion abrir modal actualizar Logistica//
  function abrirModalActualizarLogistica(logistica) {
    
  document.getElementById("updateL-id").value = logistica.ID_USUARIOS;
    console.log("🆔 ID asignado al input:", document.getElementById("updateL-id").value);

    console.log("🔍 Producto recibido:", logistica);

  document.getElementById("updateL-nombre").value = logistica.NOMBRE;
  document.getElementById("updateL-apellido").value = logistica.APELLIDO;
  document.getElementById("updateL-documento").value = logistica.NUM_DOCUMENTO;
  document.getElementById("updateL-direccion").value = logistica.DIRECCION_USUARIO;
  document.getElementById("updateL-telefono").value = logistica.TELEFONO;
  


  // Mostrar el modal
  document.getElementById("modalActualizarLogistica").style.display = "block";
}
//funcion cerrar modal//
function cerrarModalLogistica() {
  document.getElementById("modalActualizarLogistica").style.display = "none";
}

document.getElementById("formActualizarLogistica").addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = new FormData(this);

  for (let [key, value] of formData.entries()) {
  console.log(`${key}: ${value}`);
}
  fetch("PHP/actualizar_logistica.php", {
    method: "POST",
    body: formData
  })
  .then(resp => resp.json())
  .then(data => {
    if (data.success) {
      alert("✅ Uusuario actualizado correctamente.");
      cerrarModalLogistica();
      // Recargar la tabla
      cargarProductosLogistica(); // Asegúrate de tener esta función
    } else {
      alert("❌ Error al actualizar: " + (data.error || "desconocido"));
    }
  })
  .catch(error => {
    console.error("❌ Error en la solicitud:", error);
    alert("❌ Fallo en la conexión.");
  });
});


//funcion de eliminar  conductores//
 function eliminarLogistica(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    fetch(`PHP/eliminar_logistica.php?id=${id}`, {
      method: "GET",
    })
    .then(response => response.text())
    .then(data => {
      alert(data); // Muestra el mensaje que venga de PHP
      location.reload(); // Recarga la tabla
    })
    .catch(error => {
      console.error("❌ Error al eliminar el producto:", error);
      alert("❌ No se pudo eliminar el producto.");
    });
  }
}

/*buscar pedidos administrador*/
document.addEventListener("DOMContentLoaded", function () {
  const inputBuscar = document.getElementById("buscar");
  const form = document.getElementById("form-busqueda");
  const tbody = document.querySelector("#tabla-pedidos tbody");

  function buscarPedidos(valor) {
    const texto = valor.trim();
    if (texto === "") {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center;">⚠️ Escriba algo para buscar</td>
        </tr>`;
      return;
    }

    const formData = new FormData();
    formData.append("buscar", texto);

    fetch("PHP/buscar_pedidos_admin.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = "";

        if (data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="9" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
          return;
        }

        data.forEach(pedido => {
          const fila = `
            <tr>
              <td>${pedido.ID_PEDIDOS}</td>
              <td>${pedido.nombre_usuario}</td>
              <td>${pedido.nombre_producto}</td>
              <td>${pedido.CANTIDAD}</td>
              <td>${pedido.DIRECCION}</td>
              <td>${pedido.ESTADO}</td>
              <td>${pedido.FECHA_CREACION}</td>
              <td>$${pedido.TOTAL}</td>
              <td><span style="color: green;">✔ EN CAMINO</span></td>
            </tr>`;
          tbody.innerHTML += fila;
        });
      })
      .catch(error => {
        console.error("❌ Error:", error);
      });
  }

  // 🟡 Buscar mientras escribe
  inputBuscar.addEventListener("keyup", () => {
    buscarPedidos(inputBuscar.value);
  });

  // 🔴 Evitar que el botón recargue y repetir la búsqueda si se presiona
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // 🔒 Bloquea el envío del formulario
    buscarPedidos(inputBuscar.value); // 👉 Solo vuelve a buscar lo mismo
  });
});


/*buscar productos administrador*/
document.addEventListener("DOMContentLoaded", function () {
  const inputBuscar = document.getElementById("buscar_producto");
  const form = document.getElementById("form-busqueda");
  const tbody = document.querySelector("#tabla-productos tbody");

  function buscarProductos(valor) {
    const texto = valor.trim();
    if (texto === "") {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center;">⚠️ Escriba algo para buscar</td>
        </tr>`;
      return;
    }

    const formData = new FormData();
    formData.append("buscar", texto);

    fetch("PHP/buscar_producto_admin.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = "";

        if (data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
          return;
        }

        data.forEach(producto => {
          const fila = `
            <tr>
              <td>${producto.id}</td>
              <td>${producto.NOMBRE}</td>
              <td>$${parseInt(producto.PRECIO).toLocaleString("es-CO")}</td>
              <td>${producto.CATEGORIA}</td>
              <td>${producto.DESCRIPCION}</td>
              <td>${producto.ESTADO}</td>
              <td><img src="imagenes/${producto.imagen}" width="50" alt="Producto"></td>
              <td>${producto.CANTIDAD}</td>
            </tr>`;
          tbody.innerHTML += fila;
        });
      })
      .catch(error => {
        console.error("❌ Error:", error);
      });
  }

  // 🟡 Buscar mientras escribe
  inputBuscar.addEventListener("keyup", () => {
    buscarProductos(inputBuscar.value);
  });

  // 🔴 Evitar que el botón recargue
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    buscarProductos(inputBuscar.value);
  });
});


/*buscar Clientes administrador*/
document.addEventListener("DOMContentLoaded", function () {
  const inputBuscar = document.getElementById("buscar_cliente");
  const form = document.getElementById("form-busqueda_cliente");
  const tbody = document.querySelector("#tabla-clientes tbody");

  function buscarProductos(valor) {
    const texto = valor.trim();
    if (texto === "") {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center;">⚠️ Escriba algo para buscar</td>
        </tr>`;
      return;
    }

    const formData = new FormData();
    formData.append("buscar", texto);

    fetch("PHP/buscar_cliente_admin.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = "";

        if (data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
          return;
        }

        data.forEach(cliente => {
          const fila = `
            <tr>
              <td>${cliente.ID_USUARIOS}</td>
              <td>${cliente.NOMBRE}</td>
              <td>${cliente.APELLIDO}</td>
              <td>${cliente.NUM_DOCUMENTO}</td>
              <td>${cliente.DIRECCION_USUARIO}</td>
              <td>${cliente.TELEFONO}</td>
            </tr>`;
          tbody.innerHTML += fila;
        });
      })
      .catch(error => {
        console.error("❌ Error:", error);
      });
  }

  // 🟡 Buscar mientras escribe
  inputBuscar.addEventListener("keyup", () => {
    buscarProductos(inputBuscar.value);
  });

  // 🔴 Evitar que el botón recargue
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    buscarProductos(inputBuscar.value);
  });
});

/*buscar Conductor administrador*/
document.addEventListener("DOMContentLoaded", function () {
  const inputBuscar = document.getElementById("buscar_conductor");
  const form = document.getElementById("form-busqueda_conductor");
  const tbody = document.querySelector("#tabla-conductores tbody");

  function buscarProductos(valor) {
    const texto = valor.trim();
    if (texto === "") {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center;">⚠️ Escriba algo para buscar</td>
        </tr>`;
      return;
    }

    const formData = new FormData();
    formData.append("buscar", texto);

    fetch("PHP/buscar_conductor_admin.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = "";

        if (data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
          return;
        }

        data.forEach(conductor => {
          const fila = `
            <tr>
              <td>${conductor.ID_USUARIOS}</td>
              <td>${conductor.NOMBRE}</td>
              <td>${conductor.APELLIDO}</td>
              <td>${conductor.NUM_DOCUMENTO}</td>
              <td>${conductor.DIRECCION_USUARIO}</td>
              <td>${conductor.TELEFONO}</td>
            </tr>`;
          tbody.innerHTML += fila;
        });
      })
      .catch(error => {
        console.error("❌ Error:", error);
      });
  }

  // 🟡 Buscar mientras escribe
  inputBuscar.addEventListener("keyup", () => {
    buscarProductos(inputBuscar.value);
  });

  // 🔴 Evitar que el botón recargue
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    buscarProductos(inputBuscar.value);
  });
});

/*buscar Logistica administrador*/
document.addEventListener("DOMContentLoaded", function () {
  const inputBuscar = document.getElementById("buscar_logistica");
  const form = document.getElementById("form-busqueda_logistica");
  const tbody = document.querySelector("#tabla-Logistica tbody");

  function buscarProductos(valor) {
    const texto = valor.trim();
    if (texto === "") {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center;">⚠️ Escriba algo para buscar</td>
        </tr>`;
      return;
    }

    const formData = new FormData();
    formData.append("buscar", texto);

    fetch("PHP/buscar_logistica_admin.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = "";

        if (data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" style="text-align: center;">❌ No se encontraron resultados</td>
            </tr>`;
          return;
        }

        data.forEach(logistica => {
          const fila = `
            <tr>
              <td>${logistica.ID_USUARIOS}</td>
              <td>${logistica.NOMBRE}</td>
              <td>${logistica.APELLIDO}</td>
              <td>${logistica.NUM_DOCUMENTO}</td>
              <td>${logistica.DIRECCION_USUARIO}</td>
              <td>${logistica.TELEFONO}</td>
            </tr>`;
          tbody.innerHTML += fila;
        });
      })
      .catch(error => {
        console.error("❌ Error:", error);
      });
  }

  // 🟡 Buscar mientras escribe
  inputBuscar.addEventListener("keyup", () => {
    buscarProductos(inputBuscar.value);
  });

  // 🔴 Evitar que el botón recargue
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    buscarProductos(inputBuscar.value);
  });
});


/*panel de administrador foto*/


document.addEventListener("DOMContentLoaded", () => {
  const avatarImg = document.getElementById("avatar-imagen");
  const avatarIniciales = document.getElementById("avatar-iniciales");
  const inputFoto = document.getElementById("input-foto");

  // Mostrar imagen o iniciales
  fetch("PHP/obtener_foto.php")
    .then(res => res.json())
    .then(data => {
      if (data.success && data.ruta) {
        avatarImg.src = data.ruta;
        avatarImg.style.display = "block";
        avatarIniciales.style.display = "none";
      } else {
        const iniciales = data.iniciales || "AD";
        avatarIniciales.textContent = iniciales;
        avatarImg.style.display = "none";
        avatarIniciales.style.display = "flex";
      }
    });

  // Subir imagen
  inputFoto.addEventListener("change", () => {
    const archivo = inputFoto.files[0];
    if (!archivo) return;

    const formData = new FormData();
    formData.append("foto", archivo);

    fetch("PHP/subir_foto.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          avatarImg.src = data.ruta;
          avatarImg.style.display = "block";
          avatarIniciales.style.display = "none";
        } else {
          alert("❌ " + data.message);
        }
      })
      .catch(error => {
        console.error("Error subiendo imagen:", error);
      });
  });
});
//aqui muestra el codigo para que las tarjetas funcionen//

document.addEventListener("DOMContentLoaded", () => {
  fetch("PHP/resumen_admin.php")
    .then(response => response.json())
    .then(data => {
      document.getElementById("totalUsuarios").textContent = data.usuarios;
      document.getElementById("totalVentas").textContent = `${data.ventas}`;
      document.getElementById("totalProductos").textContent = data.productos;
    })
    .catch(error => {
      console.error("❌ Error cargando resumen:", error);
    });
});

/*cerrar sesion*/

document.getElementById("cerrar-sesion").addEventListener("click", function (e) {
  e.preventDefault();

  // 🔴 Limpiar localStorage
  localStorage.removeItem("usuario_id");
  localStorage.removeItem("nombre");
  localStorage.removeItem("apellido");
  localStorage.removeItem("rol_id");

  // 🔴 También puedes limpiar todo si prefieres
  // localStorage.clear();

  // 🔁 Redirige al login
  window.location.href = "inicio_secion.html";
});

