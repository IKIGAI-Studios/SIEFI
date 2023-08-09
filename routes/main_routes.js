import express from "express";
import bcrypt from "bcrypt";
import Ejecutor from "../models/ejecutorModel.js";
import Afil63 from "../models/afilModel.js";
import sequelize from "../database.js";
import RaleCop from "../models/raleCOPModel.js";
import RaleRcv from "../models/raleRCVModel.js";
import Coin from "../models/coinModel.js";
import pc from "picocolors";
import {
	generarInforme,
	generarGastos,
	generarMandamiento,
	generarCitatorio,
} from "./funciones_main_routes.js";
import { subirArchivo } from "../middlewares/subirArchivos.js";

const routes = express.Router();

// *** ADMINISTRADOR ***
/**
 * Renderiza la página de inicio de sesión.
 * @route GET /login
 */
routes.get("/login", (req, res) => {
	res.render("login", { session: req.session });
	req.session.login = "";
});

/**
 * Cierra la sesión del usuario y redirecciona a la página de inicio de sesión.
 * @route GET /logout
 */
routes.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.log(err);
		} else {
			res.redirect("/login");
		}
	});
});

/**
 * Renderiza la página de registro de un nuevo ejecutor.
 * @route GET /registerEjecutor
 */
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

/**
 * Renderiza la página de carga de archivos Excel.
 * @route GET /loadInfo
 */
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

/**
 * Renderiza la página de actualización de datos de un ejecutor.
 * @route GET /actualizarEjecutor
 */
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

/**
 * Renderiza la página de registro de un nuevo afil.
 * @route GET /registrarAfil
 */
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

/**
 * Renderiza la página de estadísticas individuales.
 * @route GET /estadisticasIndividuales
 */
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

/**
 * Renderiza la página de estadísticas globales.
 * @route GET /estadisticasGlobales
 */
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

/**
 * Renderiza la página de cambio de plantillas de documentos.
 * @route GET /changeTemplates
 */
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
/**
 * Renderiza la página de generación de reportes por ejecutor.
 * @route GET /reportes
 */
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

/**
 * Renderiza la página de visualización de patrones.
 * @route GET /verPatrones
 */
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
/**
 * Valida el inicio de sesión.
 * @route POST /login
 * @param {string} req.body.username - El nombre de usuario.
 * @param {string} req.body.password - La contraseña del usuario.
 */
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

        if (arrNombre.length === 1) {
            nombre = arrNombre[0];
        } else if (arrNombre.length === 2) {
            nombre = arrNombre[0];
            apellidos = arrNombre[1];
        } else {
            nombre = arrNombre.slice(0, arrNombre.length - 2).join(' ');
            apellidos = arrNombre.slice(arrNombre.length - 2).join(' ');
        }

		// Crear la sesión del Usuario
		req.session.user = {
			nombre,
			apellidos,
			clave_eje: user.clave_eje,
			tipo_usuario: user.type,
		};

        console.log(req.session.user)
        console.log(user.nombre)

		// Redireccionar al tipo de usuario
		if (user.type == "ejecutor") {
			res.redirect("/reportes");
		} else {
			res.redirect("/loadInfo");
		}
	} catch (error) {
		// Regresar un mensaje de error
		req.session.loginError = `Error al hacer la consula`;
		res.redirect("/login");
	}
});

/**
 * Registra un nuevo ejecutor.
 * @route POST /registerEjecutor
 * @param {string} req.body.clave_eje - La clave del ejecutor.
 * @param {string} req.body.nombre - El nombre del ejecutor.
 * @param {string} req.body.user - El nombre de usuario del ejecutor.
 * @param {string} req.body.pass - La contraseña del ejecutor.
 * @param {string} req.body.type - El tipo de usuario del ejecutor.
 */
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

/**
 * Actualiza la información de un ejecutor.
 * @route POST /actualizarEjecutor
 * @param {string} req.body.clave_eje - La clave del ejecutor.
 * @param {string} req.body.nombre - El nombre del ejecutor.
 * @param {string} req.body.status - El estado del ejecutor.
 * @param {string} req.body.user - El nombre de usuario del ejecutor.
 * @param {string} req.body.type - El tipo de usuario del ejecutor.
 */
routes.post("/actualizarEjecutor", async (req, res) => {
	try {
		// Obtener datos del formulario enviado
		const { clave_eje, nombre, status, user, type, pass } = req.body;
        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(pass, saltRounds);

		//No ha seleccionado la clave del ejecutor.
		if (clave_eje == "") {
			req.session.actualizarEjecutor =
				"Favor de elegir la clave del ejecutor.";
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
			{ nombre, status, user, type, pass: hashedPassword },
			{ where: { clave_eje: clave_eje } }
		)
			.then((user) => {
				req.session.actualizarEjecutor =
					"Usuario actualizado correctamente";
				res.redirect("/actualizarEjecutor");
			})
			.catch((e) => {
				req.session.actualizarEjecutor =
					"Error en la actualización del usuario: " + e;
				res.redirect("/actualizarEjecutor");
			});
	} catch (error) {
		console.log("Error ", error);
		req.session.actualizarEjecutor =
			"Error en la actualización del usuario";
		res.redirect("/actualizarEjecutor");
	}
});

/**
 * Registra un nuevo afil.
 * @route POST /registrarAfil
 * @param {string} req.body.reg_pat - El registro patronal.
 * @param {string} req.body.patron - El nombre del patrón.
 * @param {string} req.body.actividad - La actividad del patrón.
 * @param {string} req.body.domicilio - El domicilio del patrón.
 * @param {string} req.body.localidad - La localidad del patrón.
 * @param {string} req.body.rfc - El RFC del patrón.
 * @param {string} req.body.cp - El código postal del patrón.
 * @param {string} req.body.ejecutor - El nombre del ejecutor asignado.
 * @param {string} req.body.clave_eje - La clave del ejecutor asignado.
 */

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

/**
 * Desasigna los patrones seleccionados y los asigna a "No asignado".
 * @route POST /desasignarPatrones
 * @param {string|string[]} req.body.patronesA - El/los patrones a desasignar.
 */
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

/**
 * Asigna los patrones seleccionados al ejecutor especificado.
 * @route POST /asignarPatrones
 * @param {string|string[]} req.body.patronesNA - El/los patrones a asignar.
 * @param {string} req.body.claveEje - La clave del ejecutor.
 * @param {string} req.body.nomEje - El nombre del ejecutor.
 */
routes.post("/asignarPatrones", async (req, res) => {
    console.log(req.body)
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
						console.log(
							"Error al actualizar el afil: ",
							reg,
							" | ",
							e
						);
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

/**
 * Elimina los afil filtrados por fecha.
 * @route POST /eliminarAfilFiltrado
 * @param {string} req.body.selectAfil - La fecha de los afil a eliminar.
 */
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

/**
 * Elimina los coin filtrados por fecha.
 * @route POST /eliminarCoinFiltrado
 * @param {string} req.body.selectCoin - La fecha de los coin a eliminar.
 */
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

/**
 * Elimina los rale cop filtrados por fecha.
 * @route POST /eliminarRaleCOPFiltrado
 * @param {string} req.body.selectRaleCOP - La fecha de los rale cop a eliminar.
 */
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

/**
 * Elimina los rale rcv filtrados por fecha.
 * @route POST /eliminarRaleRCVFiltrado
 * @param {string} req.body.selectRaleRCV - La fecha de los rale rcv a eliminar.
 */
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

/**
 * Cambia el encabezado de los documentos.
 * @route POST /load_header
 * @param {File} req.files.file_header - El archivo del encabezado.
 */
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

/**
 * Cambia el pie de página de los documentos.
 * @route POST /load_footer
 * @param {File} req.files.file_footer - El archivo del pie de página.
 */
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

/**
 * Genera un citatorio en formato PDF.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string|string[]} req.body.opcion - Opciones seleccionadas en forma de cadena JSON o un arreglo de cadenas JSON.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {void}
 */
routes.post("/generarCitatorio", async (req, res) => {
	try {
		// Ejecutar funcion generar citatoio
		await generarCitatorio(req, res);
	} catch (error) {
		console.error(error);
	}
});

/**
 * Genera un mandamiento de ejecución en formato PDF.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Cuerpo de la solicitud HTTP que contiene los datos necesarios para generar el mandamiento.
 * @param {string|string[]} req.body.opcion - Opción seleccionada del formulario. Puede ser un string o un arreglo de strings.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
routes.post("/generarMandamiento", async (req, res) => {
	try {
		// Ejecutar funcion generar mandamiento
		await generarMandamiento(req, res);
	} catch (error) {
		console.error(error);
	}
});

/**
 * Genera un informe diario de ejecutor.
 * @param {Object} req - Objeto de solicitud (request).
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string|string[]} req.body.nom_cred - Nombre del crédito o array de nombres de crédito.
 * @param {string} req.body.type - Tipo de registro (cop o rcv).
 * @param {string|string[]} req.body.folioSua - Folio SUA o array de folios SUA.
 * @param {string|string[]} req.body.resultadosDiligencia - Resultados de la diligencia o array de resultados de diligencia.
 * @param {Object} res - Objeto de respuesta (response).
 */
routes.post("/generarInforme", async (req, res) => {
	try {
		// Ejecutar funcion generar informe
		await generarInforme(req, res);
	} catch (error) {
		console.error(error);
	}
});

/**
 * Genera un informe de gastos.
 * @param {Object} req - Objeto de solicitud (request).
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string|string[]} req.body.nom_cred - Nombre del crédito o array de nombres de crédito.
 * @param {string} req.body.type - Tipo de registro (cop o rcv).
 * @param {boolean|boolean[]} req.body.cobrado - Valor de cobrado o array de valores de cobrado.
 * @param {number|number[]} req.body.gastos - Monto de gastos o array de montos de gastos.
 * @param {Object} res - Objeto de respuesta (response).
 */
routes.post("/generarGastos", async (req, res) => {
	try {
		// Ejecutar funcion generar gastos
		await generarGastos(req, res);
	} catch (error) {
		console.error(error);
	}
});

export default routes;
