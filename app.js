/**
 * ============================================================================
 * SITIO WEB DE VENTAS - LÓGICA INTERACTIVA (app.js)
 * ============================================================================
 * Este archivo gestiona la interactividad de la página de ventas:
 * 1. Menú desplegable móvil (hamburguesa).
 * 2. Cotizador dinámico en tiempo real (calcula precios según invitados y extras).
 * 3. Envió automático de cotizaciones por correo electrónico vía FormSubmit.co.
 * 4. Prellenado inteligente del formulario de contacto según el plan elegido.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Inicializar los 3 módulos principales al cargar la página
    setupMobileNav();
    setupPriceCalculator();
    setupLeadsForm();
});

/**
 * ----------------------------------------------------------------------------
 * 1. MENÚ NAVEGACIÓN MÓVIL (setupMobileNav)
 * ----------------------------------------------------------------------------
 * Abre y cierra el menú hamburguesa en pantallas pequeñas y cambia el icono.
 */
function setupMobileNav() {
    const toggleBtn = document.getElementById("nav-toggle-btn");
    const navMenu = document.querySelector(".nav-menu");

    if (toggleBtn && navMenu) {
        // Evento al hacer clic en el botón de hamburguesa
        toggleBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            const icon = toggleBtn.querySelector("i");
            // Alternar entre icono de hamburguesa (ti-menu-2) y tache (ti-x)
            if (navMenu.classList.contains("active")) {
                icon.className = "ti ti-x";
            } else {
                icon.className = "ti ti-menu-2";
            }
        });

        // Cerrar el menú automáticamente al hacer clic en cualquier enlace
        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                toggleBtn.querySelector("i").className = "ti ti-menu-2";
            });
        });
    }
}

/**
 * ----------------------------------------------------------------------------
 * 2. CALCULADORA DINÁMICA DE PRECIOS (setupPriceCalculator)
 * ----------------------------------------------------------------------------
 * Permite al usuario mover la barra de invitados y activar casillas de verificación.
 * Calcula en tiempo real el costo total y genera el resumen desglosado.
 */
function setupPriceCalculator() {
    // Referencias a los elementos del DOM (slider, casillas y pantallas de texto)
    const guestsRange = document.getElementById("invitados-range");
    const guestsCount = document.getElementById("invitados-count");
    const optEmail = document.getElementById("opt-email");
    const optBranding = document.getElementById("opt-branding");
    const optMultidoor = document.getElementById("opt-multidoor");
    
    const totalPriceDisplay = document.getElementById("total-price");
    const priceDetailsList = document.getElementById("price-details-list");
    const calcCtaBtn = document.getElementById("calc-cta-btn");
    const hiddenPriceInput = document.getElementById("c-calc-price");

    // Si el cotizador no existe en la página actual, salir de la función
    if (!guestsRange) return;

    // Escuchar cambios en el slider y casillas para recalcular inmediatamente
    guestsRange.addEventListener("input", calculatePrice);
    optEmail.addEventListener("change", calculatePrice);
    optBranding.addEventListener("change", calculatePrice);
    optMultidoor.addEventListener("change", calculatePrice);

    // Ejecutar cálculo inicial al cargar
    calculatePrice();

    /**
     * Función interna de cálculo de precios
     * MODIFICAR AQUÍ: Si deseas cambiar las tarifas o costos de los servicios.
     */
    function calculatePrice() {
        const guests = parseInt(guestsRange.value);
        guestsCount.textContent = guests;

        // --- TARIFA BASE SEGÚN CANTIDAD DE INVITADOS ---
        let basePrice = 799; 
        
        if (guests <= 150) {
            basePrice = 799;  // Hasta 150 invitados
        } else if (guests <= 400) {
            basePrice = 1299; // De 151 a 400 invitados
        } else {
            basePrice = 1999; // Más de 400 invitados
        }

        let total = basePrice;
        const details = [];

        // Registro del servicio base en el desglose
        details.push({
            name: `Servicio base (${guests} invitados)`,
            price: basePrice
        });

        // --- CÁLCULO DE SERVICIOS ADICIONALES (EXTRAS) ---
        
        // Extra 1: Envío masivo por Email ($1.0 MXN por invitado)
        if (optEmail.checked) {
            const emailPrice = Math.round(guests * 1.0);
            total += emailPrice;
            details.push({
                name: "Envío masivo por Email",
                price: emailPrice
            });
        }

        // Extra 2: Personalización con Logo ($200 MXN cuota fija)
        if (optBranding.checked) {
            const brandingPrice = 200;
            total += brandingPrice;
            details.push({
                name: "Personalización con tu Logo",
                price: brandingPrice
            });
        }

        // Extra 3: Sincronización Multipuerta ($300 MXN cuota fija)
        if (optMultidoor.checked) {
            const multidoorPrice = 300;
            total += multidoorPrice;
            details.push({
                name: "Sincronización Multipuerta",
                price: multidoorPrice
            });
        }

        // Actualizar los textos y campos ocultos en la pantalla
        totalPriceDisplay.textContent = formatNumber(total);
        hiddenPriceInput.value = `$${total} MXN`;

        // Renderizar la lista desglosada en HTML
        priceDetailsList.innerHTML = details.map(item => `
            <li>
                <span>${item.name}</span>
                <span>$${formatNumber(item.price)} MXN</span>
            </li>
        `).join('');

        // Actualizar el enlace del botón de acción para enviar los datos al formulario #contacto
        calcCtaBtn.href = `#contacto?guests=${guests}&total=${total}&email=${optEmail.checked}&branding=${optBranding.checked}&multidoor=${optMultidoor.checked}`;
    }

    // Auxiliar para formatear números con comas de miles (Ej: 1200 -> 1,200)
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

/**
 * ----------------------------------------------------------------------------
 * 3. ENVÍO DE FORMULARIO DE COTIZACIÓN (setupLeadsForm)
 * ----------------------------------------------------------------------------
 * Procesa el envío del formulario usando FormSubmit.co para recibir los datos
 * de los clientes en tu correo personal gratis y sin redirigir la página.
 */
function setupLeadsForm() {
    const form = document.getElementById("leads-form");
    const formStatus = document.getElementById("form-status");
    
    // Escuchar cambios de URL (hashtags) para prellenar datos cuando el usuario da clic en un plan
    window.addEventListener("hashchange", prefillFormFromHash);
    prefillFormFromHash(); // Verificación al cargar la página

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault(); // Evitar recarga tradicional de la página
            
            // Obtener valores de los campos del formulario
            const name = document.getElementById("c-name").value;
            const email = document.getElementById("c-email").value;
            const eventType = document.getElementById("c-event-type").value;
            const guests = document.getElementById("c-guests").value;
            const details = document.getElementById("c-details").value;
            const price = document.getElementById("c-calc-price").value;

            // Deshabilitar botón temporalmente y mostrar estado "Enviando..."
            const submitBtn = form.querySelector("button[type='submit']");
            const originalBtnText = submitBtn ? submitBtn.innerHTML : "Enviar";
            
            if (submitBtn) {
                submitBtn.setAttribute("disabled", "true");
                submitBtn.innerHTML = "Enviando cotización...";
            }

            // Petición AJAX transparente a FormSubmit.co dirigida a tu correo
            fetch("https://formsubmit.co/ajax/sdbernalg004@gmail.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    Nombre: name,
                    Email: email,
                    Tipo_Evento: eventType,
                    Invitados: guests,
                    Detalles: details,
                    Precio_Cotizado: price,
                    _subject: `Nueva Cotización QR: ${name} (${eventType})`
                })
            })
            .then(response => response.json())
            .then(data => {
                // Restaurar botón
                if (submitBtn) {
                    submitBtn.removeAttribute("disabled");
                    submitBtn.innerHTML = originalBtnText;
                }
                
                // Mostrar mensaje flotante de confirmación de éxito
                formStatus.classList.remove("hidden");
                form.reset();

                // Ocultar mensaje de éxito tras 6 segundos
                setTimeout(() => {
                    formStatus.classList.add("hidden");
                }, 6000);
            })
            .catch(error => {
                console.error("Error al enviar formulario:", error);
                if (submitBtn) {
                    submitBtn.removeAttribute("disabled");
                    submitBtn.innerHTML = originalBtnText;
                }
                alert("Hubo un problema al enviar la cotización por correo. Por favor contáctanos directamente por WhatsApp.");
            });
        });
    }

    /**
     * ------------------------------------------------------------------------
     * PRELLENADO INTELIGENTE DEL FORMULARIO DE CONTACTO
     * ------------------------------------------------------------------------
     * Lee la URL cuando el usuario presiona un botón de "Cotizar" o "Comprar",
     * extrayendo los parámetros y llenando los campos del formulario automáticamente.
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

            // Caso A: Si el usuario dio clic en "Comprar Licencia PRO"
            if (params.get("plan") === "pro-license") {
                if (guestsInput) guestsInput.value = "9999";
                if (priceInput) priceInput.value = "$1,799 MXN";
                if (eventTypeSelect) eventTypeSelect.value = "Otro";
                if (detailsTextarea) {
                    detailsTextarea.value = "Solicitud de Compra: Licencia de Software PRO\n- Requiero la aplicación instalable (.exe y .apk) y una clave de activación de por vida para el panel de branding, generador masivo y fusión multipuerta.";
                }
                return;
            }

            // Caso B: Si viene del cotizador interactivo
            if (params.has("guests") && guestsInput) {
                guestsInput.value = params.get("guests");
            }

            if (priceInput && params.has("total")) {
                priceInput.value = `$${params.get("total")} MXN`;
            }

            // Llenar cuadro de texto con la nota desglosada
            if (detailsTextarea) {
                let note = "Pre-cotización calculada desde la web:\n";
                note += `- Invitados: ${params.get("guests")}\n`;
                note += `- Presupuesto estimado: $${params.get("total")} MXN\n`;
                note += `- Envío por email: ${params.get("email") === "true" ? "Sí" : "No"}\n`;
                note += `- App personalizada: ${params.get("branding") === "true" ? "Sí" : "No"}\n`;
                note += `- Múltiples accesos: ${params.get("multidoor") === "true" ? "Sí" : "No"}\n`;
                detailsTextarea.value = note;
            }
        }
    }
}
