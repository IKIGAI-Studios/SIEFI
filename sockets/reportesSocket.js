import Afil from "../models/afilModel.js";
import RaleCop from "../models/raleCOPModel.js";
import RaleRCV from "../models/raleRCVModel.js";
import { Sequelize } from "sequelize";
import { Op } from "sequelize";
import Ejecutor from "../models/ejecutorModel.js";

export function socket(io) {
	io.on("connection", (socket) => {
		//Obtener las fechas de las tablas RCV y COP de los registros que estan asignados al ejecutor.
		socket.on("cliente:capturarDatos", async (value, clave_eje) => {
			// Obtener de la tabla Afil los registros que están en la tabla ejecutores.
			const reg_pat = await Afil.findAll({
				where: { clave_eje: clave_eje },
			});

			// Obtener de las fechas de los registros de Rale Cop
			const fechasCOP = await RaleCop.findAll({
				attributes: [
					[
						Sequelize.fn("DISTINCT", Sequelize.col("createdAt")),
						"createdAt",
					],
				],
				raw: true,
			});

			// Obtener de las fechas de los registros de Rale RCV
			const fechasRCV = await RaleRCV.findAll({
				attributes: [
					[
						Sequelize.fn("DISTINCT", Sequelize.col("createdAt")),
						"createdAt",
					],
				],
				raw: true,
			});

			//Obtener los registros patronales distintos, cuando el campo pagado sea false de Rale Cop
			const RegPatCop = await RaleCop.findAll({
				attributes: [
					[
						Sequelize.fn("DISTINCT", Sequelize.col("reg_pat")),
						"reg_pat",
					],
				],
				where: {
					cobrado: false,
					reg_pat: {
						[Sequelize.Op.in]: reg_pat.map((item) => item.reg_pat),
					},
				},
				raw: true,
			});

			//Obtener los registros patronales distintos, cuando el campo pagado sea false de Rale RCV
			const RegPatRcv = await RaleRCV.findAll({
				attributes: [
					[
						Sequelize.fn("DISTINCT", Sequelize.col("reg_pat")),
						"reg_pat",
					],
				],
				where: {
					cobrado: false,
					reg_pat: {
						[Sequelize.Op.in]: reg_pat.map((item) => item.reg_pat),
					},
				},
				raw: true,
			});

			// Extraer las fechas y los registros patronales del resultado de RaleCop
			const fechasCOPArray = fechasCOP.map((item) => item.createdAt);
			const regPatCOPArray = RegPatCop.map((item) => item.reg_pat);

			// Extraer las fechas del resultado de RaleRCV
			const fechasRCVArray = fechasRCV.map((item) => item.createdAt);
			const regPatRCVArray = RegPatRcv.map((item) => item.reg_pat);

			// Unir los arreglos de fechas en una sola variable llamada fechas
			const fechas = fechasCOPArray.concat(fechasRCVArray);
			const registros = regPatCOPArray.concat(regPatRCVArray);

			socket.emit(
				"servidor:capturarDatos",
				fechas,
				registros,
				value,
				clave_eje
			);
		});

		// Obtener patrones y las fechas en las que se subio para mandamiento y citatorio
		socket.on(
			"cliente:obtenerPatrones",
			async (patron, fecha, value, clave_eje) => {
				// Obtener de la tabla Afil los registros que están en la tabla ejecutores.
				const reg_pat = await Afil.findAll({
					where: { clave_eje: clave_eje },
				});

				// Obtener de la tabla Rale COP los registros que coincidan con la consulta anterior.
				const raleC = await RaleCop.findAll({
					attributes: [
						"reg_pat",
						"nom_cred",
						"periodo",
						"importe",
						"td",
						"inc",
						"createdAt",
					],
					where: {
						reg_pat: reg_pat.map((rp) => rp.reg_pat),
						reg_pat: patron,
						createdAt: {
							[Op.eq]: Sequelize.literal(`DATE('${fecha}')`),
						},
					},
				});

				// Obtener de la tabla Rale RCV los registros que coincidan con la consulta anterior.
				const raleR = await RaleRCV.findAll({
					attributes: [
						"reg_pat",
						"nom_cred",
						"periodo",
						"importe",
						"td",
						"inc",
						"createdAt",
					],
					where: {
						reg_pat: reg_pat.map((rp) => rp.reg_pat),
						reg_pat: patron,
						createdAt: {
							[Op.eq]: Sequelize.literal(`DATE('${fecha}')`),
						},
					},
				});

				// Agregar la propiedad 'type' a cada objeto en raleCop y raleRCV
				const raleCop = raleC.map((obj) => ({
					...obj.dataValues,
					type: "cop",
				}));
				const raleRCV = raleR.map((obj) => ({
					...obj.dataValues,
					type: "rcv",
				}));

				// Unir las variables raleCop y raleRCV en una sola variable llamada patrones
				const patrones = raleCop.concat(raleRCV);

				socket.emit(
					"servidor:obtenerPatrones",
					patrones,
					value,
					clave_eje
				);
			}
		);

		// Obtener patrones y las fechas en las que se subió para gastos e informes de ejecutor
		socket.on(
			"cliente:obtenerPatronesEjecutor",
			async (value, clave_eje) => {
				// Obtener los registros de la tabla Afil que están en la tabla ejecutores.
				const reg_pat = await Afil.findAll({
					where: { clave_eje: clave_eje },
				});

				let raleC;
				let raleR;

				if (value == "informe") {
					raleC = await RaleCop.findAll({
						attributes: [
							"reg_pat",
							"nom_cred",
							"periodo",
							"importe",
							"td",
							"inc",
							"createdAt",
							"cobrado",
						],
						where: { reg_pat: reg_pat.map((rp) => rp.reg_pat) },
					});

					raleR = await RaleRCV.findAll({
						attributes: [
							"reg_pat",
							"nom_cred",
							"periodo",
							"importe",
							"td",
							"createdAt",
							"inc",
							"cobrado",
						],
						where: { reg_pat: reg_pat.map((rp) => rp.reg_pat) },
					});
				} else {
					raleC = await RaleCop.findAll({
						attributes: [
							"reg_pat",
							"nom_cred",
							"periodo",
							"importe",
							"td",
							"inc",
							"createdAt",
							"cobrado",
						],
						where: {
							reg_pat: reg_pat.map((rp) => rp.reg_pat),
							cobrado: true,
						},
					});

					raleR = await RaleRCV.findAll({
						attributes: [
							"reg_pat",
							"nom_cred",
							"periodo",
							"importe",
							"td",
							"createdAt",
							"inc",
							"cobrado",
						],
						where: {
							reg_pat: reg_pat.map((rp) => rp.reg_pat),
							cobrado: true,
						},
					});
				}

				const raleCop = raleC.map((obj) => ({
					...obj.dataValues,
					type: "cop",
					cobrado: obj.cobrado ? "Cobrado" : "No cobrado",
				}));
				const raleRCV = raleR.map((obj) => ({
					...obj.dataValues,
					type: "rcv",
					cobrado: obj.cobrado ? "Cobrado" : "No cobrado",
				}));

				const patrones = raleCop.concat(raleRCV);

				socket.emit(
					"servidor:obtenerPatrones",
					patrones,
					value,
					clave_eje
				);
			}
		);

		// Obtener el registro patronal de las opciones seleccionadas
		socket.on("cliente:crearFormInforme", async (data, value, user) => {
			var dataM;
			if (value == "informe") {
				//Obtener sólo los datos que se van a utilizar en la tabla
				dataM = data.map((obj) => {
					return {
						reg_pat: obj.reg_pat,
						type: obj.type,
						nom_cred: obj.nom_cred,
						periodo: obj.periodo,
						importe: obj.importe,
					};
				});
			} else if (value === "gastos") {
				// Obtener sólo los datos que se van a utilizar en la tabla
				dataM = await Promise.all(
					data.map(async (obj) => {
						const afilData = await Afil.findOne({
							attributes: ["patron"],
							where: {
								reg_pat: obj.reg_pat,
							},
						});

						return {
							reg_pat: obj.reg_pat,
							patron: afilData.patron,
							type: obj.type,
							nom_cred: obj.nom_cred,
							periodo: obj.periodo,
						};
					})
				);
			}

			const regEjecutor = await Ejecutor.findOne({
				attributes: ["clave_eje", "nombre"],
				where: { clave_eje: user },
			});

			socket.emit(
				"servidor:crearFormInforme",
				dataM,
				value,
				user,
				regEjecutor
			);
		});

		// Maneja el evento de desconexión del cliente
		socket.on("disconnect", () => {
			// Programar eventos (innecesarios por ahora)
		});
	});
}
