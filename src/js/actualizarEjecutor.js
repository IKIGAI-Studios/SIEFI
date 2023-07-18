const socket = io("http://localhost:3000");

/**
 * Actualiza los campos del formulario con la información del ejecutor seleccionado.
 * @param {string} ejecutores - Una cadena JSON que contiene la información de los ejecutores.
 */
function itemSeleccionado(ejecutores) {
	ejecutores = JSON.parse(ejecutores);
	var clave = document.getElementById("clave_eje").value; // Obtener la clave seleccionada
	var ejecutor = {}; // Variable para almacenar la información del ejecutor seleccionado

	// Buscar el ejecutor con la clave seleccionada y almacenar su información en la variable 'ejecutor'
	for (var i = 0; i < ejecutores.length; i++) {
		if (ejecutores[i].clave_eje == clave) {
			ejecutor = ejecutores[i];
			break;
		}
	}
	// Actualizar los valores de los campos del formulario con la información del ejecutor seleccionado
	document.getElementById("nombre").value = ejecutor.nombre;
	document.getElementById("user").value = ejecutor.user;
	document.getElementById("type").value = ejecutor.type;
	document.getElementById("status").value = ejecutor.status;

	if (ejecutor.type == "ejecutor")
		document.getElementById("ejecutor").selected = true;
	if (ejecutor.type == "admin")
		document.getElementById("admin").selected = true;
	if (ejecutor.status == "0")
		document.getElementById("deshabilitado").checked = true;
	if (ejecutor.status == "1")
		document.getElementById("habilitado").checked = true;
}

/**
 * Actualiza el valor del campo "status" en función del estado seleccionado.
 */
function statusSeleccionado() {
	if (document.getElementById("deshabilitado").checked == true)
		document.getElementById("status").value = "0";
	if (document.getElementById("habilitado").checked == true)
		document.getElementById("status").value = "1";
}

/**
 * Actualiza el valor del campo "type" en función del tipo seleccionado.
 */
function tipoSeleccionado() {
	var tipo = document.getElementById("typeS").value; // Obtener el tipo seleccionado

	if (tipo == "admin") document.getElementById("type").value = "admin";
	else if (tipo == "ejecutor")
		document.getElementById("type").value = "ejecutor";
}

/**
 * Muestra los patrones asignados para un ejecutor seleccionado.
 */
function verPatronesAsignados() {
	const clave_eje = $("#clave_eje").val();

	$("#div-patrones-asignados").empty();
	if (clave_eje != "false") {
		socket.emit("cliente:consultarPatronesAsignados", clave_eje);

		$("#verPatronesAsignadosModal").modal("show");

		$(
			`<h3 class="text-primary">Obteniendo patrones asignados</h3>`
		).appendTo("#div-patrones-asignados");
		$('<img src="imgs/folder_azul.png" class="mt-3">').appendTo(
			"#div-patrones-asignados"
		);

		$("#btnADesasignar").prop("disabled", true);
		$("#btnACancelar").prop("disabled", true);
	} else bsAlert("Selecciona la clave de ejecutor", "warning");
}

/**
 * Muestra los patrones no asignados para un ejecutor seleccionado.
 */
function verPatronesNoAsignados() {
	const clave_eje = $("#clave_eje").val();
	const nombre = $("#nombre").val();

	$("#div-patrones-no-asignados").empty();
	if (clave_eje != "false") {
		socket.emit("cliente:consultarPatronesNoAsignados", clave_eje);
		$("#verPatronesNoAsignadosModal").modal("show");

		$(
			`<h3 class="text-primary">Obteniendo patrones no asignados</h3>`
		).appendTo("#div-patrones-no-asignados");
		$('<img src="imgs/folder_azul.png" class="mt-3">').appendTo(
			"#div-patrones-no-asignados"
		);

		$("#btnNAsignar").prop("disabled", true);
		$("#btnNCancelar").prop("disabled", true);

		$("#claveEje").val(clave_eje);
		$("#nomEje").val(nombre);
	} else bsAlert("Selecciona la clave de ejecutor", "warning");
}

/**
 * Callback que se ejecuta cuando se reciben los patrones asignados del servidor.
 * @param {Array} data - Datos de los patrones asignados.
 */
socket.on("servidor:patronesAsignados", (data) => {
	$("#div-patrones-asignados").empty();
	$("#btnADesasignar").prop("disabled", false);
	$("#btnACancelar").prop("disabled", false);

	/// Crear tabla
	const table = $('<table class="table">').attr("id", "afil-table");

	// Crear el encabezado de la tabla
	const thead = $("<thead>");
	const headerRow = $("<tr>");

	// Agregar la columna "Seleccionar"
	const selectHeader = $('<th scope="col">').text("Seleccionar");
	headerRow.append(selectHeader);

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
	const tbody = $("<tbody>");

	// Recorrer los objetos y agregar filas a la tabla
	data.forEach((obj) => {
		const dataRow = $("<tr>");

		// Obtener el valor de la columna "reg_pat" y agregar checkbox en la columna "Seleccionar"
		const selectCell = $("<td>");
		const checkbox = $('<input type="checkbox" name="patronesA">').attr(
			"value",
			obj.reg_pat
		);
		selectCell.append(checkbox);
		dataRow.append(selectCell);

		// Recorrer las propiedades de cada objeto y agregar celdas a la fila
		Object.values(obj).forEach((value) => {
			const dataCell = $("<td>").text(value);
			dataCell.appendTo(dataRow);
		});

		dataRow.appendTo(tbody);
	});
	tbody.appendTo(table);

	// Mostrar la tabla con el número de registros que tiene
	const tableContainer = $("<div>").attr("id", "tb-show-patrones-asignados");
	$(`<b >Se encontraron ${data.length} patrones<b>`).appendTo(tableContainer);
	table.appendTo(tableContainer);
	tableContainer.appendTo("#div-patrones-asignados");
});

/**
 * Callback que se ejecuta cuando se reciben los patrones no asignados del servidor.
 * @param {Array} data - Datos de los patrones no asignados.
 */
socket.on("servidor:patronesNoAsignados", (data) => {
	$("#div-patrones-no-asignados").empty();
	$("#btnNAsignar").prop("disabled", false);
	$("#btnNCancelar").prop("disabled", false);

	// Crear tabla
	const table = $('<table class="table">').attr("id", "afil-table");

	// Crear el encabezado de la tabla
	const thead = $("<thead>");
	const headerRow = $("<tr>");

	// Agregar la columna "Seleccionar"
	const selectHeader = $('<th scope="col">').text("Seleccionar");
	headerRow.append(selectHeader);

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
	const tbody = $("<tbody>");

	// Recorrer los objetos y agregar filas a la tabla
	data.forEach((obj) => {
		const dataRow = $("<tr>");

		// Obtener el valor de la propiedad "reg_pat" y agregar checkbox en la columna "Seleccionar"
		const selectCell = $("<td>");
		const checkbox = $('<input type="checkbox" name="patronesNA">').attr(
			"value",
			obj.reg_pat
		);
		selectCell.append(checkbox);
		dataRow.append(selectCell);

		// Recorrer las propiedades de cada objeto y agregar celdas a la fila
		Object.values(obj).forEach((value) => {
			const dataCell = $("<td>").text(value);
			dataCell.appendTo(dataRow);
		});

		dataRow.appendTo(tbody);
	});
	tbody.appendTo(table);

	// Mostrar la tabla con el número de registros que tiene
	const tableContainer = $("<div>").attr(
		"id",
		"tb-show-patrones-no-asignados"
	);
	$(`<b >Se encontraron ${data.length} patrones no asignados<b>`).appendTo(
		tableContainer
	);
	table.appendTo(tableContainer);
	tableContainer.appendTo("#div-patrones-no-asignados");
});
