// Instanciar los sockets
const socket = io('http://localhost:3000');

let objCoin;
let objAfil;
let objRaleCOP;
let objRaleRCV;

let insrt;

$('#validateModal').on('hidden.bs.modal', function() {
    location.reload();
})

$('#Coin_input').on('change', function(e) {
    $('#div-table').empty();
    // Obtener el archivo
    const file = e.target.files[0];

    if ( file.size > 1000000 ) {
        $('#validateModal').modal('show');
        $('#modal_title').text('ERROR');

        $(`<h3 class="text-danger">
            Asegurate de subir archivos que pesen menos de 1 mb <br><br>
            En caso de que pesen mas separa en distintos archivos los registros para poder ser procesados correctamente
        </h3>`).appendTo('#div-table');
        $('<img src="imgs/X.png" class="mt-3">').appendTo('#div-table');
        return;
    }
    
    // Validar si existe el archivo
    if (file) {
        // Estructurar el modal
        $('#validateModal').modal('show');
        $('#modal_title').text('COIN');

        $(`<h3 class="text-primary">Procesando EXCEL</h3>`).appendTo('#div-table');
        $('<img src="imgs/folder_azul.png" class="mt-3">').appendTo('#div-table');

        $('#btn_cancelar').prop('disabled', true);
        $('#btn_insertar').prop('disabled', true);

        const reader = new FileReader();

        // Enviar por el socket el archivo para procesar con librearia XLSX
        reader.onload = function (e) {
            const content = new Uint8Array(e.target.result);
            socket.emit('client:load-coin', { file: content });
        };

        reader.readAsArrayBuffer(file);
    }
    else bsAlert(`No has seleccionado ningun archivo COIN`, 'danger');
});

$('#Afil_input').on('change', function(e) {
    $('#div-table').empty();
    // Obtener el archivo
    const file = e.target.files[0];

    if ( file.size > 1000000 ) {
        $('#validateModal').modal('show');
        $('#modal_title').text('ERROR');

        $(`<h3 class="text-danger">
            Asegurate de subir archivos que pesen menos de 1 mb <br><br>
            En caso de que pesen mas separa en distintos archivos los registros para poder ser procesados correctamente
        </h3>`).appendTo('#div-table');
        $('<img src="imgs/X.png" class="mt-3">').appendTo('#div-table');
        return;
    }
    
    // Validar si existe el archivo
    if (file) {
        // Estructurar el modal
        $('#validateModal').modal('show');
        $('#modal_title').text('AFIL');

        $(`<h3 class="text-primary">Procesando EXCEL</h3>`).appendTo('#div-table');
        $('<img src="imgs/folder_azul.png" class="mt-3">').appendTo('#div-table');

        $('#btn_cancelar').prop('disabled', true);
        $('#btn_insertar').prop('disabled', true);

        const reader = new FileReader();

        // Enviar por el socket el archivo para procesar con librearia XLSX
        reader.onload = function (e) {
            const content = new Uint8Array(e.target.result);
            socket.emit('client:load-afil', { file: content });
        };

        reader.readAsArrayBuffer(file);
    }
    else bsAlert(`No has seleccionado ningun archivo AFIL`, 'danger');
});

$('#RaleCOP_input').on('change', function(e) {
    $('#div-table').empty();
    // Obtener el archivo
    const file = e.target.files[0];

    if ( file.size > 1000000 ) {
        $('#validateModal').modal('show');
        $('#modal_title').text('ERROR');

        $(`<h3 class="text-danger">
            Asegurate de subir archivos que pesen menos de 1 mb <br><br>
            En caso de que pesen mas separa en distintos archivos los registros para poder ser procesados correctamente
        </h3>`).appendTo('#div-table');
        $('<img src="imgs/X.png" class="mt-3">').appendTo('#div-table');
        return;
    }
    
    // Validar si existe el archivo
    if (file) {
        // Estructurar el modal
        $('#validateModal').modal('show');
        $('#modal_title').text('Rale');

        $(`<h3 class="text-primary">Procesando EXCEL</h3>`).appendTo('#div-table');
        $('<img src="imgs/folder_azul.png" class="mt-3">').appendTo('#div-table');

        $('#btn_cancelar').prop('disabled', true);
        $('#btn_insertar').prop('disabled', true);

        const reader = new FileReader();

        // Enviar por el socket el archivo para procesar con librearia XLSX
        reader.onload = function (e) {
            const content = new Uint8Array(e.target.result);
            socket.emit('client:load-rale', { file: content }, (cb) => {
                if (!cb.status) {
                    $('#div-table').empty();
                    showResult(cb);
                }
            });
        };

        reader.readAsArrayBuffer(file);
    }
    else bsAlert(`No has seleccionado ningun archivo RALE COP`, 'danger');
});

$('#RaleRCV_input').on('change', function(e) {
    $('#div-table').empty();
    // Obtener el archivo
    const file = e.target.files[0];

    if ( file.size > 1000000 ) {
        $('#validateModal').modal('show');
        $('#modal_title').text('ERROR');

        $(`<h3 class="text-danger">
            Asegurate de subir archivos que pesen menos de 1 mb <br><br>
            En caso de que pesen mas separa en distintos archivos los registros para poder ser procesados correctamente
        </h3>`).appendTo('#div-table');
        $('<img src="imgs/X.png" class="mt-3">').appendTo('#div-table');
        return;
    }
    
    // Validar si existe el archivo
    if (file) {
        // Estructurar el modal
        $('#validateModal').modal('show');
        $('#modal_title').text('Rale');

        $(`<h3 class="text-primary">Procesando EXCEL</h3>`).appendTo('#div-table');
        $('<img src="imgs/folder_azul.png" class="mt-3">').appendTo('#div-table');

        $('#btn_cancelar').prop('disabled', true);
        $('#btn_insertar').prop('disabled', true);

        const reader = new FileReader();

        // Enviar por el socket el archivo para procesar con librearia XLSX
        reader.onload = function (e) {
            const content = new Uint8Array(e.target.result);
            socket.emit('client:load-rale', { file: content });
        };

        reader.readAsArrayBuffer(file);
    }
    else bsAlert(`No has seleccionado ningun archivo RALE RCV`, 'danger');
});

$('#btn_insertar').on('click', async function(e) {
    $('#div-table').empty();

    $(`<h3 class="text-primary">Insertando en la Base de Datos</h3>`).appendTo('#div-table');
    $('<img src="imgs/folder_azul.png" class="mt-3">').appendTo('#div-table');

    let i = 0;

    switch (insrt) {
        case "coin":
            while (i < objCoin.length) {
                const batch = objCoin.slice(i, i + 1000);
                // Aquí puedes emitir el lote a través de sockets o realizar cualquier otra operación con él
                await socket.emit('client:insert-coin', { coin:batch, lote:i }, (res) => {
                    if (i == 0) $('#div-table').empty();
                    showResult(res);
                });
                i += 1000;
            }
            break;
        case "afil":
            while (i < objAfil.length) {
                const batch = objAfil.slice(i, i + 1000);
                // Aquí puedes emitir el lote a través de sockets o realizar cualquier otra operación con él
                await socket.emit('client:insert-afil', { afil:batch, lote:i, lenght:objAfil.length }, (res) => {
                    if (i == 0) $('#div-table').empty();
                    showResult(res);
                });
                i += 1000;
            }
            break;
        case "raleCOP":
            while (i < objRaleCOP.length) {
                const batch = objRaleCOP.slice(i, i + 1000);
                // Aquí puedes emitir el lote a través de sockets o realizar cualquier otra operación con él
                await socket.emit('client:insert-rale-cop', { rale:batch, lote:i }, (res) => {
                    if (i == 0) $('#div-table').empty();
                    showResult(res);
                });
                i += 1000;
            }
            break;
        case "raleRCV":
            while (i < objRaleRCV.length) {
                const batch = objRaleRCV.slice(i, i + 1000);
                // Aquí puedes emitir el lote a través de sockets o realizar cualquier otra operación con él
                await socket.emit('client:insert-rale-rcv', { rale:batch, lote:i }, (res) => {
                    if (i == 0) $('#div-table').empty();
                    showResult(res);
                });
                i += 1000;
            }
            break;
        default:
            break;
    }

    $('#btn_cancelar').prop('disabled', true);
    $('#btn_insertar').prop('disabled', true);
});

socket.on('server:result-coin', ( data ) => {
    $('#div-table').empty();

    var err = false;
    // Validar que sea un archivo COIN verificando cada columna
    if ( !data.some(obj => 'deleg_control' in obj) ) {
        alert(`La columna deleg_control no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'subdeleg_control' in obj) ) {
        alert(`La columna subdeleg_control no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'deleg_emision' in obj) ) {
        alert(`La columna deleg_emision no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'subdeleg_emision' in obj) ) {
        alert(`La columna subdeleg_emision no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'rp' in obj) ) {
        alert(`La columna rp no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'esencial' in obj) ) {
        alert(`La columna esencial no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'clasificacion' in obj) ) {
        alert(`La columna clasificacion no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'cve_mov_pat' in obj) ) {
        alert(`La columna cve_mov_pat no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'fecha_mov_pat' in obj) ) {
        alert(`La columna fecha_mov_pat no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'razon_social' in obj) ) {
        alert(`La columna razon_social no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'num_credito' in obj) ) {
        alert(`La columna num_credito no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'periodo' in obj) ) {
        alert(`La columna periodo no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'importe' in obj) ) {
        alert(`La columna importe no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'tipo_documento' in obj) ) {
        alert(`La columna tipo_documento no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'seguro' in obj) ) {
        alert(`La columna seguro no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'dias_estancia' in obj) ) {
        alert(`La columna dias_estancia no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'incidencia' in obj) ) {
        alert(`La columna incidencia no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'fecha_incidencia' in obj) ) {
        alert(`La columna fecha_incidencia no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'estado' in obj) ) {
        alert(`La columna estado no se encontró en el archivo`);
        err = true;
    }

    // Si hubo alguna diferente mostrar el error
    if (err) {
        $('#modal_title').text('ERROR');
        $('<h3 class="text-danger">Error: Los campos introducidos del excel no coinciden con la estructura predeterminada</h3>').appendTo('#div-table');
        $('<img src="imgs/coin_example.png" class="mt-3">').appendTo('#div-table');
        $('<h3 class="mt-3 text-primary">Por favor asegurate de que la estructura coincida con la siguiente</h3>').appendTo('#div-table');
        
        $('#btn_cancelar').prop('disabled', false);
        $('#btn_insertar').prop('disabled', true);
        
        return;
    }

    $('#btn_cancelar').prop('disabled', false);
    $('#btn_insertar').prop('disabled', false);

    // Guardar el objeto
    objCoin = data;
    insrt = "coin";

    const table = $('<table class="table">').attr('id', 'coin-table');

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
    const tableContainer = $('<div>').attr('id', 'tb-show-coin');
    $(`<b >Se encontraron ${data.length} registros<b>`).appendTo(tableContainer);
    table.appendTo(tableContainer);
    tableContainer.appendTo('#div-table'); 
});

socket.on('server:result-afil', ( data ) => {
    // Vaciar div del modal
    $('#div-table').empty();

    $('#btn_cancelar').prop('disabled', false);
    $('#btn_insertar').prop('disabled', false);

    // Guardar el objeto
    objAfil = data;
    insrt = "afil";

    const table = $('<table class="table">').attr('id', 'coin-table');

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
    const tableContainer = $('<div>').attr('id', 'tb-show-coin');
    $(`<b >Se encontraron ${data.length} registros<b>`).appendTo(tableContainer);
    table.appendTo(tableContainer);
    tableContainer.appendTo('#div-table'); 
});

socket.on('server:result-rale-cop', ( data ) => {
    $('#modal_title').text('Rale COP');

    // Vaciar div del modal
    $('#div-table').empty();

    var err = false;
    // Validar que sea un archivo COIN verificando cada columna
    if ( !data.some(obj => 'REG. PATRONAL' in obj) ) {
        alert(`La columna REG. PATRONAL no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'M' in obj) ) {
        alert(`La columna M no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'OV. PATRONAL' in obj) ) {
        alert(`La columna OV. PATRONAL no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'SECT' in obj) ) {
        alert(`La columna SECT no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'NUM.CRED.' in obj) ) {
        alert(`La columna NUM.CRED. no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'CE' in obj) ) {
        alert(`La columna CE no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'PERIODO' in obj) ) {
        alert(`La columna PERIODO no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'TD' in obj) ) {
        alert(`La columna TD no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'FECHA ALTA' in obj) ) {
        alert(`La columna FECHA ALTA no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'FEC. NOTIF.' in obj) ) {
        alert(`La columna FEC. NOTIF. no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'INC.' in obj) ) {
        alert(`La columna INC. no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'FEC. INCID.' in obj) ) {
        alert(`La columna FEC. INCID. no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'DIAS' in obj) ) {
        alert(`La columna DIAS. no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'I M P O R T E' in obj)) {
        alert(`La columna I M P O R T E no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'DC SC' in obj) ) {
        alert(`La columna DC SC no se encontró en el archivo`);
        err = true;
    }

    // Si hubo alguna diferente mostrar el error
    if (err) {
        $('#modal_title').text('ERROR');
        $('<h3 class="text-danger">Error: Los campos introducidos del excel no coinciden con la estructura predeterminada</h3>').appendTo('#div-table');
        $('<img src="imgs/rale_example.png" class="mt-3">').appendTo('#div-table');
        $('<h3 class="mt-3 text-primary">Por favor asegurate de que la estructura coincida con la siguiente</h3>').appendTo('#div-table');
        
        $('#btn_cancelar').prop('disabled', false);
        $('#btn_insertar').prop('disabled', true);
        
        return;
    }

    $('#btn_cancelar').prop('disabled', false);
    $('#btn_insertar').prop('disabled', false);

    // Guardar el objeto
    objRaleCOP = data;
    insrt = "raleCOP";

    // Crear tabla
    const table = $('<table class="table">').attr('id', 'rale-cop-table');

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

socket.on('server:result-rale-rcv', ( data ) => {
    $('#modal_title').text('Rale RCV');

    // Vaciar div del modal
    $('#div-table').empty();

    var err = false;
    // Validar que sea un archivo COIN verificando cada columna
    if ( !data.some(obj => 'REG. PATRONAL' in obj) ) {
        alert(`La columna REG. PATRONAL no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'M' in obj) ) {
        alert(`La columna M no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'OV. PATRONAL' in obj) ) {
        alert(`La columna OV. PATRONAL no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'SECT' in obj) ) {
        alert(`La columna SECT no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'NUM.CRED.' in obj) ) {
        alert(`La columna NUM.CRED. no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'CE' in obj) ) {
        alert(`La columna CE no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'PERIODO' in obj) ) {
        alert(`La columna PERIODO no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'TD' in obj) ) {
        alert(`La columna TD no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'FECHA ALTA' in obj) ) {
        alert(`La columna FECHA ALTA no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'FEC. NOTIF.' in obj) ) {
        alert(`La columna FEC. NOTIF. no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'INC.' in obj) ) {
        alert(`La columna INC. no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'FEC. INCID.' in obj) ) {
        alert(`La columna FEC. INCID. no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'DIAS' in obj) ) {
        alert(`La columna DIAS no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'I M P O R T E' in obj)) {
        alert(`La columna I M P O R T E no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'DC SC' in obj) ) {
        alert(`La columna DC SC no se encontró en el archivo`);
        err = true;
    }

    // Si hubo alguna diferente mostrar el error
    if (err) {
        $('#modal_title').text('ERROR');
        $('<h3 class="text-danger">Error: Los campos introducidos del excel no coinciden con la estructura predeterminada</h3>').appendTo('#div-table');
        $('<img src="imgs/rale_example.png" class="mt-3">').appendTo('#div-table');
        $('<h3 class="mt-3 text-primary">Por favor asegurate de que la estructura coincida con la siguiente</h3>').appendTo('#div-table');
        
        $('#btn_cancelar').prop('disabled', false);
        $('#btn_insertar').prop('disabled', true);
        
        return;
    }

    $('#btn_cancelar').prop('disabled', false);
    $('#btn_insertar').prop('disabled', false);

    // Guardar el objeto
    objRaleRCV = data;
    insrt = "raleRCV";

    // Crear tabla
    const table = $('<table class="table">').attr('id', 'rale-rcv-table');

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
    const tableContainer = $('<div>').attr('id', 'tb-show-rale-rcv');
    $(`<b >Se encontraron ${data.length} registros<b>`).appendTo(tableContainer);
    table.appendTo(tableContainer);
    tableContainer.appendTo('#div-table'); 
});

socket.on('servidor:consultarRegistrosRaleCOP', (data) => {
    $('#div-registros-rale-cop').empty();
    $('#btnCerrarRaleCOP').prop('disabled', false);
  
    // Crear la etiqueta select
    const selectRaleCOP = $('<select>').attr({'id' : 'selectRaleCOP', 'name' : 'selectRaleCOP'});

    // Crear la opción "Seleccionar" con valor falso y seleccionarla por defecto
    const defaultOption = $('<option>').text('Seleccionar').val(false).prop('selected', true);
    selectRaleCOP.append(defaultOption);

    // Recorrer los datos y crear las opciones adicionales
    data.forEach((item) => {
        const option = $('<option>').text(item).val(item);
        selectRaleCOP.append(option);
    });

    // Agregar un evento de cambio al select
    selectRaleCOP.on('change', function() {
        const fechaRaleCOP = $(this).val(); // Obtener el valor de la opción seleccionada
        socket.emit('cliente:filtrarRaleCOP', fechaRaleCOP); // Enviar el valor al servidor a través del socket

        $('#btnCerrarRaleCOP').prop('disabled', true);
    });
  
    // Agregar el select al elemento con el ID 'div-registros-rale-cop'
    $('#div-registros-rale-cop').append(selectRaleCOP);
});

socket.on('servidor:filtrarRaleCOP', (data) => {
    //$('#div-registros-rale-cop').empty();
    $('#btnCerrarRaleCOP').prop('disabled', false);
    $('#btnEliminarRaleCOP').prop('disabled', false);
    $('#selectRaleCOP').hide();

    // Crear tabla
    const table = $('<table class="table">').attr('id', 'rale-cop-filtrado-table');

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

    // Mostrar la tabla con el numero de registros que tiene
    const tableContainer = $('<div>').attr('id', 'tb-show-rale-cop-filtrado');
    $(`<b >Se encontraron ${data.length} registros de Rale Cop<b>`).appendTo(tableContainer);
    table.appendTo(tableContainer);
    tableContainer.appendTo('#div-registros-rale-cop'); 
});

socket.on('servidor:filtrarCoin', (data) => {
    //$('#div-registros-coin').empty();
    $('#btnCerrarCoin').prop('disabled', false);
    $('#btnEliminarCoin').prop('disabled', false);
    $('#selectCoin').hide();

    // Crear tabla
    const table = $('<table class="table">').attr('id', 'coin-filtrado-table');

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

    // Mostrar la tabla con el numero de registros que tiene
    const tableContainer = $('<div>').attr('id', 'tb-show-coin-filtrado');
    $(`<b >Se encontraron ${data.length} registros de Coin<b>`).appendTo(tableContainer);
    table.appendTo(tableContainer);
    tableContainer.appendTo('#div-registros-coin'); 
});

socket.on('servidor:consultarRegistrosAfil', (data) => {
    $('#div-registros-afil').empty();
    $('#btnCerrarAfil').prop('disabled', false);
  
    // Crear la etiqueta select
    const selectAfil = $('<select>').attr({'id' : 'selectAfil', 'name' : 'selectAfil'});

    // Crear la opción "Seleccionar" con valor falso y seleccionarla por defecto
    const defaultOption = $('<option>').text('Seleccionar').val(false).prop('selected', true);
    selectAfil.append(defaultOption);

    // Recorrer los datos y crear las opciones adicionales
    data.forEach((item) => {
        const option = $('<option>').text(item).val(item);
        selectAfil.append(option);
    });
  
    // Agregar un evento de cambio al select
    selectAfil.on('change', function() {
      const fechaAfil = $(this).val(); // Obtener el valor de la opción seleccionada
      socket.emit('cliente:filtrarAfil', fechaAfil); // Enviar el valor al servidor a través del socket
    
      $('#btnCerrarAfil').prop('disabled', true);
    });
  
    // Agregar el select al elemento con el ID 'div-registros-afil'
    $('#div-registros-afil').append(selectAfil);
});
  

socket.on('servidor:filtrarAfil', (data) => {
    //$('#div-registros-afil').empty();
    $('#btnCerrarAfil').prop('disabled', false);
    $('#btnEliminarAfil').prop('disabled', false);
    $('#selectAfil').hide();


    // Crear tabla
    const table = $('<table class="table">').attr('id', 'afil-filtrado-table');

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

    // Mostrar la tabla con el numero de registros que tiene
    const tableContainer = $('<div>').attr('id', 'tb-show-afil-filtrado');
    $(`<b >Se encontraron ${data.length} registros de Afil<b>`).appendTo(tableContainer);
    table.appendTo(tableContainer);
    tableContainer.appendTo('#div-registros-afil'); 
});

socket.on('servidor:consultarRegistrosCoin', (data) => {
    $('#div-registros-coin').empty();
    $('#btnCerrarCoin').prop('disabled', false);
  
    // Crear la etiqueta select
    const selectCoin = $('<select>').attr({'id' : 'selectCoin', 'name' : 'selectCoin'});

    // Crear la opción "Seleccionar" con valor falso y seleccionarla por defecto
    const defaultOption = $('<option>').text('Seleccionar').val(false).prop('selected', true);
    selectCoin.append(defaultOption);

    // Recorrer los datos y crear las opciones adicionales
    data.forEach((item) => {
        const option = $('<option>').text(item).val(item);
        selectCoin.append(option);
    });

  
    // Agregar un evento de cambio al select
    selectCoin.on('change', function() {
      const fechaCoin = $(this).val(); // Obtener el valor de la opción seleccionada
      socket.emit('cliente:filtrarCoin', fechaCoin); // Enviar el valor al servidor a través del socket
    
      $('#btnCerrarCoin').prop('disabled', true);
    });
  
    // Agregar el select al elemento con el ID 'div-registros-coin'
    $('#div-registros-coin').append(selectCoin);
});

socket.on('servidor:consultarRegistrosRaleRCV', (data) => {
    $('#div-registros-rale-rcv').empty();
    $('#btnCerrarRaleRCV').prop('disabled', false);
  
    // Crear la etiqueta select
    const selectRaleRCV = $('<select>').attr({'id' : 'selectRaleRCV', 'name' : 'selectRaleRCV'});

    // Crear la opción "Seleccionar" con valor falso y seleccionarla por defecto
    const defaultOption = $('<option>').text('Seleccionar').val(false).prop('selected', true);
    selectRaleRCV.append(defaultOption);

    // Recorrer los datos y crear las opciones adicionales
    data.forEach((item) => {
        const option = $('<option>').text(item).val(item);
        selectRaleRCV.append(option);
    });

    // Agregar un evento de cambio al select
    selectRaleRCV.on('change', function() {
        const fechaRaleRCV = $(this).val(); // Obtener el valor de la opción seleccionada
        socket.emit('cliente:filtrarRaleRCV', fechaRaleRCV); // Enviar el valor al servidor a través del socket

        $('#btnCerrarRaleRCV').prop('disabled', true);
    });
  
    // Agregar el select al elemento con el ID 'div-registros-rale-rcv'
    $('#div-registros-rale-rcv').append(selectRaleRCV);
});

socket.on('servidor:filtrarRaleRCV', (data) => {
    //$('#div-registros-rale-rcv').empty();
    $('#btnCerrarRaleRCV').prop('disabled', false);
    $('#btnEliminarRaleRCV').prop('disabled', false);
    $('#selectRaleRCV').hide();

    // Crear tabla
    const table = $('<table class="table">').attr('id', 'rale-rcv-filtrado-table');

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

    // Mostrar la tabla con el numero de registros que tiene
    const tableContainer = $('<div>').attr('id', 'tb-show-rale-rcv-filtrado');
    $(`<b >Se encontraron ${data.length} registros de Rale Rcv<b>`).appendTo(tableContainer);
    table.appendTo(tableContainer);
    tableContainer.appendTo('#div-registros-rale-rcv'); 
});


socket.on('connect', () => {
    // console.log('Conexión establecida con el servidor');
});

socket.on('disconnect', () => {
    // console.log('Conexión perdida con el servidor');
});  

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

function verRegistrosAfil(){
    $('#div-registros-afil').empty();
    
        socket.emit('cliente:consultarRegistrosAfil');
        $('#verAfilModal').modal('show');
    
        $(`<h3 class="text-primary">Obteniendo registros de Afil</h3>`).appendTo('#div-registros-afil');

        $('#btnCerrarAfil').prop('disabled', true); 
        $('#btnEliminarAfil').prop('disabled', true); 
}

function verRegistrosCoin(){
    $('#div-registros-coin').empty();
    
        socket.emit('cliente:consultarRegistrosCoin');
        $('#verCoinModal').modal('show');
    
        $(`<h3 class="text-primary">Obteniendo registros de Coin</h3>`).appendTo('#div-registros-coin');

        $('#btnCerrarCoin').prop('disabled', true); 
        $('#btnEliminarCoin').prop('disabled', true); 
}

function verRegistrosRaleCOP(){
    $('#div-registros-rale-cop').empty();
    
    socket.emit('cliente:consultarRegistrosRaleCOP');
    $('#verRaleCOPModal').modal('show');

    $(`<h3 class="text-primary">Obteniendo registros de Rale COP</h3>`).appendTo('#div-registros-rale-cop');

    $('#btnCerrarRaleCOP').prop('disabled', true); 
    $('#btnEliminarRaleCop').prop('disabled', true); 
}

function verRegistrosRaleRCV(){
    $('#div-registros-rale-rcv').empty();
    
    socket.emit('cliente:consultarRegistrosRaleRCV');
    $('#verRaleRCVModal').modal('show');

    $(`<h3 class="text-primary">Obteniendo registros de Rale RCV</h3>`).appendTo('#div-registros-rale-rcv');

    $('#btnCerrarRaleRCV').prop('disabled', true); 
    $('#btnEliminarRaleRCV').prop('disabled', true); 
}