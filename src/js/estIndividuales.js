const socket = io('http://localhost:3000');

let dataStats, inc;

window.onload = function () {
    socket.emit('cliente:consultarRegistrosRaleCOP');
    socket.emit('cliente:consultarRegistrosRaleRCV');
    socket.emit('cliente:consultarRegistrosCoin');
}

socket.on('servidor:estIndividuales', (data) => {
    dataStats = data;
    fillFilters();
    showTable();
});

socket.on('servidor:consultarRegistrosRaleCOP', (data) => {
    $('#dateCOPfrst').empty();
    $('#dateCOPscnd').empty();
    $('#dateCOPfrst').append(
        $('<option>', {
            text: "Selecciona una fecha para Rale COP",
            value: false
        }
    ));
    $('#dateCOPscnd').append(
        $('<option>', {
            text: "Selecciona una fecha para Rale COP",
            value: false
        }
    ));
    data.map((date) => {
        // No se asigna el option a variables porque solo puede hacer 
        // append a un solo elemento y si se hace a un segundo se elimina del primero
        $('#dateCOPfrst').append(
            $('<option>', {
                value: date, 
                text: date
            })
        );
        $('#dateCOPscnd').append(
            $('<option>', {
                value: date, 
                text: date
            })
        );
    });
    $('#dateCOPfrst').prop('disabled', false);
    $('#dateCOPscnd').prop('disabled', false);
});

socket.on('servidor:consultarRegistrosRaleRCV', (data) => {
    $('#dateRCVfrst').empty();
    $('#dateRCVscnd').empty();
    $('#dateRCVfrst').append(
        $('<option>', {
            text: "Selecciona una fecha para Rale RCV",
            value: false 
        }));
    $('#dateRCVscnd').append(
        $('<option>', {
            text: "Selecciona una fecha para Rale RCV",
            value: false 
        })
    );
    data.map((date) => {
        $('#dateRCVfrst').append(
            $('<option>', {
                value: date, 
                text: date
            })
        );
        $('#dateRCVscnd').append(
            $('<option>', {
                value: date, 
                text: date
            })
        );
    });
    $('#dateRCVfrst').prop('disabled', false);
    $('#dateRCVscnd').prop('disabled', false);
});

socket.on('servidor:consultarRegistrosCoin', (data) => {
    $('#dateCOINscnd').empty();
    $('#dateCOINscnd').append(
        $('<option>', {
            text: "Selecciona una fecha para COIN",
            value: false 
        })
    );
    data.map((date) => {
        $('#dateCOINscnd').append(
            $('<option>', {
                value: date, 
                text: date
            })
        );
    });
    $('#dateCOINscnd').prop('disabled', false);
});

$('#nombreEjecutor').on('change', function() {
    $('#div-tabla-estadisticas-individuales').empty();

    if ($('#nombreEjecutor').val() != 'false') 
        socket.emit('cliente:ejecutorSeleccionadoEstInd', { 
            ejecutor: $('#nombreEjecutor').val(),
            copDate: $('#dateCOPfrst').val(),
            rcvDate: $('#dateRCVfrst').val()
        });
    else bsAlert("Selecciona la clave de ejecutor", 'warning');
});

// Hacemos un on change al div con el id dateCOP porque se crea dinamicamente 
// entonces no se puede crear un evento a un elemento que no existe
$('#div-frst-selects').on('change', '#dateCOPfrst', function() {
    $('#dateCOPscnd option').prop('disabled', false);
    $(`#dateCOPscnd option[value="${$(this).val()}"]`).prop('disabled', $(this).val() != 'false');
    if ($(this).val() != "false") 
        if ($('#dateRCVfrst').val() != "false") {
            if ($('#dateRCVfrst').val() != $(this).val()) bsAlert('Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes', 'warning')
            $('#nombreEjecutor').prop('disabled', false);
        }
});

$('#div-frst-selects').on('change', '#dateRCVfrst', function() {
    $('#dateRCVscnd option').prop('disabled', false);
    $(`#dateRCVscnd option[value="${$(this).val()}"]`).prop('disabled', $(this).val() != 'false');
    if ($(this).val() != "false") 
        if ($('#dateCOPfrst').val() != "false") {
            if ($('#dateCOPfrst').val() != $(this).val()) bsAlert('Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes', 'warning')
            $('#nombreEjecutor').prop('disabled', false);
        }
});

function fillFilters() {
    $('#inc_fil').empty();
    inc = Array.from(
        dataStats.reduce(function (res, obj) {
            res.add(obj.inc);
            return res;
        }, new Set())
    );
    inc.sort(function (a, b) { return a - b })
    inc.map((data) => {
        $('#inc_fil')
        .append(
            $('<li>')
            .append(
                $('<a>')
                .attr('href', '#')
                .addClass('dropdown-item')
                .append(
                    $('<div>')
                    .addClass('form-check')
                    .append( 
                        $('<input>')
                        .addClass('form-check-input')
                        .attr('checked', true)
                        .attr('type', 'checkbox')
                        .attr('id', 'chk_' + data)
                        .val('chk_inc_' + data)
                        .on('change', function () {
                            updateFilters( "inc", data, $(this).is(':checked'))
                        })
                    )
                    .append(
                        $('<label>')
                        .addClass('form-check-label')
                        .attr('for', 'flexCheckDefault')
                        .text(data)
                    )
                )
            )
        );
    });

}

function updateFilters( group, n, act ) {
    switch (group) {
        case "inc":
            if (act) inc.push(n)
            else {
                inc = inc.filter(function(num) {
                    return num !== n
                })
            }
            inc.sort(function (a, b) { return a - b })
            break;
    
        default:
            break;
    }
    showTable();
}

function showTable () {
    $('#div-tabla-estadisticas-individuales').empty();
    let data = dataStats;
    if (data.length < 1) {
        bsAlert('El ejecutor no tiene ningun patron asignado', 'danger')
        return;
    }

    // Crear tabla
    const table = $('<table class="table table-bordered border-dark">').attr('id', 'estadisticas-individuales-table');

    // Crear el encabezado de la tabla
    const thead = $('<thead>');
    const headerRow = $('<tr>');

    // Obtener los nombres de las propiedades del primer objeto
    const headers = Object.keys(data[0]);

    // Recorrer los nombres de las propiedades para agregar encabezados a la tabla
    headers.forEach((header) => {
        const headerCell = $('<th scope="col" class="bg-light">').text(header);
        headerCell.appendTo(headerRow);
    });
    headerRow.appendTo(thead);
    thead.appendTo(table);

    // Crear el cuerpo de la tabla
    const tbody = $('<tbody>');

    // Recorrer los objetos y agregar filas a la tabla
    data.forEach((obj) => {
        const dataRow = $('<tr>');

        if (obj.type == "rcv") dataRow.addClass('bg-secondary');
        if (
            obj.td == 80 ||
            obj.td == 81 ||
            obj.td == 88 ||
            obj.td == 89 
        ) dataRow.addClass('bg-success');

        if (!inc.includes(obj.inc)) return;

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
}
