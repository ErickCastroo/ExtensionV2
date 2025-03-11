document.getElementById("fileInput").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) {
    alert("Por favor, selecciona un archivo.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    // Obtener la primera hoja del archivo Excel
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convertir la hoja a JSON (array de arrays)
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Extraer solo la columna 1 (primera columna) y normalizar valores
    const columna1 = jsonData
      .map((row) => row[0]?.toString().trim()) // Convertimos a string y eliminamos espacios
      .filter((folio) => folio); // Filtramos valores vacíos

    console.log("Folios del archivo Excel:", columna1); // Verificar los folios

    // Enviar los folios al content script después de un breve retraso
    setTimeout(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;

        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "resaltar", folios: columna1 },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error al enviar mensaje:", chrome.runtime.lastError.message);
              console.error("Error al comunicarse con la página. Asegúrate de que estás en la página correcta.");
            }
            if (response && response.success) {
              alert(`Seleccionados correctamente`);
            } else {
              alert("No se encontraron coincidencias en la tabla.");
            }
          }
        );
      });
    }, 2000); // Esperar 1 segundo antes de enviar el mensaje
  };
  reader.readAsArrayBuffer(file);
});