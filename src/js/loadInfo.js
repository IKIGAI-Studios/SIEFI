// Instanciar los sockets
const socket = io('http://localhost:3000');

let objCoin;
let objAfil;
let objRaleCOP;
let objRaleRCV;

let insrt;

$('#Coin_input').on('change', function(e) {
    $('#div-table').empty();
    // Obtener el archivo
    const file = e.target.files[0];
    
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
    
    // Validar si existe el archivo
    if (file) {
        // Estructurar el modal
        $('#validateModal').modal('show');
        $('#modal_title').text('Rale COP');

        $(`<h3 class="text-primary">Procesando EXCEL</h3>`).appendTo('#div-table');
        $('<img src="imgs/folder_azul.png" class="mt-3">').appendTo('#div-table');

        $('#btn_cancelar').prop('disabled', true);
        $('#btn_insertar').prop('disabled', true);

        const reader = new FileReader();

        // Enviar por el socket el archivo para procesar con librearia XLSX
        reader.onload = function (e) {
            const content = new Uint8Array(e.target.result);
            socket.emit('client:load-rale-cop', { file: content });
        };

        reader.readAsArrayBuffer(file);
    }
    else bsAlert(`No has seleccionado ningun archivo RALE COP`, 'danger');
});

socket.on('server:result-coin', ( data ) => {
    $('#div-table').empty();

    var err = false;
    // Validar que sea un archivo COIN verificando cada columna
    if ( !data[0]['deleg_control'] ) {
        alert(`La columna deleg_control no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['subdeleg_control'] ) {
        alert(`La columna subdeleg_control no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['deleg_emision'] ) {
        alert(`La columna deleg_emision no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['subdeleg_emision'] ) {
        alert(`La columna subdeleg_emision no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['rp'] ) {
        alert(`La columna rp no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['esencial'] ) {
        alert(`La columna esencial no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['clasificacion'] ) {
        alert(`La columna clasificacion no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['cve_mov_pat'] ) {
        alert(`La columna cve_mov_pat no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['fecha_mov_pat'] ) {
        alert(`La columna fecha_mov_pat no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['razon_social'] ) {
        alert(`La columna razon_social no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['num_credito'] ) {
        alert(`La columna num_credito no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['periodo'] ) {
        alert(`La columna periodo no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['importe'] ) {
        alert(`La columna importe no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['tipo_documento'] ) {
        alert(`La columna tipo_documento no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['seguro'] ) {
        alert(`La columna seguro no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['dias_estancia'] ) {
        alert(`La columna dias_estancia no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['incidencia'] ) {
        alert(`La columna incidencia no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['fecha_incidencia'] ) {
        alert(`La columna fecha_incidencia no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['estado'] ) {
        alert(`La columna estado no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['POR IMPORTE'] ) {
        alert(`La columna POR IMPORTE no se encontró en el archivo`);
        err = true;
    }
    if ( !data[0]['POR ANTIGUEDAD'] ) {
        alert(`La columna POR ANTIGUED no se encontró en el archivo`);
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

    // Crear tabla
    const table = $('<table class="table">').attr('id', 'coin-table');

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

    // Crear tabla
    const table = $('<table class="table">').attr('id', 'afil-table');

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
    const tableContainer = $('<div>').attr('id', 'tb-show-coin');
    $(`<b >Se encontraron ${data.length} registros<b>`).appendTo(tableContainer);
    table.appendTo(tableContainer);
    tableContainer.appendTo('#div-table'); 
});

socket.on('server:result-rale-cop', ( data ) => {
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
    if ( !data.some(obj => 'OV. PATRONA' in obj) ) {
        alert(`La columna OV. PATRONA no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'L SE' in obj) ) {
        alert(`La columna L SE no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'CT NUM.CRED.' in obj) ) {
        alert(`La columna CT NUM.CRED. no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'C' in obj) ) {
        alert(`La columna C no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => 'E  PERIODO' in obj) ) {
        alert(`La columna E PERIODO no se encontró en el archivo`);
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
    if ( !data.some(obj => 'FEC. NOTIF' in obj) ) {
        alert(`La columna FEC. NOTIF no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => '. INC' in obj) ) {
        alert(`La columna . INC no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => '. FEC. INCID' in obj) ) {
        alert(`La columna . FEC. INCID no se encontró en el archivo`);
        err = true;
    }
    if ( !data.some(obj => '. DIAS' in obj) ) {
        alert(`La columna . DIAS no se encontró en el archivo`);
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

$('#btn_insertar').on('click', async function(e) {
    $('#div-table').empty();

    $(`<h3 class="text-primary">Insertando en la Base de Datos</h3>`).appendTo('#div-table');
    $('<img src="imgs/folder_azul.png" class="mt-3">').appendTo('#div-table');

    switch (insrt) {
        case "coin":
            socket.emit('client:insert-coin', objCoin);
            break;
        case "afil":
            socket.emit('client:insert-afil', objAfil);
            break;
        case "raleCOP":
            $('#div-table').empty();
            let i = 0;
            while (i < objRaleCOP.length) {
                const batch = objRaleCOP.slice(i, i + 1000);
                // Aquí puedes emitir el lote a través de sockets o realizar cualquier otra operación con él
                await socket.emit('client:insert-rale-cop', { rale:batch, lote:i }, (res) => {
                    showResult(res);
                });
                i += 1000;
            }
            break;
        case "raleRCV":
            socket.emit('client:insert-rale-rcv', objRaleRCV);
            break;
        default:
            break;
    }

    $('#btn_cancelar').prop('disabled', true);
    $('#btn_insertar').prop('disabled', true);
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