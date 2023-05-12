const socket = io('http://localhost:3000');

$('#Coin_input').on('change', function(e) {
    const file = e.target.files[0];
    
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const content = new Uint8Array(e.target.result);
            socket.emit('load-coin', { file: content });
        };

        reader.readAsArrayBuffer(file);
    }
    else console.log('No se subió un archivo')
})

socket.on('result-coin', (data) => {
    const table = $('<table>').attr('id', 'coin-table');
    
    // Crea el encabezado de la tabla
    const headerRow = $('<tr>');

    data[0].forEach((header) => {
        const headerCell = $('<th>').text(header);
        headerCell.appendTo(headerRow);
    });
    headerRow.appendTo(table);

    // Crea las filas de datos
    data.forEach((row, i) => {
        if (i == 0) return;
        const dataRow = $('<tr>');
        
        // Crea la celda del checkbox
        const checkboxCell = $('<td>');
        const checkbox = $('<input>')
                        .attr('type', 'checkbox')
                        .val(row[0])
                        .prop('checked', i != data.length - 1);
        checkboxCell.append(checkbox);

        // Agrega la celda del checkbox a la fila de datos
        checkboxCell.appendTo(dataRow);

        Object.values(row).forEach((value) => {
            const dataCell = $('<td>').text(value);
            dataCell.appendTo(dataRow);
        });

        dataRow.appendTo(table);
    });

    const tableContainer = $('<div>').attr('id', 'tb-show-coin');
    table.appendTo(tableContainer);
    tableContainer.appendTo('#div-coin'); // Cambia 'body' por el selector del elemento donde deseas agregar el contenedor

    tableContainer.css({
        width: '100%', // Ancho deseado del contenedor
        height: '300px', // Alto deseado del contenedor
        overflow: 'auto' // Agrega barras de desplazamiento cuando el contenido excede el tamaño del contenedor
    });
});
