// Variable global para almacenar el workbook cargado
let currentWorkbook = null;

// Manejo de carga del archivo Excel y llenado del select con nombres de hojas
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
    currentWorkbook = workbook; // Guardar el workbook para usarlo luego

    // Llenar el select con el nombre de cada hoja
    const sheetSelect = document.getElementById("sheetSelect");
    sheetSelect.innerHTML = ""; // Limpiar opciones anteriores
    workbook.SheetNames.forEach(sheetName => {
      const option = document.createElement("option");
      option.value = sheetName;
      option.textContent = sheetName;
      sheetSelect.appendChild(option);
    });

    console.log("Hojas disponibles en el Excel:", workbook.SheetNames);
  };
  reader.readAsArrayBuffer(file);
});

// Evento para el botón "Marcar Cuentas"
document.getElementById("resaltarBtn").addEventListener("click", function () {
  if (!currentWorkbook) {
    alert("Por favor, cargue un archivo primero.");
    return;
  }
  const sheetSelect = document.getElementById("sheetSelect");
  const selectedSheetName = sheetSelect.value;
  if (!selectedSheetName) {
    alert("Por favor, seleccione una hoja.");
    return;
  }

  // Extraer la hoja seleccionada
  const worksheet = currentWorkbook.Sheets[selectedSheetName];
  // Convertir la hoja a JSON (array de arrays)
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  // Extraer la primera columna y normalizar los valores
  const columna1 = jsonData
    .map((row) => row[0]?.toString().trim())
    .filter((folio) => folio);

  console.log("Folios de la hoja", selectedSheetName, ":", columna1);

  // Enviar los folios al content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;

    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "resaltar", folios: columna1 },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error al enviar mensaje:", chrome.runtime.lastError.message);
          console.error("Asegúrate de estar en la página correcta.");
        }
        if (response && response.success) {
          alert("Seleccionados correctamente");
        } else {
          alert("No se encontraron coincidencias en la tabla.");
        }
      }
    );
  });
});
