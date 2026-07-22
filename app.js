// JavaScript for Sales Landing Page - Interactive Features

document.addEventListener("DOMContentLoaded", () => {
    setupMobileNav();
    setupPriceCalculator();
    setupLeadsForm();
});

// Mobile Navbar Toggle
function setupMobileNav() {
    const toggleBtn = document.getElementById("nav-toggle-btn");
    const navMenu = document.querySelector(".nav-menu");

    if (toggleBtn && navMenu) {
        toggleBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            const icon = toggleBtn.querySelector("i");
            if (navMenu.classList.contains("active")) {
                icon.className = "ti ti-x";
            } else {
                icon.className = "ti ti-menu-2";
            }
        });

        // Close menu when clicking link
        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                toggleBtn.querySelector("i").className = "ti ti-menu-2";
            });
        });
    }
}

// Interactive Price Calculator
function setupPriceCalculator() {
    const guestsRange = document.getElementById("invitados-range");
    const guestsCount = document.getElementById("invitados-count");
    const optEmail = document.getElementById("opt-email");
    const optBranding = document.getElementById("opt-branding");
    const optMultidoor = document.getElementById("opt-multidoor");
    
    const totalPriceDisplay = document.getElementById("total-price");
    const priceDetailsList = document.getElementById("price-details-list");
    const calcCtaBtn = document.getElementById("calc-cta-btn");
    const hiddenPriceInput = document.getElementById("c-calc-price");

    if (!guestsRange) return;

    // Trigger calculation on input change
    guestsRange.addEventListener("input", calculatePrice);
    optEmail.addEventListener("change", calculatePrice);
    optBranding.addEventListener("change", calculatePrice);
    optMultidoor.addEventListener("change", calculatePrice);

    // Initial calculation
    calculatePrice();

    function calculatePrice() {
        const guests = parseInt(guestsRange.value);
        guestsCount.textContent = guests;

        // Pricing Configuration (Precios Bajados)
        let basePrice = 799; 
        
        if (guests <= 150) {
            basePrice = 799;
        } else if (guests <= 400) {
            basePrice = 1299;
        } else {
            basePrice = 1999;
        }

        let total = basePrice;
        const details = [];

        // Base price detail
        details.push({
            name: `Servicio base (${guests} invitados)`,
            price: basePrice
        });

        // Add-on calculations
        if (optEmail.checked) {
            // $1.0 MXN extra per guest for bulk email delivery
            const emailPrice = Math.round(guests * 1.0);
            total += emailPrice;
            details.push({
                name: "Envío masivo por Email",
                price: emailPrice
            });
        }

        if (optBranding.checked) {
            const brandingPrice = 200;
            total += brandingPrice;
            details.push({
                name: "Personalización con tu Logo",
                price: brandingPrice
            });
        }

        if (optMultidoor.checked) {
            const multidoorPrice = 300;
            total += multidoorPrice;
            details.push({
                name: "Sincronización Multipuerta",
                price: multidoorPrice
            });
        }

        // Render calculations
        totalPriceDisplay.textContent = formatNumber(total);
        hiddenPriceInput.value = `$${total} MXN`;

        priceDetailsList.innerHTML = details.map(item => `
            <li>
                <span>${item.name}</span>
                <span>$${formatNumber(item.price)} MXN</span>
            </li>
        `).join('');

        // Dynamic CTA link carrying price info to contact form
        calcCtaBtn.href = `#contacto?guests=${guests}&total=${total}&email=${optEmail.checked}&branding=${optBranding.checked}&multidoor=${optMultidoor.checked}`;
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

// Leads Form Submission Handling
function setupLeadsForm() {
    const form = document.getElementById("leads-form");
    const formStatus = document.getElementById("form-status");
    
    // Parse URL hash parameters to prefill form if navigating from calculator CTA
    window.addEventListener("hashchange", prefillFormFromHash);
    prefillFormFromHash(); // Initial check

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const name = document.getElementById("c-name").value;
            const email = document.getElementById("c-email").value;
            const eventType = document.getElementById("c-event-type").value;
            const guests = document.getElementById("c-guests").value;
            const details = document.getElementById("c-details").value;
            const price = document.getElementById("c-calc-price").value;

            const submitBtn = form.querySelector("button[type='submit']");
            const originalBtnText = submitBtn ? submitBtn.innerHTML : "Enviar";
            
            if (submitBtn) {
                submitBtn.setAttribute("disabled", "true");
                submitBtn.innerHTML = "Enviando cotización...";
            }

            // Enviar datos reales a tu correo gratis vía FormSubmit.co
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
                if (submitBtn) {
                    submitBtn.removeAttribute("disabled");
                    submitBtn.innerHTML = originalBtnText;
                }
                
                // Show success feedback
                formStatus.classList.remove("hidden");
                form.reset();

                // Hide feedback after 6 seconds
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
                if (guestsInput) guestsInput.value = "9999"; // Representing unlimited
                if (priceInput) priceInput.value = "$1,799 MXN";
                if (eventTypeSelect) eventTypeSelect.value = "Otro";
                if (detailsTextarea) {
                    detailsTextarea.value = "Solicitud de Compra: Licencia de Software PRO\n- Requiero la aplicación instalable (.exe y .apk) y una clave de activación de por vida para el panel de branding, generador masivo y fusión multipuerta.";
                }
                return;
            }

            if (params.has("guests") && guestsInput) {
                guestsInput.value = params.get("guests");
            }

            if (priceInput && params.has("total")) {
                priceInput.value = `$${params.get("total")} MXN`;
            }

            // Autofill details textarea with calculated summaries to help client
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
