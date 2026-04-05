// One-line embed loader for partner sites.
// Usage:
// <script src="https://lina.qially.com/assets/js/lina-widget-drop.js" defer></script>
(function () {
  window.LINA_API_BASE = "https://lina.qially.com";

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function init() {
    try {
      await loadScript("https://lina.qially.com/assets/js/lina-api-client.js");
      await loadScript("https://lina.qially.com/assets/js/lina-widget.js");
    } catch (err) {
      console.error("Failed to load Lina widget scripts:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
