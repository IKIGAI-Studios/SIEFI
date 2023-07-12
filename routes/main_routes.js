import express from "express";
import bcrypt from "bcrypt";
import Ejecutor from "../models/ejecutorModel.js";
import Afil63 from "../models/afilModel.js";
import sequelize from "../database.js";
import RaleCop from "../models/raleCOPModel.js";
import RaleRcv from "../models/raleRCVModel.js";
import Coin from "../models/coinModel.js";
import {
  generarInforme,
  generarGastos,
  generarMandamiento,
  generarCitatorio,
} from "./funciones_main_routes.js";
import { subirArchivo } from "../middlewares/subirArchivos.js";

const routes = express.Router();

// *** ADMINISTRADOR ***
// Renderizar login
routes.get("/login", (req, res) => {
  res.render("login", { session: req.session });
  req.session.login = "";
});

// Cerrar sesión
routes.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login");
    }
  });
});

// Registrar nuevo ejecutor
routes.get("/registerEjecutor", (req, res) => {
  // No existe la sesión
  if (req.session.user === undefined) {
    res.redirect("/login");
    return;
  }

  // No es administrador
  if (req.session.user.tipo_usuario != "admin") {
    res.redirect("/login");
    return;
  }

  res.render("registerEjecutor", { session: req.session });
  req.session.registerEjecutor = "";
});

// Subir archivos excel
routes.get("/loadInfo", (req, res) => {
  // No existe la sesión
  if (req.session.user === undefined) {
    res.redirect("/login");
    return;
  }

  // No es administrador
  if (req.session.user.tipo_usuario != "admin") {
    res.redirect("/login");
    return;
  }
  res.render("loadInfo", { session: req.session });
});

// Actualizar información del ejecutor
routes.get("/actualizarEjecutor", async (req, res) => {
  try {
    // No existe la sesión
    if (req.session.user === undefined) {
      res.redirect("/login");
      return;
    }

    // No es administrador
    if (req.session.user.tipo_usuario != "admin") {
      res.redirect("/login");
      return;
    }

    // Obtener usuarios y regstros patronales
    const ejecutores = await Ejecutor.findAll();
    const afil = await Afil63.findAll();

    res.render("actualizarEjecutor", {
      session: req.session,
      ejecutores,
      afil,
    });
    req.session.actualizarEjecutor = "";
  } catch (error) {
    console.log(error);
    req.session.login = error;
    res.redirect("/login");
  }
});

// Registrar nuevo afil
routes.get("/registrarAfil", async (req, res) => {
  try {
    // No existe la sesión
    if (req.session.user === undefined) {
      res.redirect("/login");
      return;
    }

    // No es administrador
    if (req.session.user.tipo_usuario != "admin") {
      res.redirect("/login");
      return;
    }

    // Obtener ejecutores activos unicamente
    const usuEjecutores = await Ejecutor.findAll({
      where: { type: "ejecutor", status: "1" },
    });

    res.render("registrarAfil", { session: req.session, usuEjecutores });
    req.session.registrarAfil = "";
  } catch (error) {
    console.log(error);
    req.session.login = error;
    res.redirect("/login");
  }
});

// Renderizar las estadisticas individuales
routes.get("/estadisticasIndividuales", async (req, res) => {
  try {
    // No existe la sesión
    if (req.session.user === undefined) {
      res.redirect("/login");
      return;
    }

    // No es administrador
    if (req.session.user.tipo_usuario != "admin") {
      res.redirect("/login");
      return;
    }

    // Obtener ejecutores activos unicamente
    const ejecutores = await Ejecutor.findAll({
      where: { type: "ejecutor", status: "1" },
    });

    res.render("estindividuales", { session: req.session, ejecutores });
    req.session.actualizarEjecutor = "";
  } catch (error) {
    console.log(error);
    req.session.login = error;
    res.redirect("/login");
  }
});

// Renderizar las estadisticas individuales
routes.get("/estadisticasGlobales", async (req, res) => {
  try {
    // No existe la sesión
    if (req.session.user === undefined) {
      res.redirect("/login");
      return;
    }

    // No es administrador
    if (req.session.user.tipo_usuario != "admin") {
      res.redirect("/login");
      return;
    }

    // Obtener ejecutores activos unicamente
    const ejecutores = await Ejecutor.findAll({
      where: { type: "ejecutor", status: "1" },
    });

    res.render("estGlobales", { session: req.session, ejecutores });
    req.session.actualizarEjecutor = "";
  } catch (error) {
    console.log(error);
    req.session.login = error;
    res.redirect("/login");
  }
});

// Cmabiar plantillas de los documentos
routes.get("/changeTemplates", async (req, res) => {
  try {
    // No existe la sesión
    if (req.session.user === undefined) {
      res.redirect("/login");
      return;
    }

    // No es administrador
    if (req.session.user.tipo_usuario != "admin") {
      res.redirect("/login");
      return;
    }

    res.render("changeTemplates", { session: req.session });
  } catch (error) {
    console.log(error);
    req.session.login = error;
    res.redirect("/login");
  }
});

// *? EJECUTOR ?*
// Generar reportes por ejecutor
routes.get("/reportes", (req, res) => {
  // No existe la sesión
  if (req.session.user === undefined) {
    res.redirect("/login");
    return;
  }

  // No es ejecutor
  if (req.session.user.tipo_usuario != "ejecutor") {
    res.redirect("/login");
    return;
  }
  res.render("reportes", { session: req.session });
});

// Visualizar patrones
routes.get("/verPatrones", async (req, res) => {
  // No existe la sesión
  if (req.session.user === undefined) {
    res.redirect("/login");
    return;
  }

  // No es ejecutor
  if (req.session.user.tipo_usuario != "ejecutor") {
    res.redirect("/login");
    return;
  }
  res.render("verPatrones", { session: req.session });
});

// *** Procesamiento de datos con POST ***
// Validar el inicio de sesión
routes.post("/login", async (req, res) => {
  try {
    // Obtener usuario y contraseña del formulario
    const { username, password } = req.body;

    // Buscar el usuario
    const user = await Ejecutor.findOne({
      where: {
        user: username,
      },
      attributes: ["clave_eje", "nombre", "pass", "type", "status"],
    });

    // No existe el usuario
    if (!user) {
      req.session.loginError = "Usuario no encontrado";
      res.redirect("/login");
      return;
    }

    // Existe pero esta deshabilitado
    if (!user.status) {
      req.session.loginError = "Usuario deshabilitado";
      res.redirect("/login");
      return;
    }

    // Encriptar contraseña para comparar
    const passwordMatch = await bcrypt.compare(password, user.pass);

    if (!passwordMatch) {
      req.session.loginError = "Contraseña incorrecta";
      res.redirect("/login");
      return;
    }

    // Separar nombre y apellidos
    let nombre,
      apellidos,
      arrNombre = user.nombre.split(" ");

    // Si tiene 1 o 2 nombres
    if (arrNombre[3]) {
      nombre = arrNombre[0] + " " + [1];
      apellidos = arrNombre[2] + " " + [3];
    } else {
      nombre = arrNombre[0];
      apellidos = arrNombre[1] + " " + arrNombre[2];
    }

    // Crear la sesión del Usuario
    req.session.user = {
      nombre,
      apellidos,
      clave_eje: user.clave_eje,
      tipo_usuario: user.type,
    };

    // Redireccionar al tipo de usuario
    if (user.type == "ejecutor") {
      res.redirect("/reportes");
    } else {
      res.redirect("/loadInfo");
    }
  } catch (error) {
    // Regresar un mensaje de error
    req.session.loginError = `Error al hacer la consulta | Error: ${error}`;
    res.redirect("/login");
  }
});

// Registrar nuevo ejecutor
routes.post("/registerEjecutor", async (req, res) => {
  try {
    // Obtener datos del formulario enviado
    const { clave_eje, nombre, user, pass, type } = req.body;

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(pass, saltRounds);

    // Validar que el usuario sea unico
    const existingUser = await Ejecutor.findOne({ where: { user } });
    if (existingUser) {
      req.session.registerEjecutor = `El usuario ${user} ya ha sido registrado`;
      res.redirect("/registerEjecutor");
      return;
    }

    // Validar que la clave sea unica
    const existingClave = await Ejecutor.findOne({ where: { clave_eje } });
    if (existingClave) {
      req.session.registerEjecutor = `La clave ${clave_eje} ya ha sido registrada`;
      res.redirect("/registerEjecutor");
      return;
    }

    // Registrar el usuario
    const newEjecutor = await Ejecutor.create({
      clave_eje,
      nombre,
      user,
      pass: hashedPassword,
      type,
      status: 1,
    });

    // Regresar un mensaje de confirmación
    req.session.registerEjecutor = `${nombre} Registrado Correctamente`;
    res.redirect("/registerEjecutor");
  } catch (error) {
    // Regresar un mensaje de error
    req.session.registerEjecutor = `No se pudo registrar el ultimo Ejecutor | Error: ${error}`;
    res.redirect("/registerEjecutor");
  }
});

// Actualizar datos del ejecutor
routes.post("/actualizarEjecutor", async (req, res) => {
  try {
    // Obtener datos del formulario enviado
    const { clave_eje, nombre, status, user, type } = req.body;

    //No ha seleccionado la clave del ejecutor.
    if (clave_eje == "") {
      req.session.actualizarEjecutor = "Favor de elegir la clave del ejecutor.";
      res.redirect("/actualizarEjecutor");
      return;
    }

    // Alguno de los campos no fue llenado
    if (nombre == "" || status == "" || user == "" || type == "") {
      req.session.actualizarEjecutor = "Favor de llenar todos los campos";
      res.redirect("/actualizarEjecutor");
      return;
    }

    // Actualizar en la base de datos
    const actualizarEjecutor = await Ejecutor.update(
      { nombre: nombre, status: status, user: user, type: type },
      { where: { clave_eje: clave_eje } }
    )
      .then(() => {
        req.session.actualizarEjecutor = "Usuario actualizado correctamente";
        res.redirect("/actualizarEjecutor");
      })
      .catch((e) => {
        req.session.actualizarEjecutor =
          "Error en la actualización del usuario: " + e;
        res.redirect("/actualizarEjecutor");
      });
  } catch (error) {
    console.log("Error ", error);
    req.session.actualizarEjecutor = "Error en la actualización del usuario";
    res.redirect("/actualizarEjecutor");
  }
});

// ! ELIMINAR SI NO FALLA NADA
// routes.post("/loadCoin", async (req, res) => {
//   try {
//     res.json(req.body);
//   } catch (error) {
//     // Regresar un mensaje de error
//     // req.session.loginError = `Error al hacer la consulta | Error: ${error}`;
//     res.json(error);
//   }
// });

// Registrar nuevo afil
routes.post("/registrarAfil", async (req, res) => {
  try {
    // Obtener datos del formulario enviado
    const {
      reg_pat,
      patron,
      actividad,
      domicilio,
      localidad,
      rfc,
      cp,
      ejecutor,
      clave_eje,
    } = req.body;

    // Validar los campos vacios
    if (
      reg_pat == "" ||
      patron == "" ||
      actividad == "" ||
      domicilio == "" ||
      localidad == "" ||
      cp == "" ||
      ejecutor == "" ||
      clave_eje == "" ||
      rfc == ""
    ) {
      req.session.registrarAfil = "Todos los campos no han sido llenados";
      res.redirect("/registrarAfil");
      return;
    }

    // Registrar el afil
    const newAfil = await Afil63.create({
      reg_pat,
      patron,
      actividad,
      domicilio,
      localidad,
      rfc,
      cp,
      ejecutor,
      clave_eje,
    });

    // Regresar un mensaje de confirmación
    req.session.registrarAfil = `Registrado Correctamente`;
    res.redirect("/registrarAfil");
  } catch (error) {
    // Regresar un mensaje de error
    req.session.registrarAfil = `No se pudo registrar el ultimo Afil | Error: ${error}`;
    res.redirect("/registrarAfil");
  }
});

// Desasignar patrones y asignar a "No asignado"
routes.post("/desasignarPatrones", async (req, res) => {
  try {
    // Obtener datos del formulario enviado
    const registros_patA = req.body.patronesA;

    // Validar si es un registro patronal o si son varios
    if (typeof registros_patA == "string") {
      // Actualizar un solo reg patronal
      await Afil63.update(
        { ejecutor: "No asignado", clave_eje: "E-00000000" },
        { where: { reg_pat: registros_patA } }
      )
        .then(() => {
          console.log("Usuario Actualizado correctamente");
        })
        .catch(() => {
          console.log("Error al actualizar");
        });

      res.redirect("/actualizarEjecutor");
    } else {
      // Recorrer todos los reg_patronales y actualizar uno por uno
      registros_patA.map((reg) => {
        Afil63.update(
          { ejecutor: "foraneo", clave_eje: "E-00000000" },
          { where: { reg_pat: reg } }
        )
          .then(() => {
            console.log("Usuario Actualizado correctamente");
          })
          .catch(() => {
            console.log("Error al actualizar");
          });

        res.redirect("/actualizarEjecutor");
      });
    }
  } catch (error) {
    console.log(error);
    req.session.actualizarEjecutor = `No se pudo actualizar el patron | Error: ${error}`;
    res.redirect("/actualizarEjecutor");
  }
});

// Asignar patrones a ejecutor seleccionado
routes.post("/asignarPatrones", async (req, res) => {
  try {
    // Obtener datos del formulario enviado
    const registros_patNA = req.body.patronesNA;
    const clave_eje = req.body.claveEje;
    const ejecutor = req.body.nomEje;

    // Validar si es uno o varios reg patronales
    if (typeof registros_patNA == "string") {
      // Actualizar el afil al ejecutor seleccionado
      await Afil63.update(
        { ejecutor: ejecutor, clave_eje: clave_eje },
        { where: { reg_pat: registros_patNA } }
      )
        .then(() => {
          res.redirect("/actualizarEjecutor");
        })
        .catch((e) => {
          console.log("Error al actualizar", e);
        });
    } else {
      // Recorrer todos los reg_patronales y actualizar uno por uno
      registros_patNA.map((reg) => {
        Afil63.update(
          { ejecutor: ejecutor, clave_eje: clave_eje },
          { where: { reg_pat: reg } }
        )
          .then(() => {
            console.log("Actualizado correctamente el afil: ", reg);
          })
          .catch((e) => {
            console.log("Error al actualizar el afil: ", reg, " | ", e);
          });
        res.redirect("/actualizarEjecutor");
      });
    }
  } catch (error) {
    console.log(error);
    req.session.actualizarEjecutor = `No se pudo actualizar el patron | Error: ${error}`;
    res.redirect("/actualizarEjecutor");
  }
});

// Eliminar los afil por fecha
routes.post("/eliminarAfilFiltrado", async (req, res) => {
  try {
    // Obtener datos del formulario enviado
    const fechaAfil = req.body.selectAfil;

    // Eliminar los afil que tengan dicha fecha
    const eliminarAfilF = await Afil63.destroy({
      where: sequelize.where(
        sequelize.fn("DATE", sequelize.col("createdAt")),
        fechaAfil
      ),
    })
      .then(() => {
        res.redirect("/loadInfo");
        console.log("Eliminado correctamente");
      })
      .catch((e) => {
        res.redirect("/loadInfo");
        console.log("Error al eliminar: ", e);
      });
  } catch (error) {
    console.log("Error al eliminar el Afil", error);
    res.redirect("/loadInfo");
  }
});

// Eliminar coin por fecha
routes.post("/eliminarCoinFiltrado", async (req, res) => {
  try {
    // Obtener datos del formulario enviado
    const fechaCoin = req.body.selectCoin;

    // Eliminar coin que tengan dicha fecha
    const eliminarCoinF = await Coin.destroy({
      where: sequelize.where(
        sequelize.fn("DATE", sequelize.col("createdAt")),
        fechaCoin
      ),
    })
      .then(() => {
        res.redirect("/loadInfo");
        console.log("Eliminado correctamente");
      })
      .catch((e) => {
        res.redirect("/loadInfo");
        console.log("Error al eliminar: ", e);
      });

    res.redirect("/loadInfo");
  } catch (error) {
    console.log("Error al eliminar el Coin", error);
    res.redirect("/loadInfo");
  }
});

// Eliminar rale cop por fecha
routes.post("/eliminarRaleCOPFiltrado", async (req, res) => {
  try {
    // Obtener datos del formulario enviado
    const fechaRaleCOP = req.body.selectRaleCOP;

    // Eliminar rale cop que tengan dicha fecha
    const eliminarRaleCOPF = await RaleCop.destroy({
      where: sequelize.where(
        sequelize.fn("DATE", sequelize.col("createdAt")),
        fechaRaleCOP
      ),
    })
      .then(() => {
        res.redirect("/loadInfo");
        console.log("Eliminado correctamente");
      })
      .catch((e) => {
        res.redirect("/loadInfo");
        console.log("Error al eliminar: ", e);
      });

    res.redirect("/loadInfo");
  } catch (error) {
    console.log("Error al eliminar el Rale COP", error);
    res.redirect("/loadInfo");
  }
});

// Eliminar rale rcv por fecha
routes.post("/eliminarRaleRCVFiltrado", async (req, res) => {
  try {
    // Obtener datos enviados del formulario
    const fechaRaleRCV = req.body.selectRaleRCV;

    // Eliminar rale rcv que tengan dicha fecha
    const eliminarRaleRCVF = await RaleRcv.destroy({
      where: sequelize.where(
        sequelize.fn("DATE", sequelize.col("createdAt")),
        fechaRaleRCV
      ),
    })
    .then(() => {
      res.redirect("/loadInfo");
      console.log("Eliminado correctamente");
    })
    .catch((e) => {
      res.redirect("/loadInfo");
      console.log("Error al eliminar: ", e);
    });

    res.redirect("/loadInfo");
  } catch (error) {
    console.log("Error al eliminar el Rale RCV", error);
    res.redirect("/loadInfo");
  }
});

// Cambiar header de los documentos
routes.post(
  "/load_header",
  subirArchivo("header", "file_header"),
  (req, res) => {
    try {
      res.redirect("/changeTemplates");
    } catch (e) {
      console.log(e);
      res.redirect("/changeTemplates");
    }
  }
);

// Cambiar footer de los documentos
routes.post(
  "/load_footer",
  subirArchivo("footer", "file_footer"),
  (req, res) => {
    try {
      res.redirect("/changeTemplates");
    } catch (e) {
      console.log(e);
      res.redirect("/changeTemplates");
    }
  }
);

// Generar citatorio
routes.post("/generarCitatorio", async (req, res) => {
  try {
    // Ejecutar funcion generar citatoio
    await generarCitatorio(req, res);
  } catch (error) {
    console.error(error);
  }
});

// Generar mandamiento
routes.post("/generarMandamiento", async (req, res) => {
  try {
    // Ejecutar funcion generar mandamiento
    await generarMandamiento(req, res);
  } catch (error) {
    console.error(error);
  }
});

// Generar informe
routes.post("/generarInforme", async (req, res) => {
  try {
    // Ejecutar funcion generar informe
    await generarInforme(req, res);
  } catch (error) {
    console.error(error);
  }
});

// Generar gastos
routes.post("/generarGastos", async (req, res) => {
  try {
    // Ejecutar funcion generar gastos
    await generarGastos(req, res);
  } catch (error) {
    console.error(error);
  }
});

export default routes;
