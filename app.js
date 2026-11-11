/**
 * ============================================================================
 * ACCESOQR PRO — LÓGICA INTERACTIVA DEL SITIO WEB (app.js v7.0)
 * ============================================================================
 * Gestión de interactividad y hospitalidad digital:
 * 1. Skeleton Screen Loader fluido sin lag artificial (espera a fuentes).
 * 2. Menú de navegación móvil responsive con animación de icono.
 * 3. Formulario de cotización y asesoría conectado a FormSubmit.co.
 * 4. Prellenado inteligente del formulario según hash en URL.
 */

document.addEventListener("DOMContentLoaded", () => {
    setupSkeletonLoader();
    setupMobileNav();
    setupLeadsForm();
});

/**
 * ----------------------------------------------------------------------------
 * 1. SKELETON SCREEN LOADER FLUIDO (setupSkeletonLoader)
 * ----------------------------------------------------------------------------
 * Presenta la silueta de los componentes y los revela fluidamente al cargar
 * las tipografías del sistema, garantizando cero parpadeos ni demoras artificiales.
 */
function setupSkeletonLoader() {
    const skeletonOverlay = document.getElementById("skeleton-overlay");
    let revealed = false;

    function revealRealComponents() {
        if (revealed) return;
        revealed = true;

        requestAnimationFrame(() => {
            if (skeletonOverlay) {
                skeletonOverlay.classList.add("hidden");
            }
            document.body.classList.remove("loading-state");
            document.body.classList.add("page-loaded");
        });
    }

    // Si la API de fuentes está disponible, sincronizar con la carga tipográfica
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(revealRealComponents);
    }

    if (document.readyState === "complete") {
        revealRealComponents();
    } else {
        window.addEventListener("load", revealRealComponents);
        // Fallback de seguridad en caso de redes lentas
        setTimeout(revealRealComponents, 1200);
    }
}

/**
 * ----------------------------------------------------------------------------
 * 2. MENÚ DE NAVEGACIÓN MÓVIL (setupMobileNav)
 * ----------------------------------------------------------------------------
 * Abre y cierra el menú hamburguesa en dispositivos móviles y conmuta el icono.
 */
function setupMobileNav() {
    const toggleBtn = document.getElementById("nav-toggle-btn");
    const navMenu = document.querySelector(".nav-menu");

    if (toggleBtn && navMenu) {
        toggleBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            const icon = toggleBtn.querySelector("i");
            if (icon) {
                icon.className = navMenu.classList.contains("active") ? "ti ti-x" : "ti ti-menu-2";
            }
        });

        // Cerrar menú automáticamente al hacer clic en un enlace de navegación
        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                const icon = toggleBtn.querySelector("i");
                if (icon) icon.className = "ti ti-menu-2";
            });
        });
    }
}

/**
 * ----------------------------------------------------------------------------
 * 3. ENVÍO DE FORMULARIO DE COTIZACIÓN Y ASESORÍA (setupLeadsForm)
 * ----------------------------------------------------------------------------
 * Procesa el envío asíncrono hacia FormSubmit.co para recibir solicitudes de
 * asesoría directamente en el correo oficial sin recargas de página.
 */
function setupLeadsForm() {
    const form = document.getElementById("leads-form");
    const formStatus = document.getElementById("form-status");

    window.addEventListener("hashchange", prefillFormFromHash);
    prefillFormFromHash();

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("c-name") ? document.getElementById("c-name").value : "";
            const phone = document.getElementById("c-phone") ? document.getElementById("c-phone").value : "No especificado";
            const email = document.getElementById("c-email") ? document.getElementById("c-email").value : "";
            const eventType = document.getElementById("c-event-type") ? document.getElementById("c-event-type").value : "";
            const guests = document.getElementById("c-guests") ? document.getElementById("c-guests").value : "";
            const details = document.getElementById("c-details") ? document.getElementById("c-details").value : "";
            const price = document.getElementById("c-calc-price") ? document.getElementById("c-calc-price").value : "";

            const submitBtn = form.querySelector("button[type='submit']");
            const originalBtnText = submitBtn ? submitBtn.innerHTML : "Enviar";

            if (submitBtn) {
                submitBtn.setAttribute("disabled", "true");
                submitBtn.innerHTML = 'Enviando consulta... <i class="ti ti-loader-2 ti-spin"></i>';
            }

            fetch("https://formsubmit.co/ajax/sdbernalg004@gmail.com", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    Nombre: name,
                    Telefono_WhatsApp: phone,
                    Email: email,
                    Tipo_Evento: eventType,
                    Invitados: guests,
                    Detalles: details,
                    Precio_Cotizado: price,
                    _subject: `Nueva Consulta AccesoQR: ${name} - Tel: ${phone} (${eventType})`
                })
            })
            .then(response => response.json())
            .then(data => {
                if (submitBtn) {
                    submitBtn.removeAttribute("disabled");
                    submitBtn.innerHTML = originalBtnText;
                }

                if (formStatus) {
                    formStatus.classList.remove("hidden");
                }
                form.reset();

                setTimeout(() => {
                    if (formStatus) formStatus.classList.add("hidden");
                }, 6000);
            })
            .catch(error => {
                console.error("Error al enviar formulario:", error);
                if (submitBtn) {
                    submitBtn.removeAttribute("disabled");
                    submitBtn.innerHTML = originalBtnText;
                }
                alert("Hubo un problema al enviar la consulta. Por favor contáctanos directamente por WhatsApp al +52 55 8645 1740.");
            });
        });
    }

    /**
     * Prellenado inteligente del formulario según hash en la URL
     */
    function prefillFormFromHash() {
        const hash = window.location.hash;
        if (hash && hash.includes("?")) {
            const paramsStr = hash.split("?")[1];
            const params = new URLSearchParams(paramsStr);

            const guestsInput = document.getElementById("c-guests");
            const detailsTextarea = document.getElementById("c-details");
            const priceInput = document.getElementById("c-calc-price");
            const eventTypeSelect = document.getElementById("c-event-type");

            if (params.get("plan") === "pro-license") {
                if (guestsInput) guestsInput.value = "9999";
                if (priceInput) priceInput.value = "$1,799 MXN";
                if (eventTypeSelect) eventTypeSelect.value = "Wedding Planner / Agencia";
                if (detailsTextarea) {
                    detailsTextarea.value = "Solicitud de Compra: Licencia PRO Ilimitada\n- Requiero activación de por vida para el panel de branding, generador de pases masivos y sincronización multipuerta.";
                }
                return;
            }

            if (params.has("guests") && guestsInput) {
                guestsInput.value = params.get("guests");
            }

            if (priceInput && params.has("total")) {
                priceInput.value = `$${params.get("total")} MXN`;
            }

            if (detailsTextarea && params.has("guests")) {
                let note = "Consulta generada desde la web:\n";
                note += `- Invitados estimados: ${params.get("guests")}\n`;
                if (params.has("total")) note += `- Presupuesto aproximado: $${params.get("total")} MXN\n`;
                detailsTextarea.value = note;
            }
        }
    }
}
