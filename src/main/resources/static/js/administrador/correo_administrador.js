// correo_administrador.js - logica de seleccion de roles y envio

document.addEventListener("DOMContentLoaded", () => {
    const roleCards = document.querySelectorAll(".role-card");
    const hiddenInput = document.getElementById("rolIds");
    const form = document.querySelector("form");
    const btnEnviar = document.getElementById("btnEnviarCorreos");
    const asuntoInput = document.getElementById("asunto");
    const mensajeInput = document.getElementById("mensaje");

    if (!roleCards.length) {
        console.error("no se encontraron elementos con clase .role-card");
        return;
    }

    const rolesSeleccionados = new Set();

    // seleccion de roles
    roleCards.forEach(card => {
        card.addEventListener("click", () => {
            const id = card.dataset.id;
            if (!id) return;

            card.classList.toggle("selected");
            if (rolesSeleccionados.has(id)) {
                rolesSeleccionados.delete(id);
            } else {
                rolesSeleccionados.add(id);
            }

            hiddenInput.value = Array.from(rolesSeleccionados).join(",");
            console.log("roles seleccionados:", hiddenInput.value);
        });
    });

    // validar antes de enviar
    form.addEventListener("submit", (event) => {
        const asunto = asuntoInput.value.trim();
        const mensaje = mensajeInput.value.trim();
        const roles = hiddenInput.value.trim();

        if (!roles) {
            event.preventDefault();
            alert("Debes seleccionar al menos un rol destinatario.");
            return;
        }

        if (!asunto || !mensaje) {
            event.preventDefault();
            alert("Completa el asunto y el mensaje antes de enviar.");
            return;
        }

        btnEnviar.disabled = true;
        btnEnviar.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Enviando...`;
    });
});