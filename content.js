function injectAIButtons(container) {
  if (container.querySelector(".gmail-ai-tools")) return;

  const toolsDiv = document.createElement("div");
  toolsDiv.className = "gmail-ai-tools";
  toolsDiv.style.margin = "10px 0";
  toolsDiv.style.display = "flex";
  toolsDiv.style.gap = "8px";

  const options = [
    { label: "👍 Aceptar", intent: "Aceptar la propuesta de forma positiva" },
    { label: "👎 Rechazar", intent: "Rechazar la propuesta de manera educada" },
    { label: "📅 Reunión", intent: "Proponer agendar una reunión para revisar detalles" }
  ];

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt.label;
    btn.className = "ai-response-btn";
    btn.type = "button";
    
    btn.addEventListener("click", async () => {
      const emailElement = document.querySelector(".a3s");
      const emailBody = emailElement ? emailElement.innerText : "";
      
      const originalText = btn.innerText;
      btn.innerText = "⏳ Generando...";
      btn.disabled = true;

      chrome.runtime.sendMessage({
        action: "generateResponse",
        intent: opt.intent,
        emailBody: emailBody
      }, (response) => {
        btn.innerText = originalText;
        btn.disabled = false;

        if (response && response.text) {
          const textbox = container.querySelector('[contenteditable="true"]');
          if (textbox) {
            textbox.focus();
            document.execCommand("insertText", false, response.text);
          }
        } else if (response && response.error) {
          alert(response.error);
        }
      });
    });

    toolsDiv.appendChild(btn);
  });

  container.insertBefore(toolsDiv, container.firstChild);
}

const observer = new MutationObserver(() => {
  const composeBoxes = document.querySelectorAll(".M9, .fX, [role='textbox'][contenteditable='true']");
  composeBoxes.forEach(box => {
    const container = box.closest(".ip, .M9, .fX") || box.parentElement;
    if (container) injectAIButtons(container);
  });
});

observer.observe(document.body, { childList: true, subtree: true });
