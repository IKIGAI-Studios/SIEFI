function validarRFC() {
  var rfc = document.getElementById("rfc").value;

  if (rfc.length <= 11 || rfc.length >= 14) {
    document.getElementById("rfc").value = "";
    bsAlert("Ingresa un RFC válido", "warning");
  }
}

function validarCP() {
  var cp = document.getElementById("cp").value;
  if (cp.length <= 4 || cp.length >= 6) {
    document.getElementById("cp").value = "";
    bsAlert("Ingresa un código postal válido", "warning");
  }
}
function itemSeleccionado(usuEjecutores) {
  usuEjecutores = JSON.parse(usuEjecutores);
  console.log(usuEjecutores);
  var nombre = document.getElementById("ejecutorS").value; // Obtener la clave seleccionada
  console.log(nombre);
  var ejecutor = {}; // Variable para almacenar la información del ejecutor seleccionado

  // Buscar el ejecutor con la clave seleccionada y almacenar su información en la variable 'ejecutor'
  for (var i = 0; i < usuEjecutores.length; i++) {
    if (usuEjecutores[i].nombre == nombre) {
      ejecutor = usuEjecutores[i];
      break;
    }
  }

  console.log(ejecutor);

  // Actualizar los valores de los campos del formulario con la información del ejecutor seleccionado
  document.getElementById("clave_eje").value = ejecutor.clave_eje;
  document.getElementById("ejecutor").value = ejecutor.nombre;
}
