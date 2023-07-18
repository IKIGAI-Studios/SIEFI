/**
 * Valida un RFC ingresado por el usuario.
 */
function validarRFC() {
	/**
	 * Obtén el valor del campo de texto del RFC.
	 * @type {string}
	 */
	var rfc = document.getElementById("rfc").value;

	/**
	 * Verifica la longitud del RFC y muestra una alerta en caso de ser inválido.
	 */
	if (rfc.length <= 11 || rfc.length >= 14) {
		/**
		 * Limpia el campo de texto del RFC.
		 */
		document.getElementById("rfc").value = "";

		/**
		 * Muestra una alerta indicando que se debe ingresar un RFC válido.
		 * @param {string} message - El mensaje de la alerta.
		 * @param {string} type - El tipo de alerta (por ejemplo, "warning").
		 */
		bsAlert("Ingresa un RFC válido", "warning");
	}
}

/**
 * Valida un código postal ingresado por el usuario.
 */
function validarCP() {
	/**
	 * Obtén el valor del campo de texto del código postal.
	 * @type {string}
	 */
	var cp = document.getElementById("cp").value;

	/**
	 * Verifica la longitud del código postal y muestra una alerta en caso de ser inválido.
	 */
	if (cp.length <= 4 || cp.length >= 6) {
		/**
		 * Limpia el campo de texto del código postal.
		 */
		document.getElementById("cp").value = "";

		/**
		 * Muestra una alerta indicando que se debe ingresar un código postal válido.
		 * @param {string} message - El mensaje de la alerta.
		 * @param {string} type - El tipo de alerta (por ejemplo, "warning").
		 */
		bsAlert("Ingresa un código postal válido", "warning");
	}
}

/**
 * Se ejecuta cuando se selecciona un elemento.
 * @param {string} usuEjecutores - JSON que contiene los ejecutores disponibles.
 */
function itemSeleccionado(usuEjecutores) {
	/**
	 * Convierte el JSON de ejecutores en un objeto.
	 * @type {Array<Object>}
	 */
	usuEjecutores = JSON.parse(usuEjecutores);

	/**
	 * Muestra en la consola los ejecutores disponibles.
	 */
	console.log(usuEjecutores);

	/**
	 * Obtiene el valor del campo de texto de ejecutor seleccionado.
	 * @type {string}
	 */
	var nombre = document.getElementById("ejecutorS").value;

	/**
	 * Muestra en la consola el nombre del ejecutor seleccionado.
	 */
	console.log(nombre);

	/**
	 * Almacena la información del ejecutor seleccionado.
	 * @type {Object}
	 */
	var ejecutor = {};

	/**
	 * Busca el ejecutor con el nombre seleccionado y almacena su información en la variable 'ejecutor'.
	 */
	for (var i = 0; i < usuEjecutores.length; i++) {
		if (usuEjecutores[i].nombre == nombre) {
			ejecutor = usuEjecutores[i];
			break;
		}
	}

	/**
	 * Muestra en la consola la información del ejecutor seleccionado.
	 */
	console.log(ejecutor);

	/**
	 * Actualiza los valores de los campos del formulario con la información del ejecutor seleccionado.
	 */
	document.getElementById("clave_eje").value = ejecutor.clave_eje;
	document.getElementById("ejecutor").value = ejecutor.nombre;
}
