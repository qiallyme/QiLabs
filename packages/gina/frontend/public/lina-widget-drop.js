(function () {
  function injectLinaWidget() {
    if (document.getElementById("lina-widget-frame")) return;

    var iframe = document.createElement("iframe");
    iframe.id = "lina-widget-frame";
    iframe.src = "https://lina2.qially.com/lina-widget.html"; // 👈 key line
    iframe.style.position = "fixed";
    iframe.style.bottom = "20px";
    iframe.style.right = "20px";
    iframe.style.width = "360px";
    iframe.style.height = "520px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "16px";
    iframe.style.boxShadow = "0 18px 45px rgba(15, 23, 42, 0.35)";
    iframe.style.zIndex = "999999";
    document.body.appendChild(iframe);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    injectLinaWidget();
  } else {
    document.addEventListener("DOMContentLoaded", injectLinaWidget);
  }
})();
