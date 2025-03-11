document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('fileInput')
  const errorMessage = document.getElementById('error-message')

  // Verificar si los elementos existen antes de agregar event listeners
  if (fileInput && errorMessage) {
    fileInput.addEventListener('change', function () {
      const file = this.files[0] // Obtiene el archivo seleccionado

      if (file) {
        const validExtensions = ['xlsx', 'xls', 'csv']
        const fileExtension = file.name.split('.').pop().toLowerCase()

        if (!validExtensions.includes(fileExtension)) {
          errorMessage.textContent =
            'Seleccione un archivo válido (.xlsx, .xls, .csv)'
          this.value = '' // Resetea el input para evitar el envío de archivos inválidos
        } else {
          errorMessage.textContent = '' // Borra el mensaje si el archivo es válido
        }
      }
    })
  } else {
    console.error("No se encontró el elemento 'fileInput' o 'error-message'.")
  }
})