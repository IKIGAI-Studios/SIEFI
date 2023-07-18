const socket = io("http://localhost:3000");

// Variables globales. 
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

// Socket para inicializar variables, deshabilitar botones inicialmente y llamar funciones.   
socket.on("servidor:estIndividuales", ({ data }) => {
	dataStats = data;
	fillFilters();
	showTable("inicio");
	fillStats();
	$("#dateCOPscnd").prop("disabled", false);
	$("#dateRCVscnd").prop("disabled", false);
	$("#dateCOINscnd").prop("disabled", false);
});

// Socket para crear las estadisticas individuales. 
socket.on("servidor:estIndividualesConfronta", ({ data }) => {
  confronta = data;
  var encontrado = false;

  // Recorrer el objeto dataStats, agregando al objeto rales, dentro de dataStats los registros. 
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

    // Si no fue encotrado agrega el registro al arreglo correspondiente
    if (!encontrado) regFal.rales.push(dataStats.rales[i]);
  }

  // Contabiliza la cantidad de registros con incidencia 2 y 31 y asiga a cuotas asign. 
  cuotas.asig = data.rales.filter(
    (obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
  ).length;

  // Contabiliza la cantidad de registros con incidencia 2 y 31 y asiga a cuotas pen.
  cuotas.pen = data.rales.filter(
    (obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
  ).length;

  // Contabiliza la cantidad de registros con incidencia 2 y 31 y que no esten en el objeto cobrado y asiga a cuotas pen.
  cuotas.pen = data.rales.filter(
    (obj) =>
      obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31) && !obj.cobrado
  ).length;

  //  Cuotas coin diligenciado. 
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

    //  Cuotas diligenciado.
  cuotas.dil = regFal.rales.filter(
    (obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
  ).length;

  // Insertar cuotas diligenciados. 
  $("#CUOTAS_asignado").text(cuotas.asig);
  $("#CUOTAS_pendiente").text(cuotas.pen);
  $("#CUOTAS_coin_dilig").text(cuotas.coin_dilig);
  $("#CUOTAS_diligenciado").text(cuotas.dil);

  // Contabilizar los registros que el tipo sea rcv y la incidencia 2 o 31, y guardar en rcv asignado. 
  rcv.asignado = data.rales.filter(
    (obj) => obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31)
  ).length;

  // Contabilizar los registros que el tipo sea rcv y la incidencia 2 o 31, y guardar en rcv pendiente. 
  rcv.pendiente = data.rales.filter(
    (obj) =>
      obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31) && !obj.cobrado
  ).length;

  // Rcv coin diligenciado
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

    // Rcv diligenciado.
  rcv.dil = regFal.rales.filter(
    (obj) => obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31)
  ).length;

  // Insertar rcv diligenciados.
  $("#RCV_asignado").text(rcv.asignado);
  $("#RCV_pendiente").text(rcv.pendiente);
  $("#RCV_coin_dilig").text(rcv.coin_dilig);
  $("#RCV_diligenciado").text(rcv.dil);

  // Obtener el totol de los registros de cuotas y rcv
  cop_rcv.entregados = cuotas.asig + rcv.asignado;
  cop_rcv.req_pago = cuotas.dil + rcv.dil;
  cop_rcv.no_local = cuotas.inc_09 + rcv.inc_09;
  cop_rcv.embargo = cuotas.embargo + rcv.embargo;
  cop_rcv.citatorios = cuotas.citatorios + rcv.citatorio;

  // Contabilizar los registros de notificaciones
  cop_rcv.notif = data.rales.filter(
    (obj) =>
      (obj.type === "rcv" || obj.type === "cop") &&
      (obj.inc == 2 || obj.inc == 31) &&
      obj.res_dil == "NOTIFICACIÓN"
  ).length;

  // Insertar los totales de los registros. 
  $("#COP_RCV_entregados").text(cop_rcv.entregados);
  $("#COP_RCV_req_pago").text(cop_rcv.req_pago);
  $("#COP_RCV_no_local").text(cop_rcv.no_local);
  $("#COP_RCV_embargo").text(cop_rcv.embargo);
  $("#COP_RCV_citatorios").text(cop_rcv.citatorios);
  $("#COP_RCV_notif").text(cop_rcv.notif);

	fecha = new Date($("#dateCOPfrst").val());

  // Obtener las fechas, y generar la oportunidad en en base a las incidencias 
  dates.pat_dilig =
    cuotas.dil +
    cuotas.inc_09 +
    cuotas.embargo +
    rcv.dil +
    rcv.inc_09 +
    rcv.embargo;
  dates.productividad = ((dates.pat_dilig / dates.dilig) * 100).toFixed(2);
  dates.ava_coin = ((cuotas.coin_dilig / cuotas.coin) * 100).toFixed(2);
  oports.dos = data.rales.filter(
    (obj) => (obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 2"
  ).length;
  oports.tres_uno = data.rales.filter(
    (obj) =>
      (obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 31"
  ).length;
  oports.fuera = data.rales.filter(
    (obj) =>
      (obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "Fuera de tiempo"
  ).length;
  dates.opor_docs = (
    ((oports.dos + oports.tres_uno) /
      (oports.dos + oports.tres_uno + oports.fuera)) *
    100
  ).toFixed(2);
  imp.dos = data.rales
    .filter(
      (obj) =>
        (obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 2"
    )
    .reduce((acumulador, obj) => acumulador + obj.importe, 0);
  imp.tres_uno = data.rales
    .filter(
      (obj) =>
        (obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 31"
    )
    .reduce((acumulador, obj) => acumulador + obj.importe, 0);
  imp.fuera = data.rales
    .filter(
      (obj) =>
        (obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "Fuera de tiempo"
    )
    .reduce((acumulador, obj) => acumulador + obj.importe, 0);
  dates.opor_imp = (
    ((imp.dos + imp.tres_uno) / (imp.dos + imp.tres_uno + imp.fuera)) *
    100
  ).toFixed(2);
  dates.oport = (parseInt(dates.opor_docs) + parseInt(dates.opor_imp)) / 2;

  // Inseertar los dato.
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
	showTable("confronta");
});

// Socket para consultar los registros de Rale Cop 
socket.on("servidor:consultarRegistrosRaleCOP", (data) => {
  // Limpiar los div correspondientes, y agregar al div dateCopfrst información. 
  $("#dateCOPfrst").empty();
  $("#dateCOPscnd").empty();
  $("#dateCOPfrst").append(
    $("<option>", {
      text: "Selecciona una fecha para Rale COP",
      value: false,
    })
  );
  // Agregar al div dateCopscnd información.
  $("#dateCOPscnd").append(
    $("<option>", {
      text: "Selecciona una fecha para Rale COP",
      value: false,
    })
  );
  data.map((date) => {
    // No se asigna el option a variables porque solo puede hacer
    // append a un solo elemento y si se hace a un segundo se elimina del primero
    // Agregar al div dateCopfrst información. 
    $("#dateCOPfrst").append(
      $("<option>", {
        value: date,
        text: date,
      })
    );
    // Agregar al div dateCopscnd información.
    $("#dateCOPscnd").append(
      $("<option>", {
        value: date,
        text: date,
      })
    );
  });
  // Deshabilitar el primer select, ya que ya se cargaron las fechas.
  $("#dateCOPfrst").prop("disabled", false);
});

// Socket para consultar los registros de Rale RCV 
socket.on("servidor:consultarRegistrosRaleRCV", (data) => {
  // Limpiar los div correspondientes, y agregar al div dateCopfrst información.
  $("#dateRCVfrst").empty();
  $("#dateRCVscnd").empty();
  $("#dateRCVfrst").append(
    $("<option>", {
      text: "Selecciona una fecha para Rale RCV",
      value: false,
    })
  );
  // Agregar al div dateRCVscnd información.
  $("#dateRCVscnd").append(
    $("<option>", {
      text: "Selecciona una fecha para Rale RCV",
      value: false,
    })
  );
  data.map((date) => {
    // Agregar al div dateRCVfrst información.
    $("#dateRCVfrst").append(
      $("<option>", {
        value: date,
        text: date,
      })
    );
    // Agregar al div dateRCVscnd información.
    $("#dateRCVscnd").append(
      $("<option>", {
        value: date,
        text: date,
      })
    );
  });
  // Deshabilitar el primer select, ya que ya se cargaron las fechas.
  $("#dateRCVfrst").prop("disabled", false);
});

// Socket para consultar los registros de COIN
socket.on("servidor:consultarRegistrosCoin", (data) => {
  // Limpiar los div correspondientes, y agregar al div dateCOINscnd información.
  $("#dateCOINscnd").empty();
  $("#dateCOINfrst").empty();
  $("#dateCOINscnd").append(
    $("<option>", {
      text: "Selecciona una fecha para COIN",
      value: false,
    })
  );
  // Agregar al div dateCOINfrst información.
  $("#dateCOINfrst").append(
    $("<option>", {
      text: "Selecciona una fecha para COIN",
      value: false,
    })
  );
  data.map((date) => {
    // Agregar al div dateCOINscnd información. 
    $("#dateCOINscnd").append(
      $("<option>", {
        value: date,
        text: date,
      })
    );
    // Agregar al div dateCOINfrst información.
    $("#dateCOINfrst").append(
      $("<option>", {
        value: date,
        text: date,
      })
    );
  });
  // Deshabilitar el primer select, ya que ya se cargaron las fechas.
  $("#dateCOINfrst").prop("disabled", false);
});

// Agregar el evento para cuando el botón generar listado de patrones sea seleccionado 
$('#btnListadoPatrones').on('click', function () {
  socket.emit('cliente:generarListadoPatrones', { dataStats }, $('#switchOrdenar').prop('checked'), $("#nombreEjecutor").val(), (response) => {
       // Crear un objeto Blob con los datos del archivo PDF
       const blob = new Blob([response.fileData], { type: 'application/pdf' });

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

  // Se evalua si las fechas seleccionadas son iguales para evitar que se calcule
  // los dias restantes cuando se seleccionan fechas diferentes
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
        // Se manda al socket los valores de los inputs correspondientes. 
        socket.emit("cliente:ejecutorSeleccionadoEstInd", {
          ejecutor: $("#nombreEjecutor").val(),
          copDate: $("#dateCOPfrst").val(),
          rcvDate: $("#dateRCVfrst").val(),
          coinDate: $("#dateCOINfrst").val(),
        });
      }
    }
});

// Se realiza un on change al div con el id dateRCV porque se crea dinamicamente
$("#div-frst-selects").on("change", "#dateRCVfrst", function () {
	$("#btn_fil_inc").prop("disabled", true);
	$("#btn_fil_res").prop("disabled", true);
	$("#btn_fil_con").prop("disabled", true);

  $("#dateRCVscnd option").prop("disabled", false);
  $(`#dateRCVscnd option[value="${$(this).val()}"]`).prop(
    "disabled",
    $(this).val() != "false"
  );
  // Se evalua si las fechas seleccionadas son iguales para evitar que se calcule
  // los dias restantes cuando se seleccionan fechas diferentes
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
        // Se manda al socket los valores de los inputs correspondientes.
        socket.emit("cliente:ejecutorSeleccionadoEstInd", {
          ejecutor: $("#nombreEjecutor").val(),
          copDate: $("#dateCOPfrst").val(),
          rcvDate: $("#dateRCVfrst").val(),
          coinDate: $("#dateCOINfrst").val(),
        });
      }
    }
});

// Se realiza un on change al div con el id dateCOIN porque se crea dinamicamente
$("#div-frst-selects").on("change", "#dateCOINfrst", function () {
	$("#btn_fil_inc").prop("disabled", true);
	$("#btn_fil_res").prop("disabled", true);
	$("#btn_fil_con").prop("disabled", true);

  $("#dateCOINscnd option").prop("disabled", false);
  $(`#dateCOINscnd option[value="${$(this).val()}"]`).prop(
    "disabled",
    $(this).val() != "false"
  );
  // Se evalua si las fechas seleccionadas son iguales para evitar que se calcule
  // los dias restantes cuando se seleccionan fechas diferentes
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
        // Se manda al socket los valores de los inputs correspondientes.
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
// Se realiza un on change al div con el id div-scnd-selects porque se crea dinamicamente
$("#div-scnd-selects").on("change", "#dateCOPscnd", function () {
  $("#dateCOPfrst option").prop("disabled", false);
  $(`#dateCOPfrst option[value="${$(this).val()}"]`).prop(
    "disabled",
    $(this).val() != "false"
  );
  // Se evalua si las fechas seleccionadas son iguales para evitar que se calcule
  // los dias restantes cuando se seleccionan fechas diferentes
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

// Se realiza un on change al div con el id div-scnd-selects porque se crea dinamicamente. 
$("#div-scnd-selects").on("change", "#dateRCVscnd", function () {
  $("#dateRCVfrst option").prop("disabled", false);
  $(`#dateRCVfrst option[value="${$(this).val()}"]`).prop(
    "disabled",
    $(this).val() != "false"
  );
  // Se evalua si las fechas seleccionadas son iguales para evitar que se calcule
  // los dias restantes cuando se seleccionan fechas diferentes
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

// Se realiza un on change al div con el id inp_DATES_fes porque se crea dinamicamente. 
$("#inp_DATES_fes").on("change", function () {
	if (
		$("#dateCOPfrst").val() == "false" ||
		$("#dateRCVfrst").val() == "false"
	)
		return;
	if ($(this).val() == "")
		bsAlert("Inserta un número en los dias festivos", "warning");
	else {
		dates.laborales =
			getWorkDays(fecha.getMonth(), fecha.getFullYear()).length -
			($("#inp_DATES_fes").val() != "" ? $("#inp_DATES_fes").val() : 0);
		dates.dilig = dates.laborales * 5 < 0 ? 0 : dates.laborales * 5;
		$("#DATES_laborales").text(dates.laborales);
		$("#DATES_dilig").text(dates.dilig);
		showGraphics("canvas-prod-ind", dates.productividad, "prod");
	}
});

// Función para llamar un socket, enviando como valores, los valores de los inputs correspondientes.
function getConfronta() {
  console.log($("#dateRCVscnd").val(), $("#dateCOPscnd").val());
  socket.emit("cliente:confrontaEstInd", {
    ejecutor: $("#nombreEjecutor").val(),
    copDate: $("#dateCOPscnd").val(),
    rcvDate: $("#dateRCVscnd").val(),
  });
}

// Función para llenar los filtros de incidencias
function fillFilters() {
  $("#inc_fil").empty();
  $("#btn_fil_inc").prop("disabled", false);
  $("#btn_fil_con").prop("disabled", false);
  $("#btn_fil_res").prop("disabled", false);

  // Obtiene los datos únicos de la propiedad inc de dataStats.rales y guarda en inc. 
  inc = Array.from(
    dataStats.rales.reduce(function (res, obj) {
      res.add(obj.inc);
      return res;
    }, new Set())
  );

  // Obtiene los datos únicos de la propiedad con de dataStats.rales y guarda en con. 
  con = Array.from(
    dataStats.rales.reduce(function (res, obj) {
      res.add(obj.type);
      return res;
    }, new Set())
  );

  // Obtiene los datos únicos de la propiedad res de dataStats.rales y guarda en res. 
  res = Array.from(
    dataStats.rales.reduce(function (res, obj) {
      if (obj.res_dil) res.add(obj.res_dil);
      return res;
    }, new Set())
  );

  // Ordena los resultados por inc, con y res. 
  inc.sort(function (a, b) {
    return a - b;
  });
  con.sort(function (a, b) {
    a.localeCompare(b);
  });
  res.sort(function (a, b) {
    a.localeCompare(b);
  });

  // Realiza al inc un map, y agrega al div información con formato. 
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
                    updateFilters("inc", data, $(this).is(":checked"));
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

  // Realiza al con un map, y agrega al div información con formato.
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
                    updateFilters("con", data, $(this).is(":checked"));
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

  // Realiza al res un map, y agrega al div información con formato.
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
                    updateFilters("res", data, $(this).is(":checked"));
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

// Se encarga de actualizar los filtros de incidencias, dependiendo de si el checkbox está activo o no.
function fillStats() {
  // Contabilizar las cuotas asign y asignarlas a cuotas.asig. 
  cuotas.asig = dataStats.rales.filter(
    (obj) => obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31)
  ).length;
  // Contabilizar las cuotas pen y asignarlas a cuotas.pen.
  cuotas.pen = dataStats.rales.filter(
    (obj) =>
      obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31) && !obj.cobrado
  ).length;
  // Contabilizar las cuotas coin y asignarlas a cuotas.coin si las incidencias son 2 o 31, si el tipo es cuotas
  // y si el rale tiene reg_pat igual al reg_pat de la coin y si el rale tiene nom_cred igual al num_credito de la coin.
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

  // Contabilizar las cuotas coin dilig y asignarlas a cuotas.coin_dilig si las incidencias son 2 o 31, si el tipo es cuotas
  // y si el rale tiene reg_pat igual al reg_pat de la coin y si el rale tiene nom_cred igual al num_credito de la coin.
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
  cuotas.dil = dataStats.rales.filter(
    (obj) =>
      obj.type === "cuotas" && (obj.inc == 2 || obj.inc == 31) && obj.cobrado
  ).length;
  cuotas.inc_09 = dataStats.rales.filter(
    (obj) => obj.inc === 9 && obj.type === "cuotas"
  ).length;
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
  $("#CUOTAS_asignado").text(cuotas.asig);
  $("#CUOTAS_pendiente").text(cuotas.pen);
  $("#CUOTAS_coin").text(cuotas.coin);
  $("#CUOTAS_coin_dilig").text(cuotas.coin_dilig);
  $("#CUOTAS_diligenciado").text(cuotas.dil);
  $("#CUOTAS_inc_09").text(cuotas.inc_09);
  $("#CUOTAS_embargo").text(cuotas.embargo);
  $("#CUOTAS_citatorios").text(cuotas.citatorios);

	rcv.asignado = dataStats.rales.filter(
		(obj) => obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31)
	).length;
	rcv.pendiente = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			!obj.cobrado
	).length;
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
	rcv.dil = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" && (obj.inc == 2 || obj.inc == 31) && obj.cobrado
	).length;
	rcv.inc_09 = dataStats.rales.filter(
		(obj) => obj.inc === 9 && obj.type === "rcv"
	).length;
	rcv.embargo = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			(obj.res_dil == 33 || obj.res_dil == 43)
	).length;
	rcv.citatorio = dataStats.rales.filter(
		(obj) =>
			obj.type === "rcv" &&
			(obj.inc == 2 || obj.inc == 31) &&
			obj.res_dil == "citatoio"
	).length;

	$("#RCV_asignado").text(rcv.asignado);
	$("#RCV_pendiente").text(rcv.pendiente);
	$("#RCV_coin").text(rcv.coin);
	$("#RCV_coin_dilig").text(rcv.coin_dilig);
	$("#RCV_diligenciado").text(rcv.dil);
	$("#RCV_inc_09").text(rcv.inc_09);
	$("#RCV_embargo").text(rcv.embargo);
	$("#RCV_citatorios").text(rcv.citatorio);

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

	$("#COP_RCV_entregados").text(cop_rcv.entregados);
	$("#COP_RCV_req_pago").text(cop_rcv.req_pago);
	$("#COP_RCV_no_local").text(cop_rcv.no_local);
	$("#COP_RCV_embargo").text(cop_rcv.embargo);
	$("#COP_RCV_citatorios").text(cop_rcv.citatorios);
	$("#COP_RCV_notif").text(cop_rcv.notif);

	fecha = new Date($("#dateCOPfrst").val());

	dates.fec_ini = new Date(
		fecha.getFullYear(),
		fecha.getMonth(),
		1
	).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	dates.fec_fin = new Date(
		fecha.getFullYear(),
		fecha.getMonth() + 1,
		0
	).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	dates.laborales =
		getWorkDays(fecha.getMonth(), fecha.getFullYear()).length -
		($("#inp_DATES_fes").val() != "" ? $("#inp_DATES_fes").val() : 0);
	dates.dilig = dates.laborales * 5;
	dates.pat_dilig =
		cuotas.dil +
		cuotas.inc_09 +
		cuotas.embargo +
		rcv.dil +
		rcv.inc_09 +
		rcv.embargo;
	dates.productividad = ((dates.pat_dilig / dates.dilig) * 100).toFixed(2);
	dates.ava_coin = ((cuotas.coin_dilig / cuotas.coin) * 100).toFixed(2);
	oports.dos = dataStats.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 2"
	).length;
	oports.tres_uno = dataStats.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) && obj.oportunidad == "En tiempo 31"
	).length;
	oports.fuera = dataStats.rales.filter(
		(obj) =>
			(obj.inc == 2 || obj.inc == 31) &&
			obj.oportunidad == "Fuera de tiempo"
	).length;
	dates.opor_docs = (
		((oports.dos + oports.tres_uno) /
			(oports.dos + oports.tres_uno + oports.fuera)) *
		100
	).toFixed(2);
	imp.dos = dataStats.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 2"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);
	imp.tres_uno = dataStats.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "En tiempo 31"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);
	imp.fuera = dataStats.rales
		.filter(
			(obj) =>
				(obj.inc == 2 || obj.inc == 31) &&
				obj.oportunidad == "Fuera de tiempo"
		)
		.reduce((acumulador, obj) => acumulador + obj.importe, 0);
	dates.opor_imp = (
		((imp.dos + imp.tres_uno) / (imp.dos + imp.tres_uno + imp.fuera)) *
		100
	).toFixed(2);
	dates.oport = (parseInt(dates.opor_docs) + parseInt(dates.opor_imp)) / 2;

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

// Función para obtener los días laborales
function getWorkDays(month, year) {
  // Define a la variable date, los valores recibidos en la función. 
  const days = [];
  const date = new Date(year, month, 1);

  // Evalua si al obtener el día diferente a sábado o domingo y agregarlo a la lista days. 
  while (date.getMonth() === month) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      days.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function updateFilters(group, n, act) {
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
