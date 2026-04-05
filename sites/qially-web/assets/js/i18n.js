const translations = {
  en: {
    // Header
    "nav.home": "Home",
    "nav.tax_prep": "Tax Prep 2025",
    "nav.tax_resources": "Tax Resources",
    "nav.other_services": "Other Services",
    "nav.start_tax_return": "Start Tax Return",
    "nav.checklists": "Checklists & Resources",

    // Hero Section
    "hero.prefix": "Orchestrating ",
    "hero.chaos": "chaos",
    "hero.connector": "into ",
    "hero.clarity": "clarity.",
    "hero.subtitle":
      "Tax resolution, accounting cleanup, and structured systems for individuals and small businesses.",
    "hero.badge": "Now accepting 2025 Tax Clients",
    "hero.cta.start": "Start 2025 Tax Return",
    "hero.cta.checklist": "View Checklists",

    // Services Section
    "services.tax.title": "Tax & Accounting",
    "services.tax.desc":
      "Individual and Business tax preparation, resolution, and cleanup.",
    "services.tax.link": "Start Return →",
    "services.tax.checklist": "Checklists",
    "services.hr.title": "HR & Ops",
    "services.hr.desc":
      "Talent acquisition, compliance, and systems that scale.",
    "services.hr.link": "View Services →",
    "services.it.title": "IT & AI",
    "services.it.desc": "Automation and AI integrations that reduce busywork.",
    "services.it.link": "View Services →",

    // Portfolio Section
    "portfolio.title": "Systems Whisperer.",
    "portfolio.desc":
      "Corporate-grade precision with personal delivery. I operate as a solo-practitioner, meaning you get direct access, rapid turnaround, and an expert who actually knows your name.",
    "portfolio.cta.view": "View Portfolio",
    "portfolio.cta.cv": "Download CV",
    "portfolio.cta.cv_icon": "Download CV",
  },
  es: {
    // Header
    "nav.home": "Inicio",
    "nav.tax_prep": "Preparación de Impuestos 2025",
    "nav.tax_resources": "Recursos Fiscales",
    "nav.other_services": "Otros Servicios",
    "nav.start_tax_return": "Iniciar Declaración",
    "nav.checklists": "Listas de Verificación y Recursos",

    // Hero Section
    "hero.prefix": "Orquestando el ",
    "hero.chaos": "caos",
    "hero.connector": "hacia la ",
    "hero.clarity": "claridad.",
    "hero.subtitle":
      "Resolución de impuestos, limpieza contable y sistemas estructurados para individuos y pequeñas empresas.",
    "hero.badge": "Aceptando clientes para impuestos 2025",
    "hero.cta.start": "Iniciar Declaración 2025",
    "hero.cta.checklist": "Ver Listas de Verificación",

    // Services Section
    "services.tax.title": "Impuestos y Contabilidad",
    "services.tax.desc":
      "Preparación de impuestos individuales y comerciales, resolución y limpieza.",
    "services.tax.link": "Iniciar Declaración →",
    "services.tax.checklist": "Listas de Verificación",
    "services.hr.title": "RRHH y Operaciones",
    "services.hr.desc":
      "Adquisición de talento, cumplimiento y sistemas escalables.",
    "services.hr.link": "Ver Servicios →",
    "services.it.title": "TI e IA",
    "services.it.desc":
      "Automatización e integraciones de IA que reducen el trabajo manual.",
    "services.it.link": "Ver Servicios →",

    // Portfolio Section
    "portfolio.title": "Susurrador de Sistemas.",
    "portfolio.desc":
      "Precisión corporativa con entrega personal. Opero como profesional independiente, lo que significa acceso directo, respuesta rápida y un experto que realmente conoce su nombre.",
    "portfolio.cta.view": "Ver Portafolio",
    "portfolio.cta.cv": "Descargar CV",
    "portfolio.cta.cv_icon": "Descargar CV",
  },
};

class I18n {
  constructor() {
    this.currentLang = localStorage.getItem("language") || "en";
    this.translations = translations;
    this.elements = document.querySelectorAll("[data-i18n]");
    this.init();
  }

  init() {
    this.updateLanguage(this.currentLang);
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Handle toggle buttons dynamically since they might be in injected components
    document.addEventListener("click", (e) => {
      const toggle = e.target.closest("[data-lang-toggle]");
      if (toggle) {
        const newLang = this.currentLang === "en" ? "es" : "en";
        this.setLanguage(newLang);
      }
    });
  }

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem("language", lang);
    this.updateLanguage(lang);

    // Dispatch event for other components
    window.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { language: lang } }),
    );
  }

  updateLanguage(lang) {
    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update all translatable elements
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (this.translations[lang] && this.translations[lang][key]) {
        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
          element.placeholder = this.translations[lang][key];
        } else {
          // Check for HTML content in translation (optional security risk if untrusted, but here it's static)
          // For now, use innerHTML to support basic formatting like <span>
          element.innerHTML = this.translations[lang][key];
        }
      }
    });

    // Update toggle button text/state
    const toggles = document.querySelectorAll("[data-lang-toggle]");
    toggles.forEach((toggle) => {
      // Example: Update button text or icon based on state
      const textSpan = toggle.querySelector(".lang-text");
      if (textSpan) {
        textSpan.textContent = lang === "en" ? "ES" : "EN";
      }
    });
  }
}

// Initialize on window load or when ready
window.i18nManager = new I18n();
