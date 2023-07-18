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

window.onload = function () {
	socket.emit("cliente:consultarRegistrosRaleCOP");
	socket.emit("cliente:consultarRegistrosRaleRCV");
	socket.emit("cliente:consultarRegistrosCoin");
};

// Socket para inicializar variables, inhabilitar componentes y llamar funciones.
socket.on("servidor:estIndividuales", ({ data }) => {
	dataStats = data;
	fillFilters();
	showTable("inicio");
	fillStats();
	$("#dateCOPscnd").prop("disabled", false);
	$("#dateRCVscnd").prop("disabled", false);
	$("#dateCOINscnd").prop("disabled", false);
});

// Socket para crear las estadísticas individuales.
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
	// Filtra los registros de cuotas.asign y cuotas.pen con incidencias tipo 2 y 31, y qie el tipo del objeto sea cuotas.
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
	cuotas.coin_dilig += dataStats.coin

		// Busca los registros que la incidencia sea 2 y 31 y que el tipo sea cuotas y que el reg_pat y nom_cred coincida en coin y rale.
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

	// Guarda en cuotas.dil, los registros que sean filtrados de regFal.rales, que la incidencia sea 2 o 31, y que sean cuotas.
	cuotas.dil = regFal.rales.filter(
		(obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
	).length;

	// Muestra la información
	$("#CUOTAS_asignado").text(cuotas.asig);
	$("#CUOTAS_pendiente").text(cuotas.pen);
	$("#CUOTAS_coin_dilig").text(cuotas.coin_dilig);
	$("#CUOTAS_diligenciado").text(cuotas.dil);

	// Filtra los registros de rcv.asign y rcv.pen con incidencias tipo 2 y 31, y qie el tipo del objeto sea
	rcv.asignado = data.rales.filter(
		(obj) => obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31)
	).length;

	rcv.pendiente = data.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			!obj.cobrado
	).length;

	// Incrementa la variable, sumando dataStats.coin.
	rcv.coin_dilig += dataStats.coin

		// Busca los registros de tipo rcv, que las incidencias sean 2 o 31, y que reg_pat y nom_cred  coincidan en coin y rale.
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

	// Busca en regFal.rales los registos rcv con incidencia 2 y 31, y guarda en rcv.dil
	rcv.dil = regFal.rales.filter(
		(obj) => obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31)
	).length;

	// Muestra la información
	$("#RCV_asignado").text(rcv.asignado);
	$("#RCV_pendiente").text(rcv.pendiente);
	$("#RCV_coin_dilig").text(rcv.coin_dilig);
	$("#RCV_diligenciado").text(rcv.dil);

	// Suma los registros cop y rcv y asigna a las variables totales.
	cop_rcv.entregados = cuotas.asig + rcv.asignado;
	cop_rcv.req_pago = cuotas.dil + rcv.dil;
	cop_rcv.no_local = cuotas.inc_09 + rcv.inc_09;
	cop_rcv.embargo = cuotas.embargo + rcv.embargo;
	cop_rcv.citatorios = cuotas.citatorios + rcv.citatorio;

	// Para cop_rcv.notif guarda los registros que sean rcv o coin, con incidencia 2 y 31
	// que el resultado de la diligencia sea "NOTIFICACION".
	cop_rcv.notif = data.rales.filter(
		(obj) =>
			(obj.type === "rcv" || obj.type === "cop") &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.res_dil == "NOTIFICACIÓN"
	).length;

	// Muestra la información
	$("#COP_RCV_entregados").text(cop_rcv.entregados);
	$("#COP_RCV_req_pago").text(cop_rcv.req_pago);
	$("#COP_RCV_no_local").text(cop_rcv.no_local);
	$("#COP_RCV_embargo").text(cop_rcv.embargo);
	$("#COP_RCV_citatorios").text(cop_rcv.citatorios);
	$("#COP_RCV_notif").text(cop_rcv.notif);

	// Asigna fecha una nueva fecha con el valor del componente.
	fecha = new Date($("#dateCOPfrst").val());

	// Guarda en dates.pat_dilig, la suma de las variables.
	dates.pat_dilig =
		cuotas.dil +
		cuotas.inc_09 +
		cuotas.embargo +
		rcv.dil +
		rcv.inc_09 +
		rcv.embargo;

	// Guarda en las variables, la división correspondiente, se multiplica por 100, y se configura para tener dos decimales.
	dates.productividad = ((dates.pat_dilig / dates.dilig) * 100).toFixed(2);
	dates.ava_coin = ((cuotas.coin_dilig / cuotas.coin) * 100).toFixed(2);

	// Guarda en oports.dos, los registros de incidencia 2 o 31 con la oportunidad "En tiempo 2"
	oports.dos = data.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 2"
	).length;

	// Guarda en oports.tres_uno, los registros de incidencia 2 o 31 con la oportunidad "En tiempo 31"
	oports.tres_uno = data.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 31"
	).length;

	// Guarda en oports.fuera, los registros de incidencias 2 y 31 con oportunidad "Fuera de tiempo"
	oports.fuera = data.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) &&
			obj.oportunidad == "Fuera de tiempo"
	).length;

	// Guarda en el arreglo opor_docs de dates la operación agregando dos decimales.
	dates.opor_docs = (
		((oports.dos + oports.tres_uno) /
			(oports.dos + oports.tres_uno + oports.fuera)) *
		100
	).toFixed(2);

	// Guarda en imp.dos, los registros de incidencia 2 o 31 con la oportunidad "En tiempo 2", reduciendo el array obtenido.
	imp.dos = data.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 2"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);

	// Guarda en imp.tres_uno, los registros de incidencia 2 o 31 con la oportunidad "En tiempo 31", reduciendo el array obtenido.
	imp.tres_uno = data.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 31"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);

	// Guarda en imp.fuera, los registros de incidencia 2 y 31 con oportunidad "Fuera de tiempo", reduciendo el array obtenido.
	imp.fuera = data.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "Fuera de tiempo"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);

	// Guarda en el arreglo opor_imp de dates la operación agregando dos decimales.
	dates.opor_imp = (
		((imp.dos + imp.tres_uno) / (imp.dos + imp.tres_uno + imp.fuera)) *
		100
	).toFixed(2);

	// Suma las variables de dates convertidas en enteros y guarda en oport.
	dates.oport = (parseInt(dates.opor_docs) + parseInt(dates.opor_imp)) / 2;

	// Muestra la información en los labels correspondientes.
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

// Socket para consultar los registros rale cop
socket.on("servidor:consultarRegistrosRaleCOP", (data) => {
	// Limpia los div correspondientes, y agrega a dateCopfrst y dateCOPscnd la opción con valor en falso.
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
	// Se realiza un map a date para agregar componentes.
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

	// Se deshabilita el select de fecha.
	$("#dateCOPfrst").prop("disabled", false);
});

// Socket para consultar los registros rale rcv
socket.on("servidor:consultarRegistrosRaleRCV", (data) => {
	// Limpiar los div correspondientes y agregar en dateRCVfrst y dateRCVscnd una opción cuyo valor sea false.
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

	// Se realiza un map a date para agregar componentes.
	data.map((date) => {
		$("#dateRCVfrst").append(
			// No se asigna el option a variables porque solo puede hacer
			// append a un solo elemento y si se hace a un segundo se elimina del primero
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

	// Se deshabilita el select de fecha.
	$("#dateRCVfrst").prop("disabled", false);
});

// Socket para consultar los registros coin
socket.on("servidor:consultarRegistrosCoin", (data) => {
	// Limpia los div correspondientes y agrega en dateCOINfrst y dateCOINscnd una opción cuyo valor sea false.
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

	// Realiza un map a date para agregar componentes.
	data.map((date) => {
		// No se asigna el option a variables porque solo puede hacer
		// append a un solo elemento y si se hace a un segundo se elimina del primero
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
	// Se deshabilita el select de fecha.
	$("#dateCOINfrst").prop("disabled", false);
});

// Evento del boton btnListadoPatrones para cuando se de click sobre el
$("#btnListadoPatrones").on("click", function () {
	// Se evalua que dataStats tenga algo para emitir el socket, si no, manda una alerta.
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

// Hacemos un on change al div con el id div-frst-selects porque se crea dinamicamente
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
			) {
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
				socket.emit("cliente:ejecutorSeleccionadoEstInd", {
					ejecutor: $("#nombreEjecutor").val(),
					copDate: $("#dateCOPfrst").val(),
					rcvDate: $("#dateRCVfrst").val(),
					coinDate: $("#dateCOINfrst").val(),
				});
			}
		}
});

// Hacemos un on change al div con el id div-frst-selects porque se crea dinamicamente
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
			) {
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
				socket.emit("cliente:ejecutorSeleccionadoEstInd", {
					ejecutor: $("#nombreEjecutor").val(),
					copDate: $("#dateCOPfrst").val(),
					rcvDate: $("#dateRCVfrst").val(),
					coinDate: $("#dateCOINfrst").val(),
				});
			}
		}
});

// Hacemos un on change al div con el id div-frst-selects porque se crea dinamicamente
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
			) {
				bsAlert(
					"Se recomienda utilizar fechas iguales para evitar confusion a la hora de calcular los dias restantes",
					"warning"
				);
				socket.emit("cliente:ejecutorSeleccionadoEstInd", {
					ejecutor: $("#nombreEjecutor").val(),
					copDate: $("#dateCOPfrst").val(),
					rcvDate: $("#dateRCVfrst").val(),
					coinDate: $("#dateCOINfrst").val(),
				});
			}
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

// Hacemos un on change al div con el id div-scnd-selects, dateRCVscnd evalua que las fechas
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

// Función que llama al socket para la confronta y estadisticas individuales.
function getConfronta() {
	console.log($("#dateRCVscnd").val(), $("#dateCOPscnd").val());

	socket.emit("cliente:confrontaEstInd", {
		ejecutor: $("#nombreEjecutor").val(),
		copDate: $("#dateCOPscnd").val(),
		rcvDate: $("#dateRCVscnd").val(),
	});
}

// Función para generar y llenar diámicamente elementos de filtro basandose en dataStats.rales.
function fillFilters() {
	// Deshabilira componentes y limpia el div correspondiente.
	$("#inc_fil").empty();
	$("#btn_fil_inc").prop("disabled", false);
	$("#btn_fil_con").prop("disabled", false);
	$("#btn_fil_res").prop("disabled", false);
	// Crea instancias del objeto iterable y recude a un sólo valor
	// añade al objeto y retorna.
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
	// Ordena de mayor a menor los elementos del array inc, con y res.
	inc.sort(function (a, b) {
		return a - b;
	});
	con.sort(function (a, b) {
		a.localeCompare(b);
	});
	res.sort(function (a, b) {
		a.localeCompare(b);
	});

	// Realiza el map de las incidencias, modifica loa componentes y agrega a inc_fil
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

	// Realiza un map a con, modifica los componentes y agrega a con_fil.
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

	// Realizaun map a res, modifica los componentes y agrega a res_fil.
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

// Función para obtener los filtros y llenar el objeto cuotas.
function fillStats() {
	// Guarda en cuotas.asign las cuotas con incidencia 2 o 31.
	cuotas.asig = dataStats.rales.filter(
		(obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
	).length;

	// Guarda en cuotas.pen las cuotas con incidencia 2 o 31 y no han sido cobradas.
	cuotas.pen = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc == 2 || obj.inc == 31) &&
			!obj.cobrado
	).length;

	// Guarda en cuotas.coin las cuotas con incidencia 2 o 31  y que los valores de rale y coin coincidan.
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

	// Guarda en cuotas.coin_dilig las cuotas con incidencia 2 o 31
	// y que los valores de rale y coin coincidan y han sido cobrados
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

	// Guarda en cuotas.dil las cuotas con incidencia 2 o 31 y han sido cobradas.
	cuotas.dil = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.cobrado
	).length;

	// Guarda en cuotas.inc_09 las cuotas con incidencia 9.
	cuotas.inc_09 = dataStats.rales.filter(
		(obj) => obj.inc === 9 && obj.type === "cuotas"
	).length;

	// Guarda en cuotas.embargo las cuotas con incidencia 2 o 31
	// y con resultado de diligenciamiento 33 o 43.
	cuotas.embargo = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc == 2 || obj.inc == 31) &&
			(obj.res_dil == 33 || obj.res_dil == 43)
	).length;

	// Guarda en cuotas.citatorios las cuotas con incidencia 2 o 31
	// y que el resultado de diligenciamiento sea citatorio.
	cuotas.citatorios = dataStats.rales.filter(
		(obj) =>
			obj.type === "cuotas" &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.res_dil == "citatorio"
	).length;

	// Agrega la información a los componentes correspondientes.
	$("#CUOTAS_asignado").text(cuotas.asig);
	$("#CUOTAS_pendiente").text(cuotas.pen);
	$("#CUOTAS_coin").text(cuotas.coin);
	$("#CUOTAS_coin_dilig").text(cuotas.coin_dilig);
	$("#CUOTAS_diligenciado").text(cuotas.dil);
	$("#CUOTAS_inc_09").text(cuotas.inc_09);
	$("#CUOTAS_embargo").text(cuotas.embargo);
	$("#CUOTAS_citatorios").text(cuotas.citatorios);

	// Filtra los regitros rcv con incidencias 2 o 31 y guarda en rcv.asignado
	rcv.asignado = dataStats.rales.filter(
		(obj) => obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31)
	).length;
	rcv.pendiente = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			!obj.cobrado
	).length;

	// Filtra los regitros rcv con incidencias 2 o 31
	// que los valores de rale y coin coincidan y guarda en rcv.coin
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

	// Filtra los regitros rcv con incidencias 2 o 31 que los valores
	// de rale y coin coincidan y han sido cobrados y guarda en rcv.coin_dilig 
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

	// Filtra los regitros rcv con incidencias 2 o 31 y han sido cobrados y guarda en rcv.dil.
	rcv.dil = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31) && obj.cobrado
	).length;

	// Filtra los regitros rcv con incidencias 9 y guarda en rcv.inc_09.
	rcv.inc_09 = dataStats.rales.filter(
		(obj) => obj.inc === 9 && obj.type === "rcv"
	).length;

	// Filtra los regitros rcv con incidencias 2 o 31 y con resultado
	// de diligenciamiento 33 o 43 y guarda en rcv.embargo.
	rcv.embargo = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			(obj.res_dil == 33 || obj.res_dil == 43)
	).length;

	// Filtra los regitros rcv con incidencias 2 o 31 y que el resultado
	// de diligenciamiento sea citatorio y guarda en rcv.citatorio.
	rcv.citatorio = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.res_dil == "citatoio"
	).length;

	// Muestra la información en los componentes correspondientes.
	$("#RCV_asignado").text(rcv.asignado);
	$("#RCV_pendiente").text(rcv.pendiente);
	$("#RCV_coin").text(rcv.coin);
	$("#RCV_coin_dilig").text(rcv.coin_dilig);
	$("#RCV_diligenciado").text(rcv.dil);
	$("#RCV_inc_09").text(rcv.inc_09);
	$("#RCV_embargo").text(rcv.embargo);
	$("#RCV_citatorios").text(rcv.citatorio);

	// Realiza la suma se las cuotas y el rcv y guarda en las variables correspondientes.
	cop_rcv.entregados = cuotas.asig + rcv.asignado;
	cop_rcv.req_pago = cuotas.dil + rcv.dil;
	cop_rcv.no_local = cuotas.inc_09 + rcv.inc_09;
	cop_rcv.embargo = cuotas.embargo + rcv.embargo;
	cop_rcv.citatorios = cuotas.citatorios + rcv.citatorio;
	cop_rcv.notif = dataStats.rales.filter(
		(obj) =>
			(obj.type === "rcv" || obj.type === "cop") &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.res_dil == "NOTIFICACIÓN"
	).length;

	// Muestra la información en los componentes correspondientes.
	$("#COP_RCV_entregados").text(cop_rcv.entregados);
	$("#COP_RCV_req_pago").text(cop_rcv.req_pago);
	$("#COP_RCV_no_local").text(cop_rcv.no_local);
	$("#COP_RCV_embargo").text(cop_rcv.embargo);
	$("#COP_RCV_citatorios").text(cop_rcv.citatorios);
	$("#COP_RCV_notif").text(cop_rcv.notif);

	// Guarda en la variable fecha el valor de dateCOPfrst
	fecha = new Date($("#dateCOPfrst").val());

	// Guarda en la variable dates.fec_ini, los resultados de llamar las funciones
	// y agrega el formato para el dia, mes y año.
	dates.fec_ini = new Date(
		fecha.getFullYear(),
		fecha.getMonth(),
		1
	).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	// Guarda en la variable dates.fec_fin, los resultados de llamar las funciones
	// y agrega el formato para el dia, mes y año.
	dates.fec_fin = new Date(
		fecha.getFullYear(),
		fecha.getMonth() + 1,
		0
	).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	// Guarda en dates.laborales la resta de la fecha con lo que tiene días laborales
	// Si dias laborales no tiene nada, es cero.
	dates.laborales =
		getWorkDays(fecha.getMonth(), fecha.getFullYear()).length -
		($("#inp_DATES_fes").val() != "" ? $("#inp_DATES_fes").val() : 0);

	// Guarda en dates.dilig, la multiplicación de dates.laborales por 5.
	dates.dilig = dates.laborales * 5;

	// Guarda en dates.pat_dilig, la suma de las variables de cuotas y rcv.
	dates.pat_dilig =
		cuotas.dil +
		cuotas.inc_09 +
		cuotas.embargo +
		rcv.dil +
		rcv.inc_09 +
		rcv.embargo;

	// Guarda en las variables dates.productividad, dates.ava_coin la división y define como dos decimales.
	dates.productividad = ((dates.pat_dilig / dates.dilig) * 100).toFixed(2);
	dates.ava_coin = ((cuotas.coin_dilig / cuotas.coin) * 100).toFixed(2);

	// Guarda en la variable oports.dos los registros de incidencias 2 o 31 y oportunidad "En tiempo 2"
	oports.dos = dataStats.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 2"
	).length;

	// Guarda en la variable oports.tres_uno los registros de incidencias 2 o 31 y oportunidad "En tiempo 31"
	oports.tres_uno = dataStats.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 31"
	).length;

	// Guarda en la variable oports.fuera los registros de incidencias 2 o 31 y oportunidad "Fuera de tiempo"
	oports.fuera = dataStats.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) &&
			obj.oportunidad == "Fuera de tiempo"
	).length;

	// Realiza la división de los registros y define dos decimales.
	dates.opor_docs = (
		((oports.dos + oports.tres_uno) /
			(oports.dos + oports.tres_uno + oports.fuera)) *
		100
	).toFixed(2);

	// Filtra los registros de incidencias 2 o 31 y oportunidad "En tiempo 2"
	// Reduce para que sea un sólo registro y guarda en imp.dos
	imp.dos = dataStats.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 2"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);

	// Filtra los registros de incidencias 2 o 31 y oportunidad "En tiempo 31"
	// Reduce para que sea un sálo registro y guarda en imp.tres_uno.
	imp.tres_uno = dataStats.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 31"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);

	// Filtra los registros de incidencias 2 o 31 y oportunidad "Fuera de tiempo"
	// Reduce para que sea un sálo registro y guarda en imp.fuera.
	imp.fuera = dataStats.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "Fuera de tiempo"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);

	// Realiza las operaciones con las variables y agrega dos decimales.
	dates.opor_imp = (
		((imp.dos + imp.tres_uno) / (imp.dos + imp.tres_uno + imp.fuera)) *
		100
	).toFixed(2);
	dates.oport = (parseInt(dates.opor_docs) + parseInt(dates.opor_imp)) / 2;

	// Muestra la información en los componentes correspondientes
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

	showGraphics("canvas-coin-31", dates.ava_coin, "coin");
	showGraphics("canvas-prod-ind", dates.productividad, "prod");
}

// Función para mostrar gráficos
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

// Función para obtener gráficos
async function getGraphics() {
	// Configura visualmente los graficos.
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

// Función para obtener los días laborables
function getWorkDays(month, year) {
	const days = [];
	const date = new Date(year, month, 1);

	// Realiza un ciclo que recorra los días del mes y los añade al array
	// si los días son distintos a sabados y domingos.
	while (date.getMonth() === month) {
		const day = date.getDay();
		if (day !== 0 && day !== 6) {
			days.push(new Date(date));
		}
		date.setDate(date.getDate() + 1);
	}
	return days;
}

// Función para actualizar los filtros
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

// Función para mostrar la tabla de estadísticas individuales
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
}
