function injectAIButtons() {
  // Busca directamente el cuadro de texto donde estás parado en tu imagen
  const textboxes = document.querySelectorAll('[contenteditable="true"]');
  
  textboxes.forEach(textbox => {
    // Si ya le pusimos los botones, no los dupliques
    if (textbox.parentElement.querySelector(".gmail-ai-tools")) return;

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
        // Busca el cuerpo del mensaje original
        const emailElement = document.querySelector(".a3s, .ii.gt");
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
            textbox.focus();
            // Inserta el texto directamente donde está parpadeando el cursor
            document.execCommand("insertText", false, response.text);
          } else if (response && response.error) {
            alert(response.error);
          }
        });
      });

      toolsDiv.appendChild(btn);
    });

    // Coloca los botones exactamente arriba de la caja blanca de texto
    textbox.parentElement.insertBefore(toolsDiv, textbox);
  });
}

// Escucha constantemente la pantalla por si abres una respuesta
const observer = new MutationObserver(injectAIButtons);
observer.observe(document.body, { childList: true, subtree: true });
