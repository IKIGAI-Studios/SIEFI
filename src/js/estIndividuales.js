// @ts-nocheck
// Importar los sockets
const socket = io("http://localhost:3000");

// Variables globales
let dataStats,
	inc,
	res,
	con,
	fecha,
	dates = {},
	cop_rcv = {},
	cuotas = {},
	rcv = {},
	coinData = {},
	oports = {},
	imp = {},
	confronta = {},
	regFal = { rales: [] };
regExis = { rales: [] };

/**
 * Funciones al cargar la página.
 */
window.onload = function () {
	$("#spinner").hide();
	$("#div-tabla-estadisticas-individuales").hide();
	socket.emit("cliente:consultarRegistrosRaleCOP");
	socket.emit("cliente:consultarRegistrosRaleRCV");
	socket.emit("cliente:consultarRegistrosCoin");
};

/**
 * Socket para las estadísticas individuales.
 * @param {{ data: any }} data - Datos recibidos del servidor.
 */
socket.on("servidor:estIndividuales", ({ data }) => {
	dataStats = data;
	// Llenar filtro de Rales
	fillFilters();
	// Mostrar la tabla con la información que sea tipo inicio
	showTable("inicio");
	// Llenar estadisticas individuales
	fillStats();
	// Habilitar los campos secundaroios para la confronta
	$("#dateCOPscnd").prop("disabled", false);
	$("#dateRCVscnd").prop("disabled", false);
	$("#dateCOINscnd").prop("disabled", false);
});

/**
 * Socket para la confronta.
 * @param {{ data: any }} data - Datos recibidos del servidor.
 */
socket.on("servidor:estIndividualesConfronta", ({ data }) => {
	confronta = data;
	var encontrado = false;
	// Recorrer el objeto rales
	for (var i = 0; i < dataStats.rales.length; i++) {
		encontrado = false;
		var reg_pat = dataStats.rales[i].reg_pat;
		var nom_cred = dataStats.rales[i].nom_cred;

		// Verifica si el registro existe en el nuevo objeto 'rales'
		for (var j = 0; j < data.rales.length; j++) {
			if (
				data.rales[j].reg_pat === reg_pat &&
				data.rales[j].nom_cred === nom_cred
			) {
				regExis.rales.push(dataStats.rales[i]);
				encontrado = true;
				break;
			}
		}

		// Agrega el registro al arreglo correspondiente
		if (!encontrado) regFal.rales.push(dataStats.rales[i]);
	}

	// Cuotas asignadas
	cuotas.asig = data.rales.filter(
		(obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
	).length;
	// Cuotas pendientes
	cuotas.pen = data.rales.filter(
		(obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
	).length;
	// Coin diligenciado
	cuotas.coin_dilig += dataStats.coin
		.map((coin) =>
			regFal.rales.filter(
				(rale) =>
					(rale.inc == 2 || rale.inc == 31) &&
					rale.type == "cuotas" &&
					rale.reg_pat == coin.reg_pat &&
					rale.nom_cred == coin.num_credito
			)
		)
		.filter((objetos) => objetos.length > 0).length;
	// Cuotas diligenciado
	cuotas.dil = regFal.rales.filter(
		(obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
	).length;

	// Insertar los datos
	$("#CUOTAS_asignado").text(cuotas.asig);
	$("#CUOTAS_pendiente").text(cuotas.pen);
	$("#CUOTAS_coin_dilig").text(cuotas.coin_dilig);
	$("#CUOTAS_diligenciado").text(cuotas.dil);

	// Rcv asignado
	rcv.asignado = data.rales.filter(
		(obj) => obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31)
	).length;
	// Rcv pendiente
	rcv.pendiente = data.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			!obj.cobrado
	).length;
	// Coin diligenciado
	rcv.coin_dilig += dataStats.coin
		.map((coin) =>
			regFal.rales.filter(
				(rale) =>
					(rale.inc == 2 || rale.inc == 31) &&
					rale.type == "rcv" &&
					rale.reg_pat == coin.reg_pat &&
					rale.nom_cred == coin.num_credito
			)
		)
		.filter((objetos) => objetos.length > 0).length;
	// RCV diligenciado
	rcv.dil = regFal.rales.filter(
		(obj) => obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31)
	).length;

	// Insertar los datos
	$("#RCV_asignado").text(rcv.asignado);
	$("#RCV_pendiente").text(rcv.pendiente);
	$("#RCV_coin_dilig").text(rcv.coin_dilig);
	$("#RCV_diligenciado").text(rcv.dil);

	// Cop y Rcv entregados
	cop_rcv.entregados = cuotas.asig + rcv.asignado;
	// Cop y Rcv diligenciados
	cop_rcv.req_pago = cuotas.dil + rcv.dil;
	// Cop y Rcv no localizados
	cop_rcv.no_local = cuotas.inc_09 + rcv.inc_09;
	// Cop y Rcv embargos
	cop_rcv.embargo = cuotas.embargo + rcv.embargo;
	// Cop y Rcv citatorios
	cop_rcv.citatorios = cuotas.citatorios + rcv.citatorio;
	// Cop y Rcv notificaciones
	cop_rcv.notif = data.rales.filter(
		(obj) =>
			(obj.type === "rcv" || obj.type === "cop") &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.res_dil == "NOTIFICACIÓN"
	).length;
	// Insertar los datos
	$("#COP_RCV_entregados").text(cop_rcv.entregados);
	$("#COP_RCV_req_pago").text(cop_rcv.req_pago);
	$("#COP_RCV_no_local").text(cop_rcv.no_local);
	$("#COP_RCV_embargo").text(cop_rcv.embargo);
	$("#COP_RCV_citatorios").text(cop_rcv.citatorios);
	$("#COP_RCV_notif").text(cop_rcv.notif);

	// Obtener la fecha del primer input
	fecha = new Date($("#dateCOPfrst").val());
	// Patrones diligenciados
	dates.pat_dilig =
		cuotas.dil +
		cuotas.inc_09 +
		cuotas.embargo +
		rcv.dil +
		rcv.inc_09 +
		rcv.embargo;
	// Productividad
	dates.productividad = ((dates.pat_dilig / dates.dilig) * 100).toFixed(2);
	// Avance de coin
	dates.ava_coin = ((cuotas.coin_dilig / cuotas.coin) * 100).toFixed(2);
	// Oportunidad 2
	oports.dos = data.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 2"
	).length;
	// Oportunidad 31
	oports.tres_uno = data.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 31"
	).length;
	// Oportunidad Fuera de Tiempo
	oports.fuera = data.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) &&
			obj.oportunidad == "Fuera de tiempo"
	).length;
	// Oportunidad por documentos
	dates.opor_docs = (
		((oports.dos + oports.tres_uno) /
			(oports.dos + oports.tres_uno + oports.fuera)) *
		100
	).toFixed(2);
	// Importe 2
	imp.dos = data.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 2"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);
	// Importe 31
	imp.tres_uno = data.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 31"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);
	// Importe Fuera de Tiempo
	imp.fuera = data.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "Fuera de tiempo"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);
	// Oportunidad por importe
	dates.opor_imp = (
		((imp.dos + imp.tres_uno) / (imp.dos + imp.tres_uno + imp.fuera)) *
		100
	).toFixed(2);
	// Oportunidad promediada
	dates.oport = (parseInt(dates.opor_docs) + parseInt(dates.opor_imp)) / 2;
	// Insertar los datos
	$("#DATES_fec_ini").text(dates.fec_ini);
	$("#DATES_fec_fin").text(dates.fec_fin);
	$("#DATES_laborales").text(dates.laborales);
	$("#DATES_dilig").text(dates.dilig);
	$("#DATES_pat_dilig").text(dates.pat_dilig);
	$("#DATES_product").text(dates.productividad + "%");
	$("#DATES_ava_coin").text(dates.ava_coin + "%");
	$("#DATES_opor_docs").text(dates.opor_docs + "%");
	$("#DATES_opor_imp").text(dates.opor_imp + "%");
	$("#DATES_opor").text(dates.oport + "%");

	// Mostrar los gráfico
	showGraphics("canvas-coin-31", dates.ava_coin, "coin");
	showGraphics("canvas-prod-ind", dates.productividad, "prod");
	// Mostrar la tabla
	showTable("confronta");
});

/**
 * Socket para consultar las fechas de los registros de Rale COP.
 * @param {any} data - Datos recibidos del servidor.
 */
socket.on("servidor:consultarRegistrosRaleCOP", (data) => {
	$("#dateCOPfrst").empty();
	$("#dateCOPscnd").empty();
	$("#dateCOPfrst").append(
		$("<option>", {
			text: "Selecciona una fecha para Rale COP",
			value: false,
		})
	);
	$("#dateCOPscnd").append(
		$("<option>", {
			text: "Selecciona una fecha para Rale COP",
			value: false,
		})
	);
	data.map((date) => {
		// No se asigna el option a variables porque solo puede hacer
		// append a un solo elemento y si se hace a un segundo se elimina del primero
		$("#dateCOPfrst").append(
			$("<option>", {
				value: date,
				text: date,
			})
		);
		$("#dateCOPscnd").append(
			$("<option>", {
				value: date,
				text: date,
			})
		);
	});
	$("#dateCOPfrst").prop("disabled", false);
});

/**
 * Socket para consultar las fechas de los registros de Rale RCV.
 * @param {any} data - Datos recibidos del servidor.
 */
socket.on("servidor:consultarRegistrosRaleRCV", (data) => {
	$("#dateRCVfrst").empty();
	$("#dateRCVscnd").empty();
	$("#dateRCVfrst").append(
		$("<option>", {
			text: "Selecciona una fecha para Rale RCV",
			value: false,
		})
	);
	$("#dateRCVscnd").append(
		$("<option>", {
			text: "Selecciona una fecha para Rale RCV",
			value: false,
		})
	);
	data.map((date) => {
		$("#dateRCVfrst").append(
			$("<option>", {
				value: date,
				text: date,
			})
		);
		$("#dateRCVscnd").append(
			$("<option>", {
				value: date,
				text: date,
			})
		);
	});
	$("#dateRCVfrst").prop("disabled", false);
});

/**
 * Socket para consultar las fechas de los registros de COIN.
 * @param {any} data - Datos recibidos del servidor.
 */
socket.on("servidor:consultarRegistrosCoin", (data) => {
	$("#dateCOINscnd").empty();
	$("#dateCOINfrst").empty();
	$("#dateCOINscnd").append(
		$("<option>", {
			text: "Selecciona una fecha para COIN",
			value: false,
		})
	);
	$("#dateCOINfrst").append(
		$("<option>", {
			text: "Selecciona una fecha para COIN",
			value: false,
		})
	);
	data.map((date) => {
		$("#dateCOINscnd").append(
			$("<option>", {
				value: date,
				text: date,
			})
		);
		$("#dateCOINfrst").append(
			$("<option>", {
				value: date,
				text: date,
			})
		);
	});
	$("#dateCOINfrst").prop("disabled", false);
});

/**
 * Evento que se ejecuta cuando se selecciona un ejecutor.
 */
$("#nombreEjecutor").on("change", function () {
	// Deshabilitar los filtros
	$("#btn_fil_inc").prop("disabled", true);
	$("#btn_fil_res").prop("disabled", true);
	$("#btn_fil_con").prop("disabled", true);

	// Vaciar las estadisticas individuales
	$("#div-tabla-estadisticas-individuales").empty();

	// Validar que el nombre de ejecutor no sea falso
	if ($("#nombreEjecutor").val() != "false") {
		// Mostrar spinner y ocultar tabla
		$("#spinner").show();
		$("#div-tabla-estadisticas-individuales").hide();
		// Petición al servidor para obtener las estadisticas individuales con el ejecutor y las fechas seleccionadas
		socket.emit("cliente:ejecutorSeleccionadoEstInd", {
			ejecutor: $("#nombreEjecutor").val(),
			copDate: $("#dateCOPfrst").val(),
			rcvDate: $("#dateRCVfrst").val(),
			coinDate: $("#dateCOINfrst").val(),
		});
	} else bsAlert("Selecciona la clave de ejecutor", "warning");
});

/**
 * Evento que se ejecuta cuando se selecciona una fecha para Rale COP.
 */
$("#div-frst-selects").on("change", "#dateCOPfrst", function () {
	// Deshabilitar los filtros
	$("#btn_fil_inc").prop("disabled", true);
	$("#btn_fil_res").prop("disabled", true);
	$("#btn_fil_con").prop("disabled", true);

	// Habilitar todas las opciones del segundo input
	$("#dateCOPscnd option").prop("disabled", false);
	// Deshabilitar la opcion seleccionada en el otro input siempre y cuando no sea diferente de false
	$(`#dateCOPscnd option[value="${$(this).val()}"]`).prop(
		"disabled",
		$(this).val() != "false"
	);
	if ($(this).val() != "false")
		if (
			$("#dateRCVfrst").val() != "false" &&
			$("#dateCOINfrst").val() != "false"
		) {
			// Validar que no haya falsos
			if (
				$("#dateRCVfrst").val() != $(this).val() ||
				$("#dateCOINfrst").val() != $(this).val()
			)
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
			// Habilitar en nombre de ejecutor
			$("#nombreEjecutor").prop("disabled", false);
		}
});

/**
 * Evento que se ejecuta cuando se selecciona una fecha para Rale RCV.
 */
$("#div-frst-selects").on("change", "#dateRCVfrst", function () {
	// Deshabilitar los filtros
	$("#btn_fil_inc").prop("disabled", true);
	$("#btn_fil_res").prop("disabled", true);
	$("#btn_fil_con").prop("disabled", true);

	// Habilitar todas las opciones del segundo input
	$("#dateRCVscnd option").prop("disabled", false);
	// Deshabilitar la opcion seleccionada en el otro input siempre y cuando no sea diferente de false
	$(`#dateRCVscnd option[value="${$(this).val()}"]`).prop(
		"disabled",
		$(this).val() != "false"
	);
	if ($(this).val() != "false")
		if (
			// Validar que no haya false
			$("#dateCOPfrst").val() != "false" &&
			$("#dateCOINfrst").val() != "false"
		) {
			if (
				$("#dateCOPfrst").val() != $(this).val() ||
				$("#dateCOINfrst").val() != $(this).val()
			)
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
			// Habilitar en nombre de ejecutor
			$("#nombreEjecutor").prop("disabled", false);
		}
});

/**
 * Evento que se ejecuta cuando se selecciona una fecha para COIN.
 */
$("#div-frst-selects").on("change", "#dateCOINfrst", function () {
	// Deshabilitar los filtros
	$("#btn_fil_inc").prop("disabled", true);
	$("#btn_fil_res").prop("disabled", true);
	$("#btn_fil_con").prop("disabled", true);

	// Habilitar todas las opciones del segundo input
	$("#dateCOINscnd option").prop("disabled", false);
	// Deshabilitar la opcion seleccionada en el otro input siempre y cuando no sea diferente de false
	$(`#dateCOINscnd option[value="${$(this).val()}"]`).prop(
		"disabled",
		$(this).val() != "false"
	);
	if ($(this).val() != "false")
		if (
			// Validar que no haya falsos
			$("#dateCOPfrst").val() != "false" &&
			$("#dateRCVfrst").val() != "false"
		) {
			if (
				$("#dateCOPfrst").val() != $(this).val() ||
				$("#dateRCVfrst").val() != $(this).val()
			)
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
			// Habilitar el nombre del ejecutor
			$("#nombreEjecutor").prop("disabled", false);
		}
});

// *** Confronta inputs ***
/**
 * Evento que se ejecuta cuando se selecciona una fecha para Rale COP en el segundo input.
 */
$("#div-scnd-selects").on("change", "#dateCOPscnd", function () {
	// Habilitar todos los options del otro input
	$("#dateCOPfrst option").prop("disabled", false);
	// Deshabilitar el option seleccionado del otro input siempre y cuando no sea diferente de false
	$(`#dateCOPfrst option[value="${$(this).val()}"]`).prop(
		"disabled",
		$(this).val() != "false"
	);
	// Validar que no haya falsos
	if ($(this).val() != "false")
		if ($("#dateRCVscnd").val() != "false") {
			if ($("#dateRCVscnd").val() != $(this).val())
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
			// Obtener la confronta
			getConfronta();
		}
});

/**
 * Evento que se ejecuta cuando se selecciona una fecha para Rale RCV en el segundo input.
 */
$("#div-scnd-selects").on("change", "#dateRCVscnd", function () {
	// Habilitar todos los options del otro input
	$("#dateRCVfrst option").prop("disabled", false);
	// Deshabilitar el option seleccionado del otro input siempre y cuando no sea diferente de false
	$(`#dateRCVfrst option[value="${$(this).val()}"]`).prop(
		"disabled",
		$(this).val() != "false"
	);
	// Validar que no haya falsos
	if ($(this).val() != "false")
		if ($("#dateCOPscnd").val() != "false") {
			if ($("#dateCOPscnd").val() != $(this).val())
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
			// Obtener la confronta
			getConfronta();
		}
});

/**
 * Evento que se ejecuta al cambiar los días festivos.
 */
$("#inp_DATES_fes").on("change", function () {
	if (
		$("#dateCOPfrst").val() == "false" ||
		$("#dateRCVfrst").val() == "false"
	)
		return;
	// Validar que sea numero valido
	if ($(this).val() == "" || $(this).val() < 0)
		bsAlert("Inserta un número valido en los dias festivos", "warning");
	else {
		// Obtener los dias laborales
		dates.laborales =
			getWorkDays(fecha.getMonth(), fecha.getFullYear()).length -
			($("#inp_DATES_fes").val() != "" ? $("#inp_DATES_fes").val() : 0);
		// Diligencias por dia
		dates.dilig = dates.laborales * 5 > 0 ? dates.laborales * 5 : 0;
		// Productividad
		dates.productividad = ((dates.pat_dilig / dates.dilig) * 100).toFixed(
			2
		);
		// Mostrar los graficos
		showGraphics("canvas-prod-ind", dates.productividad, "prod");
		// Insertar los datos
		$("#DATES_laborales").text(dates.laborales < 0 ? 0 : dates.laborales);
		$("#DATES_dilig").text(dates.dilig);
		$("#DATES_pat_dilig").text(dates.pat_dilig);
		$("#DATES_product").text(dates.productividad + "%");
	}
});

/**
 * Evento que se ejecuta al presionar el botón de generar listado de patrones.
 */
$("#btnListadoPatrones").on("click", function () {
	// Validar que haya informacion
	if (dataStats) {
		// Obtener listado de patrones
		socket.emit(
			"cliente:generarListadoPatrones",
			{
				obj: dataStats,
				ordenar: $("#switchOrdenar").prop("checked"),
				ejecutor: $("#nombreEjecutor").val(),
			},
			(response) => {
				// Crear un objeto Blob con los datos del archivo PDF
				const blob = new Blob([response.fileData], {
					type: "application/pdf",
				});

				// Crear una URL de objeto para el Blob
				const url = URL.createObjectURL(blob);

				// Crear un enlace para descargar el archivo
				const link = document.createElement("a");
				link.href = url;
				link.download = response.fileName;
				link.click();

				// Liberar la URL de objeto
				URL.revokeObjectURL(url);
			}
		);
	}
	bsAlert("No se ha realizado ninguna consulta", "warning");
});

/**
 * Función para obtener la confronta de estadísticas individuales.
 */
function getConfronta() {
	// Mostrar spinner
	$("#spinner").show();
	// Ocultar tabla
	$("#div-tabla-estadisticas-individuales").hide();
	// Peticion para la confronta de estadisticas individuales
	socket.emit("cliente:confrontaEstInd", {
		ejecutor: $("#nombreEjecutor").val(),
		copDate: $("#dateCOPscnd").val(),
		rcvDate: $("#dateRCVscnd").val(),
	});
}

/**
 * Llena los filtros, los habilita y los muestra en un dropdown.
 */
function fillFilters() {
	// Vaciar los filtros y deshabilitarlos
	$("#inc_fil").empty();
	$("#btn_fil_inc").prop("disabled", false);
	$("#btn_fil_con").prop("disabled", false);
	$("#btn_fil_res").prop("disabled", false);
	// Filtro de incidencia
	inc = Array.from(
		dataStats.rales.reduce(function (res, obj) {
			res.add(obj.inc);
			return res;
		}, new Set())
	);
	// Filtro de concepto
	con = Array.from(
		dataStats.rales.reduce(function (res, obj) {
			res.add(obj.type);
			return res;
		}, new Set())
	);
	// Filtro de resultado
	res = Array.from(
		dataStats.rales.reduce(function (res, obj) {
			if (obj.res_dil) res.add(obj.res_dil);
			return res;
		}, new Set())
	);
	// Orderar cada filtro
	inc.sort(function (a, b) {
		return a - b;
	});
	con.sort(function (a, b) {
		a.localeCompare(b);
	});
	res.sort(function (a, b) {
		a.localeCompare(b);
	});
	// Mostrar en un dropdown
	inc.map((data) => {
		$("#inc_fil").append(
			$("<li>").append(
				$("<a>")
					.attr("href", "#")
					.addClass("dropdown-item")
					.append(
						$("<div>")
							.addClass("form-check")
							.append(
								$("<input>")
									.addClass("form-check-input")
									.attr("checked", true)
									.attr("type", "checkbox")
									.val("chk_inc_" + data)
									.on("change", function () {
										updateFilters(
											"inc",
											data,
											$(this).is(":checked")
										);
									})
							)
							.append(
								$("<label>")
									.addClass("form-check-label")
									.attr("for", "flexCheckDefault")
									.text(data)
							)
					)
			)
		);
	});
	con.map((data) => {
		$("#con_fil").append(
			$("<li>").append(
				$("<a>")
					.attr("href", "#")
					.addClass("dropdown-item")
					.append(
						$("<div>")
							.addClass("form-check")
							.append(
								$("<input>")
									.addClass("form-check-input")
									.attr("checked", true)
									.attr("type", "checkbox")
									.val("chk_con_" + data)
									.on("change", function () {
										updateFilters(
											"con",
											data,
											$(this).is(":checked")
										);
									})
							)
							.append(
								$("<label>")
									.addClass("form-check-label")
									.attr("for", "flexCheckDefault")
									.text(data)
							)
					)
			)
		);
	});
	res.map((data) => {
		$("#res_fil").append(
			$("<li>").append(
				$("<a>")
					.attr("href", "#")
					.addClass("dropdown-item")
					.append(
						$("<div>")
							.addClass("form-check")
							.append(
								$("<input>")
									.addClass("form-check-input")
									.attr("checked", true)
									.attr("type", "checkbox")
									.val("chk_res_" + data)
									.on("change", function () {
										updateFilters(
											"res",
											data,
											$(this).is(":checked")
										);
									})
							)
							.append(
								$("<label>")
									.addClass("form-check-label")
									.attr("for", "flexCheckDefault")
									.text(data)
							)
					)
			)
		);
	});
}

/**
 * Llena las tablas de estadísticas con los datos correspondientes.
 */
function fillStats() {
	// Cuotas asignadas
	cuotas.asig = dataStats.rales.filter(
		(obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
	).length;
	// Cuotas pendeintes
	cuotas.pen = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc == 2 || obj.inc == 31) &&
			!obj.cobrado
	).length;
	// Cuootas coin
	cuotas.coin = dataStats.coin
		.map((coin) =>
			dataStats.rales.filter(
				(rale) =>
					(rale.inc == 2 || rale.inc == 31) &&
					rale.type == "cuotas" &&
					rale.reg_pat == coin.reg_pat &&
					rale.nom_cred == coin.num_credito
			)
		)
		.filter((objetos) => objetos.length > 0).length;
	// Cuotas coin diligenciadas
	cuotas.coin_dilig = dataStats.coin
		.map((coin) =>
			dataStats.rales.filter(
				(rale) =>
					(rale.inc == 2 || rale.inc == 31) &&
					rale.type == "cuotas" &&
					rale.reg_pat == coin.reg_pat &&
					rale.nom_cred == coin.num_credito &&
					rale.cobrado
			)
		)
		.filter((objetos) => objetos.length > 0).length;
	// Cuotas diligenciadas
	cuotas.dil = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.cobrado
	).length;
	// Cuotas inc 09
	cuotas.inc_09 = dataStats.rales.filter(
		(obj) => obj.inc === 9 && obj.type === "cuotas"
	).length;
	// Cuotas embargo
	cuotas.embargo = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc == 2 || obj.inc == 31) &&
			(obj.res_dil == 33 || obj.res_dil == 43)
	).length;
	cuotas.citatorios = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.res_dil == "citatorio"
	).length;
	// Insertar datos
	$("#CUOTAS_asignado").text(cuotas.asig);
	$("#CUOTAS_pendiente").text(cuotas.pen);
	$("#CUOTAS_coin").text(cuotas.coin);
	$("#CUOTAS_coin_dilig").text(cuotas.coin_dilig);
	$("#CUOTAS_diligenciado").text(cuotas.dil);
	$("#CUOTAS_inc_09").text(cuotas.inc_09);
	$("#CUOTAS_embargo").text(cuotas.embargo);
	$("#CUOTAS_citatorios").text(cuotas.citatorios);

	// RCV asignado
	rcv.asignado = dataStats.rales.filter(
		(obj) => obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31)
	).length;
	// RCV Pendiente
	rcv.pendiente = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			!obj.cobrado
	).length;
	// RCV Coin
	rcv.coin = dataStats.coin
		.map((coin) =>
			dataStats.rales.filter(
				(rale) =>
					(rale.inc == 2 || rale.inc == 31) &&
					rale.type == "rcv" &&
					rale.reg_pat == coin.reg_pat &&
					rale.nom_cred == coin.num_credito
			)
		)
		.filter((objetos) => objetos.length > 0).length;
	// RCV Coin Diligenciada
	rcv.coin_dilig = dataStats.coin
		.map((coin) =>
			dataStats.rales.filter(
				(rale) =>
					(rale.inc == 2 || rale.inc == 31) &&
					rale.type == "rcv" &&
					rale.reg_pat == coin.reg_pat &&
					rale.nom_cred == coin.num_credito &&
					rale.cobrado
			)
		)
		.filter((objetos) => objetos.length > 0).length;
	// RCV Diligenciada
	rcv.dil = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31) && obj.cobrado
	).length;
	// RCV Inc 09
	rcv.inc_09 = dataStats.rales.filter(
		(obj) => obj.inc === 9 && obj.type === "rcv"
	).length;
	// RCV Embargo
	rcv.embargo = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			(obj.res_dil == 33 || obj.res_dil == 43)
	).length;
	// RCV Citatorios
	rcv.citatorio = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.res_dil == "citatoio"
	).length;
	// Insertar datos
	$("#RCV_asignado").text(rcv.asignado);
	$("#RCV_pendiente").text(rcv.pendiente);
	$("#RCV_coin").text(rcv.coin);
	$("#RCV_coin_dilig").text(rcv.coin_dilig);
	$("#RCV_diligenciado").text(rcv.dil);
	$("#RCV_inc_09").text(rcv.inc_09);
	$("#RCV_embargo").text(rcv.embargo);
	$("#RCV_citatorios").text(rcv.citatorio);

	// Cop RCV entregados
	cop_rcv.entregados = cuotas.asig + rcv.asignado;
	// Cop RCV requeridos
	cop_rcv.req_pago = cuotas.dil + rcv.dil;
	// Cop RCV no localizados
	cop_rcv.no_local = cuotas.inc_09 + rcv.inc_09;
	// Cop RCV embargo
	cop_rcv.embargo = cuotas.embargo + rcv.embargo;
	// Cop RCV citatorios
	cop_rcv.citatorios = cuotas.citatorios + rcv.citatorio;
	// Cop RCV notificaciones
	cop_rcv.notif = dataStats.rales.filter(
		(obj) =>
			(obj.type === "rcv" || obj.type === "cop") &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.res_dil == "NOTIFICACIÓN"
	).length;

	// Insertar datos
	$("#COP_RCV_entregados").text(cop_rcv.entregados);
	$("#COP_RCV_req_pago").text(cop_rcv.req_pago);
	$("#COP_RCV_no_local").text(cop_rcv.no_local);
	$("#COP_RCV_embargo").text(cop_rcv.embargo);
	$("#COP_RCV_citatorios").text(cop_rcv.citatorios);
	$("#COP_RCV_notif").text(cop_rcv.notif);

	// Obtener input de fecha
	fecha = new Date($("#dateCOPfrst").val());

	// Fecha de inicio
	dates.fec_ini = new Date(
		fecha.getFullYear(),
		fecha.getMonth(),
		1
	).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	// Fecha de fin
	dates.fec_fin = new Date(
		fecha.getFullYear(),
		fecha.getMonth() + 1,
		0
	).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	// Dias laborales
	dates.laborales =
		getWorkDays(fecha.getMonth(), fecha.getFullYear()).length -
		($("#inp_DATES_fes").val() != "" ? $("#inp_DATES_fes").val() : 0);
	// Dilgencias
	dates.dilig = dates.laborales * 5;
	// Patrones diligenciados
	dates.pat_dilig =
		cuotas.dil +
		cuotas.inc_09 +
		cuotas.embargo +
		rcv.dil +
		rcv.inc_09 +
		rcv.embargo;
	// Prroductividad
	dates.productividad = ((dates.pat_dilig / dates.dilig) * 100).toFixed(2);
	// Avance en coin
	dates.ava_coin = ((cuotas.coin_dilig / cuotas.coin) * 100).toFixed(2);
	// Oportunidad 2
	oports.dos = dataStats.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 2"
	).length;
	// Oportunidad 31
	oports.tres_uno = dataStats.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 31"
	).length;
	// Oportunidad Fuera de tiempo
	oports.fuera = dataStats.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) &&
			obj.oportunidad == "Fuera de tiempo"
	).length;
	// Oportunidad por documentos
	dates.opor_docs = (
		((oports.dos + oports.tres_uno) /
			(oports.dos + oports.tres_uno + oports.fuera)) *
		100
	).toFixed(2);
	// Oportunidad por importe 2
	imp.dos = dataStats.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 2"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);
	// Importe 31
	imp.tres_uno = dataStats.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 31"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);
	// Importe Fuera de tiempo
	imp.fuera = dataStats.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "Fuera de tiempo"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);
	// Oportunidad por importe
	dates.opor_imp = (
		((imp.dos + imp.tres_uno) / (imp.dos + imp.tres_uno + imp.fuera)) *
		100
	).toFixed(2);
	// Oportunidad promediada
	dates.oport = (parseInt(dates.opor_docs) + parseInt(dates.opor_imp)) / 2;

	// Insertar datos de fecha
	$("#DATES_fec_ini").text(dates.fec_ini);
	$("#DATES_fec_fin").text(dates.fec_fin);
	$("#DATES_laborales").text(dates.laborales);
	$("#DATES_dilig").text(dates.dilig);
	$("#DATES_pat_dilig").text(dates.pat_dilig);
	$("#DATES_product").text(dates.productividad + "%");
	$("#DATES_ava_coin").text(dates.ava_coin + "%");
	$("#DATES_opor_docs").text(dates.opor_docs + "%");
	$("#DATES_opor_imp").text(dates.opor_imp + "%");
	$("#DATES_opor").text(dates.oport + "%");

	// Mostrar gráfico
	showGraphics("canvas-coin-31", dates.ava_coin, "coin");
	showGraphics("canvas-prod-ind", dates.productividad, "prod");
}

/**
 * Muestra un gráfico de dona en el elemento canvas especificado.
 * @param {string} id - El ID del elemento canvas.
 * @param {number} perc - El porcentaje para la sección resaltada en el gráfico.
 * @param {string} type - El tipo de gráfico. Puede ser "coin" o cualquier otro valor.
 */
function showGraphics(id, perc, type) {
	// Obtén el elemento canvas
	var canvas = document.getElementById(id);
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Configuración del dona
	var centerX = canvas.width / 2;
	var centerY = canvas.height;
	var outerRadius = 120;
	var innerRadius = 80;

	var colors;
	// Colores para las secciones
	if (type == "coin")
		colors = [
			"#FF0000",
			"#FF3300",
			"#FF6600",
			"#FF9900",
			"#FFCC00",
			"#FFFF00",
			"#D4FF00",
			"#AAFF00",
			"#55FF00",
			"#00FF00",
		];
	else colors = ["#FF0000", "#FFAA00", "#FFFF00", "#DA70D6", "#00FFFF"];

	// Dibujar seccion por seccion
	colors.map((color, i) => {
		let start = (180 + i * (180 / colors.length)) * (Math.PI / 180),
			end = (180 + (i + 1) * (180 / colors.length)) * (Math.PI / 180);
		// Dibuja la dona
		ctx.beginPath();
		ctx.arc(centerX, centerY, outerRadius, start, end);
		ctx.arc(centerX, centerY, innerRadius, end, start, true);
		ctx.closePath();

		// Establece el color de relleno y trazo
		ctx.fillStyle = color;
		ctx.strokeStyle = "#000000";

		// Aplica el color de relleno y trazo
		ctx.fill();
		ctx.stroke();

		// Agrega el número dentro de la sección
		var sectionNumber = i + 1;
		var sectionText = sectionNumber.toString();
		var sectionAngle = (start + end) / 2; // Ángulo medio de la sección
		var textX =
			centerX +
			Math.cos(sectionAngle) *
				(innerRadius + (outerRadius - innerRadius) / 2);
		var textY =
			centerY +
			Math.sin(sectionAngle) *
				(innerRadius + (outerRadius - innerRadius) / 2);

		ctx.fillStyle = "#000000"; // Color del texto
		ctx.font = "20px Arial"; // Fuente y tamaño del texto
		ctx.textAlign = "center"; // Alineación del texto
		ctx.textBaseline = "middle"; // Baseline del texto
		ctx.fillText(sectionText, textX, textY); // Dibuja el texto dentro de la sección
	});

	// Calcular el ángulo correspondiente al porcentaje
	var radianes = (((360 - 180) * perc) / 100 + 180) * (Math.PI / 180);

	// Calcular las coordenadas de la punta de la flecha
	var x = centerX + Math.cos(radianes) * 95;
	var y = centerY + Math.sin(radianes) * 95;

	// Dibujar la flecha
	ctx.beginPath();
	ctx.moveTo(centerX, centerY);
	ctx.lineTo(x, y);
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#FF0000";
	ctx.stroke();

	// Dibujar el círculo en la punta de la flecha
	ctx.beginPath();
	ctx.arc(x, y, 5, 0, Math.PI * 2);
	ctx.fillStyle = "#FF0000";
	ctx.fill();
}

/**
 * Obtiene un arreglo de objetos Date que representan los días laborales de un mes y año específicos.
 * @param {number} month - El número de mes (0-11) del cual se desean obtener los días laborales.
 * @param {number} year - El año del cual se desean obtener los días laborales.
 * @returns {Date[]} Un arreglo de objetos Date que representan los días laborales del mes y año especificados.
 */
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

/**
 * Actualiza los filtros según la acción realizada en un grupo específico.
 * @param {string} group - El grupo al que pertenece el filtro a actualizar ('inc', 'con' o 'res').
 * @param {string|number} n - El valor del filtro a actualizar.
 * @param {boolean} act - Indica si la acción es activar (true) o desactivar (false) el filtro.
 */
function updateFilters(group, n, act) {
	// Validar grupo
	switch (group) {
		case "inc":
			// Si la accion es verdadera insertamos el filtro en el arreglo
			if (act) inc.push(n);
			else {
				// Si no eliminamos el filtro del arreglo
				inc = inc.filter(function (fil) {
					return fil !== n;
				});
			}
			// Ordenamos el arreglo
			inc.sort(function (a, b) {
				return a - b;
			});
			break;
		case "con":
			if (act) con.push(n);
			else {
				con = con.filter(function (fil) {
					return fil !== n;
				});
			}
			con.sort(function (a, b) {
				a.localeCompare(b);
			});
			break;
		case "res":
			if (act) res.push(n);
			else {
				res = res.filter(function (fil) {
					return fil !== n;
				});
			}
			res.sort(function (a, b) {
				a.localeCompare(b);
			});
			break;
		default:
			break;
	}
	// Mostrar tabla
	showTable("inicio");
}

/**
 * Muestra una tabla de estadísticas individuales según el tipo especificado.
 * @param {string} type - El tipo de tabla a mostrar ('inicio' para la tabla inicial o cualquier otro valor para la tabla de confronta).
 */
function showTable(type) {
	// Validar el tipo de tabla
	let data = type == "inicio" ? dataStats.rales : confronta.rales;
	// Vaciar la tabla
	$("#div-tabla-estadisticas-individuales").empty();
	// Validar que haya patrones asignados
	if (data.length < 1) {
		bsAlert("El ejecutor no tiene ningun patron asignado", "danger");
		return;
	}

	// Crear tabla
	const table = $('<table class="table table-bordered border-dark">').attr(
		"id",
		"estadisticas-individuales-table"
	);

	// Crear el encabezado de la tabla
	const thead = $("<thead>");
	const headerRow = $("<tr>");

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
	const tbody = $("<tbody>");

	// Recorrer los objetos y agregar filas a la tabla
	data.forEach((obj) => {
		const dataRow = $("<tr>");

		if (obj.type == "rcv") dataRow.addClass("bg-secondary");
		if (obj.type == "multas") dataRow.addClass("bg-success");
		if (obj.type == "cuotas") dataRow.addClass("bg-light");

		if (!inc.includes(obj.inc)) return;
		if (!con.includes(obj.type)) return;

		// Recorrer las propiedades de cada objeto y agregar celdas a la fila
		Object.values(obj).forEach((value) => {
			const dataCell = $("<td>").text(value);
			dataCell.appendTo(dataRow);
		});

		dataRow.appendTo(tbody);
	});
	tbody.appendTo(table);

	// Crear un div con scroll para contener la tabla
	const tableScrollContainer = $("<div>").css({
		"overflow-y": "scroll",
		"max-height": "400px",
	});
	table.appendTo(tableScrollContainer);

	// Mostrar la tabla con el número de registros que tiene
	const tableContainer = $("<div>").attr(
		"id",
		"tb-show-estadisticas-individuales"
	);
	tableScrollContainer.appendTo(tableContainer);
	tableContainer.appendTo("#div-tabla-estadisticas-individuales");
	// Ocultar spinner
	$("#spinner").hide();
	// Mostrar tabla
	$("#div-tabla-estadisticas-individuales").show();
}
