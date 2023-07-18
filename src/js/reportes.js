const socket = io("http://localhost:3000");

// Events

$("#btnCerrar").on("click", function () {
	location.href = "/reportes";
});

// Sockets

//Socket para pedir la información inicial al usuario.
/**
 * Evento del socket para capturar los datos iniciales del usuario.
 * @param {Object} data - Datos del usuario.
 * @param {Array} registros - Registros patronales.
 * @param {string} value - Valor del usuario.
 * @param {string} clave_eje - Clave del ejecutor.
 */
socket.on("servidor:capturarDatos", (data, registros, value, clave_eje) => {
	/**
	 * Vacía el contenido del contenedor de ingreso de registro patronal.
	 */
	$("#div-ingresar-registro-patronal").empty();

	/**
	 * Muestra el modal para generar reportes de registro patronal.
	 */
	$("#generarReportesRPModal").modal("show");

	/**
	 * Deshabilita el botón de cerrar.
	 */
	$("#btnCerrar").prop("disabled", true);

	/**
	 * Crea un elemento select para los registros patronales.
	 * @type {JQuery<HTMLElement>}
	 */
	const selectR = $(
		'<select id="registroSelect" class="form-control form-control-sm w-50">'
	);

	/**
	 * Crea un elemento select para las fechas.
	 * @type {JQuery<HTMLElement>}
	 */
	const select = $(
		'<select id="fechaSelect" class="form-control form-control-sm w-50">'
	);

	/**
	 * Crea un elemento de enlace para aceptar la selección.
	 * @type {JQuery<HTMLElement>}
	 */
	const link = $(
		'<a href="#" class="btn btn-primary disabled ml-3">Aceptar</a>'
	);

	/**
	 * Obtiene las fechas distintas del campo createdAt en el objeto data.
	 * @type {Array<string>}
	 */
	const fechasDistintas = Array.from(new Set(data.map((item) => item)));

	/**
	 * Obtiene los registros patronales diferentes y no cobrados en el objeto registros.
	 * @type {Array<string>}
	 */
	const registrosDistintos = Array.from(
		new Set(registros.map((item) => item))
	).sort();

	/**
	 * Agrega el elemento de selección por defecto para registros patronales.
	 */
	const defaultOption = $("<option>")
		.text("Seleccionar registro patronal")
		.val("0")
		.prop("selected", true);
	selectR.append(defaultOption);

	/**
	 * Agrega el elemento de selección por defecto para fechas.
	 */
	const defaultOption2 = $("<option>")
		.text("Seleccionar fecha")
		.val("0")
		.prop("selected", true);
	select.append(defaultOption2);

	/**
	 * Agrega las opciones al select de fechas con los valores distintos.
	 */
	fechasDistintas.forEach((fecha) => {
		const option = $("<option>").text(fecha).val(fecha);
		select.append(option);
	});

	/**
	 * Agrega las opciones al select de registros patronales con los valores distintos.
	 */
	registrosDistintos.forEach((registro) => {
		const option = $("<option>").text(registro).val(registro);
		selectR.append(option);
	});

	/**
	 * Agrega el select de registros patronales, el select de fechas y el enlace al contenedor de ingreso de registro patronal.
	 */
	$("#div-ingresar-registro-patronal").append(selectR);
	$("#div-ingresar-registro-patronal").append(select);
	$("#div-ingresar-registro-patronal").append(link);

	/**
	 * Maneja el evento de cambio en el select de registros patronales.
	 */
	selectR.on("change", function () {
		if ($(this).val() !== "0") {
			link.removeClass("disabled");
		} else {
			link.addClass("disabled");
		}
	});

	/**
	 * Maneja el evento de clic en el enlace.
	 */
	link.on("click", function (event) {
		event.preventDefault();
		const opcionSeleccionada = $("#fechaSelect").val();

		if (opcionSeleccionada !== "0") {
			const patron = $("#registroSelect").val();
			const fecha = $("#fechaSelect").val();
			$("#div-ingresar-registro-patronal").text("Cargando...");
			socket.emit(
				"cliente:obtenerPatrones",
				patron,
				fecha,
				value,
				clave_eje
			);
		} else {
			bsAlert("Selecciona una fecha", "warning");
		}
	});
});

/**
 * Evento del socket para obtener y crear una tabla de patrones.
 * @param {Object[]} data - Datos de los patrones.
 * @param {string} value - Valor recibido.
 * @param {string} user - Usuario.
 */
socket.on("servidor:obtenerPatrones", (data, value, user) => {
	/**
	 * Vacía el contenido del contenedor de generación de reportes.
	 */
	$("#div-generar-reportes").empty();

	/**
	 * Vacía el contenido del contenedor de formularios de reportes.
	 */
	$("#div-formularios-reportes").empty();

	/**
	 * Oculta el modal para generar reportes de registro patronal.
	 */
	$("#generarReportesRPModal").modal("hide");

	/**
	 * Habilita el botón de cerrar.
	 */
	$("#btnCerrar").prop("disabled", false);

	/**
	 * Deshabilita el botón de generar formularios.
	 */
	$("#btnGenerarForms").prop("disabled", true);

	/**
	 * Deshabilita el botón de generar según el valor recibido.
	 */
	if (value == "mandamiento" || value == "citatorio")
		$("#btnGenerar").prop("disabled", true);
	else $("#btnGenerar").prop("disabled", false);

	/**
	 * Muestra el modal correspondiente según el valor recibido.
	 */
	if (value == "citatorio" || value == "mandamiento") {
		$("#generarReportesModal").modal("show");
		$("#formsReportesModal").modal("hide");
	}
	if (value == "informe" || value == "gastos") {
		$("#formsReportesModal").modal("show");
		$("#generarReportesModal").modal("hide");
	}

	/**
	 * Comprueba si la variable data está vacía.
	 */
	if (data.length === 0) {
		/**
		 * Crea un mensaje indicando que no se encontraron registros.
		 */
		const noRecordsMessage = $("<p>")
			.text("No se encontraron registros.")
			.css({
				color: "red",
				"font-size": "24px",
			});
		$("#div-generar-reportes").append(noRecordsMessage);
		$("#div-formularios-reportes").append(noRecordsMessage);
		return;
	} else {
		/**
		 * Crea una tabla.
		 */
		const table = $("<table>")
			.addClass("table")
			.attr("id", "reportes-table");

		/**
		 * Crea el encabezado de la tabla.
		 */
		const thead = $("<thead>");
		const headerRow = $("<tr>");

		/**
		 * Obtiene los nombres de las propiedades del primer objeto.
		 */
		const headers = Object.keys(data[0]);

		/**
		 * Agrega encabezados a la tabla.
		 */
		headers.forEach((header) => {
			const headerCell = $("<th>").attr("scope", "col").text(header);
			headerCell.appendTo(headerRow);
		});

		/**
		 * Agrega una columna adicional para seleccionar los registros.
		 */
		const checkboxHeader = $("<th>")
			.attr("scope", "col")
			.text("Seleccionar");
		checkboxHeader.prependTo(headerRow);

		headerRow.appendTo(thead);
		thead.appendTo(table);

		/**
		 * Crea el cuerpo de la tabla.
		 */
		const tbody = $("<tbody>");

		/**
		 * Recorre los objetos y agrega filas a la tabla.
		 */
		data.forEach((obj) => {
			const dataRow = $("<tr>");

			/**
			 * Cambia los colores de los registros dependiendo del tipo de documento.
			 */
			if (value == "informe" || value == "gastos") {
				/**
				 * Switch para cambiar el color dependiendo del estado de cobro del registro.
				 */
				switch (obj.cobrado) {
					case "Cobrado":
						dataRow.addClass("table-primary");
						break;
					case "No cobrado":
						dataRow.addClass("table-success");
						break;
					default:
						break;
				}
			} else {
				/**
				 * Switch para cambiar el color de los registros dependiendo de la tabla donde fueron seleccionados.
				 */
				switch (obj.type) {
					case "cop":
						dataRow.addClass("table-primary");
						break;
					case "rcv":
						dataRow.addClass("table-success");
						break;
					default:
						break;
				}
			}

			/**
			 * Recorre las propiedades de cada objeto y agrega celdas a la fila.
			 */
			Object.values(obj).forEach((value) => {
				const dataCell = $("<td>").text(value);
				dataCell.appendTo(dataRow);
			});

			/**
			 * Agrega una columna adicional para seleccionar los registros.
			 */
			const checkboxCell = $("<td>");
			const checkbox = $(
				'<input type="checkbox" id="selectPatrones" class="select-registro" name="opcion">'
			).attr("value", JSON.stringify(obj));
			checkbox.appendTo(checkboxCell);
			checkboxCell.prependTo(dataRow);
			$("#btnGenerarForms").show();

			/**
			 * Verifica si la incidencia es 31 y, si lo es, selecciona el registro por defecto.
			 */
			if (value == "mandamiento" || value == "citatorio") {
				if (obj.inc === 31) {
					checkbox.prop("checked", true);
				}
			}

			dataRow.appendTo(tbody);
		});

		tbody.appendTo(table);

		/**
		 * Muestra la tabla con el número de registros encontrados, dependiendo del modal.
		 */
		const tableContainer = $("<div>").attr("id", "tb-show-reportes");
		$("<b>")
			.text(`Se encontraron ${data.length} patrones`)
			.appendTo(tableContainer);
		table.appendTo(tableContainer);
		if (value === "citatorio" || value === "mandamiento")
			tableContainer.appendTo("#div-generar-reportes");
		if (value === "informe" || value === "gastos")
			tableContainer.appendTo("#div-formularios-reportes");

		/**
		 * Habilita o deshabilita el botón según las selecciones.
		 */
		const select = $("#selectPatrones");
		select.on("change", function () {
			actualizarEstadoBoton(value, user);
		});

		/**
		 * Establece el estado inicial del botón.
		 */
		actualizarEstadoBoton(value, user);

		/**
		 * Asigna las rutas correspondientes al formulario.
		 */
		const form = $("#reportesForm");

		if (value == "mandamiento") form.attr("action", "/generarMandamiento");
		if (value == "citatorio") form.attr("action", "/generarCitatorio");
	}
});

//Socket para crear el formulario del informe y de gastos de ejecutor.

/**
 * Evento del socket para crear el formulario del informe y de gastos de ejecutor.
 * @param {Object[]} data - Datos de los patrones.
 * @param {string} value - Valor recibido.
 * @param {string} user - Usuario.
 * @param {string} registro - Registro.
 */
socket.on("servidor:crearFormInforme", (data, value, user, registro) => {
	/**
	 * Vacía el contenido del contenedor de generación de reportes.
	 */
	$("#div-generar-reportes").empty();

	/**
	 * Oculta el modal de formularios de reportes.
	 */
	$("#formsReportesModal").modal("hide");

	/**
	 * Muestra el modal correspondiente para generar reportes.
	 */
	$("#generarReportesModal").modal("show");

	/**
	 * Comprueba si la variable data está vacía.
	 */
	if (data.length === 0) {
		/**
		 * Crea un mensaje indicando que no se encontraron registros.
		 */
		const noRecordsMessage = $("<p>")
			.text("No se encontraron registros.")
			.css({
				color: "red",
				"font-size": "24px",
			});
		$("#div-generar-reportes").append(noRecordsMessage);
		$("#div-formularios-reportes").append(noRecordsMessage);
		return;
	} else {
		/**
		 * Crea una tabla.
		 */
		const table = $("<table>")
			.addClass("table")
			.attr("id", "reportes-table");

		/**
		 * Crea el encabezado de la tabla.
		 */
		const thead = $("<thead>");
		const headerRow = $("<tr>");

		/**
		 * Obtiene los nombres de las propiedades del primer objeto.
		 */
		const headers = Object.keys(data[0]);

		/**
		 * Agrega encabezados a la tabla.
		 */
		headers.forEach((header) => {
			const headerCell = $("<th>").attr("scope", "col").text(header);
			headerCell.appendTo(headerRow);
		});

		/**
		 * Agrega encabezados adicionales para las nuevas columnas cuando sea informe.
		 */
		if (value == "informe") {
			const folioSuaHeader = $("<th>")
				.attr("scope", "col")
				.text("Folio SUA");
			const resultadosHeader = $("<th>")
				.attr("scope", "col")
				.text("Resultados de la diligencia");
			folioSuaHeader.appendTo(headerRow);
			resultadosHeader.appendTo(headerRow);
		}

		/**
		 * Agrega encabezados adicionales para las nuevas columnas cuando sean gastos.
		 */
		if (value == "gastos") {
			const provioHeader = $("<th>")
				.attr("scope", "col")
				.text("Rev. Prov./ O.I.");
			const fechaPagoHeader = $("<th>")
				.attr("scope", "col")
				.text("Fecha de pago");
			const cobradoHeader = $("<th>")
				.attr("scope", "col")
				.text("Cobrado");
			const gastosEjecutor = $("<th>").attr("scope", "col").text("G.E");
			provioHeader.appendTo(headerRow);
			fechaPagoHeader.appendTo(headerRow);
			cobradoHeader.appendTo(headerRow);
			gastosEjecutor.appendTo(headerRow);
		}

		headerRow.appendTo(thead);
		thead.appendTo(table);

		/**
		 * Crea el cuerpo de la tabla.
		 */
		const tbody = $("<tbody>");

		/**
		 * Recorre los objetos y agrega filas a la tabla.
		 */
		data.forEach((obj) => {
			const dataRow = $("<tr>");

			/**
			 * Recorre las propiedades de cada objeto y agrega celdas a la fila.
			 */
			Object.entries(obj).forEach(([key, value]) => {
				const dataCell = $("<td>");
				const input = $("<input>")
					.attr({
						type: "text",
						value: value,
						readonly: "readonly",
						name: key,
					})
					.addClass("form-control");
				input.appendTo(dataCell);
				dataCell.appendTo(dataRow);
			});

			/**
			 * Agrega celdas adicionales con inputs de tipo texto si es informe.
			 */
			if (value == "informe") {
				const folioSuaInput = $("<input>")
					.attr({
						type: "text",
						name: "folioSua",
						value: "",
					})
					.addClass("form-control");
				const resultadosInput = $("<input>")
					.attr({
						type: "text",
						name: "resultadosDiligencia",
						value: "",
					})
					.addClass("form-control");

				const inputCell1 = $("<td>").append(folioSuaInput);
				const inputCell2 = $("<td>").append(resultadosInput);
				inputCell1.appendTo(dataRow);
				inputCell2.appendTo(dataRow);

				dataRow.appendTo(tbody);
			}

			/**
			 * Agrega campos rellenables en caso de que el valor sea gastos.
			 */
			if (value == "gastos") {
				const provioInput = $("<input>")
					.attr({
						type: "number",
						name: "provio",
						value: "",
						min: 0,
					})
					.addClass("form-control");

				const fechaPagoInput = $("<input>")
					.attr({
						type: "date",
						name: "fechaPago",
						value: "",
					})
					.addClass("form-control");

				const cobradoInput = $("<input>")
					.attr({
						type: "number",
						name: "cobrado",
						id: "cobrado",
						value: "",
						min: 0,
					})
					.addClass("form-control");

				const gastosInput = $("<input>")
					.attr({
						type: "number",
						name: "gastos",
						id: "gastos",
						value: "",
						min: 0,
					})
					.addClass("form-control");

				const inputCell1 = $("<td>").append(provioInput);
				const inputCell2 = $("<td>").append(fechaPagoInput);
				const inputCell3 = $("<td>").append(cobradoInput);
				const inputCell4 = $("<td>").append(gastosInput);
				inputCell1.appendTo(dataRow);
				inputCell2.appendTo(dataRow);
				inputCell3.appendTo(dataRow);
				inputCell4.appendTo(dataRow);

				dataRow.appendTo(tbody);
			}
		});

		tbody.appendTo(table);

		/**
		 * Muestra la tabla en el contenedor correspondiente.
		 */
		const tableContainer = $("<div>").attr("id", "tb-show-reportes");
		table.appendTo(tableContainer);
		tableContainer.appendTo("#div-generar-reportes");

		/**
		 * Asigna las rutas correspondientes al formulario.
		 */
		const form = $("#reportesForm");

		if (value == "informe") form.attr("action", "/generarInforme");
		if (value == "gastos") form.attr("action", "/generarGastos");
	}
});

/**
 * Genera los reportes según el valor y el usuario especificados.
 * @param {string} value - Valor que determina el tipo de reporte a generar.
 * @param {string} user - Usuario para generar los reportes.
 */
function generarReportes(value, user) {
	/**
	 * Comprueba si el valor es "informe" o "gastos".
	 */
	if (value == "informe" || value == "gastos") {
		/**
		 * Vacía el contenido del contenedor de formularios de reportes.
		 */
		$("#div-formularios-reportes").empty();

		/**
		 * Muestra el modal de formularios de reportes.
		 */
		$("#formsReportesModal").modal("show");

		/**
		 * Agrega un título al modal de formularios de reportes.
		 */
		$(`<h3 class="text-primary">Obteniendo Patrones</h3>`).appendTo(
			"#formsReportesModal"
		);

		/**
		 * Deshabilita el botón de cierre del modal.
		 */
		$("#btnCerrar").prop("disabled", true);

		/**
		 * Emite un evento para obtener los patrones del ejecutor.
		 */
		socket.emit("cliente:obtenerPatronesEjecutor", value, user);
	}

	/**
	 * Comprueba si el valor es "citatorio" o "mandamiento".
	 */
	if (value == "citatorio" || value == "mandamiento") {
		/**
		 * Emite un evento para capturar los datos correspondientes.
		 */
		socket.emit("cliente:capturarDatos", value, user);
	}
}

/**
 * Actualiza el estado del botón y obtiene los registros de la tabla.
 * @param {string} value - Valor que determina el tipo de reporte.
 * @param {string} user - Usuario para generar los reportes.
 */
function actualizarEstadoBoton(value, user) {
	let btnGenerarForms;

	/**
	 * Comprueba si el valor es "informe" o "gastos" para asignar el botón correspondiente.
	 */
	if (value == "informe" || value == "gastos")
		btnGenerarForms = $("#btnGenerarForms");
	else btnGenerarForms = $("#btnGenerar");

	const checkboxes = $(".select-registro");

	/**
	 * Controla la acción al presionar el botón.
	 */
	btnGenerarForms.off("click"); // Eliminar cualquier controlador de clic anterior
	btnGenerarForms.on("click", function () {
		/**
		 * Obtiene los registros seleccionados.
		 */
		const registrosSeleccionados = checkboxes
			.filter(":checked")
			.map(function () {
				return JSON.parse($(this).val());
			})
			.get();

		/**
		 * Emite un evento para crear el formulario correspondiente con los registros seleccionados.
		 */
		socket.emit(
			"cliente:crearFormInforme",
			registrosSeleccionados,
			value,
			user
		);
	});

	/**
	 * Controla el evento change de los checkboxes.
	 */
	checkboxes.on("change", function () {
		/**
		 * Obtiene los registros seleccionados.
		 */
		const registrosSeleccionados = checkboxes
			.filter(":checked")
			.map(function () {
				return JSON.parse($(this).val());
			})
			.get();

		/**
		 * Habilita o deshabilita el botón según la cantidad de registros seleccionados.
		 */
		btnGenerarForms.prop("disabled", registrosSeleccionados.length === 0);
	});

	/**
	 * Establece el estado inicial del botón según las selecciones.
	 */
	const registrosSeleccionadosInicial = checkboxes
		.filter(":checked")
		.map(function () {
			return JSON.parse($(this).val());
		})
		.get();

	btnGenerarForms.prop(
		"disabled",
		registrosSeleccionadosInicial.length === 0
	);
}
