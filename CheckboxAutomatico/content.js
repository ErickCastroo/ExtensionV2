console.log("Content script cargado correctamente");

// Función para marcar los checkboxes
function marcarCheckboxes(folios) {
  let filasMarcadas = [];

  // Limpiar marcas anteriores
  document
    .querySelectorAll(
      "#CPHContenido_gdvResultado tbody tr td .i-checks input[type='checkbox']"
    )
    .forEach((checkbox) => {
      checkbox.checked = false;
      // Disparar eventos para iCheck
      const iCheckHelper = checkbox
        .closest(".i-checks")
        .querySelector(".iCheck-helper");
      if (iCheckHelper) {
        iCheckHelper.click();
      }
    });

  // Obtener todas las filas de la tabla
  const filas = document.querySelectorAll(
    "#CPHContenido_gdvResultado tbody tr"
  );

  // Iterar sobre las filas de la tabla
  filas.forEach((fila) => {
    let cuenta = fila
      .querySelector("td:nth-child(2) span")
      ?.innerText.trim()
      .replace(/[\u200B-\u200D\uFEFF]/g, "");
    if (cuenta) {
      cuenta = cuenta.toString();
    }
    console.log("Buscando cuenta en fila:", cuenta, "tipo:", typeof cuenta);

    let coincide = false;
    for (let folio of folios) {
      let folioNormalizado = folio
        .trim()
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .toString();
      console.log(
        "Comparando con folio:",
        folioNormalizado,
        "tipo:",
        typeof folioNormalizado
      );
      if (cuenta === folioNormalizado) {
        coincide = true;
        break;
      }
    }

    // Si la cuenta no está en la lista de folios, se marca el checkbox
    if (cuenta && !coincide) {
      console.log("✅ Coincidencia encontrada para:", cuenta);

      const checkbox = fila.querySelector(
        "td .i-checks input[type='checkbox']"
      );
      if (!checkbox) {
        console.warn(
          "⚠️ No se encontró checkbox en la fila de la cuenta:",
          cuenta
        );
        return;
      }

      checkbox.checked = true;
      // Disparar evento de iCheck
      const iCheckHelper = checkbox
        .closest(".i-checks")
        .querySelector(".iCheck-helper");
      if (iCheckHelper) {
        iCheckHelper.click();
      }

      console.log("✅ Checkbox marcado para:", cuenta);
      filasMarcadas.push(fila);
    } else {
      console.log("❌ No coincide:", cuenta);
    }
  });

  console.log("Total filas marcadas:", filasMarcadas.length);
  return filasMarcadas.length;
}

// Escuchar mensajes del popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "resaltar") {
    const folios = message.folios.map((folio) =>
      folio.trim().replace(/[\u200B-\u200D\uFEFF]/g, "")
    );
    const totalMarcados = marcarCheckboxes(folios);
    sendResponse({ success: true, total: totalMarcados });
  }
  return true; // Para respuestas asíncronas
});
