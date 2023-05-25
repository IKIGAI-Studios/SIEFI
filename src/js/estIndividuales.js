const socket = io('http://localhost:3000');

socket.on('servidor:estIndividuales', (data) => {
    $('#div-tabla-estadisticas-individuales').empty();

    // Crear tabla
    const table = $('<table class="table">').attr('id', 'estadisticas-individuales-table');

    // Crear el encabezado de la tabla
    const thead = $('<thead>');
    const headerRow = $('<tr>');

    // Obtener los nombres de las propiedades del primer objeto
    const headers = Object.keys(data[0]);

    // Recorrer los nombres de las propiedades para agregar encabezados a la tabla
    headers.forEach((header) => {
        const headerCell = $('<th scope="col">').text(header);
        headerCell.appendTo(headerRow);
    });
    headerRow.appendTo(thead);
    thead.appendTo(table);

    // Crear el cuerpo de la tabla
    const tbody = $('<tbody>');

    // Recorrer los objetos y agregar filas a la tabla
    data.forEach((obj) => {
        const dataRow = $('<tr>');

        // Recorrer las propiedades de cada objeto y agregar celdas a la fila
        Object.values(obj).forEach((value) => {
            const dataCell = $('<td>').text(value);
            dataCell.appendTo(dataRow);
        });

        dataRow.appendTo(tbody);
    });
    tbody.appendTo(table);

    // Crear un div con scroll para contener la tabla
    const tableScrollContainer = $('<div>').css({
        'overflow-y': 'scroll',
        'max-height': '350px' 
    });
    table.appendTo(tableScrollContainer);

    // Mostrar la tabla con el número de registros que tiene
    const tableContainer = $('<div>').attr('id', 'tb-show-estadisticas-individuales');
    tableScrollContainer.appendTo(tableContainer);
    tableContainer.appendTo('#div-tabla-estadisticas-individuales');
});


function ejecutorSeleccionado() {
    const nombreEjecutor = $('#nombreEjecutor').val();

    $('#div-tabla-estadisticas-individuales').empty();
    if (nombreEjecutor != 'false') socket.emit('cliente:ejecutorSeleccionado', nombreEjecutor);
    else bsAlert("Selecciona la clave de ejecutor", 'warning');
}
