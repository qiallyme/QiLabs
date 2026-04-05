(function () {
  function injectStyles() {
    if (document.getElementById("lina-widget-styles")) return;
    const style = document.createElement("style");
    style.id = "lina-widget-styles";
    style.textContent = `
.lina-chat-widget {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.lina-chat-toggle {
  border: none;
  border-radius: 999px;
  padding: 8px 14px 8px 8px;
  background: #111827;
  color: #f9fafb;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.35);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
}
.lina-chat-toggle-avatar {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 0%, #ffe5de 0, #ff6b35 40%, #d84315 100%);
  box-shadow: 0 0 10px rgba(255, 107, 53, 0.55);
  position: relative;
  overflow: hidden;
}
.lina-chat-toggle-avatar::after {
  content: "";
  position: absolute;
  inset: 5px;
  border-radius: inherit;
  border: 1px solid rgba(255, 255, 255, 0.75);
}
.lina-chat-toggle-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
}
.lina-chat-toggle-text span:first-child {
  font-size: 0.8rem;
  font-weight: 600;
}
.lina-chat-toggle-text span:last-child {
  font-size: 0.7rem;
  color: #e5e7eb;
}
.lina-chat-toggle-indicator {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.85);
}
.lina-chat-panel {
  width: 310px;
  max-height: 420px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.35);
  display: none;
  flex-direction: column;
  overflow: hidden;
}
.lina-chat-widget.lina-open .lina-chat-panel {
  display: flex;
}
.lina-chat-panel-header {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fffbf7, #fff7ec);
}
.lina-chat-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.lina-avatar {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 0%, #ffe5de 0, #ff6b35 40%, #d84315 100%);
  box-shadow: 0 0 10px rgba(255, 107, 53, 0.55);
  position: relative;
  overflow: hidden;
}
.lina-avatar::after {
  content: "";
  position: absolute;
  inset: 5px;
  border-radius: inherit;
  border: 1px solid rgba(255, 255, 255, 0.75);
}
.lina-chat-panel-title-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lina-chat-panel-title-text span:first-child {
  font-size: 0.8rem;
  font-weight: 600;
  color: #111827;
}
.lina-chat-panel-title-text span:last-child {
  font-size: 0.7rem;
  color: #6b7280;
}
.lina-chat-panel-body {
  padding: 10px 10px 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lina-chat-panel-messages {
  max-height: 260px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lina-bubble {
  max-width: 100%;
  padding: 8px 9px;
  border-radius: 14px;
  font-size: 0.8rem;
  line-height: 1.45;
}
.lina-bubble-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
  margin-bottom: 4px;
}
.lina-bubble.lina {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #374151;
  align-self: flex-start;
}
.lina-bubble.member {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(56, 189, 248, 0.35));
  border: 1px solid rgba(56, 189, 248, 0.6);
  color: #111827;
  align-self: flex-end;
}
.lina-chat-panel-footer {
  padding: 6px 10px 10px;
  border-top: 1px solid #e5e7eb;
}
.lina-chat-panel-input {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  padding: 5px 7px;
  background: #f9fafb;
}
.lina-chat-panel-input input {
  border: none;
  background: transparent;
  flex: 1;
  font-size: 0.78rem;
  color: #374151;
  outline: none;
}
.lina-chat-panel-send {
  border: none;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  background: linear-gradient(135deg, #ff6b35, #ffb347);
  color: #111827;
  cursor: pointer;
}
.lina-chat-panel-meta {
  margin-top: 4px;
  font-size: 0.7rem;
  color: #6b7280;
}
@media (max-width: 600px) {
  .lina-chat-panel {
    width: calc(100vw - 32px);
  }
}
`;
    document.head.appendChild(style);
  }

  function createWidget() {
    if (document.querySelector(".lina-chat-widget")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "lina-chat-widget";
    wrapper.innerHTML = `
      <button class="lina-chat-toggle" type="button" aria-expanded="false">
        <div class="lina-chat-toggle-avatar" aria-hidden="true"></div>
        <div class="lina-chat-toggle-text">
          <span>Chat with Lina</span>
          <span>Demo · Safe to explore</span>
        </div>
        <span class="lina-chat-toggle-indicator" aria-hidden="true"></span>
      </button>
      <div class="lina-chat-panel" aria-label="Lina chat widget">
        <div class="lina-chat-panel-header">
          <div class="lina-chat-panel-title">
            <div class="lina-avatar" aria-hidden="true"></div>
            <div class="lina-chat-panel-title-text">
              <span>Lina</span>
              <span>Lumara Navigator · Demo</span>
            </div>
          </div>
          <button class="lina-chat-panel-close" type="button" aria-label="Close Lina chat">×</button>
        </div>
        <div class="lina-chat-panel-body">
          <div class="lina-chat-panel-messages"></div>
        </div>
        <div class="lina-chat-panel-footer">
          <div class="lina-chat-panel-input">
            <input type="text" placeholder="Describe a situation to simulate…" />
            <button class="lina-chat-panel-send" type="button">Send</button>
          </div>
          <div class="lina-chat-panel-meta">
            <strong>Note:</strong> This is an example experience, not real legal or emergency help.
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);

    const toggle = wrapper.querySelector(".lina-chat-toggle");
    const close = wrapper.querySelector(".lina-chat-panel-close");
    const panel = wrapper.querySelector(".lina-chat-panel");
    const messagesEl = wrapper.querySelector(".lina-chat-panel-messages");
    const input = wrapper.querySelector(".lina-chat-panel-input input");
    const send = wrapper.querySelector(".lina-chat-panel-send");

    const conversation = [
      {
        role: "assistant",
        content:
          "Hi love, I’m Lina. 💛 This is a demo to show how Lumara would walk with you in a hard moment."
      }
    ];

    function setOpen(open) {
      wrapper.classList.toggle("lina-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      panel.style.display = open ? "flex" : "none";
      if (open) setTimeout(() => input && input.focus(), 50);
    }

    function addBubble(role, text, meta) {
      const bubble = document.createElement("div");
      bubble.className = "lina-bubble " + (role === "lina" ? "lina" : "member");

      const label = document.createElement("div");
      label.className = "lina-bubble-label";
      label.textContent = role === "lina" ? "Lina" : "You";
      bubble.appendChild(label);

      const content = document.createElement("div");
      content.innerHTML = text.replace(/\n/g, "<br>");
      bubble.appendChild(content);

      if (meta) {
        const small = document.createElement("small");
        small.textContent = meta;
        bubble.appendChild(small);
      }

      messagesEl.appendChild(bubble);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      if (role === "lina") {
        conversation.push({ role: "assistant", content: text });
      } else {
        conversation.push({ role: "user", content: text });
      }
    }

    async function handleSend() {
      const val = input.value.trim();
      if (!val) return;
      addBubble("member", val);
      input.value = "";

      try {
        const result = await window.linaApi.sendMessage(conversation, {
          language: "en",
          voice: false,
          source: "bubble-widget"
        });
        addBubble("lina", result.reply || "I’m here with you. Something went wrong on my side, but you’re not alone. 💛");
      } catch (err) {
        console.error(err);
        addBubble(
          "lina",
          "I’m having trouble reaching the Lumara network right now. Please try again later. 💛"
        );
      }
    }

    toggle.addEventListener("click", () => {
      setOpen(!wrapper.classList.contains("lina-open"));
    });
    close.addEventListener("click", () => setOpen(false));
    send.addEventListener("click", handleSend);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    });

    addBubble(
      "lina",
      "Hi love, I’m Lina. 💛 This is a demo to show how Lumara would walk with you in a hard moment.",
      "Demo · No real personal data is collected here."
    );
  }

  function init() {
    if (!window.linaApi) {
      console.error("linaApi client not loaded. Make sure lina-api-client.js is included.");
      return;
    }
    injectStyles();
    createWidget();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
