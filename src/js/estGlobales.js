const socket = io('http://localhost:3000');

let dataStats, inc, res, con, fecha, dates = {}, cop_rcv = {}, cuotas = {}, rcv = {};

window.onload = function () {
    socket.emit('cliente:consultarRegistrosRaleCOP');
    socket.emit('cliente:consultarRegistrosRaleRCV');
    socket.emit('cliente:consultarRegistrosCoin');
}

socket.on('servidor:estGlobales', (data) => {
    dataStats = data;
    fillFilters();
    showTable();
    fillStats();
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

// Hacemos un on change al div con el id dateCOP porque se crea dinamicamente 
// entonces no se puede crear un evento a un elemento que no existe
$('#div-frst-selects').on('change', '#dateCOPfrst', function() {
    $('#btn_fil_inc').prop('disabled', true)
    $('#btn_fil_res').prop('disabled', true)
    $('#btn_fil_con').prop('disabled', true)

    $('#dateCOPscnd option').prop('disabled', false);
    $(`#dateCOPscnd option[value="${$(this).val()}"]`).prop('disabled', $(this).val() != 'false');
    if ($(this).val() != "false") 
        if ($('#dateRCVfrst').val() != "false") {
            if ($('#dateRCVfrst').val() != $(this).val()) bsAlert('Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes', 'warning')
            getRales();
        }
});

$('#div-frst-selects').on('change', '#dateRCVfrst', function() {
    $('#btn_fil_inc').prop('disabled', true)
    $('#btn_fil_res').prop('disabled', true)
    $('#btn_fil_con').prop('disabled', true)

    $('#dateRCVscnd option').prop('disabled', false);
    $(`#dateRCVscnd option[value="${$(this).val()}"]`).prop('disabled', $(this).val() != 'false');
    if ($(this).val() != "false") 
        if ($('#dateCOPfrst').val() != "false") {
            if ($('#dateCOPfrst').val() != $(this).val()) bsAlert('Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes', 'warning')
            getRales();
        }
});

$('#inp_DATES_fes').on('change', function () {
    if ($('#dateCOPfrst').val() == "false" || $('#dateRCVfrst').val() == "false") return;
    if ($(this).val() == "") bsAlert('Inserta un número en los dias festivos', 'warning')
    else {
        let dias_lab = getWorkDays(fecha.getMonth(), fecha.getFullYear()).length - ($('#inp_DATES_fes').val() != "" ? $('#inp_DATES_fes').val() : 0 )
        $('#DATES_laborales').text(dias_lab < 0 ? 0 : dias_lab)
        $('#DATES_dilig').text(dias_lab * 5 < 0 ? 0 : dias_lab * 5)
    } 
})

function getRales () {
    $('#btn_fil_inc').prop('disabled', true)
    $('#btn_fil_res').prop('disabled', true)
    $('#btn_fil_con').prop('disabled', true)

    $('#div-tabla-estadisticas-globales').empty();

    socket.emit('cliente:ejecutorSeleccionadoEstGlob', { 
        copDate: $('#dateCOPfrst').val(),
        rcvDate: $('#dateRCVfrst').val()
    });
}

function fillFilters() {
    $('#inc_fil').empty();
    $('#btn_fil_inc').prop('disabled', false)
    $('#btn_fil_con').prop('disabled', false)
    inc = Array.from(
        dataStats.reduce(function (res, obj) {
            res.add(obj.inc);
            return res;
        }, new Set())
    );
    con = Array.from(
        dataStats.reduce(function (res, obj) {
            res.add(obj.type);
            return res;
        }, new Set())
    );
    inc.sort(function (a, b) { return a - b })
    con.sort(function (a, b) { return a - b })
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
    con.map((data) => {
        $('#con_fil')
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
                        .val('chk_con_' + data)
                        .on('change', function () {
                            updateFilters( "con", data, $(this).is(':checked'))
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

function fillStats() {
    cuotas.asig = dataStats.filter(obj => obj.type === "cuotas" && (obj.inc == 2  || obj.inc == 31)).length;
    cuotas.pen = dataStats.filter(obj => obj.type === "cuotas" && (obj.inc == 2  || obj.inc == 31) && !obj.cobrado).length;
    cuotas.coin = 0 // preguntar
    cuotas.coin_dilig = 0 // preguntar  
    cuotas.pend_2 = "preguntar como se saca"
    cuotas.dil = dataStats.filter(obj => obj.type === "cuotas" && (obj.inc == 2  || obj.inc == 31) && obj.cobrado).length;
    cuotas.inc_09 = dataStats.filter(obj => obj.inc === 9 && obj.type === "cuotas").length;
    cuotas.embargo = 0 // pregutnar
    cuotas.citatorios = "preguntar como se saca"
    $('#CUOTAS_asignado').text(cuotas.asig)
    $('#CUOTAS_pendiente').text(cuotas.pen)
    $('#CUOTAS_coin').text(cuotas.coin)
    $('#CUOTAS_coin_dilig').text(cuotas.coin_dilig)
    $('#CUOTAS_pendiente_2').text(cuotas.pend_2)
    $('#CUOTAS_diligenciado').text(cuotas.dil)
    $('#CUOTAS_inc_09').text(cuotas.inc_09)
    $('#CUOTAS_embargo').text(cuotas.embargo)
    $('#CUOTAS_citatorios').text(cuotas.citatorios)

    rcv.asignado = dataStats.filter(obj => obj.type === "rcv" && (obj.inc == 2  || obj.inc == 31)).length
    rcv.pendiente = dataStats.filter(obj => obj.type === "rcv" && (obj.inc == 2  || obj.inc == 31) && !obj.cobrado).length
    rcv.coin = 0 // preguntar
    rcv.coin_dilig = 0 // preguntar
    rcv.pend_2 = "preguntar como se saca"
    rcv.dil = dataStats.filter(obj => obj.type === "rcv" && (obj.inc == 2  || obj.inc == 31) && obj.cobrado).length
    rcv.inc_09 = dataStats.filter(obj => obj.inc === 9 && obj.type === "rcv").length
    rcv.embargo = 0 // preguntar
    rcv.citatorio = "preguntar como se saca"

    $('#RCV_asignado').text(rcv.asignado)
    $('#RCV_pendiente').text(rcv.pendiente)
    $('#RCV_coin').text(rcv.coin)
    $('#RCV_coin_dilig').text(rcv.coin_dilig)
    $('#RCV_pendiente_2').text(rcv.pend_2)
    $('#RCV_diligenciado').text(rcv.dil)
    $('#RCV_inc_09').text(rcv.inc_09)
    $('#RCV_embargo').text(rcv.embargo)
    $('#RCV_citatorios').text(rcv.citatorio)

    cop_rcv.entregados = dataStats.filter(obj => (obj.type === "rcv" || obj.type === "cuotas") && (obj.inc == 2  || obj.inc == 31)).length
    cop_rcv.req_pago = "preguntar como se saca"
    cop_rcv.no_local = "preguntar como se saca"
    cop_rcv.embargo = "preguntar como se saca"
    cop_rcv.citatorios = "preguntar como se saca"
    cop_rcv.notif = "preguntar como se saca"

    $('#COP_RCV_entregados').text(cop_rcv.entregados)
    $('#COP_RCV_req_pago').text(cop_rcv.req_pago)
    $('#COP_RCV_no_local').text(cop_rcv.no_local)
    $('#COP_RCV_embargo').text(cop_rcv.embargo)
    $('#COP_RCV_citatorios').text(cop_rcv.citatorios)
    $('#COP_RCV_notif').text(cop_rcv.notif)

    fecha = new Date($('#dateCOPfrst').val());

    dates.fec_ini = new Date(fecha.getFullYear(), fecha.getMonth(), 1).toLocaleDateString(undefined,  { year: 'numeric', month: 'long', day: 'numeric' })
    dates.fec_fin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).toLocaleDateString(undefined,  { year: 'numeric', month: 'long', day: 'numeric' })
    dates.laborales = getWorkDays(fecha.getMonth(), fecha.getFullYear()).length - ($('#inp_DATES_fes').val() != "" ? $('#inp_DATES_fes').val() : 0 )
    dates.dilig = dates.laborales * 5
    dates.pat_dilig = cuotas.dil + cuotas.inc_09 + cuotas.embargo + rcv.dil + rcv.inc_09 + rcv.embargo;

    $('#DATES_fec_ini').text(dates.fec_ini)
    $('#DATES_fec_fin').text(dates.fec_fin)
    $('#DATES_laborales').text(dates.laborales)
    $('#DATES_dilig').text(dates.dilig)
    $('#DATES_pat_dilig').text(dates.pat_dilig)

    getGraphics()
}

async function getGraphics() {
    new Chart($('#canv_coin'), {
        type: 'doughnut',
        data: {
            labels: [
                'No diligenciado',
                'Diligenciado',
            ],
            datasets: [{
                label: 'My First Dataset',
                data: [cuotas.coin, cuotas.coin_dilig],
                backgroundColor: [
                    'rgb(220, 53, 69)',
                    'rgb(25, 135, 84)',
                ],
                hoverOffset: 4
            }]
        }
    });

    new Chart($('#canv_prod'), {
        type: 'doughnut',
        data: {
            labels: [
                'No diligenciado',
                'Diligenciado',
            ],
            datasets: [{
                label: 'My First Dataset',
                data: [dates.dilig, dates.pat_dilig],
                backgroundColor: [
                    'rgb(220, 53, 69)',
                    'rgb(25, 135, 84)',
                ],
                hoverOffset: 4
            }]
        }
    });
}

function getWorkDays(month, year) {
    const days = [];
    const date = new Date(year, month, 1);
  
    while (date.getMonth() === month) {
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        days.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return days;
}

function updateFilters( group, n, act ) {
    switch (group) {
        case "inc":
            if (act) inc.push(n)
            else {
                inc = inc.filter(function(fil) {
                    return fil !== n
                })
            }
            inc.sort(function (a, b) { return a - b })
            break;
        case "con":
            if (act) con.push(n)
            else {
                con = con.filter(function(fil) {
                    return fil !== n
                })
            }
            con.sort(function (a, b) { return a - b })
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
        if (obj.type == "multas") dataRow.addClass('bg-success');
        if (obj.type == "cuotas") dataRow.addClass('bg-light');

        if (!inc.includes(obj.inc)) return;
        if (!con.includes(obj.type)) return;

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
