const socket = io('http://localhost:3000');

$('#typeFile').on('change', function() {
    switch ($(this).val()) {
        case "Rale": 
            $('#div-selects').empty();
            $('#div-selects').append(
                $('<label>', {
                    for: 'dateCOP',
                    text: 'Fechas a confrontar de Rale COP',
                    class: 'mt-3'
                }), 
                $('<select>', {
                    name: 'dateCOP',
                    id: 'dateCOP',
                    class: 'form-control input-group-text',
                    disabled: true
                }),
                $('<label>', {
                    for: 'dateRCV',
                    text: 'Fechas a confrontar de Rale RCV',
                    class: 'mt-3'
                }), 
                $('<select>', {
                    name: 'dateRCV',
                    id: 'dateRCV',
                    class: 'form-control input-group-text',
                    disabled: true
                })
            );
            socket.emit('cliente:consultarRegistrosRaleCOP');
            socket.emit('cliente:consultarRegistrosRaleRCV');
            break;
        case "Coin": 
            $('#div-selects').empty();
            break;
        default: 
            $('#div-selects').empty();
            break;
    }
});

// Hacemos un on change al div con el id dateCOP porque se crea dinamicamente 
// entonces no se puede crear un evento a un elemento que no existe
$('#div-selects').on('change', '#dateCOP', function() {
    if ($(this).val() != "false") 
        if ($('#dateRCV').val() != "false") 
            socket.emit('cliente:filtrarRales', { 
                rcv: $('#dateRCV').val(), 
                cop: $('#dateCOP').val() 
            });
});

$('#div-selects').on('change', '#dateRCV', function() {
    if ($(this).val() != "false") 
        if ($('#dateCOP').val() != "false") 
            socket.emit('cliente:filtrarRales', { 
                rcv: $('#dateRCV').val(), 
                cop: $('#dateCOP').val() 
            });
});

socket.on('servidor:consultarRegistrosRaleCOP', (data) => {
    $('#dateCOP').empty();
    $('#dateCOP').append($('<option>', {
        text: "Selecciona una fecha para Rale COP",
        value: false
    }));
    data.map((date) => {
        let option = $('<option>', {
            value: date, 
            text: date
        });

        $('#dateCOP').append(option);
    });
    $('#dateCOP').prop('disabled', false);
});

socket.on('servidor:consultarRegistrosRaleRCV', (data) => {
    $('#dateRCV').empty();
    $('#dateRCV').append($('<option>', {
        text: "Selecciona una fecha para Rale RCV",
        value: false 
    }));
    data.map((date) => {
        let option = $('<option>', {
            value: date, 
            text: date
        });

        $('#dateRCV').append(option);
    });
    $('#dateRCV').prop('disabled', false);
});

socket.on('servidor:consultarRegistrosRaleRCV', (data) => {
    $('#dateRCV').empty();
    $('#dateRCV').append($('<option>', {
        text: "Selecciona una fecha para Rale RCV",
        value: false 
    }));
    data.map((date) => {
        let option = $('<option>', {
            value: date, 
            text: date
        });

        $('#dateRCV').append(option);
    });
    $('#dateRCV').prop('disabled', false);
});

socket.on('servidor:filtrarRales', ({ raleRCVFiltrado, raleCOPFiltrado }) => {
    let data = confrontData({ raleRCVFiltrado, raleCOPFiltrado }); 

    // Crear tabla
    const table = $('<table class="table">').attr('id', 'rales-table');

    // Obtener todas las propiedades de los objetos en el conjunto de datos
    const allProperties = Array.from(data.reduce((acc, obj) => {
        Object.keys(obj).forEach((prop) => acc.add(prop));
        return acc;
    }, new Set()));

    // Crear el encabezado de la tabla
    const thead = $('<thead>');
    const headerRow = $('<tr>');

    // Recorrer todas las propiedades para agregar encabezados a la tabla
    allProperties.forEach((property) => {
        const headerCell = $('<th scope="col">').text(property);
        headerCell.appendTo(headerRow);
    });

    headerRow.appendTo(thead);
    thead.appendTo(table);

    // Crear el cuerpo de la tabla
    const tbody = $('<tbody>');

    // Recorrer los objetos y agregar filas a la tabla
    data.forEach((obj) => {
        const dataRow = $('<tr>');

        // Recorrer todas las propiedades y agregar celdas a la fila
        allProperties.forEach((property) => {
            const value = obj[property] || ''; // Obtener el valor de la propiedad o usar una cadena vacía si no existe
            const dataCell = $('<td>').text(value);
            dataCell.appendTo(dataRow);
        });

        dataRow.appendTo(tbody);
    });
    tbody.appendTo(table);

    // Mostrar la tabla con el numero de registros que tiene
    const tableContainer = $('<div>').attr('id', 'tb-show-rale-cop');
    $(`<b >Se encontraron ${data.length} registros<b>`).appendTo(tableContainer);
    table.appendTo(tableContainer);
    tableContainer.appendTo('#div-table');
});

function confrontData ({ raleRCVFiltrado, raleCOPFiltrado }) {
    let rcv = raleRCVFiltrado.map((rale) => Object.assign(rale, { type: "rcv" }));
    let cop = raleCOPFiltrado.map((rale) => Object.assign(rale, { type: "cop" }));

    let data = rcv.concat(cop);
    console.log(data)
    return data;
}