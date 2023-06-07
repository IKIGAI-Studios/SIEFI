const socket = io('http://localhost:3000');

let frstRaleRCV, frstRaleCOP, scndRaleRCV, scndRaleCOP, Coin, frstData, scndData, patr, eje, confronta;

window.onload = function () {
    socket.emit('cliente:consultarRegistrosRaleCOP');
    socket.emit('cliente:consultarRegistrosRaleRCV');
    socket.emit('cliente:consultarRegistrosCoin');
}

// $('#typeFile').on('change', function() {
//     switch ($(this).val()) {
//         case "Rale": 
//             $('#div-frst-selects').empty();
//             $('#div-scnd-selects').empty();
//             $('#div-frst-selects').append(
//                 $('<label>', {
//                     for: 'dateCOPfrst',
//                     text: 'Primer fecha a confrontar de Rale COP',
//                     class: 'mt-3'
//                 }), 
//                 $('<select>', {
//                     name: 'dateCOPfrst',
//                     id: 'dateCOPfrst',
//                     class: 'form-control input-group-text',
//                     disabled: true
//                 }),
//                 $('<label>', {
//                     for: 'dateRCVfrst',
//                     text: 'Primer fecha a confrontar de Rale RCV',
//                     class: 'mt-3'
//                 }), 
//                 $('<select>', {
//                     name: 'dateRCVfrst',
//                     id: 'dateRCVfrst',
//                     class: 'form-control input-group-text',
//                     disabled: true
//                 })
//             );
//             $('#div-scnd-selects').append(
//                 $('<label>', {
//                     for: 'dateCOPscnd',
//                     text: 'Segunda fecha a confrontar de Rale COP',
//                     class: 'mt-3'
//                 }), 
//                 $('<select>', {
//                     name: 'dateCOPscnd',
//                     id: 'dateCOPscnd',
//                     class: 'form-control input-group-text',
//                     disabled: true
//                 }),
//                 $('<label>', {
//                     for: 'dateRCVscnd',
//                     text: 'Segunda fecha a confrontar de Rale RCV',
//                     class: 'mt-3'
//                 }), 
//                 $('<select>', {
//                     name: 'dateRCVscnd',
//                     id: 'dateRCVscnd',
//                     class: 'form-control input-group-text',
//                     disabled: true
//                 }),
//                 $('<label>', {
//                     for: 'dateCOINscnd',
//                     text: 'Segunda fecha a confrontar de Rale RCV',
//                     class: 'mt-3'
//                 }), 
//                 $('<select>', {
//                     name: 'dateCOINscnd',
//                     id: 'dateCOINscnd',
//                     class: 'form-control input-group-text',
//                     disabled: true
//                 })
//             );
//             socket.emit('cliente:consultarRegistrosRaleCOP');
//             socket.emit('cliente:consultarRegistrosRaleRCV');
//             socket.emit('cliente:consultarRegistrosCoin');
//             break;
//         case "Coin": 
//             $('#div-selects').empty();
//             break;
//         default: 
//             $('#div-selects').empty();
//             break;
//     }
// });

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
    if (data.length <= 1) bsAlert('Es necesario tener al menos 2 archivos para la confronta', "danger");
    else {
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
    }
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
    if (data.length > 1) {
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
    }
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

// Hacemos un on change al div con el id dateCOP porque se crea dinamicamente 
// entonces no se puede crear un evento a un elemento que no existe
$('#div-frst-selects').on('change', '#dateCOPfrst', function() {
    $('#dateCOPscnd option').prop('disabled', false);
    $(`#dateCOPscnd option[value="${$(this).val()}"]`).prop('disabled', $(this).val() != 'false');
    if ($(this).val() != "false") 
        if ($('#dateRCVfrst').val() != "false") {
            if ($('#dateRCVfrst').val() != $(this).val()) bsAlert('Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes', 'warning')
            socket.emit('cliente:filtrarRales', { 
                rcv: $('#dateRCVfrst').val(), 
                cop: $('#dateCOPfrst').val(),
                type: "frst"
            });
        }
});

$('#div-frst-selects').on('change', '#dateRCVfrst', function() {
    $('#dateRCVscnd option').prop('disabled', false);
    $(`#dateRCVscnd option[value="${$(this).val()}"]`).prop('disabled', $(this).val() != 'false');
    if ($(this).val() != "false") 
        if ($('#dateCOPfrst').val() != "false") {
            if ($('#dateCOPfrst').val() != $(this).val()) bsAlert('Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes', 'warning')
            socket.emit('cliente:filtrarRales', { 
                rcv: $('#dateRCVfrst').val(), 
                cop: $('#dateCOPfrst').val(),
                type: "frst"
            });
        }
});

$('#div-scnd-selects').on('change', '#dateCOPscnd', function() {
    $('#dateCOPfrst option').prop('disabled', false);
    $(`#dateCOPfrst option[value="${$(this).val()}"]`).prop('disabled', $(this).val() != 'false');
    if ($(this).val() != "false") 
        if ($('#dateRCVscnd').val() != "false") {
            if ($('#dateRCVscnd').val() != $(this).val()) bsAlert('Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes', 'warning')
            socket.emit('cliente:filtrarRales', { 
                rcv: $('#dateRCVscnd').val(), 
                cop: $('#dateCOPscnd').val(),
                type: "scnd"
            });
        }
});

$('#div-scnd-selects').on('change', '#dateRCVscnd', function() {
    $('#dateRCVfrst option').prop('disabled', false);
    $(`#dateRCVfrst option[value="${$(this).val()}"]`).prop('disabled', $(this).val() != 'false');
    if ($(this).val() != "false") 
        if ($('#dateCOPscnd').val() != "false") {
            if ($('#dateCOPscnd').val() != $(this).val()) bsAlert('Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes', 'warning')
            socket.emit('cliente:filtrarRales', { 
                rcv: $('#dateRCVscnd').val(), 
                cop: $('#dateCOPscnd').val(),
                type: "scnd"
            });
        }
});

$('#div-scnd-selects').on('change', '#dateCOINscnd', function() {
    if ($(this).val() != "false") socket.emit('cliente:filtrarCoin', $(this).val() );
});

$('#switch_show_modal').on('change', function () {
    if ($(this).prop('checked')) {
        if (confronta !== undefined) {
            $('#confrontarModal').modal('show');
            showConfronta();
        } else bsAlert('Mostrar el resultado en una ventana puede consumir bastantes recursos', 'warning');
    }
});

$('#confrontarModal').on('hidden.bs.modal', function() {
    $("#switch_show_modal").prop('checked', false);
});

socket.on('servidor:filtrarRales', ({ raleRCVFiltrado, raleCOPFiltrado, type }) => {
    if (type == "frst") {
        frstRaleRCV = raleRCVFiltrado;
        frstRaleCOP = raleCOPFiltrado;
    } else if (type == "scnd") {
        scndRaleRCV = raleRCVFiltrado;
        scndRaleCOP = raleCOPFiltrado;
    }
    if ( frstRaleRCV && frstRaleCOP && scndRaleRCV && scndRaleCOP && Coin ) {
        if ($("#switch_show_modal").prop('checked')) {
            $('#div-table').empty();
            $('#confrontarModal').modal('show');
            $('#modal_title').text('Confronta');
            $(`<h3 class="text-primary">Generando la confronta</h3>`).appendTo('#div-table');
            $('<img src="imgs/folder_azul.png" class="mt-3">').appendTo('#div-table');
        }
        socket.emit('cliente:confrontarData');
    }
});

socket.on('servidor:filtrarCoin', (coinFiltrado) => {
    Coin = coinFiltrado;
    if ( frstRaleRCV && frstRaleCOP && scndRaleRCV && scndRaleCOP && Coin ) {
        if ($("#switch_show_modal").prop('checked')) {
            $('#div-table').empty();
            $('#confrontarModal').modal('show');
            $('#modal_title').text('Confronta');
            $(`<h3 class="text-primary">Generando la confronta</h3>`).appendTo('#div-table');
            $('<img src="imgs/folder_azul.png" class="mt-3">').appendTo('#div-table');
        }
        socket.emit('cliente:confrontarData');
    }
});

socket.on('servidor:confrontarData', ({ patrones, ejecutores }) => {
    confrontData({ patrones, ejecutores });
});

function confrontData ({ patrones, ejecutores }) {
    let frstRcv = frstRaleRCV.map((rale) => Object.assign(rale, { type: "rcv" }));
    let scndRcv = scndRaleRCV.map((rale) => Object.assign(rale, { type: "rcv" }));
    let frstCop = frstRaleCOP.map((rale) => Object.assign(rale, { type: "cop" }));
    let scndCop = scndRaleCOP.map((rale) => Object.assign(rale, { type: "cop" }));
    Coin = Coin.map((coin) => Object.assign(coin, { type: "coin" }));

    frstData = frstRcv.concat(frstCop);
    scndData = scndRcv.concat(scndCop);

    confronta = frstData.map((data) => {
        // Calcular dias restantes
        data.dias_rest = Math.floor((new Date() - new Date(data.fec_insid)) / 86400000)
        // Calcular oportunidad
        data.oportunidad = data.inc == 2 ? 
            "En tiempo en la 2"
            : data.dias_rest > 40 ? 
                "Fuera de tiempo"
                : "En tiempo 31" 
        // Calcular quemados
        data.quemados = data.inc != 2 ? 
            data.dias_rest > 40 ? 
                "Fuera de tiempo"
                :  data.dias_rest > 15 ? 
                    "Quemandose"
                    : "En tiempo 31"
            : ""
        // Calcular clave ejecutor
        data.clave_eje = patrones.find(pat => pat.reg_pat == data.reg_pat).clave_eje
        data.clave_eje ??= "No existe la clave de ejecutor"
        // Calcular ejecutor 
        data.ejecutor = ejecutores.find(ejecutor => ejecutor.clave_eje == data.clave_eje).nombre
        data.ejecutor ??= "No existe el ejecutor"
        // Calcular programable con el coin
        data.programable = Coin.find(coin => coin.reg_pat == data.reg_pat && coin.nom_cred == data.nom_cred)
        data.programable ??= "EN TIEMPO 02"
        // Calcular patron
        data.patron = patrones.find(pat => pat.reg_pat == data.reg_pat).patron
        data.patron ??= "No existe el patron"
        // Calcular actividad
        data.actividad = patrones.find(pat => pat.reg_pat == data.reg_pat).actividad
        data.actividad ??= "No existe el patron"
        // Calcular domicilio
        data.domicilio = patrones.find(pat => pat.reg_pat == data.reg_pat).domicilio
        data.domicilio ??= "No existe el patron"
        // Calcular localidad
        data.localidad = patrones.find(pat => pat.reg_pat == data.reg_pat).localidad
        data.localidad ??= "No existe el patron"
        // Calcular buscar pago
        data.buscar_pago = scndData.find(data => data.reg_pat == data.reg_pat && data.nom_cred == data.nom_cred).importe
        data.buscar_pago ??= "No hay pago"
        // Calcular buscar td
        data.buscar_td = data.buscar_pago != "No hay pago" ? data.buscar_pago : data.td
        // Calcular cambio inc
        data.buscar_cambio_inc = scndData.find(data => data.reg_pat == data.reg_pat && data.nom_cred == data.nom_cred).inc
        data.buscar_pago ??= "No hay cambio"
        // Calcular buscar 2 y 31
        data.buscar_2_y_31 = data.buscar_cambio_inc != 2 ?
            data.buscar_cambio_inc == 23 ?
                23
                : data.buscar_cambio_inc != 31 ?
                    data.buscar_cambio_inc
                    : "No hay 2 o 31"
            : "No hay 2 o 31"
        // Calcular re cuotas
        data.re_cuotas = data.buscar_td.toString()[0] == "2" ? "RE" : "No hay cuotas"
        // Calcular re rcv
        data.re_rcv = data.buscar_td.toString()[0] == "6" ? "RB" : "No hay rcv"
        // Calcular re multas
        data.re_multas = data.buscar_td.toString()[0] == "8" ? "RE 10%" : "No hay multas"
        // Calcular re aud
        data.re_aud = data.buscar_td.toString()[0] == "5" ? "RE AUD" : "No hay Aud"
        // Calcular res
        data.resultado_concatenado = [
            data.buscar_cambio_inc, 
            data.buscar_2_y_31, 
            data.re_cuotas, 
            data.re_rcv, 
            data.re_multas, 
            data.buscar_td, 
            data.re_aud
        ].join('-')
        return data;
    })
    showConfronta();
    bsAlert('Se ha generado la confronta correctamente', 'success');
}

function showConfronta () {
    if (!$("#switch_show_modal").prop('checked')) return;
    let data = confronta;
    $('#div-table').empty();
    // Crear tabla
    const table = $('<table class="table">').attr('id', 'confronta-table');

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

        switch (obj.type) {
            case "rcv":
                dataRow.addClass('table-primary');
                break;
            case "cop":
                dataRow.addClass('table-success');
                break;
            default:
                break;
        }

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
    const tableContainer = $('<div>').attr('id', 'tb-show-confronta');
    $(`<b >Se encontraron ${data.length} registros<b>`).appendTo(tableContainer);
    table.appendTo(tableContainer);
    tableContainer.appendTo('#div-table');
}