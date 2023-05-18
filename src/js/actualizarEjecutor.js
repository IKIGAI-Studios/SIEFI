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


    if (ejecutor.type == 'ejecutor') {
        document.getElementById("ejecutor").selected = true;
    }
    if (ejecutor.type == 'admin') {
        document.getElementById("admin").selected = true;
    }

    if (ejecutor.status == '0') {
        document.getElementById("deshabilitado").checked = true;
    }
    if (ejecutor.status == '1') {
        document.getElementById("habilitado").checked = true;
    }

}

function statusSeleccionado() {
    if ((document.getElementById("deshabilitado").checked) == true) {
        document.getElementById("status").value = '0';
    }
    if ((document.getElementById("habilitado").checked) == true) {
        document.getElementById("status").value = '1';
    }
}

function tipoSeleccionado() {
    var tipo = document.getElementById("typeS").value; // Obtener la clave seleccionada
    console.log('tipo: ', tipo);

    if (tipo == 'admin') {
        document.getElementById("type").value = 'admin';
    } else {
        if (tipo == 'ejecutor') {
            document.getElementById("type").value = 'ejecutor';
        }
    }
}