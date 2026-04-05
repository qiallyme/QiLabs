// Load components
async function loadComponent(id, file) {
  const response = await fetch(file);
  const text = await response.text();
  document.getElementById(id).innerHTML = text;
}
const loadHeader = loadComponent("nav-placeholder", "/header.html");
const loadFooter = loadComponent("footer-placeholder", "/footer.html");

Promise.all([loadHeader, loadFooter]).then(() => {
  if (window.i18nManager) {
    window.i18nManager.init();
  }
});

// Zoho SalesIQ Integration (Web PWA Mode)
const isNativeApp =
  window.navigator.userAgent.includes("QiAllyNative") ||
  new URLSearchParams(window.location.search).has("native");

if (!isNativeApp) {
  window.$zoho = window.$zoho || {};
  $zoho.salesiq = $zoho.salesiq || {
    ready: function () {
      console.log("SalesIQ Web is ready");
    },
  };
  (function () {
    var d = document;
    var s = d.createElement("script");
    s.type = "text/javascript";
    s.id = "zsiqscript";
    s.defer = true;
    s.src =
      "https://salesiq.zohopublic.com/widget?wc=siqdb087c4840b1b49e07ec03ea0af3a71c14fff19429170b3e4d9f22d7006f343c";
    var t = d.getElementsByTagName("script")[0];
    t.parentNode.insertBefore(s, t);
  })();
} else {
  console.log(
    "Native App detected: Suppressing SalesIQ Web Widget to use Native Mobilisten SDK instead.",
  );
}
