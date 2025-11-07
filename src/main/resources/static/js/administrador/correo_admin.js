document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Página de envío de correos cargada");

    const roleCards = document.querySelectorAll(".role-card");
    const hiddenInput = document.getElementById("rolIds");
    const form = document.querySelector("form");
    const btnEnviar = document.getElementById("btnEnviarCorreos");
    const asuntoInput = document.getElementById("asunto");
    const mensajeInput = document.getElementById("mensaje");

    if (!roleCards.length) {
        console.error("❌ No se encontraron elementos con clase .role-card");
        return;
    }

    const rolesSeleccionados = new Set();

    // Selección de roles
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
            console.log("📩 Roles seleccionados:", hiddenInput.value);
        });
    });

    // Validar antes de enviar
    form.addEventListener("submit", (event) => {
        const asunto = asuntoInput.value.trim();
        const mensaje = mensajeInput.value.trim();
        const roles = hiddenInput.value.trim();

        if (!roles) {
            event.preventDefault();
            alert("⚠️ Debes seleccionar al menos un rol destinatario.");
            return;
        }

        if (!asunto || !mensaje) {
            event.preventDefault();
            alert("⚠️ Completa el asunto y el mensaje antes de enviar.");
            return;
        }

        btnEnviar.disabled = true;
        btnEnviar.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Enviando...`;
    });
});
