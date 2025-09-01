document.addEventListener("DOMContentLoaded", () => {
  fetch("PHP/ver_reportes.php")
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById("reportes");
      contenedor.innerHTML = "";

      if (!data.success) {
        contenedor.innerHTML = `<p style="color:red;">❌ ${data.message}</p>`;
        return;
      }

      const { destinatario, reportes } = data;

      const titulo = document.createElement("h2");
      titulo.textContent = `📥 Mensajes para: ${destinatario}`;
      contenedor.appendChild(titulo);

      if (reportes.length === 0) {
        contenedor.innerHTML += "<p>No hay reportes.</p>";
        return;
      }

       const nombre = localStorage.getItem("nombre");
       const apellido = localStorage.getItem("apellido");

      reportes.forEach(reporte => {
        const card = document.createElement("div");
        card.classList.add("reporte-card");

        card.innerHTML = `
          <img src="imagenes/LOGO.jpg" class="logo" width="50" height="50" style="border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
          <p><strong>De:</strong> ${reporte.remitente} ${nombre} ${apellido}</p>
          <p><strong>Título:</strong> ${reporte.titulo}</p>
          <p><strong>Mensaje:</strong> ${reporte.descripcion.replace(/\n/g, "<br>")}</p>
          ${reporte.archivo ? `<p><strong>Archivo:</strong></p><img src="imagenes/${reporte.archivo}" style="max-width:100%;">` : ''}
          <p><strong>Fecha:</strong> ${reporte.fecha}</p>
          <hr>
        `;

        contenedor.appendChild(card);
      });
    })
    .catch(err => {
      console.error("❌ Error al cargar reportes:", err);
      document.getElementById("reportes").innerHTML = "Error al cargar los reportes.";
    });
});


   document.addEventListener("DOMContentLoaded", () => {
    const btnAtras = document.getElementById("btn-atras");
    const rol = localStorage.getItem("rol_id");

    if (rol == "1") {
      btnAtras.href = "administrador.html";
    } else if (rol == "2") {
      btnAtras.href = "conductor.html";
    } else if (rol == "3") {
      btnAtras.href = "logistica.html";
    } else {
      btnAtras.href = "inicio.html"; // Fallback
    }
  });



  document.addEventListener("DOMContentLoaded", () => {
  const remitente = localStorage.getItem("rol_id");
  const nombreRol = {
    1: "administrador",
    2: "conductor",
    3: "logistica"
  };

  // Establecer el valor del input oculto
  if (remitente && document.getElementById("remitente")) {
    const rolNombre = nombreRol[remitente] || "desconocido";
    document.getElementById("remitente").value = rolNombre;

    // Mostrar quién está creando el reporte
    const titulo = document.getElementById("titulo-formulario");
    if (titulo) {
      titulo.textContent = `Crea reporte señor:  ${rolNombre}`;
    }
  }
});


