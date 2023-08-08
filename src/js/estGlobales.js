// Obtener los sockets
const socket = io();

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
	imp = {};
(confronta = {}), (regFal = { rales: [] });
(regExis = { rales: [] }), (nEjecutores = {});

/**
 * Función que se ejecuta al cargar la página.
 */
window.onload = function () {
	$("#spinner").hide();
	socket.emit("cliente:consultarRegistrosRaleCOP");
	socket.emit("cliente:consultarRegistrosRaleRCV");
	socket.emit("cliente:consultarRegistrosCoin");
};

/**
 * Callback que se ejecuta al recibir las estadísticas globales del servidor.
 * @param {Object} data - Datos de las estadísticas globales.
 * @param {Array} ejecutores - Lista de ejecutores.
 */
socket.on("servidor:estGlobales", ({ data, ejecutores }) => {
	nEjecutores = ejecutores.length;
	dataStats = data;
	// Llenar los filtros de los patrones a trabajar
	fillFilters();
	// Mostrar la tabla del principio
	showTable("inicio");
	// Llenar las estadisticas de acuerdo a los datos
	fillStats();
	// Habilitar los campos para la confronta
	$("#dateCOPscnd").prop("disabled", false);
	$("#dateRCVscnd").prop("disabled", false);
	$("#dateCOINscnd").prop("disabled", false);
});

/**
 * Callback que se ejecuta al recibir la confronta de las estadísticas globales del servidor.
 * @param {Object} data - Datos de la confronta de las estadísticas globales.
 */
socket.on("servidor:estGlobalesConfronta", ({ data }) => {
	confronta = data;
	var encontrado = false;
	// Recorrer dataStats
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

	// Obtener las cuotas asignadas si el tipo es cuotas y la inc es 2 o 31
	cuotas.asig = data.rales.filter(
		(obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
	).length;

	// Obtener las cuotas pendientes si el tipo es cuotas y la inc es 2 o 31 y no esta cobrado
	cuotas.pen = data.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc == 2 || obj.inc == 31) &&
			!obj.cobrado
	).length;

	// Obtener las cuotas coin diligenciadas si el tipo es cuotas, la inc es 2 o 31 y que coincida el reg_pat y el numero de credito
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

	// Obtener las cuotas diligenciadas si el tipo es cuotas, la inc es 2 o 31
	cuotas.dil = regFal.rales.filter(
		(obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
	).length;

	// Insertar los resultados a los campos
	$("#CUOTAS_asignado").text(cuotas.asig);
	$("#CUOTAS_pendiente").text(cuotas.pen);
	$("#CUOTAS_coin_dilig").text(cuotas.coin_dilig);
	$("#CUOTAS_diligenciado").text(cuotas.dil);

	// Obtener los rcv asignados si el tipo es rcv y la inc es 9
	rcv.asignado = data.rales.filter(
		(obj) => obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31)
	).length;

	// Obtener los rcv pendientes si el tipo es rcv, la inc es 2 o 31 y no esta cobrado
	rcv.pendiente = data.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			!obj.cobrado
	).length;

	// Obtener y sumar los rcv coin diligenciados si el tipo es rcv, la inc es 2 o 31 y que coincida el reg_pat y el numero de credito
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

	// Obtener los rcv diligenciados si el tipo es rcv, la inc es 2 o 31
	rcv.dil = regFal.rales.filter(
		(obj) => obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31)
	).length;

	// Insertar los resultados a los campos
	$("#RCV_asignado").text(rcv.asignado);
	$("#RCV_pendiente").text(rcv.pendiente);
	$("#RCV_coin_dilig").text(rcv.coin_dilig);
	$("#RCV_diligenciado").text(rcv.dil);

	// Obtener la suma de las cuotas asignadas y los rcv asignados
	cop_rcv.entregados = cuotas.asig + rcv.asignado;
	// Obtener la suma de las cuotas diligenciadas y los rcv diligenciadas
	cop_rcv.req_pago = cuotas.dil + rcv.dil;
	// Obtener la suma de las cuotas no localizadas y los rcv no localizados
	cop_rcv.no_local = cuotas.inc_09 + rcv.inc_09;
	// Obtener la suma de las cuotas con embargo y los rcv con embargo
	cop_rcv.embargo = cuotas.embargo + rcv.embargo;
	// Obtener la suma de las citatorios y los rcv citatorios
	cop_rcv.citatorios = cuotas.citatorios + rcv.citatorio;
	// Obtener la suma de las notificaciones y los rcv notificaciones
	cop_rcv.notif = data.rales.filter(
		(obj) =>
			(obj.type === "rcv" || obj.type === "cop") &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.res_dil == "NOTIFICACIÓN"
	).length;

	// Insertar los resultados a los campos
	$("#COP_RCV_entregados").text(cop_rcv.entregados);
	$("#COP_RCV_req_pago").text(cop_rcv.req_pago);
	$("#COP_RCV_no_local").text(cop_rcv.no_local);
	$("#COP_RCV_embargo").text(cop_rcv.embargo);
	$("#COP_RCV_citatorios").text(cop_rcv.citatorios);
	$("#COP_RCV_notif").text(cop_rcv.notif);

	// Obtener la fecha del primer campo
	fecha = new Date($("#dateCOPfrst").val());

	// Obtener la suma de las cuotas y rcv
	dates.pat_dilig =
		cuotas.dil +
		cuotas.inc_09 +
		cuotas.embargo +
		rcv.dil +
		rcv.inc_09 +
		rcv.embargo;

	// Obtener la productividad de acuerdo a los patrones diligenciados y los patrones que se deberian diligenciar diario
	dates.productividad = ((dates.pat_dilig / dates.dilig) * 100).toFixed(2);
	// Obtener el avance en coin de acuerdo con los coin diligenciados y los coin asignados
	dates.ava_coin = ((cuotas.coin_dilig / cuotas.coin) * 100).toFixed(2);
	// Obtener la oportunidad de acuerdo con los dos, tres uno y fuera
	oports.dos = data.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 2"
	).length;
	oports.tres_uno = data.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 31"
	).length;
	oports.fuera = data.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) &&
			obj.oportunidad == "Fuera de tiempo"
	).length;
	// Obtener la oportunidad de acuerdo con los dos, tres uno y fuera
	dates.opor_docs = (
		((oports.dos + oports.tres_uno) /
			(oports.dos + oports.tres_uno + oports.fuera)) *
		100
	).toFixed(2);
	// Obtener el importe de acuerdo con la oportunidad dos
	imp.dos = data.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 2"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);
	// Obtener el importe de acuerdo con la oportunidad tres uno
	imp.tres_uno = data.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 31"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);
	// Obtener el importe de acuerdo con la oportunidad fuera
	imp.fuera = data.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "Fuera de tiempo"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);
	// Obtener el importe de acuerdo con la oportunidad dos, tres uno y fuera
	dates.opor_imp = (
		((imp.dos + imp.tres_uno) / (imp.dos + imp.tres_uno + imp.fuera)) *
		100
	).toFixed(2);
	// Obtener la oportunidad de acuerdo a la oportunidad de docs y de importes
	dates.oport = (parseInt(dates.opor_docs) + parseInt(dates.opor_imp)) / 2;

	// Insertar los resultados a los campos
	$("#DATES_fec_ini").text(dates.fec_ini);
	$("#DATES_fec_fin").text(dates.fec_fin);
	$("#DATES_laborales").text(dates.laborales < 0 ? 0 : dates.laborales);
	$("#DATES_dilig").text(dates.dilig);
	$("#DATES_pat_dilig").text(dates.pat_dilig);
	$("#DATES_product").text(dates.productividad + "%");
	$("#DATES_ava_coin").text(dates.ava_coin + "%");
	$("#DATES_opor_docs").text(dates.opor_docs + "%");
	$("#DATES_opor_imp").text(dates.opor_imp + "%");
	$("#DATES_opor").text(dates.oport + "%");

	// Mostrar los gráficos y tabla
	showGraphics("canvas-coin-31", dates.ava_coin, "coin");
	showGraphics("canvas-prod-ind", dates.productividad, "prod");
	showTable("confronta");
});

/**
 * Callback que se ejecuta al recibir los registros de Rale COP desde el servidor.
 * @param {Array} data - Array de fechas de los registros de Rale COP.
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

// Consultar las fechas de los registros de Rale RCV
/**
 * Callback que se ejecuta al recibir los registros de Rale RCV desde el servidor.
 *
 * @param {Array} data - Array de fechas de los registros de Rale RCV.
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
 * Callback que se ejecuta al recibir los registros de COIN desde el servidor.
 * @param {Array} data - Array de fechas de los registros de COIN.
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

// Hacemos un on change al div con el id dateCOP porque se crea dinamicamente
// entonces no se puede crear un evento a un elemento que no existe
$("#div-frst-selects").on("change", "#dateCOPfrst", function () {
	$("#btn_fil_inc").prop("disabled", true);
	$("#btn_fil_res").prop("disabled", true);
	$("#btn_fil_con").prop("disabled", true);

	$("#dateCOPscnd option").prop("disabled", false);
	$(`#dateCOPscnd option[value="${$(this).val()}"]`).prop(
		"disabled",
		$(this).val() != "false"
	);
	if ($(this).val() != "false")
		if (
			$("#dateRCVfrst").val() != "false" &&
			$("#dateCOINfrst").val() != "false"
		) {
			if (
				$("#dateRCVfrst").val() != $(this).val() ||
				$("#dateCOINfrst").val() != $(this).val()
			)
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
			getRales();
		}
});

// Hacemos un on change al div con el id dateRCV porque se crea dinamicamente
$("#div-frst-selects").on("change", "#dateRCVfrst", function () {
	// Deshabilitar botones de filtro de rales
	$("#btn_fil_inc").prop("disabled", true);
	$("#btn_fil_res").prop("disabled", true);
	$("#btn_fil_con").prop("disabled", true);

	// Habilitar todas las opciones de las fechas de la confronta de RCV
	$("#dateRCVscnd option").prop("disabled", false);
	// Deshabilitar la opcion seleccionada en el otro input siempre y cuando no tenga como value false
	$(`#dateRCVscnd option[value="${$(this).val()}"]`).prop(
		"disabled",
		$(this).val() != "false"
	);
	// Validar que el valor sea diferente de falso
	if ($(this).val() != "false")
		if (
			$("#dateCOPfrst").val() != "false" &&
			$("#dateCOINfrst").val() != "false"
		) {
			// Validar que los demas tambien sean diferentes de falso
			// Validar que los valores no sean diferentes
			if (
				$("#dateCOPfrst").val() != $(this).val() ||
				$("#dateCOINfrst").val() != $(this).val()
			)
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
			// Obtener los rales
			getRales();
		}
});

// Hacemos un on change al div con el id dateCOIN porque se crea dinamicamente
$("#div-frst-selects").on("change", "#dateCOINfrst", function () {
	// Deshabilitar los botones de filtro de rales
	$("#btn_fil_inc").prop("disabled", true);
	$("#btn_fil_res").prop("disabled", true);
	$("#btn_fil_con").prop("disabled", true);

	// Habilitar todas las opciones de las fechas de la confronta de COIN
	$("#dateCOINscnd option").prop("disabled", false);
	// Deshabilitar la opcion seleccionada en el otro input siempre y cuando no tenga como value false
	$(`#dateCOINscnd option[value="${$(this).val()}"]`).prop(
		"disabled",
		$(this).val() != "false"
	);
	// Validar que el valor sea diferente de falso
	if ($(this).val() != "false")
		if (
			$("#dateCOPfrst").val() != "false" &&
			$("#dateRCVfrst").val() != "false"
		) {
			// Validar que los demas tambien sean diferentes de falso
			// Validar que los valores no sean diferentes
			if (
				$("#dateCOPfrst").val() != $(this).val() ||
				$("#dateRCVfrst").val() != $(this).val()
			)
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
			// Obtener rales
			getRales();
		}
});

// *** Confronta inputs ***
// Hacemos un on change al div con el id dateCOP porque se crea dinamicamente
$("#div-scnd-selects").on("change", "#dateCOPscnd", function () {
	// Habilitar todos los options de las fechas del primer input COP
	$("#dateCOPfrst option").prop("disabled", false);
	// Deshabilitar la opcion seleccionada en el otro input siempre y cuando no tenga como value false
	$(`#dateCOPfrst option[value="${$(this).val()}"]`).prop(
		"disabled",
		$(this).val() != "false"
	);
	// Validar que el valor sea diferente de falso
	if ($(this).val() != "false")
		if ($("#dateRCVscnd").val() != "false") {
			// Validar que los demas tambien sean diferentes de falso
			// Validar que no sean diferentes
			if ($("#dateRCVscnd").val() != $(this).val())
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
			// Obtener la confronta
			getConfronta();
		}
});

// Hacemos un on change al div con el id dateCOIN porque se crea dinamicamente
$("#div-scnd-selects").on("change", "#dateRCVscnd", function () {
	// Habilitar todos los options de las fechas del primer input RCV
	$("#dateRCVfrst option").prop("disabled", false);
	// Deshabilitar la opcion seleccionada en el otro input siempre y cuando no tenga como value false
	$(`#dateRCVfrst option[value="${$(this).val()}"]`).prop(
		"disabled",
		$(this).val() != "false"
	);
	// Validar que el valor sea diferente de falso
	if ($(this).val() != "false")
		if ($("#dateCOPscnd").val() != "false") {
			// Validar que los demas sean diferente de falso
			// Validar que los valores no sean diferentes
			if ($("#dateCOPscnd").val() != $(this).val())
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
			// Obtener la confronta
			getConfronta();
		}
});

// Evento cambio de dias festivos
$("#inp_DATES_fes").on("change", function () {
	// Validar que los inputs de la fecha de COP y RCV no sean diferentes de falso
	if (
		$("#dateCOPfrst").val() == "false" ||
		$("#dateRCVfrst").val() == "false"
	)
		return;
	// Validar que no sea vacio o menor de 0
	if ($(this).val() == "" || $(this).val() < 0)
		bsAlert("Inserta un número valido en los dias festivos", "warning");
	else {
		// Obtener los dias laborales
		dates.laborales =
			getWorkDays(fecha.getMonth(), fecha.getFullYear()).length -
			($("#inp_DATES_fes").val() != "" ? $("#inp_DATES_fes").val() : 0);
		// Obtener las diligencias por dias
		dates.dilig =
			dates.laborales * 5 * nEjecutores > 0
				? dates.laborales * 5 * nEjecutores
				: 0;
		// Obtener la productividad por dias
		dates.productividad = ((dates.pat_dilig / dates.dilig) * 100).toFixed(
			2
		);
		// Mostrar la grafica con la info actualizada
		showGraphics("canvas-prod-ind", dates.productividad, "prod");
		// Mostrar los datos en el html
		$("#DATES_laborales").text(dates.laborales < 0 ? 0 : dates.laborales);
		$("#DATES_dilig").text(dates.dilig);
		$("#DATES_pat_dilig").text(dates.pat_dilig);
		$("#DATES_product").text(dates.productividad + "%");
	}
});

/**
 * Función para obtener los rales.
 * Realiza acciones como deshabilitar botones de filtros de rales, vaciar la tabla de estadísticas globales,
 * mostrar el spinner y enviar los datos de las fechas de COP, RCV y COIN al servidor.
 */
function getRales() {
	// Deshabilitar los botones de filtros de rales
	$("#btn_fil_inc").prop("disabled", true);
	$("#btn_fil_res").prop("disabled", true);
	$("#btn_fil_con").prop("disabled", true);

	// Vaciar la tabla de estadísticas globales
	$("#div-tabla-estadisticas-globales").empty();

	// Mostrar el spinner
	$("#spinner").show();
	// Ocultar la tabla de estadísticas globales
	$("#div-tabla-estadisticas-globales").hide();

	// Enviar los datos de los inputs de la fecha de COP, RCV y COIN al servidor
	socket.emit("cliente:ejecutorSeleccionadoEstGlob", {
		copDate: $("#dateCOPfrst").val(),
		rcvDate: $("#dateRCVfrst").val(),
		coinDate: $("#dateCOINfrst").val(),
	});
}

/**
 * Función para obtener la confronta de los inputs de las fechas de COP, RCV y COIN.
 * Realiza acciones como mostrar el spinner, ocultar la tabla de estadísticas globales
 * y enviar los datos de las fechas y el ejecutor al servidor.
 */
function getConfronta() {
	// Mostrar el spinner
	$("#spinner").show();
	// Ocultar la tabla de estadísticas globales
	$("#div-tabla-estadisticas-globales").hide();
	// Enviar los datos de los inputs de la fecha de COP, RCV y COIN al servidor
	socket.emit("cliente:confrontaEstGlo", {
		ejecutor: $("#nombreEjecutor").val(),
		copDate: $("#dateCOPscnd").val(),
		rcvDate: $("#dateRCVscnd").val(),
	});
}

/**
 * Función para llenar los filtros de incidencias, concepto y resultados.
 * Realiza acciones como borrar los filtros existentes, habilitar los botones de filtros,
 * obtener los datos de incidencias, concepto y resultados de los rales,
 * ordenar los datos y agregarlos a los filtros correspondientes.
 */
function fillFilters() {
	// Borrar los filtros de incidencias, concepto y resultados
	$("#inc_fil").empty();
	// Habilitar los botones de filtros de rales
	$("#btn_fil_inc").prop("disabled", false);
	$("#btn_fil_con").prop("disabled", false);
	$("#btn_fil_res").prop("disabled", false);
	// Obtener las incidencias de los rales
	inc = Array.from(
		dataStats.rales.reduce(function (res, obj) {
			res.add(obj.inc);
			return res;
		}, new Set())
	);
	// Obtener los conceptos de los rales
	con = Array.from(
		dataStats.rales.reduce(function (res, obj) {
			res.add(obj.type);
			return res;
		}, new Set())
	);
	// Obtener los resultados de los rales
	res = Array.from(
		dataStats.rales.reduce(function (res, obj) {
			if (obj.res_dil) res.add(obj.res_dil);
			return res;
		}, new Set())
	);
	// Ordenar los datos de incidencias, concepto y resultados
	inc.sort(function (a, b) {
		return a - b;
	});
	con.sort(function (a, b) {
		a.localeCompare(b);
	});
	res.sort(function (a, b) {
		a.localeCompare(b);
	});
	// Agregar los datos de incidencias, concepto y resultados a los filtros de incidencias, concepto y resultados
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
 * Función para llenar las estadísticas globales.
 * Realiza acciones como obtener y calcular diferentes datos estadísticos
 * basados en los datos de los rales y las fechas seleccionadas, y mostrarlos en la interfaz.
 */
function fillStats() {
	// Obtener las cuotas asignadas
	cuotas.asig = dataStats.rales.filter(
		(obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
	).length;
	// Cuotas pendientes
	cuotas.pen = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc == 2 || obj.inc == 31) &&
			!obj.cobrado
	).length;
	// Obtener los coin asignados
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
	// Obtener los coin diligenciados
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
	// Obtener las diligencias
	cuotas.dil = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.cobrado
	).length;
	// Obtener las incidencias 09
	cuotas.inc_09 = dataStats.rales.filter(
		(obj) => obj.inc === 9 && obj.type === "cuotas"
	).length;
	// Obtener las embargos
	cuotas.embargo = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc == 2 || obj.inc == 31) &&
			(obj.res_dil == 33 || obj.res_dil == 43)
	).length;
	// Obtener los citatorios
	cuotas.citatorios = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.res_dil == "citatorio"
	).length;
	// Mostrar las cuotas
	$("#CUOTAS_asignado").text(cuotas.asig);
	$("#CUOTAS_pendiente").text(cuotas.pen);
	$("#CUOTAS_coin").text(cuotas.coin);
	$("#CUOTAS_coin_dilig").text(cuotas.coin_dilig);
	$("#CUOTAS_diligenciado").text(cuotas.dil);
	$("#CUOTAS_inc_09").text(cuotas.inc_09);
	$("#CUOTAS_embargo").text(cuotas.embargo);
	$("#CUOTAS_citatorios").text(cuotas.citatorios);

	// Obtener los rcv asignados
	rcv.asignado = dataStats.rales.filter(
		(obj) => obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31)
	).length;
	// Obtener los rcv pendientes
	rcv.pendiente = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			!obj.cobrado
	).length;
	// Obtener los rcv coin asignados
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
	// Obtener los rcv coin diligenciados
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
	// Obtener los rcv diligenciados
	rcv.dil = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31) && obj.cobrado
	).length;
	// Obtener las incidencias 09
	rcv.inc_09 = dataStats.rales.filter(
		(obj) => obj.inc === 9 && obj.type === "rcv"
	).length;
	// Obtener los rcv embargos
	rcv.embargo = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			(obj.res_dil == 33 || obj.res_dil == 43)
	).length;
	// Obtener los rcv citatorios
	rcv.citatorio = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.res_dil == "citatoio"
	).length;

	// Mostrar los rcv
	$("#RCV_asignado").text(rcv.asignado);
	$("#RCV_pendiente").text(rcv.pendiente);
	$("#RCV_coin").text(rcv.coin);
	$("#RCV_coin_dilig").text(rcv.coin_dilig);
	$("#RCV_diligenciado").text(rcv.dil);
	$("#RCV_inc_09").text(rcv.inc_09);
	$("#RCV_embargo").text(rcv.embargo);
	$("#RCV_citatorios").text(rcv.citatorio);

	// Obtener los cop y rcv asignados
	cop_rcv.entregados = cuotas.asig + rcv.asignado;
	// Obtener los cop y rcv pendientes
	cop_rcv.req_pago = cuotas.dil + rcv.dil;
	// Obtener los cop y rcv no localizados
	cop_rcv.no_local = cuotas.inc_09 + rcv.inc_09;
	// Obtener los cop y rcv con embargo
	cop_rcv.embargo = cuotas.embargo + rcv.embargo;
	// Obtener los cop y rcv con citatorios
	cop_rcv.citatorios = cuotas.citatorios + rcv.citatorio;
	// Obtener los cop y rcv con notificaciones
	cop_rcv.notif = dataStats.rales.filter(
		(obj) =>
			(obj.type === "rcv" || obj.type === "cop") &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.res_dil == "NOTIFICACIÓN"
	).length;

	// Mostrar los cop y rcv
	$("#COP_RCV_entregados").text(cop_rcv.entregados);
	$("#COP_RCV_req_pago").text(cop_rcv.req_pago);
	$("#COP_RCV_no_local").text(cop_rcv.no_local);
	$("#COP_RCV_embargo").text(cop_rcv.embargo);
	$("#COP_RCV_citatorios").text(cop_rcv.citatorios);
	$("#COP_RCV_notif").text(cop_rcv.notif);

	// Obtener los datos de las fechas
	fecha = new Date($("#dateCOPfrst").val());

	// Obtener fecha de inicio
	dates.fec_ini = new Date(
		fecha.getFullYear(),
		fecha.getMonth(),
		1
	).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	// Obtener fecha de fin
	dates.fec_fin = new Date(
		fecha.getFullYear(),
		fecha.getMonth() + 1,
		0
	).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	// Obtener los dias laborales
	dates.laborales =
		getWorkDays(fecha.getMonth(), fecha.getFullYear()).length -
		($("#inp_DATES_fes").val() != "" ? $("#inp_DATES_fes").val() : 0);
	// Las diligencias se obtienen de los dias laborales por 5 por el numero de ejecutores ya que son estaidsicas globales
	dates.dilig = dates.laborales * 5 * nEjecutores;
	// Obtener los patrones diligenciados
	dates.pat_dilig =
		cuotas.dil +
		cuotas.inc_09 +
		cuotas.embargo +
		rcv.dil +
		rcv.inc_09 +
		rcv.embargo;
	// Obtener la oportunidad
	dates.productividad = ((dates.pat_dilig / dates.dilig) * 100).toFixed(2);
	// Obtener el avance en coin
	dates.ava_coin = ((cuotas.coin_dilig / cuotas.coin) * 100).toFixed(2);
	// Oportunidad en tiempo 2
	oports.dos = dataStats.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 2"
	).length;
	// Oportunidad en tiempo 31
	oports.tres_uno = dataStats.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 31"
	).length;
	// Oportunidad fuera de tiemp
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
	// Oportunidad por importe tiempo 2
	imp.dos = dataStats.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 2"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);
	// Oportunidad por importe tiempo 31
	imp.tres_uno = dataStats.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 31"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);
	// Oportunidad por importe fuera de tiempo
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
	// Oportunidad promedidada
	dates.oport = (parseInt(dates.opor_docs) + parseInt(dates.opor_imp)) / 2;

	// Mostrar los datos de las fechas
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

	// Mostrar los gráficos
	showGraphics("canvas-coin-31", dates.ava_coin, "coin");
	showGraphics("canvas-prod-ind", dates.productividad, "prod");
}

/**
 * Muestra un gráfico de dona en un elemento canvas.
 * @param {string} id - El ID del elemento canvas donde se mostrará el gráfico.
 * @param {number} perc - El porcentaje de llenado del gráfico.
 * @param {string} type - El tipo de gráfico a mostrar ("coin" o cualquier otro valor).
 */
function showGraphics(id, perc, type) {
	// Obtén el elemento canvas
	var canvas = document.getElementById(id);
	var ctx = canvas.getContext("2d");

	// Inicializar el ctx y limpiar
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
		// Obtener cords de inico y fin
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
 * Obtiene los días laborales de un mes específico.
 * @param {number} month - El número del mes (0-11) donde 0 representa enero y 11 representa diciembre.
 * @param {number} year - El año correspondiente a los días laborales que se desean obtener.
 * @returns {Array} - Un array de objetos Date que representa los días laborales del mes y año especificados.
 */
function getWorkDays(month, year) {
	const days = [];
	// Obtener la fecha de el mes y año
	const date = new Date(year, month, 1);

	// Recorrer los días del mes
	while (date.getMonth() === month) {
		const day = date.getDay();
		// Validar día que no sea fin de semana
		if (day !== 0 && day !== 6) {
			days.push(new Date(date));
		}
		// Aumentar fecha
		date.setDate(date.getDate() + 1);
	}
	return days;
}

/**
 * Actualiza los filtros de los grupos de datos.
 * @param {string} group - El grupo de datos que se está actualizando ("inc" para incidencias, "con" para conceptos, "res" para resultados).
 * @param {string|number} n - El valor del filtro que se está actualizando.
 * @param {boolean} act - Indica si el filtro se activó (true) o desactivó (false).
 * @returns {void}
 */
function updateFilters(group, n, act) {
	// Mostrar spinner y ocultar tabla
	$("#spinner").show();
	$("#div-tabla-estadisticas-globales").hide();
	// Validar el tipo de cambio
	switch (group) {
		case "inc":
			// Si se activó, se inserta al arreglo
			if (act) inc.push(n);
			else {
				// Si no se activó, se elimina del arreglo
				inc = inc.filter(function (fil) {
					return fil !== n;
				});
			}
			// Se ordena de nuevo
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
				return a.localeCompare(b);
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
				return a.localeCompare(b);
			});
			break;
		default:
			break;
	}
	// Se muestra la tabla con los filtros actualizados
	showTable("inicio");
}

/**
 * Muestra una tabla con los datos.
 * @param {string} type - El tipo de tabla a mostrar ("inicio" para la tabla de inicio, cualquier otro valor para la tabla de confronta).
 * @returns {void}
 */
function showTable(type) {
	// Valiar el tipo si es una tabla de inicio o de confronta
	let data = type == "inicio" ? dataStats.rales : confronta.rales;
	// Vaciar la tabla
	$("#div-tabla-estadisticas-globales").empty();
	// Validar si no hay datos
	if (data.length < 1) {
		bsAlert("No hay ningún patrón asignado", "danger");
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
	data.forEach((obj, i) => {
		const dataRow = $("<tr>");
        
        // ! No deja con css local, unicamente con el traido del cdn
        // Agregar color a las filas una por una 
        // if (obj.type == "multas") dataRow.css("background-color", "#198754");
        // if (obj.type == "cuotas") dataRow.css("background-color", "#0d6efd");
        // if (obj.type == "rcv") dataRow.css("background-color", "#6c757d");
        
		if (!inc.includes(obj.inc)) return;
		if (!con.includes(obj.type)) return;
                
		// Recorrer las propiedades de cada objeto y agregar celdas a la fila
		Object.values(obj).forEach((value) => {
            const dataCell = $("<td>").text(value);
			dataCell.appendTo(dataRow);
            // *** Este si deja con css local
            // Agregar color a las celdas una por una porque con el css local no deja por filas
            if (obj.type == "multas") dataCell.css("background-color", "#198754");
            if (obj.type == "cuotas") dataCell.css("background-color", "#0d6efd");
            if (obj.type == "rcv") dataCell.css("background-color", "#6c757d");
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
	tableContainer.appendTo("#div-tabla-estadisticas-globales");
	// Ocultar spinner
	$("#spinner").hide();
	// Mostrar la tabla
	$("#div-tabla-estadisticas-globales").show();
}
