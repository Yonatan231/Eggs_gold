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




// Mostrar/ocultar menú lateral
const btntoggle = document.querySelector('.toggle-btn');
btntoggle.addEventListener('click', function(){
    document.getElementById('sidebar').classList.toggle('active');
});

// Cargar pedidos 
document.addEventListener("DOMContentLoaded", cargarPedidosRecientes);

function cargarPedidosRecientes() {
  fetch("http://localhost:8080/api/pedido/listar")
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
          <td>${p.idPedidos}</td>
          <td>${p.nombreUsuario}</td>
          <td colspan="2">${p.productos.join(", ")}</td> <!-- ✅ Aquí unimos nombre y cantidad -->
          <td>${p.direccion}</td>
          <td>${p.estado}</td>
           <td>${new Date(p.fechaCreacion).toLocaleString()}</td>
          <td>$${p.total}</td>
        `;

        const tdAccion = document.createElement("td");

        if (rol === 'ADMIN' && p.estado === 'Pendiente') {
          tdAccion.innerHTML = `
            <button onclick="actualizarEstado(${p.idPedidos}, 'APROBADO')">Aceptar</button>
            <button onclick="actualizarEstado(${p.idPedidos}, 'RECHAZADO')">Denegar</button>
          `;
        } else if (rol == "LOGISTICA" && p.estado === 'Aprobado') {
          tdAccion.innerHTML = `<button onclick="asignarPedido(${p.idPedidos})">Asignar</button>`;
        } else if (rol == "ADMIN" && p.estado === 'Aprobado') {
          tdAccion.innerHTML = `<span style="color: green; font-weight: bold;">✔ Aprobado</span>`;
        } else if (rol == "ADMIN" && p.estado === 'Rechazado') {
          tdAccion.innerHTML = `<span style="color: red; font-weight: bold;">✖ Rechazado</span>`;
        } else if (rol == "ADMIN" && p.estado === 'En_camino') {
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

    fetch('/api/pedido/actualizar-estado', {
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

/*mostrar productos*/
function cargarProductos(){
fetch("http://localhost:8080/inventario/producto")
  .then(response => response.json())
  .then(html => {
    const productos = html;
    const tabla = document.querySelector("#tabla-productos tbody");

    tabla.innerHTML = "";

    productos.forEach(producto => {
      const fila = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = producto.idProducto;

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
eliminarBtn.addEventListener("click", () => eliminarProducto(producto.idProducto));

const tdEliminar = document.createElement("td");
tdEliminar.appendChild(eliminarBtn);

      

      fila.appendChild(id);
      fila.appendChild(nombre);
      fila.appendChild(precio);
      fila.appendChild(categoria);
      fila.appendChild(descripcion);
      fila.appendChild(estado);

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
fetch("http://localhost:8080/clientes/pedidos")
  .then(resultado => resultado.json())
  .then(datos => {
    const clientes = datos;
    const tabla = document.querySelector("#tabla-clientes tbody");

    tabla.innerHTML = "";

    clientes.forEach(cliente => {
      const fila = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = cliente.idUsuarios;

      const nombre = document.createElement("td");
      nombre.textContent = cliente.nombre;

      const apellido = document.createElement("td");
      apellido.textContent = cliente.apellido;

      const documento = document.createElement("td");
      documento.textContent = cliente.numDocumento;

      const direccion = document.createElement("td");
      direccion.textContent = cliente.direccionUsuario;

      const telefono = document.createElement("td");
      telefono.textContent = cliente.telefono;

       const actualizar = document.createElement("td");

      const btnActualizar = document.createElement("button");
      btnActualizar.textContent = "Actualizar";
     
       btnActualizar.onclick = () => abrirModalActualizarCliente(cliente);
       actualizar.appendChild(btnActualizar)
       //boton eliminar clientes //
       const eliminarBtn = document.createElement("button");
eliminarBtn.textContent = "Eliminar";
eliminarBtn.addEventListener("click", () => eliminarProductoCliente(cliente.idUsuarios));

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
fetch("http://localhost:8080/conductores/pedidos-entregados")
  .then(respuesta => respuesta.json())
  .then(datos => {
    const conductores = datos;
    const tabla = document.querySelector("#tabla-conductores tbody");

    tabla.innerHTML = "";

    conductores.forEach(conductor => {
      const fila = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = conductor.idConductor;

      const nombre = document.createElement("td");
      nombre.textContent = conductor.nombre;

      const apellido = document.createElement("td");
      apellido.textContent = conductor.apellido;

      const documento = document.createElement("td");
      documento.textContent = conductor.numDocumento;

       const direccion = document.createElement("td");
       direccion.textContent = conductor.direccionUsuario;

       const telefono = document.createElement("td");
       telefono.textContent = conductor.telefono;

        const actualizar = document.createElement("td");

      const btnActualizar = document.createElement("button");
      btnActualizar.textContent = "Actualizar";
     
       btnActualizar.onclick = () => abrirModalActualizarConductores(conductor);
       actualizar.appendChild(btnActualizar)

        //boton eliminar conductores //
       const eliminarBtn = document.createElement("button");
eliminarBtn.textContent = "Eliminar";
eliminarBtn.addEventListener("click", () => eliminarProductoConductores(conductor.idUsuarios || conductor.idConductor));

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
fetch("http://localhost:8080/logistica/ver")
  .then(respuesta => respuesta.json())
  .then(datos => {
    const logistica = datos;
    const tabla = document.querySelector("#tabla-Logistica tbody");

    tabla.innerHTML = "";

    logistica.forEach(logistica => {
      const fila = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = logistica.idUsuarios;

      const nombre = document.createElement("td");
      nombre.textContent = logistica.nombre;

      const apellido = document.createElement("td");
      apellido.textContent = logistica.apellido;

      const documento = document.createElement("td");
      documento.textContent = logistica.numDocumento;

       const direccion = document.createElement("td");
       direccion.textContent = logistica.direccionUsuario;

       const telefono = document.createElement("td");
       telefono.textContent = logistica.telefono;

        const actualizar = document.createElement("td");

      const btnActualizar = document.createElement("button");
      btnActualizar.textContent = "Actualizar";
     
       btnActualizar.onclick = () => abrirModalActualizarLogistica(logistica);
       actualizar.appendChild(btnActualizar)

        //boton eliminar conductores //
       const eliminarBtn = document.createElement("button");
eliminarBtn.textContent = "Eliminar";
eliminarBtn.addEventListener("click", () => eliminarLogistica(logistica.idUsuarios));

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
    console.error("✖️Error al cargar logistica", error);
    alert("✖️Error al cargar logistica");
  });

}
cargarProductosLogistica();

// Función abrir modal actualizar productos
function abrirModalActualizar(producto) {
  document.getElementById("update-id").value = producto.idProducto; // ojo: idProductos en tu entidad
  document.getElementById("update-nombre").value = producto.nombre;
  document.getElementById("update-precio").value = producto.precio;
  document.getElementById("update-categoria").value = producto.categoria;
  document.getElementById("update-descripcion").value = producto.descripcion;
  document.getElementById("update-estado").value = producto.estado;


  document.getElementById("modalActualizar").style.display = "block";
}

// Función cerrar modal
function cerrarModal() {
  document.getElementById("modalActualizar").style.display = "none";
}

document.getElementById("formActualizarProducto").addEventListener("submit", function(e) {
  e.preventDefault();

  const id = document.getElementById("update-id").value;

  // Construir objeto producto
  const producto = {
    nombre: document.getElementById("update-nombre").value,
    precio: parseFloat(document.getElementById("update-precio").value),
    categoria: document.getElementById("update-categoria").value,
    descripcion: document.getElementById("update-descripcion").value,
    estado: document.getElementById("update-estado").value,

  };

  console.log("📦 Enviando producto:", producto);

  fetch("http://localhost:8080/actualizar/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(producto)
  })
  .then(resp => resp.json())
  .then(data => {
    if (data.success) {
      alert("✅ Producto actualizado correctamente.");
      cerrarModal();
      cargarProductos(); // Recargar la tabla
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

      document.getElementById("updatec-id").value = cliente.idUsuarios ;
    console.log("🆔 ID asignado al input:", document.getElementById("updatec-id").value);

    console.log("🔍 Cliente recibido:", cliente);

  document.getElementById("updatec-nombre").value = cliente.nombre;
  document.getElementById("updatec-apellido").value = cliente.apellido;
  document.getElementById("updatec-documento").value = cliente.numDocumento;
  document.getElementById("updatec-direccion").value = cliente.direccionUsuario;
  document.getElementById("updatec-telefono").value = cliente.telefono;



  // Mostrar el modal
  document.getElementById("modalActualizarClientes").style.display = "block";
}
//funcion cerrar modal//
function cerrarModalCliente() {
  document.getElementById("modalActualizarClientes").style.display = "none";
}

document.getElementById("formActualizarClientes").addEventListener("submit", function(e) {
  e.preventDefault();

    const usuario = {
        nombre: document.getElementById("updatec-nombre").value,
        apellido: document.getElementById("updatec-apellido").value,
        numDocumento: document.getElementById("updatec-documento").value,
        direccionUsuario: document.getElementById("updatec-direccion").value,
        telefono: document.getElementById("updatec-telefono").value
    };

    const id = document.getElementById("updatec-id").value;

    fetch(`http://localhost:8080/usuarios/${id}`, {
    method: "PUT",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario)
  })
  .then(resp => resp.json())
  .then(data => {
    if (data.success) {
      alert("✅ Cliente actualizado correctamente.");
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

// función de eliminar clientes //
function eliminarProductoCliente(id) {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
        fetch(`/eliminar/${id}`, {
            method: "PUT"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error en la petición al backend");
                }
                return response.text(); // el backend devuelve un mensaje plano
            })
            .then(data => {
                alert(data); // ✅ Muestra el mensaje del backend
                location.reload(); // Recarga la tabla para que ya no aparezca
            })
            .catch(error => {
                console.error("❌ Error al eliminar el cliente:", error);
                alert("❌ No se pudo eliminar el cliente.");
            });
    }
}


//funcion abrir modal actualizar conductores//
  function abrirModalActualizarConductores(conductor) {
    
  document.getElementById("updateco-id").value = conductor.idUsuarios || conductor.idConductor;
    console.log("🆔 ID asignado al input:", document.getElementById("updateco-id").value);

    console.log("🔍 Conductor recibido:", conductor);

  document.getElementById("updateco-nombre").value = conductor.nombre;
  document.getElementById("updateco-apellido").value = conductor.apellido;
  document.getElementById("updateco-documento").value = conductor.numDocumento;
  document.getElementById("updateco-direccion").value = conductor.direccionUsuario;
  document.getElementById("updateco-telefono").value = conductor.telefono;
  


  // Mostrar el modal
  document.getElementById("modalActualizarConductores").style.display = "block";
}
//funcion cerrar modal//
function cerrarModalConductores() {
  document.getElementById("modalActualizarConductores").style.display = "none";
}

document.getElementById("formActualizarConductores").addEventListener("submit", function(e) {
  e.preventDefault();

  const usuario = {
      nombre: document.getElementById("updateco-nombre").value,
      apellido: document.getElementById("updateco-apellido").value,
      numDocumento: document.getElementById("updateco-documento").value,
      direccionUsuario: document.getElementById("updateco-direccion").value,
      telefono: document.getElementById("updateco-telefono").value
  };

    const id = document.getElementById("updateco-id").value;


  fetch(`http://localhost:8080/usuarios/${id}`, {
    method: "PUT",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario)
  })
  .then(resp => resp.json())
  .then(data => {
    if (data.success) {
      alert("✅ Conductor actualizado correctamente.");
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
     if (confirm("¿Estás seguro de que quieres eliminar este conductor?")) {
         fetch(`/eliminar/${id}`, {
             method: "PUT"
         })
             .then(response => {
                 if (!response.ok) {
                     throw new Error("Error en la petición al backend");
                 }
                 return response.text(); // el backend devuelve un mensaje plano
             })
             .then(data => {
                 alert(data); // ✅ Muestra el mensaje del backend
                 location.reload(); // Recarga la tabla para que ya no aparezca
             })
             .catch(error => {
                 console.error("❌ Error al eliminar el conductor:", error);
                 alert("❌ No se pudo eliminar el conductor.");
             });
     }
}

//funcion abrir modal actualizar Logistica//
  function abrirModalActualizarLogistica(logistica) {
    
  document.getElementById("updateL-id").value = logistica.idUsuarios;
    console.log("🆔 ID asignado al input:", document.getElementById("updateL-id").value);

    console.log("🔍 Producto recibido:", logistica);

  document.getElementById("updateL-nombre").value = logistica.nombre;
  document.getElementById("updateL-apellido").value = logistica.apellido;
  document.getElementById("updateL-documento").value = logistica.numDocumento;
  document.getElementById("updateL-direccion").value = logistica.direccionUsuario;
  document.getElementById("updateL-telefono").value = logistica.telefono;
  


  // Mostrar el modal
  document.getElementById("modalActualizarLogistica").style.display = "block";
}
//funcion cerrar modal//
function cerrarModalLogistica() {
  document.getElementById("modalActualizarLogistica").style.display = "none";
}

document.getElementById("formActualizarLogistica").addEventListener("submit", function(e) {
  e.preventDefault();

    const usuario = {
        nombre: document.getElementById("updateL-nombre").value,
        apellido: document.getElementById("updateL-apellido").value,
        numDocumento: document.getElementById("updateL-documento").value,
        direccionUsuario: document.getElementById("updateL-direccion").value,
        telefono: document.getElementById("updateL-telefono").value
    };

  const id = document.getElementById("updateL-id").value;



  fetch(`http://localhost:8080/usuarios/${id}`, {
    method: "PUT",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario)
  })
  .then(resp => resp.json())
  .then(data => {
    if (data.success) {
      alert("✅ Logistica actualizado correctamente.");
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
     if (confirm("¿Estás seguro de que quieres eliminar logistica?")) {
         fetch(`/eliminar/${id}`, {
             method: "PUT"
         })
             .then(response => {
                 if (!response.ok) {
                     throw new Error("Error en la petición al backend");
                 }
                 return response.text(); // el backend devuelve un mensaje plano
             })
             .then(data => {
                 alert(data); // ✅ Muestra el mensaje del backend
                 location.reload(); // Recarga la tabla para que ya no aparezca
             })
             .catch(error => {
                 console.error("❌ Error al eliminar logistica:", error);
                 alert("❌ No se pudo eliminar logistica");
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
  fetch("/api/dashboard")
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
document.getElementById("cerrar_sesion").addEventListener("click", function(e) {
    e.preventDefault();
    localStorage.clear(); // limpia datos locales
    window.location.href = "/logout"; // llama al endpoint de Spring
});


