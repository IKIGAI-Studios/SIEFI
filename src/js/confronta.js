const socket = io('http://localhost:3000');

let frstRaleRCV, frstRaleCOP, scndRaleRCV, scndRaleCOP, Coin, frstData, scndData, patr, eje, confronta;

window.onload = function () {
    socket.emit('cliente:consultarRegistrosRaleCOP');
    socket.emit('cliente:consultarRegistrosRaleRCV');
    socket.emit('cliente:consultarRegistrosCoin');
    socket.emit('cliente:consultarConfrontas');
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

socket.on('servidor:consultarConfrontas', ({ confronta }) => {
    $('#show_confrontas tbody').empty();
    confronta.map((reg, i) => {
        let row = $('<tr>');
        row.append(`<td>${ i + 1 }</td>`);
        row.append(`<td>${ reg.createdAt }</td>`);
        row.append(`<td>
                        <button class="btn btn-danger btn-sm" onclick="deleteConfronta('${ reg.createdAt }')">
                            Eliminar
                        </button>
                    </td>`);
        $('#show_confrontas tbody').append(row);
    })
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
    socket.emit('cliente:consultarConfrontas');
});

$('#saveConfronta').on('click', async function () { 
    let i = 0, lenght = confronta.length;
    $('#div-table').empty();
    $('#confrontarModal').modal('show');
    $('#modal_title').text('Guardando en la BD');

    while (i < lenght) {
        const batch = confronta.slice(i, i + 1000);

        await socket.emit('cliente:saveConfronta', { confronta:batch, lote:i, lenght }, (res) => {
            if (i == 0) $('#div-table').empty();
            showResult(res);
        });
        i += 1000;
    }
});

function deleteConfronta( date ) {
    socket.emit('cliente:deleteConfronta', date, (res) => {
        if (res.status) socket.emit('cliente:consultarConfrontas')
        else bsAlert('No se pudo eliminar la fecha' + date, 'danger')
    });
}

function confrontData ({ patrones, ejecutores }) {
    let frstRcv = frstRaleRCV.map((rale) => Object.assign(rale, { type: "rcv" }));
    let scndRcv = scndRaleRCV.map((rale) => Object.assign(rale, { type: "rcv" }));
    let frstCop = frstRaleCOP.map((rale) => Object.assign(rale, { type: "cop" }));
    let scndCop = scndRaleCOP.map((rale) => Object.assign(rale, { type: "cop" }));
    Coin = Coin.map((coin) => Object.assign(coin, { type: "coin" }));

    frstData = frstRcv.concat(frstCop);
    scndData = scndRcv.concat(scndCop);

    confronta = frstData.map((frstdata) => {
        // Calcular dias restantes
        frstdata.dias_rest = Math.floor((new Date() - new Date(frstdata.fec_insid)) / 86400000)
        // Calcular oportunidad
        frstdata.oportunidad = frstdata.inc == 2 ? 
            "En tiempo en la 2"
            : frstdata.dias_rest > 40 ? 
                "Fuera de tiempo"
                : "En tiempo 31" 
        // Calcular quemados
        frstdata.quemados = frstdata.inc != 2 ? 
            frstdata.dias_rest > 40 ? 
                "Fuera de tiempo"
                :  frstdata.dias_rest > 15 ? 
                    "Quemandose"
                    : "En tiempo 31"
            : ""
        frstData.createdAt = null;
        frstData.updatedAt = null;
        // Calcular clave ejecutor
        frstdata.clave_eje = patrones.find(pat => pat.reg_pat == frstdata.reg_pat).clave_eje
        frstdata.clave_eje ??= "No existe la clave de ejecutor"
        // Calcular ejecutor 
        frstdata.ejecutor = ejecutores.find(ejecutor => ejecutor.clave_eje == frstdata.clave_eje).nombre
        frstdata.ejecutor ??= "No existe el ejecutor"
        // Calcular programable con el coin
        frstdata.programable = Coin.find(coin => coin.reg_pat == frstdata.reg_pat && coin.nom_cred == frstdata.nom_cred)
        frstdata.programable ??= "EN TIEMPO 02"
        // Calcular patron
        frstdata.patron = patrones.find(pat => pat.reg_pat == frstdata.reg_pat).patron
        frstdata.patron ??= "No existe el patron"
        // Calcular actividad
        frstdata.actividad = patrones.find(pat => pat.reg_pat == frstdata.reg_pat).actividad
        frstdata.actividad ??= "No existe el patron"
        // Calcular domicilio
        frstdata.domicilio = patrones.find(pat => pat.reg_pat == frstdata.reg_pat).domicilio
        frstdata.domicilio ??= "No existe el patron"
        // Calcular localidad
        frstdata.localidad = patrones.find(pat => pat.reg_pat == frstdata.reg_pat).localidad
        frstdata.localidad ??= "No existe el patron"
        // Calcular buscar pago
        frstdata.buscar_pago = scndData.find(data => data.reg_pat == frstdata.reg_pat && data.nom_cred == frstdata.nom_cred)
        frstdata.buscar_pago = frstdata.buscar_pago ? frstdata.buscar_pago.importe : "No hay pago"
        // Calcular buscar td
        frstdata.buscar_td = frstdata.buscar_pago != "No hay pago" ? frstdata.buscar_pago : frstdata.td
        // Calcular cambio inc
        frstdata.buscar_cambio_inc = scndData.find(data => data.reg_pat == frstdata.reg_pat && data.nom_cred == frstdata.nom_cred)
        frstdata.buscar_cambio_inc = frstdata.buscar_cambio_inc ? frstdata.buscar_cambio_inc.inc : "No hay cambio"
        // Calcular buscar 2 y 31
        frstdata.buscar_2_y_31 = frstdata.buscar_cambio_inc != 2 ?
            frstdata.buscar_cambio_inc == 23 ?
                23
                : frstdata.buscar_cambio_inc != 31 ?
                    frstdata.buscar_cambio_inc
                    : "No hay 2 o 31"
            : "No hay 2 o 31"
        // Calcular re cuotas
        frstdata.re_cuotas = frstdata.buscar_td.toString()[0] == "2" ? "RE" : "No hay cuotas"
        // Calcular re rcv
        frstdata.re_rcv = frstdata.buscar_td.toString()[0] == "6" ? "RB" : "No hay rcv"
        // Calcular re multas
        frstdata.re_multas = frstdata.buscar_td.toString()[0] == "8" ? "RE 10%" : "No hay multas"
        // Calcular re aud
        frstdata.re_aud = frstdata.buscar_td.toString()[0] == "5" ? "RE AUD" : "No hay Aud"
        // Calcular res
        frstdata.resultado_concatenado = [
            frstdata.buscar_cambio_inc, 
            frstdata.buscar_2_y_31, 
            frstdata.re_cuotas, 
            frstdata.re_rcv, 
            frstdata.re_multas, 
            frstdata.buscar_td, 
            frstdata.re_aud
        ].join('-')
        return frstdata;
    })
    showConfronta();
    bsAlert('Se ha generado la confronta correctamente', 'success');
    $('#saveConfronta').prop('disabled', false);
}

function showResult( rslt ) {
    if (rslt.status) {
        $(`<h3 class="text-success">${rslt.msg}</h3>`).appendTo('#div-table');
        $('<img src="imgs/folder_listo.png" class="mt-3">').appendTo('#div-table');
    } else {
        $(`<h3 class="text-danger">${rslt.msg}</h3>`).appendTo('#div-table');
        $('<img src="imgs/X.png" class="mt-3">').appendTo('#div-table');
    }

    $('#btn_cancelar').prop('disabled', false).text('Salir');
    $('#btn_insertar').prop('disabled', true);
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