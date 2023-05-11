import $ from 'jquery';
import XLSX from 'xlsx';


$('#Coin_input').on('change', function(e) {
    const file = e.target.file[0];
    
    // Verificar que el archivo seleccionado sea un archivo .xlsx
    if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        alert('Por favor seleccione un archivo .xlsx');
        return;
    }
})
