const socket = io("http://localhost:3000");
// Variables
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
 * Función que se ejecuta cuando se carga la ventana.
 * @returns {void}
 */
window.onload = function () {
	$("#spinner").hide();
	$("#div-tabla-estadisticas-individuales").hide();
	socket.emit("cliente:consultarRegistrosRaleCOP");
	socket.emit("cliente:consultarRegistrosRaleRCV");
	socket.emit("cliente:consultarRegistrosCoin");
};

/**
 * Función que se ejecuta cuando se recibe el evento "servidor:estIndividuales" desde el socket.
 * Inicializa variables, inhabilita componentes y llama a otras funciones para llenar los filtros, mostrar la tabla y llenar las estadísticas.
 * @param {Object} data - Datos recibidos desde el servidor.
 * @returns {void}
 */
socket.on("servidor:estIndividuales", ({ data }) => {
	dataStats = data;
	fillFilters();
	showTable("inicio");
	fillStats();
	$("#dateCOPscnd").prop("disabled", false);
	$("#dateRCVscnd").prop("disabled", false);
	$("#dateCOINscnd").prop("disabled", false);
});

/**
 * Función que se ejecuta cuando se recibe el evento "servidor:estIndividualesConfronta" desde el socket.
 * Realiza cálculos y asignaciones de valores para crear las estadísticas individuales de confronta.
 * @param {Object} data - Datos recibidos desde el servidor.
 * @returns {void}
 */
socket.on("servidor:estIndividualesConfronta", ({ data }) => {
	confronta = data;
	var encontrado = false;

	// Recorre el objeto dataStats.rales para buscar el número de crédito y el registro patronal.
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

	// Filtra los registros de cuotas.asign y cuotas.pen con incidencias tipo 2 y 31, y que el tipo del objeto sea cuotas.
	cuotas.asig = data.rales.filter(
		(obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
	).length;

	cuotas.pen = data.rales.filter(
		(obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
	).length;

	// Busca en cuotas.pen los registros que el tipo sea cuotas, que la incidencia sea dos y 31, y que cobrado sea falso.
	cuotas.pen = data.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc == 2 || obj.inc == 31) &&
			!obj.cobrado
	).length;

	// Incrementa la variable sumando el dataStats.coin.
	cuotas.coin_dilig += dataStats.coin;

	// Busca los registros que la incidencia sea 2 y 31 y que el tipo sea cuotas y que el reg_pat y nom_cred coincida en coin y rale.
	cuotas.dil = regFal.rales.filter(
		(coin) =>
			coin.type == "cuotas" &&
			(coin.inc == 2 || coin.inc == 31) &&
			regFal.rales.some(
				(rale) =>
					(rale.inc == 2 || rale.inc == 31) &&
					rale.type == "cuotas" &&
					rale.reg_pat == coin.reg_pat &&
					rale.nom_cred == coin.num_credito
			)
	).length;

	// Muestra la información de cuotas en los elementos correspondientes.
	$("#CUOTAS_asignado").text(cuotas.asig);
	$("#CUOTAS_pendiente").text(cuotas.pen);
	$("#CUOTAS_coin_dilig").text(cuotas.coin_dilig);
	$("#CUOTAS_diligenciado").text(cuotas.dil);

	// Filtra los registros de rcv.asign y rcv.pen con incidencias tipo 2 y 31, y que el tipo del objeto sea rcv.
	rcv.asignado = data.rales.filter(
		(obj) => obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31)
	).length;

	rcv.pendiente = data.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			!obj.cobrado
	).length;

	// Incrementa la variable sumando el dataStats.coin.
	rcv.coin_dilig += dataStats.coin;

	// Busca los registros de tipo rcv, que las incidencias sean 2 o 31, y que reg_pat y nom_cred coincidan en coin y rale.
	rcv.dil = regFal.rales.filter(
		(coin) =>
			coin.type == "rcv" &&
			(coin.inc == 2 || coin.inc == 31) &&
			regFal.rales.some(
				(rale) =>
					(rale.inc == 2 || rale.inc == 31) &&
					rale.type == "rcv" &&
					rale.reg_pat == coin.reg_pat &&
					rale.nom_cred == coin.num_credito
			)
	).length;

	// Muestra la información de rcv en los elementos correspondientes.
	$("#RCV_asignado").text(rcv.asignado);
	$("#RCV_pendiente").text(rcv.pendiente);
	$("#RCV_coin_dilig").text(rcv.coin_dilig);
	$("#RCV_diligenciado").text(rcv.dil);

	// Suma los registros de cuotas.asig y rcv.asignado y asigna a la variable cop_rcv.entregados.
	cop_rcv.entregados = cuotas.asig + rcv.asignado;

	// Suma los registros de cuotas.dil y rcv.dil y asigna a la variable cop_rcv.req_pago.
	cop_rcv.req_pago = cuotas.dil + rcv.dil;

	// Busca en cuotas.inc_09 y rcv.inc_09 los registros que tengan incidencia 9 y los suma en la variable cop_rcv.no_local.
	cop_rcv.no_local = cuotas.inc_09 + rcv.inc_09;

	// Busca en cuotas.embargo y rcv.embargo los registros que tengan incidencia "Embargo" y los suma en la variable cop_rcv.embargo.
	cop_rcv.embargo = cuotas.embargo + rcv.embargo;

	// Busca en cuotas.citatorios y rcv.citatorio los registros que tengan incidencia "Citatorio" y los suma en la variable cop_rcv.citatorios.
	cop_rcv.citatorios = cuotas.citatorios + rcv.citatorio;

	// Busca en data.rales los registros que tengan incidencia 2 y 31 y res_dil "NOTIFICACIÓN" y los cuenta en la variable cop_rcv.notif.
	cop_rcv.notif = data.rales.filter(
		(obj) =>
			(obj.type === "rcv" || obj.type === "cop") &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.res_dil == "NOTIFICACIÓN"
	).length;

	// Muestra la información de cop_rcv en los elementos correspondientes.
	$("#COP_RCV_entregados").text(cop_rcv.entregados);
	$("#COP_RCV_req_pago").text(cop_rcv.req_pago);
	$("#COP_RCV_no_local").text(cop_rcv.no_local);
	$("#COP_RCV_embargo").text(cop_rcv.embargo);
	$("#COP_RCV_citatorios").text(cop_rcv.citatorios);
	$("#COP_RCV_notif").text(cop_rcv.notif);

	// Asigna la fecha obtenida del componente correspondiente a la variable fecha.
	fecha = new Date($("#dateCOPfrst").val());

	// Calcula la suma de las variables de diligencia en dates.pat_dilig.
	dates.pat_dilig =
		cuotas.dil +
		cuotas.inc_09 +
		cuotas.embargo +
		rcv.dil +
		rcv.inc_09 +
		rcv.embargo;

	// Calcula la productividad dividiendo dates.pat_dilig entre dates.dilig, multiplicando por 100 y manteniendo 2 decimales.
	dates.productividad = ((dates.pat_dilig / dates.dilig) * 100).toFixed(2);

	// Calcula el avance en coin dividiendo cuotas.coin_dilig entre cuotas.coin, multiplicando por 100 y manteniendo 2 decimales.
	dates.ava_coin = ((cuotas.coin_dilig / cuotas.coin) * 100).toFixed(2);

	// Filtra los registros de incidencia 2 y 31 con oportunidad "En tiempo 2" y los cuenta en oports.dos.
	oports.dos = data.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 2"
	).length;

	// Filtra los registros de incidencia 2 y 31 con oportunidad "En tiempo 31" y los cuenta en oports.tres_uno.
	oports.tres_uno = data.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 31"
	).length;

	// Filtra los registros de incidencia 2 y 31 con oportunidad "Fuera de tiempo" y los cuenta en oports.fuera.
	oports.fuera = data.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) &&
			obj.oportunidad == "Fuera de tiempo"
	).length;

	// Calcula la oportunidad en documentos dividiendo (oports.dos + oports.tres_uno) entre (oports.dos + oports.tres_uno + oports.fuera), multiplicando por 100 y manteniendo 2 decimales.
	dates.opor_docs = (
		((oports.dos + oports.tres_uno) /
			(oports.dos + oports.tres_uno + oports.fuera)) *
		100
	).toFixed(2);

	// Calcula la suma de importes para oportunidad en imp.dos, imp.tres_uno y imp.fuera.
	imp.dos = data.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 2"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);

	imp.tres_uno = data.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 31"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);

	imp.fuera = data.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "Fuera de tiempo"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);

	// Calcula la oportunidad en importes dividiendo (imp.dos + imp.tres_uno) entre (imp.dos + imp.tres_uno + imp.fuera), multiplicando por 100 y manteniendo 2 decimales.
	dates.opor_imp = (
		((imp.dos + imp.tres_uno) / (imp.dos + imp.tres_uno + imp.fuera)) *
		100
	).toFixed(2);

	// Calcula la oportunidad promedio dividiendo la suma de opor_docs y opor_imp entre 2.
	dates.oport = (parseInt(dates.opor_docs) + parseInt(dates.opor_imp)) / 2;

	// Muestra la información de dates en los elementos correspondientes.
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

	// Muestra los gráficos en los canvas correspondientes.
	showGraphics("canvas-coin-31", dates.ava_coin, "coin");
	showGraphics("canvas-prod-ind", dates.productividad, "prod");
	showTable("confronta");
});

/**
 * Función que se ejecuta cuando se recibe el evento "servidor:consultarRegistrosRaleCOP" desde el socket.
 * Realiza consultas de registros Rale COP y actualiza los elementos HTML correspondientes.
 * @param {Array} data - Datos recibidos desde el servidor.
 * @returns {void}
 */
socket.on("servidor:consultarRegistrosRaleCOP", (data) => {
	// Limpia los div correspondientes, y agrega opciones vacías a los select de fecha.
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

	// Agrega las opciones de fechas al select de fecha utilizando los datos recibidos.
	data.map((date) => {
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

	// Habilita el select de fecha.
	$("#dateCOPfrst").prop("disabled", false);
});

/**
 * Función que se ejecuta cuando se recibe el evento "servidor:consultarRegistrosRaleRCV" desde el socket.
 * Realiza consultas de registros Rale RCV y actualiza los elementos HTML correspondientes.
 * @param {Array} data - Datos recibidos desde el servidor.
 * @returns {void}
 */
socket.on("servidor:consultarRegistrosRaleRCV", (data) => {
	// Limpiar los div correspondientes y agregar opciones vacías a los select de fecha.
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

	// Agregar las opciones de fechas al select de fecha utilizando los datos recibidos.
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

	// Habilitar el select de fecha.
	$("#dateRCVfrst").prop("disabled", false);
});

/**
 * Función que se ejecuta cuando se recibe el evento "servidor:consultarRegistrosCoin" desde el socket.
 * Realiza consultas de registros COIN y actualiza los elementos HTML correspondientes.
 * @param {Array} data - Datos recibidos desde el servidor.
 * @returns {void}
 */
socket.on("servidor:consultarRegistrosCoin", (data) => {
	// Limpiar los div correspondientes y agregar opciones vacías a los select de fecha.
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

	// Agregar las opciones de fechas al select de fecha utilizando los datos recibidos.
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

	// Habilitar el select de fecha.
	$("#dateCOINfrst").prop("disabled", false);
});

// Evalua que el nombre del usuario sea seleccionado.
$("#nombreEjecutor").on("change", function () {
	$("#btn_fil_inc").prop("disabled", true);
	$("#btn_fil_res").prop("disabled", true);
	$("#btn_fil_con").prop("disabled", true);

	$("#div-tabla-estadisticas-individuales").empty();

	if ($("#nombreEjecutor").val() != "false") {
		$("#spinner").show();
		$("#div-tabla-estadisticas-individuales").hide();
		socket.emit("cliente:ejecutorSeleccionadoEstInd", {
			ejecutor: $("#nombreEjecutor").val(),
			copDate: $("#dateCOPfrst").val(),
			rcvDate: $("#dateRCVfrst").val(),
			coinDate: $("#dateCOINfrst").val(),
		});
	} else bsAlert("Selecciona la clave de ejecutor", "warning");
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
	// Se evalua que las fechas sean iguales para calcular dias restantes, si no, manda un alert y direcciona al socket.
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
			$("#nombreEjecutor").prop("disabled", false);
		}
});

// Hacemos un on change al div con el id dateCOP porque se crea dinamicamente
// entonces no se puede crear un evento a un elemento que no existe
$("#div-frst-selects").on("change", "#dateRCVfrst", function () {
	$("#btn_fil_inc").prop("disabled", true);
	$("#btn_fil_res").prop("disabled", true);
	$("#btn_fil_con").prop("disabled", true);

	$("#dateRCVscnd option").prop("disabled", false);
	$(`#dateRCVscnd option[value="${$(this).val()}"]`).prop(
		"disabled",
		$(this).val() != "false"
	);

	// Se evalua que las fechas sean iguales para calcular dias restantes, si no, manda un alert y direcciona al socket.
	if ($(this).val() != "false")
		if (
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
			$("#nombreEjecutor").prop("disabled", false);
		}
});

// Hacemos un on change al div con el id dateCOP porque se crea dinamicamente
// entonces no se puede crear un evento a un elemento que no existe
$("#div-frst-selects").on("change", "#dateCOINfrst", function () {
	$("#btn_fil_inc").prop("disabled", true);
	$("#btn_fil_res").prop("disabled", true);
	$("#btn_fil_con").prop("disabled", true);

	$("#dateCOINscnd option").prop("disabled", false);
	$(`#dateCOINscnd option[value="${$(this).val()}"]`).prop(
		"disabled",
		$(this).val() != "false"
	);
	// Se evalua que las fechas sean iguales para calcular dias restantes, si no, manda un alert y direcciona al socket.
	if ($(this).val() != "false")
		if (
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
			$("#nombreEjecutor").prop("disabled", false);
		}
});

// Confronta inputs

// Hacemos un on change al div con el id div-scnd-selects dateCOPscnd, evalua que las fechas
// sean iguales, sino manda alerta y manda llamar la función getConfronta.
// Si las fechas son iguales, se deshabilitan las fechas de los selectores
$("#div-scnd-selects").on("change", "#dateCOPscnd", function () {
	$("#dateCOPfrst option").prop("disabled", false);
	$(`#dateCOPfrst option[value="${$(this).val()}"]`).prop(
		"disabled",
		$(this).val() != "false"
	);
	if ($(this).val() != "false")
		if ($("#dateRCVscnd").val() != "false") {
			if ($("#dateRCVscnd").val() != $(this).val())
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
			getConfronta();
		}
});

// Hacemos un on change al div con el id div-scnd-selects dateRCVscnd, evalua que las fechas
// sean iguales, sino manda alerta y manda llamar la función getConfronta.
// Si las fechas son iguales, se deshabilitan las fechas de los selectores
$("#div-scnd-selects").on("change", "#dateRCVscnd", function () {
	$("#dateRCVfrst option").prop("disabled", false);
	$(`#dateRCVfrst option[value="${$(this).val()}"]`).prop(
		"disabled",
		$(this).val() != "false"
	);
	if ($(this).val() != "false")
		if ($("#dateCOPscnd").val() != "false") {
			if ($("#dateCOPscnd").val() != $(this).val())
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
			getConfronta();
		}
});

// Event del inp_DATES_fes
$("#inp_DATES_fes").on("change", function () {
	// Evalua que el campo de días festivos sea llenado y si no, manda un alert.
	if (
		$("#dateCOPfrst").val() == "false" ||
		$("#dateRCVfrst").val() == "false"
	)
		return;
	if ($(this).val() == "")
		bsAlert("Inserta un número en los dias festivos", "warning");
	else {
		// Si el campo de días festivos es llenado, se calcula la productividad y se muestra en el canvas.
		dates.laborales =
			getWorkDays(fecha.getMonth(), fecha.getFullYear()).length -
			($("#inp_DATES_fes").val() != "" ? $("#inp_DATES_fes").val() : 0);
		dates.dilig = dates.laborales * 5 < 0 ? 0 : dates.laborales * 5;
		$("#DATES_laborales").text(dates.laborales);
		$("#DATES_dilig").text(dates.dilig);
		showGraphics("canvas-prod-ind", dates.productividad, "prod");
	}
});

// Botón para generar listado de patrones
$("#btnListadoPatrones").on("click", function () {
	if (dataStats) {
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
 * Función que se ejecuta al llamar al socket para obtener la confronta y estadísticas individuales.
 * Emite un evento al servidor para solicitar la confronta y estadísticas individuales.
 * @returns {void}
 */
function getConfronta() {
	// Mostrar el spinner y ocultar la tabla de estadísticas individuales.
	$("#spinner").show();
	$("#div-tabla-estadisticas-individuales").hide();

	// Emitir evento al servidor con los parámetros necesarios.
	socket.emit("cliente:confrontaEstInd", {
		ejecutor: $("#nombreEjecutor").val(),
		copDate: $("#dateCOPscnd").val(),
		rcvDate: $("#dateRCVscnd").val(),
	});
}

/**
 * Función que genera y llena dinámicamente elementos de filtro basándose en dataStats.rales.
 * Los elementos de filtro se agregan a los componentes correspondientes en el documento HTML.
 * @returns {void}
 */
function fillFilters() {
	// Limpiar los div y habilitar los botones correspondientes.
	$("#inc_fil").empty();
	$("#btn_fil_inc").prop("disabled", false);
	$("#btn_fil_con").prop("disabled", false);
	$("#btn_fil_res").prop("disabled", false);

	// Crear instancias de objetos Set para realizar la reducción y eliminar duplicados.
	// Luego convertir los Sets en Arrays.
	inc = Array.from(
		dataStats.rales.reduce(function (res, obj) {
			res.add(obj.inc);
			return res;
		}, new Set())
	);
	con = Array.from(
		dataStats.rales.reduce(function (res, obj) {
			res.add(obj.type);
			return res;
		}, new Set())
	);
	res = Array.from(
		dataStats.rales.reduce(function (res, obj) {
			if (obj.res_dil) res.add(obj.res_dil);
			return res;
		}, new Set())
	);

	// Ordenar los elementos de los arrays inc, con y res.
	inc.sort(function (a, b) {
		return a - b;
	});
	con.sort(function (a, b) {
		a.localeCompare(b);
	});
	res.sort(function (a, b) {
		a.localeCompare(b);
	});

	// Generar y llenar dinámicamente los elementos de filtro para las incidencias.
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

	// Generar y llenar dinámicamente los elementos de filtro para los conceptos.
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

	// Generar y llenar dinámicamente los elementos de filtro para los resultados de diligencia.
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
 * Función que obtiene los filtros y llena el objeto cuotas con la información correspondiente.
 * Además, muestra la información en los componentes correspondientes y realiza operaciones adicionales.
 * @returns {void}
 */
function fillStats() {
	// Obtener la cantidad de cuotas asignadas con incidencia 2 o 31 y guardar en cuotas.asig.
	cuotas.asig = dataStats.rales.filter(
		(obj) => obj.type === "cuotas" && (obj.inc === 2 || obj.inc === 31)
	).length;

	// Obtener la cantidad de cuotas pendientes con incidencia 2 o 31 y no cobradas y guardar en cuotas.pen.
	cuotas.pen = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc === 2 || obj.inc === 31) &&
			!obj.cobrado
	).length;

	// Obtener la cantidad de cuotas con coincidencia en los valores de rale y coin
	// y con incidencia 2 o 31 y guardar en cuotas.coin.
	cuotas.coin = dataStats.coin
		.map((coin) =>
			dataStats.rales.filter(
				(rale) =>
					(rale.inc === 2 || rale.inc === 31) &&
					rale.type === "cuotas" &&
					rale.reg_pat === coin.reg_pat &&
					rale.nom_cred === coin.num_credito
			)
		)
		.filter((objetos) => objetos.length > 0).length;

	// Obtener la cantidad de cuotas diligenciadas con coincidencia en los valores de rale y coin
	// y con incidencia 2 o 31 y cobradas y guardar en cuotas.coin_dilig.
	cuotas.coin_dilig = dataStats.coin
		.map((coin) =>
			dataStats.rales.filter(
				(rale) =>
					(rale.inc === 2 || rale.inc === 31) &&
					rale.type === "cuotas" &&
					rale.reg_pat === coin.reg_pat &&
					rale.nom_cred === coin.num_credito &&
					rale.cobrado
			)
		)
		.filter((objetos) => objetos.length > 0).length;

	// Obtener la cantidad de cuotas diligenciadas con incidencia 2 o 31 y cobradas y guardar en cuotas.dil.
	cuotas.dil = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc === 2 || obj.inc === 31) &&
			obj.cobrado
	).length;

	// Obtener la cantidad de cuotas con incidencia 9 y guardar en cuotas.inc_09.
	cuotas.inc_09 = dataStats.rales.filter(
		(obj) => obj.inc === 9 && obj.type === "cuotas"
	).length;

	// Obtener la cantidad de cuotas embargadas con incidencia 2 o 31
	// y con resultado de diligenciamiento 33 o 43 y guardar en cuotas.embargo.
	cuotas.embargo = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc === 2 || obj.inc === 31) &&
			(obj.res_dil === 33 || obj.res_dil === 43)
	).length;

	// Obtener la cantidad de cuotas con incidencia 2 o 31 y resultado de diligenciamiento "citatorio"
	// y guardar en cuotas.citatorios.
	cuotas.citatorios = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc === 2 || obj.inc === 31) &&
			obj.res_dil === "citatorio"
	).length;

	// Mostrar la información de cuotas en los componentes correspondientes.
	$("#CUOTAS_asignado").text(cuotas.asig);
	$("#CUOTAS_pendiente").text(cuotas.pen);
	$("#CUOTAS_coin").text(cuotas.coin);
	$("#CUOTAS_coin_dilig").text(cuotas.coin_dilig);
	$("#CUOTAS_diligenciado").text(cuotas.dil);
	$("#CUOTAS_inc_09").text(cuotas.inc_09);
	$("#CUOTAS_embargo").text(cuotas.embargo);
	$("#CUOTAS_citatorios").text(cuotas.citatorios);

	// Filtrar los registros de tipo "rcv" con incidencia 2 o 31 y guardar en rcv.asignado.
	rcv.asignado = dataStats.rales.filter(
		(obj) => obj.type === "rcv" && (obj.inc === 2 || obj.inc === 31)
	).length;

	// Filtrar los registros de tipo "rcv" con incidencia 2 o 31 y no cobrados y guardar en rcv.pendiente.
	rcv.pendiente = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc === 2 || obj.inc === 31) &&
			!obj.cobrado
	).length;

	// Filtrar los registros de tipo "rcv" con coincidencia en los valores de rale y coin
	// y con incidencia 2 o 31 y guardar en rcv.coin.
	rcv.coin = dataStats.coin
		.map((coin) =>
			dataStats.rales.filter(
				(rale) =>
					(rale.inc === 2 || rale.inc === 31) &&
					rale.type === "rcv" &&
					rale.reg_pat === coin.reg_pat &&
					rale.nom_cred === coin.num_credito
			)
		)
		.filter((objetos) => objetos.length > 0).length;

	// Filtrar los registros de tipo "rcv" con coincidencia en los valores de rale y coin
	// y con incidencia 2 o 31 y cobrados y guardar en rcv.coin_dilig.
	rcv.coin_dilig = dataStats.coin
		.map((coin) =>
			dataStats.rales.filter(
				(rale) =>
					(rale.inc === 2 || rale.inc === 31) &&
					rale.type === "rcv" &&
					rale.reg_pat === coin.reg_pat &&
					rale.nom_cred === coin.num_credito &&
					rale.cobrado
			)
		)
		.filter((objetos) => objetos.length > 0).length;

	// Filtrar los registros de tipo "rcv" con incidencia 2 o 31 y cobrados y guardar en rcv.dil.
	rcv.dil = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc === 2 || obj.inc === 31) &&
			obj.cobrado
	).length;

	// Filtrar los registros de tipo "rcv" con incidencia 9 y guardar en rcv.inc_09.
	rcv.inc_09 = dataStats.rales.filter(
		(obj) => obj.inc === 9 && obj.type === "rcv"
	).length;

	// Filtrar los registros de tipo "rcv" con incidencia 2 o 31
	// y con resultado de diligenciamiento 33 o 43 y guardar en rcv.embargo.
	rcv.embargo = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc === 2 || obj.inc === 31) &&
			(obj.res_dil === 33 || obj.res_dil === 43)
	).length;

	// Filtrar los registros de tipo "rcv" con incidencia 2 o 31
	// y con resultado de diligenciamiento "citatorio" y guardar en rcv.citatorio.
	rcv.citatorio = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc === 2 || obj.inc === 31) &&
			obj.res_dil === "citatorio"
	).length;

	// Mostrar la información de rcv en los componentes correspondientes.
	$("#RCV_asignado").text(rcv.asignado);
	$("#RCV_pendiente").text(rcv.pendiente);
	$("#RCV_coin").text(rcv.coin);
	$("#RCV_coin_dilig").text(rcv.coin_dilig);
	$("#RCV_diligenciado").text(rcv.dil);
	$("#RCV_inc_09").text(rcv.inc_09);
	$("#RCV_embargo").text(rcv.embargo);
	$("#RCV_citatorios").text(rcv.citatorio);

	// Calcular la suma de cuotas y rcv y guardar en cop_rcv.entregados.
	cop_rcv.entregados = cuotas.asig + rcv.asignado;
	// Calcular la suma de cuotas y rcv diligenciados y guardar en cop_rcv.req_pago.
	cop_rcv.req_pago = cuotas.dil + rcv.dil;
	// Calcular la suma de cuotas y rcv con incidencia 9 y guardar en cop_rcv.no_local.
	cop_rcv.no_local = cuotas.inc_09 + rcv.inc_09;
	// Calcular la suma de cuotas y rcv embargados y guardar en cop_rcv.embargo.
	cop_rcv.embargo = cuotas.embargo + rcv.embargo;
	// Calcular la suma de cuotas y rcv con resultado de diligenciamiento "citatorio" y guardar en cop_rcv.citatorios.
	cop_rcv.citatorios = cuotas.citatorios + rcv.citatorio;
	// Obtener la cantidad de registros de tipo "rcv" o "cop" con incidencia 2 o 31
	// y resultado de diligenciamiento "NOTIFICACIÓN" y guardar en cop_rcv.notif.
	cop_rcv.notif = dataStats.rales.filter(
		(obj) =>
			(obj.type === "rcv" || obj.type === "cop") &&
			(obj.inc === 2 || obj.inc === 31) &&
			obj.res_dil === "NOTIFICACIÓN"
	).length;

	// Mostrar la información de cop_rcv en los componentes correspondientes.
	$("#COP_RCV_entregados").text(cop_rcv.entregados);
	$("#COP_RCV_req_pago").text(cop_rcv.req_pago);
	$("#COP_RCV_no_local").text(cop_rcv.no_local);
	$("#COP_RCV_embargo").text(cop_rcv.embargo);
	$("#COP_RCV_citatorios").text(cop_rcv.citatorios);
	$("#COP_RCV_notif").text(cop_rcv.notif);

	// Obtener la fecha del campo dateCOPfrst y guardar en la variable fecha.
	fecha = new Date($("#dateCOPfrst").val());

	// Guardar en dates.fec_ini la fecha inicial en formato "día de mes, año".
	dates.fec_ini = new Date(
		fecha.getFullYear(),
		fecha.getMonth(),
		1
	).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	// Guardar en dates.fec_fin la fecha final en formato "día de mes, año".
	dates.fec_fin = new Date(
		fecha.getFullYear(),
		fecha.getMonth() + 1,
		0
	).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	// Obtener los días laborales y restar los días festivos ingresados en inp_DATES_fes,
	// y guardar en dates.laborales.
	dates.laborales =
		getWorkDays(fecha.getMonth(), fecha.getFullYear()).length -
		($("#inp_DATES_fes").val() !== "" ? $("#inp_DATES_fes").val() : 0);

	// Calcular los días de diligenciamiento multiplicando los días laborales por 5,
	// y guardar en dates.dilig.
	dates.dilig = dates.laborales * 5;

	// Calcular el patrimonio diligenciado sumando las cantidades de cuotas y rcv diligenciados,
	// y guardar en dates.pat_dilig.
	dates.pat_dilig =
		cuotas.dil +
		cuotas.inc_09 +
		cuotas.embargo +
		rcv.dil +
		rcv.inc_09 +
		rcv.embargo;

	// Calcular la productividad dividiendo el patrimonio diligenciado entre los días de diligenciamiento,
	// y guardar en dates.productividad con dos decimales.
	dates.productividad = ((dates.pat_dilig / dates.dilig) * 100).toFixed(2);

	// Calcular la disponibilidad de coinversiones dividiendo cuotas diligenciadas entre cuotas con coincidencia,
	// y guardar en dates.ava_coin con dos decimales.
	dates.ava_coin = ((cuotas.coin_dilig / cuotas.coin) * 100).toFixed(2);

	// Obtener la cantidad de registros con incidencias 2 o 31 y oportunidad "En tiempo 2",
	// y guardar en oports.dos.
	oports.dos = dataStats.rales.filter(
		(obj) =>
			(obj.inc === 2 || obj.inc === 31) &&
			obj.oportunidad === "En tiempo 2"
	).length;

	// Obtener la cantidad de registros con incidencias 2 o 31 y oportunidad "En tiempo 31",
	// y guardar en oports.tres_uno.
	oports.tres_uno = dataStats.rales.filter(
		(obj) =>
			(obj.inc === 2 || obj.inc === 31) &&
			obj.oportunidad === "En tiempo 31"
	).length;

	// Obtener la cantidad de registros con incidencias 2 o 31 y oportunidad "Fuera de tiempo",
	// y guardar en oports.fuera.
	oports.fuera = dataStats.rales.filter(
		(obj) =>
			(obj.inc === 2 || obj.inc === 31) &&
			obj.oportunidad === "Fuera de tiempo"
	).length;

	// Calcular la oportunidad de documentos dividiendo la cantidad de registros en tiempo (2 y 31)
	// entre la cantidad total de registros (en tiempo y fuera de tiempo), y guardar en dates.opor_docs con dos decimales.
	dates.opor_docs = (
		((oports.dos + oports.tres_uno) /
			(oports.dos + oports.tres_uno + oports.fuera)) *
		100
	).toFixed(2);

	// Obtener la suma de importes de los registros con incidencias 2 o 31 y oportunidad "En tiempo 2",
	// y guardar en imp.dos.
	imp.dos = dataStats.rales
		.filter(
			(obj) =>
				(obj.inc === 2 || obj.inc === 31) &&
				obj.oportunidad === "En tiempo 2"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);

	// Obtener la suma de importes de los registros con incidencias 2 o 31 y oportunidad "En tiempo 31",
	// y guardar en imp.tres_uno.
	imp.tres_uno = dataStats.rales
		.filter(
			(obj) =>
				(obj.inc === 2 || obj.inc === 31) &&
				obj.oportunidad === "En tiempo 31"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);

	// Obtener la suma de importes de los registros con incidencias 2 o 31 y oportunidad "Fuera de tiempo",
	// y guardar en imp.fuera.
	imp.fuera = dataStats.rales
		.filter(
			(obj) =>
				(obj.inc === 2 || obj.inc === 31) &&
				obj.oportunidad === "Fuera de tiempo"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);

	// Calcular la oportunidad de importes dividiendo la suma de importes en tiempo (2 y 31)
	// entre la suma total de importes (en tiempo y fuera de tiempo), y guardar en dates.opor_imp con dos decimales.
	dates.opor_imp = (
		((imp.dos + imp.tres_uno) / (imp.dos + imp.tres_uno + imp.fuera)) *
		100
	).toFixed(2);

	// Mostrar la información de fechas en los componentes correspondientes.
	$("#DATES_fec_ini").text(dates.fec_ini);
	$("#DATES_fec_fin").text(dates.fec_fin);
	$("#DATES_laborales").text(dates.laborales);
	$("#DATES_dilig").text(dates.dilig);
	$("#DATES_pat_dilig").text(dates.pat_dilig);
	$("#DATES_productividad").text(dates.productividad);
	$("#DATES_ava_coin").text(dates.ava_coin);
	$("#DATES_opor_docs").text(dates.opor_docs);
	$("#DATES_opor_imp").text(dates.opor_imp);
}

/**
 * Función para mostrar gráficos
 * @param {string} id - El id del elemento canvas.
 * @param {number} perc - El porcentaje para calcular el ángulo de la flecha.
 * @param {string} type - El tipo de gráfico: "coin" o cualquier otro.
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
 * Función para obtener gráficos.
 * @returns {Promise} - Una promesa que se resuelve una vez que se han configurado visualmente los gráficos.
 */
async function getGraphics() {
	// Configura visualmente los gráficos.
	new Chart($("#canv_coin"), {
		type: "doughnut",
		data: {
			labels: ["No diligenciado", "Diligenciado"],
			datasets: [
				{
					label: "My First Dataset",
					data: [cuotas.coin, cuotas.coin_dilig],
					backgroundColor: ["rgb(220, 53, 69)", "rgb(25, 135, 84)"],
					hoverOffset: 4,
				},
			],
		},
	});

	new Chart($("#canv_prod"), {
		type: "doughnut",
		data: {
			labels: ["No diligenciado", "Diligenciado"],
			datasets: [
				{
					label: "My First Dataset",
					data: [dates.dilig, dates.pat_dilig],
					backgroundColor: ["rgb(220, 53, 69)", "rgb(25, 135, 84)"],
					hoverOffset: 4,
				},
			],
		},
	});
}

/**
 * Función para obtener los días laborables de un mes y año específicos.
 * @param {number} month - El número del mes (0-11).
 * @param {number} year - El año.
 * @returns {Date[]} - Un array de objetos Date que representan los días laborables del mes y año especificados.
 */
function getWorkDays(month, year) {
	const days = [];
	const date = new Date(year, month, 1);

	// Realiza un ciclo que recorra los días del mes y los añade al array
	// si los días son distintos a sábados y domingos.
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
 * Función para actualizar los filtros.
 * @param {string} group - El grupo al que pertenece el registro: "inc", "con" o "res".
 * @param {any} n - El valor del registro a agregar o eliminar del filtro.
 * @param {boolean} act - Indica si se debe agregar (true) o eliminar (false) el registro del filtro.
 */
function updateFilters(group, n, act) {
	// Realiza un switch para agregar al objeto correspondiente el registro.
	switch (group) {
		case "inc":
			if (act) inc.push(n);
			else {
				inc = inc.filter(function (fil) {
					return fil !== n;
				});
			}
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
	showTable("inicio");
}

/**
 * Función para mostrar la tabla de estadísticas individuales.
 * @param {string} type - El tipo de tabla a mostrar: "inicio" o "confronta".
 */
function showTable(type) {
	let data = type == "inicio" ? dataStats.rales : confronta.rales;
	$("#div-tabla-estadisticas-individuales").empty();
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
	$("#spinner").hide();
	$("#div-tabla-estadisticas-individuales").show();
}
