// Instanciar los sockets
const socket = io('http://localhost:3000');
let objCoin;

$('#Coin_input').on('change', function(e) {
    // Obtener el archivo
    const file = e.target.files[0];
    
    // Validar si existe el archivo
    if (file) {
        // Estructurar el modal
        $('#validateModal').modal('show');
        $('#modal_title').text('COIN');

        const reader = new FileReader();

        // Enviar por el socket el archivo para procesar con librearia XLSX
        reader.onload = function (e) {
            const content = new Uint8Array(e.target.result);
            socket.emit('load-file', { file: content, type: 'coin' });
        };

        reader.readAsArrayBuffer(file);
    }
    else bsAlert(`No has seleccionado ningun archivo COIN`, 'danger');
});

socket.on('result-coin', (data) => {
    console.log(data)
    // Vaciar div del modal
    $('#div-table').empty();

    var err = false;
    // Validar que sea un archivo COIN verificando cada columna
    if ( data[0][0] != 'deleg_control' ) {
        alert(`La columna ${data[0][0]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][1] != 'subdeleg_control') {
        alert(`La columna ${data[0][1]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][2] != 'deleg_emision') {
        alert(`La columna ${data[0][2]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][3] != 'subdeleg_emision') {
        alert(`La columna ${data[0][3]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][4] != 'rp') {
        alert(`La columna ${data[0][4]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][5] != 'esencial') {
        alert(`La columna ${data[0][5]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][6] != 'clasificacion') {
        alert(`La columna ${data[0][6]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][7] != 'cve_mov_pat') {
        alert(`La columna ${data[0][7]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][8] != 'fecha_mov_pat') {
        alert(`La columna ${data[0][8]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][9] != 'razon_social') {
        alert(`La columna ${data[0][9]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][10] != 'num_credito') {
        alert(`La columna ${data[0][10]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][11] != 'periodo') {
        alert(`La columna ${data[0][11]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][12] != 'importe') {
        alert(`La columna ${data[0][12]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][13] != 'tipo_documento') {
        alert(`La columna ${data[0][13]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][14] != 'seguro') {
        alert(`La columna ${data[0][14]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][15] != 'dias_estancia') {
        alert(`La columna ${data[0][15]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][16] != 'incidencia') {
        alert(`La columna ${data[0][16]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][17] != 'fecha_incidencia') {
        alert(`La columna ${data[0][17]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][18] != 'estado') {
        alert(`La columna ${data[0][18]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][19] != 'POR IMPORTE') {
        alert(`La columna ${data[0][19]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][20] != 'POR ANTIGUEDAD') {
        alert(`La columna ${data[0][20]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][21] != 'INC ACTUAL') {
        alert(`La columna ${data[0][21]} no coincide con la estructura predeterminada`);
        err = true;
    }
    if ( data[0][22] != 'RESULTADO') {
        alert(`La columna ${data[0][22]} no coincide con la estructura predeterminada`);
        err = true;
    }

    // Si hubo alguna diferente mostrar el error
    if (err) {
        $('#modal_title').text('ERROR');
        $('<h3 class="text-danger">Error: Los campos introducidos del excel no coinciden con la estructura predeterminada</h3>').appendTo('#div-table');
        $('<img src="imgs/coin_example.png" class="mt-3">').appendTo('#div-table');
        $('<h3 class="mt-3 text-primary">Por favor asegurate de que la estructura coincida con la siguiente</h3>').appendTo('#div-table');
        return;
    }

    objCoin = data;

    // Crear tabla
    const table = $('<table class="table">').attr('id', 'coin-table');

    // Crea el encabezado de la tabla
    const thead = $('<thead>');
    const headerRow = $('<tr>');
    //const headerSelCell = $('<th scope="col">').text('SELEC.');
    //headerSelCell.appendTo(headerRow);
    // Recorrer todo el encabezado uno por uno para agregar a la tabla
    data[0].forEach((header, i) => {
        const headerCell = $('<th scope="col">').text(header);
        headerCell.appendTo(headerRow);
    });
    headerRow.appendTo(thead);
    thead.appendTo(table);

    // Crea el cuerpo de la tabla
    const tbody = $('<tbody>');
    // Recorrer fila por fila y celda por celda para agregar
    data.forEach((row, i) => {
        if (i === 0) return;
        const dataRow = $('<tr>');

        // // Crea la celda del checkbox
        // const checkboxCell = $('<td>');

        // // Agregar check box a cada elemento
        // if (i !== data.length - 1) {
        //     const checkbox = $('<input>')
        //         .attr('type', 'checkbox')
        //         .val(row[0])
        //         .prop('checked', true);
        //     checkboxCell.append(checkbox);
        // }

        // // Agrega la celda del checkbox a la fila de datos
        // checkboxCell.appendTo(dataRow);

        Object.values(row).forEach((value) => {
            const dataCell = $('<td>').text(value);
            dataCell.appendTo(dataRow);
        });

        dataRow.appendTo(tbody);
    });
    tbody.appendTo(table);

    // Mostrar la tabla con el numero de registros que tiene
    const tableContainer = $('<div>').attr('id', 'tb-show-coin');
    $(`<b >Se encontraron ${data.length} registros<b>`).appendTo(tableContainer);
    table.appendTo(tableContainer);
    tableContainer.appendTo('#div-table'); 

    // Cambiar action del form
    $('#form_load_info').attr('action', '/loadCoin');
});

$('#btn_insertar').on('click', function(e) {
    // console.log(objCoin);
    socket.emit('insert-coin', objCoin);
});