const socket = io('http://localhost:3000');

// Sockets

//Socket para pedir la información inicial al usuario. 
socket.on('servidor:capturarDatos', (data, value, clave_eje) => {
  
  $('#div-ingresar-registro-patronal').empty();
  $('#generarReportesRPModal').modal('show');
  $('#btnCerrar').prop('disabled', true);
  $('#btnGenerar').hide();

  // Crear el input, el link y el select
  const input = $('<input type="text" id="patronInput" class="form-control form-control-sm w-50" placeholder="Registro Patronal">');
  const select = $('<select id="fechaSelect" class="form-control form-control-sm w-50">');
  const link = $('<a href="#" class="btn btn-primary disabled ml-3">Aceptar</a>');

  // Obtener las fechas distintas del campo createdAt en el objeto data
  const fechasDistintas = Array.from(new Set(data.map(item => item)));

  // Agregar el elemento de selección por defecto
  const defaultOption = $('<option>').text('Seleccionar').val('0').prop('selected', true);
  select.append(defaultOption);

  // Agregar las opciones al select con las fechas distintas
  fechasDistintas.forEach(fecha => {
    const option = $('<option>').text(fecha).val(fecha);
    select.append(option);
  });  

  // Agregar el input y el enlace al div de ingreso de registro patronal
  $('#div-ingresar-registro-patronal').append(input);
  $('#div-ingresar-registro-patronal').append(select);
  $('#div-ingresar-registro-patronal').append(link);

  // Manejar el evento input del input
  input.on('input', function() {
    if ($(this).val() !== '') {
      link.removeClass('disabled');
    } else {
      link.addClass('disabled');
    }
  });


  // Manejar el evento click del enlace
  link.on('click', function(event) {
    event.preventDefault();
    const opcionSeleccionada = $('#fechaSelect').val();
    
    if (opcionSeleccionada !== '0'){
      const patron = $('#patronInput').val();
      const fecha = $('#fechaSelect').val();
      $('#div-ingresar-registro-patronal').text("Cargando...");
      socket.emit('cliente:obtenerPatrones', patron, fecha, value, clave_eje);

    } else  bsAlert("Selecciona una fecha", 'warning');
  });
});



//Socket para crear la tabla 
socket.on('servidor:obtenerPatrones', (data, value, user) => {

  
  $('#div-generar-reportes').empty();
  $('#div-formularios-reportes').empty();

  $('#generarReportesRPModal').modal('hide');
  $('#btnCerrar').prop('disabled', false);
  $('#btnGenerarForms').prop('disabled', true);

  //Mostrar el modal dependiendo del valor recibido
  if(value == 'citatorio' || value == 'mandamiento') {
    $('#generarReportesModal').modal('show');
    $('#formsReportesModal').modal('hide');
  }
  if(value == 'informe' || value == 'gastos') {
    $('#formsReportesModal').modal('show');
    $('#generarReportesModal').modal('hide');
  }

  // Comprobar si la variable data está vacía
  if (data.length === 0) {
    const noRecordsMessage = $('<p>').text('No se encontraron registros.').css({
      color: 'red',
      'font-size': '24px'
    });    
    $('#div-generar-reportes').append(noRecordsMessage);
    $('#div-formularios-reportes').append(noRecordsMessage);
    return;
  } else{

    // Crear tabla
    const table = $('<table>').addClass('table').attr('id', 'reportes-table');

    // Crear el encabezado de la tabla
    const thead = $('<thead>');
    const headerRow = $('<tr>');

    // Obtener los nombres de las propiedades del primer objeto
    const headers = Object.keys(data[0]);

    // Agregar encabezados a la tabla
    headers.forEach((header) => {
      const headerCell = $('<th>').attr('scope', 'col').text(header);
      headerCell.appendTo(headerRow);
    });

    // Agregar columna adicional según el valor recibido
    if (value === 'citatorio' || value === 'mandamiento') {
      const iconHeader = $('<th>').attr('scope', 'col').text('Generar');
      iconHeader.appendTo(headerRow);
    } else if (value === 'informe' || value === 'gastos') {
      const checkboxHeader = $('<th>').attr('scope', 'col').text('Seleccionar');
      checkboxHeader.prependTo(headerRow);
    }

    headerRow.appendTo(thead);
    thead.appendTo(table);

    // Crear el cuerpo de la tabla
    const tbody = $('<tbody>');

    // Recorrer los objetos y agregar filas a la tabla
    data.forEach((obj) => {
      const dataRow = $('<tr>');

    //Switch para cambiar el color dependiendo de la tabla donde fueron obtenidas
    switch (obj.cobrado) {
      case true:
        dataRow.addClass('table-primary');
        break;
      case false:
        dataRow.addClass('table-success');
        break;
        default:
        break;
    }

      // Recorrer las propiedades de cada objeto y agregar celdas a la fila
      Object.values(obj).forEach((value) => {
        const dataCell = $('<td>').text(value);
        dataCell.appendTo(dataRow);
      });

      // Agregar columna adicional según el valor recibido
      if (value === 'citatorio' || value === 'mandamiento') {
        const buttonCell = $('<td>');
        const button = $('<button>').html('<img src="imgs/folder_azul.png">').addClass('custom-button');

        // Agregar evento de clic al botón
        button.on('click', function() {
          const form = $(this).closest('form');
          const dataRow = $(this).closest('tr');
          const formData = dataRow.find('td').map(function() {
            return $(this).text();
          }).get();

          switch (value) {
            case 'citatorio':
              form.attr('action', '/generarCitatorio');
              break;
            case 'mandamiento':
              form.attr('action', '/generarMandamiento');
              break;
          }

          $('<input>').attr({
            type: 'hidden',
            name: 'registroData',
            value: formData.join(',')
          }).appendTo(form);

          form.submit();
        });

        button.appendTo(buttonCell);
        buttonCell.appendTo(dataRow);
      }

        else if (value === 'informe' || value === 'gastos') {
          const checkboxCell = $('<td>');
          const checkbox = $('<input type="checkbox" id="selectPatrones" class="select-registro" name="opcion">').attr('value', JSON.stringify(obj));
          checkbox.appendTo(checkboxCell);
          checkboxCell.prependTo(dataRow);
          $('#btnGenerarForms').show();
        }

      dataRow.appendTo(tbody);
    });

    tbody.appendTo(table);

    // Mostrar la tabla con el número de registros que tiene, dependiendo del modal
    const tableContainer = $('<div>').attr('id', 'tb-show-reportes');
    $('<b>').text(`Se encontraron ${data.length} patrones`).appendTo(tableContainer);
    table.appendTo(tableContainer);
    if (value === 'citatorio' || value === 'mandamiento') tableContainer.appendTo('#div-generar-reportes');
    if (value === 'informe' || value === 'gastos') tableContainer.appendTo('#div-formularios-reportes'); 

   
  // Habilitar o deshabilitar el botón según las selecciones
  const select = $('#selectPatrones');
  select.on('change', function() {
    actualizarEstadoBoton(value, user);
  });

  // Llamar a la función para establecer el estado inicial del botón
  actualizarEstadoBoton(value, user);
    
  }
});


//Socket para crear el formulario del informe.
socket.on('servidor:crearFormInforme', (data, value, user, registro) => {

  $('#div-generar-reportes').empty();
  $('#formsReportesModal').modal('hide');

  $('#generarReportesModal').modal('show');
  $('#btnGenerar').show();

  // Comprobar si la variable data está vacía
  if (data.length === 0) {
    const noRecordsMessage = $('<p>').text('No se encontraron registros.').css({
      color: 'red',
      'font-size': '24px'
    });    
    $('#div-generar-reportes').append(noRecordsMessage);
    $('#div-formularios-reportes').append(noRecordsMessage);
    return;
  } else {
    // Crear tabla
    const table = $('<table>').addClass('table').attr('id', 'reportes-table');

    // Crear el encabezado de la tabla
    const thead = $('<thead>');
    const headerRow = $('<tr>');

    // Obtener los nombres de las propiedades del primer objeto
    const headers = Object.keys(data[0]);

    // Agregar encabezados a la tabla
    headers.forEach((header) => {
      const headerCell = $('<th>').attr('scope', 'col').text(header);
      headerCell.appendTo(headerRow);
    });

    // Agregar encabezados adicionales para las nuevas columnas cuando sea informe
    if (value == 'informe'){
      const folioSuaHeader = $('<th>').attr('scope', 'col').text('Folio Sua');
      const resultadosHeader = $('<th>').attr('scope', 'col').text('Resultados de la diligencia');
      folioSuaHeader.appendTo(headerRow);
      resultadosHeader.appendTo(headerRow);
    }  
    
    // Agregar encabezados adicionales para las nuevas columnas cuando sean gastos
    if(value == 'gastos'){
      const provioHeader = $('<th>').attr('scope', 'col').text('Provio .I.');
      const fechaPagoHeader = $('<th>').attr('scope', 'col').text('Fecha de pago');
      const cobradoHeader = $('<th>').attr('scope', 'col').text('Cobrado');
      const gastosEjecutor = $('<th>').attr('scope', 'col').text('G.E');
      const tabulador = $('<th>').attr('scope', 'col').text('Tabulador');
      provioHeader.appendTo(headerRow);
      fechaPagoHeader.appendTo(headerRow);
      cobradoHeader.appendTo(headerRow);
      gastosEjecutor.appendTo(headerRow);
      tabulador.appendTo(headerRow);
    }
    

    headerRow.appendTo(thead);
    thead.appendTo(table);

    // Crear el cuerpo de la tabla
    const tbody = $('<tbody>');

    // Recorrer los objetos y agregar filas a la tabla
      data.forEach((obj) => {
      const dataRow = $('<tr>');

      // Recorrer las propiedades de cada objeto y agregar celdas a la fila
      Object.entries(obj).forEach(([key, value]) => {
        const dataCell = $('<td>');
        const input = $('<input>').attr({
          type: 'text',
          value: value,
          readonly: 'readonly',
          name: key
        }).addClass('form-control');
        input.appendTo(dataCell);
        dataCell.appendTo(dataRow);
      });


      // Agregar celdas adicionales con inputs de tipo texto si es informe
      if (value == 'informe'){
        const folioSuaInput = $('<input>').attr({
          type: 'text',
          name: 'folioSua',
          value: ''
        }).addClass('form-control');
        const resultadosInput = $('<input>').attr({
          type: 'text',
          name: 'resultadosDiligencia',
          value: ''
        }).addClass('form-control');

        const inputCell1 = $('<td>').append(folioSuaInput);
        const inputCell2 = $('<td>').append(resultadosInput);
        inputCell1.appendTo(dataRow);
        inputCell2.appendTo(dataRow);
  
        dataRow.appendTo(tbody);
      }

      if (value == 'gastos'){
        const provioInput = $('<input>').attr({
          type: 'text',
          name: 'provio',
          value: ''
        }).addClass('form-control');
        const cobradoInput = $('<input>').attr({
          type: 'text',
          name: 'cobrado',
          value: ''
        }).addClass('form-control');
        const gastosInput = $('<input>').attr({
          type: 'text',
          name: 'gastos',
          value: ''
        }).addClass('form-control');
        const tabuladorInput = $('<input>').attr({
          type: 'text',
          name: 'tabulador',
          value: ''
        }).addClass('form-control');
        const fechaPagoInput = $('<input>').attr({
          type: 'date',
          name: 'fechaPago',
          value: ''
        }).addClass('form-control');

        const inputCell1 = $('<td>').append(provioInput);
        const inputCell2 = $('<td>').append(cobradoInput);
        const inputCell3 = $('<td>').append(gastosInput);
        const inputCell4 = $('<td>').append(tabuladorInput);
        const inputCell5 = $('<td>').append(fechaPagoInput);
        inputCell1.appendTo(dataRow);
        inputCell2.appendTo(dataRow);
        inputCell3.appendTo(dataRow);
        inputCell4.appendTo(dataRow);
        inputCell5.appendTo(dataRow);
  
        dataRow.appendTo(tbody);

      }

    });

    tbody.appendTo(table);

    // Mostrar la tabla con el número de registros que tiene, dependiendo del modal
    const tableContainer = $('<div>').attr('id', 'tb-show-reportes');
    table.appendTo(tableContainer);
    tableContainer.appendTo('#div-generar-reportes');

    const form = $("#reportesForm");

    //Mandar a la ruta de acuerdo a su valor 

    if (value == 'informe') form.attr('action', '/generarInforme');
    if (value == 'gastos') form.attr('action', '/generarGastos');

  }
});



//Funciones
  function generarReportes(value, user) {

    if (value == 'informe' || value == 'gastos'){
      $('#div-formularios-reportes').empty();
      $('#formsReportesModal').modal('show');

      $(`<h3 class="text-primary">Obteniendo Patrones</h3>`).appendTo('#formsReportesModal');
      $('#btnCerrar').prop('disabled', true);
      $('#btnGenerar').hide();

      socket.emit('cliente:obtenerPatronesEjecutor', value, user);
    }

    if (value == 'citatorio' || value == 'mandamiento') socket.emit('cliente:capturarDatos',  value, user);
}
 


// Función para actualizar el estado del botón y obtener los registros de la tabla. 
function actualizarEstadoBoton(value, user) {
  const btnGenerarForms = $('#btnGenerarForms');
  const checkboxes = $('.select-registro');

  // Controlar la acción al presionar el botón
  btnGenerarForms.off('click'); // Eliminar cualquier controlador de clic anterior
  btnGenerarForms.on('click', function() {
    const registrosSeleccionados = checkboxes.filter(':checked').map(function() {
      return JSON.parse($(this).val());
    }).get();

    socket.emit('cliente:crearFormInforme', registrosSeleccionados, value, user);
  });

  // Controlar el evento change de los checkboxes
  checkboxes.on('change', function() {
    const registrosSeleccionados = checkboxes.filter(':checked').map(function() {
      return JSON.parse($(this).val());
    }).get();

    btnGenerarForms.prop('disabled', registrosSeleccionados.length === 0);
  });
}


  