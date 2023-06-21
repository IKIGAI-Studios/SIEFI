const socket = io('http://localhost:3000');

// Sockets

//Socket para pedir la información inicial al usuario. 
socket.on('servidor:capturarDatos', (data, value, clave_eje) => {
  
  $('#div-ingresar-registro-patronal').empty();
  $('#generarReportesRPModal').modal('show');
  $('#btnCerrar').prop('disabled', true);
  

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

  // Deshabilitar el botón sólo si es mandamiento o citatorio de otra forma habilitarlo
  if (value == 'mandamiento' || value == 'citatorio') $('#btnGenerar').prop('disabled', true);
  else $('#btnGenerar').prop('disabled', false);

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

    // Agregar columna adicional para seleccionar los registros.
      const checkboxHeader = $('<th>').attr('scope', 'col').text('Seleccionar');
      checkboxHeader.prependTo(headerRow);
    

    headerRow.appendTo(thead);
    thead.appendTo(table);

    // Crear el cuerpo de la tabla
    const tbody = $('<tbody>');

    // Recorrer los objetos y agregar filas a la tabla
    data.forEach((obj) => {
      const dataRow = $('<tr>');


    // Cambiar los colores de los registros, dependiendo del documento.  
    if (value == 'informe' || value == 'gastos' ){

      //Switch para cambiar el color dependiendo del status del registro
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
    } else {

      // Switch para cambiar el color de los registros dependiendo de la tabla donde fueron seleccionados.
      switch (obj.type) {
        case 'cop':
          dataRow.addClass('table-primary');
          break;
        case 'rcv':
          dataRow.addClass('table-success');
          break;
          default:
          break;
      }

    }

      // Recorrer las propiedades de cada objeto y agregar celdas a la fila
      Object.values(obj).forEach((value) => {
        const dataCell = $('<td>').text(value);
        dataCell.appendTo(dataRow);
      });

      // Agregar columna adicional para seleccionar los registros. 
      const checkboxCell = $('<td>');
      const checkbox = $('<input type="checkbox" id="selectPatrones" class="select-registro" name="opcion">').attr('value', JSON.stringify(obj));
      checkbox.appendTo(checkboxCell);
      checkboxCell.prependTo(dataRow);
      $('#btnGenerarForms').show();
        

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

  //Mandar a diferentes rutas 
  const form = $("#reportesForm");

  //Mandar a la ruta de acuerdo a su valor 
  if (value == 'mandamiento') form.attr('action', '/generarMandamiento');
  if (value == 'citatorio') form.attr('action', '/generarCitatorio');
    
  }
});


//Socket para crear el formulario del informe y de gastos de ejecutor. 

socket.on('servidor:crearFormInforme', (data, value, user, registro) => {

  $('#div-generar-reportes').empty();
  $('#formsReportesModal').modal('hide');

  $('#generarReportesModal').modal('show');

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
      const provioHeader = $('<th>').attr('scope', 'col').text('Prov/o .I.');
      const fechaPagoHeader = $('<th>').attr('scope', 'col').text('Fecha de pago');
      const cobradoHeader = $('<th>').attr('scope', 'col').text('Cobrado');
      const gastosEjecutor = $('<th>').attr('scope', 'col').text('G.E');
      provioHeader.appendTo(headerRow);
      fechaPagoHeader.appendTo(headerRow);
      cobradoHeader.appendTo(headerRow);
      gastosEjecutor.appendTo(headerRow);
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
      
      //Crear los campos rellenables en caso de que el valor sea gastos. 
      if (value == 'gastos'){

        const provioInput = $('<input>').attr({
          type: 'number',
          name: 'provio',
          value: ''
        }).addClass('form-control');

        const fechaPagoInput = $('<input>').attr({
          type: 'date',
          name: 'fechaPago',
          value: ''
        }).addClass('form-control');

        const cobradoInput = $('<input>').attr({
          type: 'number',
          name: 'cobrado',
          id: 'cobrado',
          value: ''
        }).addClass('form-control');

        const gastosInput = $('<input>').attr({
          type: 'number',
          name: 'gastos',
          id: 'gastos',
          value: ''
        }).addClass('form-control');
     
        

        const inputCell1 = $('<td>').append(provioInput);
        const inputCell2 = $('<td>').append(fechaPagoInput);
        const inputCell3 = $('<td>').append(cobradoInput);
        const inputCell4 = $('<td>').append(gastosInput);
        inputCell1.appendTo(dataRow);
        inputCell2.appendTo(dataRow);
        inputCell3.appendTo(dataRow);
        inputCell4.appendTo(dataRow);

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

      socket.emit('cliente:obtenerPatronesEjecutor', value, user);
    }

    if (value == 'citatorio' || value == 'mandamiento') socket.emit('cliente:capturarDatos',  value, user);
}
 


// Función para actualizar el estado del botón y obtener los registros de la tabla. 
function actualizarEstadoBoton(value, user) {
  var btnGenerarForms;

  if(value == 'informe' || value == 'gastos') btnGenerarForms = $('#btnGenerarForms');
  else btnGenerarForms = $('#btnGenerar');
  
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


  