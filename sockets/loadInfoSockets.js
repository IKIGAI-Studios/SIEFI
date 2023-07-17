import XLSX from "xlsx";
import Coin from "../models/coinModel.js";
import Afil from "../models/afilModel.js";
import RaleCop from "../models/raleCOPModel.js";
import RaleRcv from "../models/raleRCVModel.js";
import Ejecutor from "../models/ejecutorModel.js";
import sequelize from "../database.js";

export function socket(io) {
	io.on("connection", (socket) => {
		// Socket para cargar archivo coin
		socket.on("client:load-coin", ({ file }) => {
			// Procesar archivo coin
			const result = processCoin(file);
			// Regresar el objeto
			socket.emit("server:result-coin", result);
		});

		// Socket para cargar archivo afil
		socket.on("client:load-afil", async ({ file }) => {
			// Procesar archivo afil
			const result = await processAfil(file);
			// Regresar el objeto
			socket.emit("server:result-afil", result);
		});

		// Socket para cargar archivo rale
		socket.on("client:load-rale", ({ file }, callback) => {
			// Destructurar el resultado de procesar el arhcivo
			const { result, raleType } = processRale(file);
			// Si el archivo es de tipo COP
			if (raleType == "COP")
				// Regresar el objeto
				socket.emit("server:result-rale-cop", result);
			else if (raleType == "RCV")
				// Regresar el objeto
				socket.emit("server:result-rale-rcv", result);
			// Si no tiene tipo de archivo regresar el error
			else if (raleType == "")
				callback({
					status: false,
					msg: `Seleccione un archivo RALE valido`,
				});
		});

		// ! INSERT COIN PROCESS
		socket.on("client:insert-coin", async ({ coin, lote }, callback) => {
			try {
				let coinValidado = []; // Arreglo para almacenar el coin validado
				let registrosNoInsertados = []; // Arreglo para almacenar los reg_pat no insertados

				// Recorrer el coin para asignar los nombres del objeto
				coin.forEach((reg, i) => {
					const regValid = {
						id_coin: null,
						deleg_control: reg["deleg_control"],
						subdeleg_control: reg["subdeleg_control"],
						deleg_emi: reg["deleg_emision"],
						subdeleg_emi: reg["subdeleg_emision"],
						reg_pat: reg["rp"],
						escencial: reg["esencial"],
						clasificacion: reg["clasificacion"],
						cve_mov_p: reg["cve_mov_pat"],
						fec_mov: reg["fecha_mov_pat"],
						razon_social: reg["razon_social"],
						num_credito: reg["num_credito"],
						periodo: reg["periodo"],
						importe: reg["importe"],
						tipo_documento: reg["tipo_documento"],
						seguro: reg["seguro"],
						dias_estancia: reg["dias_estancia"],
						incidencia: reg["incidencia"],
						fec_incidencia: reg["fecha_incidencia"],
						estado: reg["estado"],
						por_importe: reg["POR IMPORTE"],
						por_antiguedad: reg["POR ANTIGUEDAD"],
						inc_actual: reg["INC ACTUAL"] ?? null,
						resultado: reg["RESULTADO"] ?? null,
					};
					// Insertar al arreglo de coins ya validados
					coinValidado.push(regValid);
				});

				// Obtener todos los afil registrados y regresar solo el reg pat como afil
				const existingRegPats = await Afil.findAll({
					attributes: ["reg_pat"],
				}).then((afilRecords) => {
					return afilRecords.map((afil) => afil.reg_pat);
				});

				// Realiza una promesa para validar todos los registros, haciendo un map para todo el arreglo de rale
				const validRecords = await Promise.all(
					coinValidado.map(async (regValid) => {
						// Obtiene únicamente el reg_pat de ese objeto iterado
						const { reg_pat } = regValid;

						// Verificar si el valor de reg_pat ya existe en la tabla afil
						if (!existingRegPats.includes(reg_pat)) {
							registrosNoInsertados.push(reg_pat); // Almacenar los reg_pat no insertados
							return undefined;
						}

						return regValid;
					})
				);

				// Filtrar los registros válidos para insertar en la tabla RaleCop
				const recordsToInsert = validRecords.filter(
					(regValid) => regValid !== undefined
				);

				let reg_pat_no_ins = [];
				// Recorrer el arreglo de registros no insertados
				for (var i = 0; i < registrosNoInsertados.length; i++) {
					if (
						reg_pat_no_ins.indexOf(registrosNoInsertados[i]) === -1
					) {
						// Si el elemento no existe en el nuevo array, agregarlo
						reg_pat_no_ins.push(registrosNoInsertados[i]);
					}
				}

				// Validar si hay registros que insertar
				if (recordsToInsert.length > 0) {
					// Insertar los registros válidos en la tabla RaleCop
					await Coin.bulkCreate(recordsToInsert, { logging: false })
						.then(() => {
							// Si todo fue correcto regresar el callback con la seccion de archivos insertados
							callback({
								status: true,
								msg: `
                                    Lote [${lote}-${
									lote + 999
								}] insertado correctamente
                                    ${
										reg_pat_no_ins.length > 0
											? `| ${reg_pat_no_ins.length} registros no fueron insertados debido a que no estaban registrados en la tabla afil: ` +
											  reg_pat_no_ins
											: "Todos los registros patronales fueron insertador correctamente"
									}
                                `,
							});
						})
						.catch((e) => {
							// SI hubo un error mostrar el lote y el error
							callback({
								status: false,
								msg: `No se pudo insertar el lote [${lote}-${
									lote + 999
								}]. Error: ${e}`,
							});
						});
				} else {
					// No hay registros válidos para insertar
					callback({
						status: false,
						msg: `No se pudo insertar el lote [${lote}-${
							lote + 999
						}]. No hay registros válidos.`,
					});
				}
			} catch (e) {
				// Hubo un error en la insercion
				callback({
					status: false,
					msg: `No se pudo insertar el lote [${lote}-${
						lote + 999
					}]. Error: ${e}`,
				});
			}
		});

		// Registrar AFIL en la BD
		socket.on("client:insert-afil", ({ afil, lote, lenght }, callback) => {
			let afilValidado = [];
			// Recorrer todo el objeto para asignarles los nombres que tienen en la bd
			afil.forEach((reg, i) => {
				const regValid = {
					reg_pat: reg["REG PAT"] ? reg["REG PAT"] : "",
					patron: reg["PATRON"] ? reg["PATRON"] : "",
					actividad: reg["ACTIVIDAD"] ? reg["ACTIVIDAD"] : "",
					domicilio: reg["DOMICILIO"] ? reg["DOMICILIO"] : "",
					localidad: reg["LOCALIDAD"] ? reg["LOCALIDAD"] : "",
					ejecutor: reg["EJECUTOR"] ? reg["EJECUTOR"] : "foraneo",
					clave_eje: reg["CLAVE"] ? reg["CLAVE"] : "E-00000000",
					rfc: reg["RFC"] ? reg["RFC"] : "",
					cp: reg["C.P."] ? reg["C.P."] : 0,
				};
				// Insertar el registro en el arreglo
				afilValidado.push(regValid);
			});

			// Insertar en la bd todos los registros
			Afil.bulkCreate(afilValidado)
				.then(() => {
					// Si todo fue correcto regresar el callback con la seccion de archivos insertados
					callback({
						status: true,
						msg: `Lote [${lote}-${
							lote + 999 > lenght ? lenght : lote + 999
						}] insertado correctamente`,
					});
				})
				.catch((e) => {
					// Si hubo un error mostrar el lote y el error
					callback({
						status: false,
						msg: `Lote [${lote}-${
							lote + 999 > lenght ? lenght : lote + 999
						}] no se pudo insertar. Error ${e}`,
					});
				});
		});

		// Registrar RALE COP en la BD
		socket.on(
			"client:insert-rale-cop",
			async ({ rale, lote }, callback) => {
				try {
					let raleValidado = [];
					let registrosNoInsertados = []; // Arreglo para almacenar los reg_pat no insertados

					// Recorrer todo el objeto para asignarles los nombres que tienen en la bd
					rale.forEach((reg, i) => {
						// Asignar keys
						const regValid = {
							reg_pat: reg["REG. PATRONAL"],
							mov: reg["M"],
							patronal: reg["OV. PATRONAL"],
							sect: reg["SECT"],
							nom_cred: reg["NUM.CRED."],
							ce: reg["CE"],
							periodo: reg["PERIODO"],
							td: reg["TD"],
							fec_alta: reg["FECHA ALTA"],
							fec_notif: reg["FEC. NOTIF."],
							inc: reg["INC."],
							fec_insid: reg["FEC. INCID."],
							dias: reg["DIAS"],
							importe: reg["I M P O R T E"],
							dcsc: reg["DC SC"],
						};
						// Insertar el registro en el arreglo
						raleValidado.push(regValid);
					});

					// Obtener todos los afil registrados y regresar solo el reg pat como afil
					const existingRegPats = await Afil.findAll({
						attributes: ["reg_pat"],
					}).then((afilRecords) => {
						return afilRecords.map((afil) => afil.reg_pat);
					});

					// Realiza una promesa para validar todos los registros, haciendo un map para todo el arreglo de rale
					const validRecords = await Promise.all(
						raleValidado.map(async (regValid) => {
							// Obtiene únicamente el reg_pat de ese objeto iterado
							const { reg_pat } = regValid;

							// Verificar si el valor de reg_pat ya existe en la tabla afil
							if (!existingRegPats.includes(reg_pat)) {
								registrosNoInsertados.push(reg_pat); // Almacenar los reg_pat no insertados
								return undefined;
							}

							return regValid;
						})
					);

					// Filtrar los registros válidos para insertar en la tabla RaleCop
					const recordsToInsert = validRecords.filter(
						(regValid) => regValid !== undefined
					);

					let reg_pat_no_ins = [];
					// Recorrer todos los registros no insertados
					for (var i = 0; i < registrosNoInsertados.length; i++) {
						if (
							reg_pat_no_ins.indexOf(registrosNoInsertados[i]) ===
							-1
						) {
							// Si el elemento no existe en el nuevo array, agregarlo
							reg_pat_no_ins.push(registrosNoInsertados[i]);
						}
					}

					// Si hay registros no insertados, regresar el callback con el mensaje
					if (recordsToInsert.length > 0) {
						// Insertar los registros válidos en la tabla RaleCop
						await RaleCop.bulkCreate(recordsToInsert, {
							logging: false,
						})
							.then(() => {
								// Si todo fue correcto regresar el callback con la seccion de archivos insertados
								callback({
									status: true,
									msg: `
                                        Lote [${lote}-${
										lote + 999
									}] insertado correctamente
                                        ${
											reg_pat_no_ins.length > 0
												? `| ${reg_pat_no_ins.length} registros no fueron insertados debido a que no estaban registrados en la tabla afil: ` +
												  reg_pat_no_ins
												: "Todos los registros patronales fueron insertador correctamente"
										}
                                    `,
								});
							})
							.catch((e) => {
								// Si hubo un error mostrar el lote y el error
								callback({
									status: false,
									msg: `No se pudo insertar el lote [${lote}-${
										lote + 999
									}]. Error: ${e}`,
								});
							});
					} else {
						// No hay registros válidos para insertar
						callback({
							status: false,
							msg: `No se pudo insertar el lote [${lote}-${
								lote + 999
							}]. No hay registros válidos.`,
						});
					}
				} catch (e) {
					// Si hubo un error mostrar el lote y el error
					console.error(e);
					callback({
						status: false,
						msg: `No se pudo insertar el lote [${lote}-${
							lote + 999
						}]. Error en el proceso.`,
					});
				}
			}
		);

		// Registrar RALE RCV en la BD
		socket.on(
			"client:insert-rale-rcv",
			async ({ rale, lote }, callback) => {
				try {
					let raleValidado = [];
					let registrosNoInsertados = []; // Arreglo para almacenar los reg_pat no insertados

					// Recorrer todo el objeto para asignarles los nombres que tienen en la bd
					rale.forEach((reg, i) => {
						// Asignar keys
						const regValid = {
							reg_pat: reg["REG. PATRONAL"],
							mov: reg["M"],
							patronal: reg["OV. PATRONAL"],
							sect: reg["SECT"],
							nom_cred: reg["NUM.CRED."],
							ce: reg["CE"],
							periodo: reg["PERIODO"],
							td: reg["TD"],
							fec_alta: reg["FECHA ALTA"],
							fec_notif: reg["FEC. NOTIF."],
							inc: reg["INC."],
							fec_insid: reg["FEC. INCID."],
							dias: reg["DIAS"],
							importe: reg["I M P O R T E"],
							dcsc: reg["DC SC"],
						};
						// Insertar el registro en el arreglo
						raleValidado.push(regValid);
					});

					// Obtener todos los afil registrados y regresar solo el reg pat como afil
					const existingRegPats = await Afil.findAll({
						attributes: ["reg_pat"],
					}).then((afilRecords) => {
						return afilRecords.map((afil) => afil.reg_pat);
					});

					// Realiza una promesa para validar todos los registros, haciendo un map para todo el arreglo de rale
					const validRecords = await Promise.all(
						raleValidado.map(async (regValid) => {
							// Obtiene únicamente el reg_pat de ese objeto iterado
							const { reg_pat } = regValid;

							// Verificar si el valor de reg_pat ya existe en la tabla afil
							if (!existingRegPats.includes(reg_pat)) {
								registrosNoInsertados.push(reg_pat); // Almacenar los reg_pat no insertados
								return undefined;
							}

							return regValid;
						})
					);

					// Filtrar los registros válidos para insertar en la tabla RaleCop
					const recordsToInsert = validRecords.filter(
						(regValid) => regValid !== undefined
					);

					let reg_pat_no_ins = [];
					// Recorrer todos los registros no insertados
					for (var i = 0; i < registrosNoInsertados.length; i++) {
						if (
							reg_pat_no_ins.indexOf(registrosNoInsertados[i]) ===
							-1
						) {
							// Si el elemento no existe en el nuevo array, agregarlo
							reg_pat_no_ins.push(registrosNoInsertados[i]);
						}
					}

					// Si hay registros no insertados, regresar el callback con el mensaje
					if (recordsToInsert.length > 0) {
						// Insertar los registros válidos en la tabla RaleCop
						await RaleRcv.bulkCreate(recordsToInsert, {
							logging: false,
						})
							.then(() => {
								// Si todo fue bien, regresar el callback con el mensaje
								callback({
									status: true,
									msg: `
                                        Lote [${lote}-${
										lote + 999
									}] insertado correctamente
                                        ${
											reg_pat_no_ins.length > 0
												? `| ${reg_pat_no_ins.length} registros no fueron insertados debido a que no estaban registrados en la tabla afil: ` +
												  reg_pat_no_ins
												: "Todos los registros patronales fueron insertador correctamente"
										}
                                    `,
								});
							})
							.catch((e) => {
								// Si hubo un error, regresar el callback con el mensaje
								callback({
									status: false,
									msg: `No se pudo insertar el lote [${lote}-${
										lote + 999
									}]. Error: ${e}`,
								});
							});
					} else {
						// No hay registros válidos para insertar
						callback({
							status: false,
							msg: `No se pudo insertar el lote [${lote}-${
								lote + 999
							}]. No hay registros válidos.`,
						});
					}
				} catch (e) {
					// Si hubo un error, regresar el callback con el mensaje
					callback({
						status: false,
						msg: `No se pudo insertar el lote [${lote}-${
							lote + 999
						}]. Error: ${e}`,
					});
				}
			}
		);

		// Obtener fechas de registro en la tabla Afil
		socket.on("cliente:consultarRegistrosAfil", async () => {
			try {
				// Obtener todas las fechas de registro de la tabla Afil
				const fechasRegistro = await Afil.findAll({
					attributes: [
						[
							sequelize.fn(
								"DISTINCT",
								sequelize.col("createdAt")
							),
							"createdAt",
						],
					],
				});

				// Hacer un map para cada registro para obtener solo la fecha
				const fechasDistintas = fechasRegistro.map(
					(registro) => registro.dataValues.createdAt
				);
				// Regresar las fechas distintas
				socket.emit("servidor:consultarRegistrosAfil", fechasDistintas);
			} catch (error) {
				// Manejar el error
				console.error(error);
				socket.emit(
					"servidor:error",
					"Error al consultar los registros de Afil."
				);
			}
		});

		// Filtrar los registros Afil por fecha.
		socket.on("cliente:filtrarAfil", async (fechaAfil) => {
			try {
				// Filtrar los registros Afil por fecha
				const afilFiltrado = await Afil.findAll({
					where: sequelize.where(
						sequelize.fn("DATE", sequelize.col("createdAt")),
						fechaAfil
					),
				});
				// Emitir el resultado de la busqueda de Afil
				socket.emit("servidor:filtrarAfil", afilFiltrado);
			} catch (error) {
				// Manejar el error
				console.error(error);
				// Emitir el mensaje de error
				socket.emit(
					"servidor:error",
					"Error al filtrar los registros de Afil por fecha."
				);
			}
		});

		// Obtener fechas de registro en la tabla Coin
		socket.on("cliente:consultarRegistrosCoin", async () => {
			try {
				// Obtener todas las fechas de registro de la tabla Coin
				const fechasRegistro = await Coin.findAll({
					attributes: [
						[
							sequelize.fn(
								"DISTINCT",
								sequelize.col("createdAt")
							),
							"createdAt",
						],
					],
				});
				// Hacer un map para cada registro para obtener solo la fecha
				const fechasDistintas = fechasRegistro.map(
					(registro) => registro.dataValues.createdAt
				);
				// Regresar las fechas distinta
				socket.emit("servidor:consultarRegistrosCoin", fechasDistintas);
			} catch (error) {
				// Manejar el error
				console.error(error);
				socket.emit(
					"servidor:error",
					"Error al consultar los registros de Coin."
				);
			}
		});

		// Filtrar los registros Coin por fecha.
		socket.on("cliente:filtrarCoin", async (fechaCoin) => {
			try {
				// Filtrar los registros Coin por fecha
				const coinFiltrado = await Coin.findAll({
					where: sequelize.where(
						sequelize.fn("DATE", sequelize.col("createdAt")),
						fechaCoin
					),
				});
				// Emitir el resultado de la busqueda de Coin
				socket.emit("servidor:filtrarCoin", coinFiltrado);
			} catch (error) {
				// Manejar el error
				console.error(error);
				socket.emit(
					"servidor:error",
					"Error al filtrar los registros de Coin por fecha."
				);
			}
		});

		// Obtener fechas de registro en la tabla Rale COP
		socket.on("cliente:consultarRegistrosRaleCOP", async () => {
			try {
				// Obtener todas las fechas de registro de la tabla Rale COP
				const fechasRegistro = await RaleCop.findAll({
					attributes: [
						[
							sequelize.fn(
								"DISTINCT",
								sequelize.col("createdAt")
							),
							"createdAt",
						],
					],
				});
				// Hacer un map para cada registro para obtener solo la fecha
				const fechasDistintas = fechasRegistro.map(
					(registro) => registro.dataValues.createdAt
				);
				// Regresar las fechas distinta
				socket.emit(
					"servidor:consultarRegistrosRaleCOP",
					fechasDistintas
				);
			} catch (error) {
				// Manejar el error
				console.error(error);
				socket.emit(
					"servidor:error",
					"Error al consultar los registros de Rale COP."
				);
			}
		});

		// Filtrar los registros Rale COP por fecha.
		socket.on("cliente:filtrarRaleCOP", async (fechaRaleCOP) => {
			try {
                // Filtrar los registros Rale COP por fecha
				const raleCOPFiltrado = await RaleCop.findAll({
					where: sequelize.where(
						sequelize.fn("DATE", sequelize.col("createdAt")),
						fechaRaleCOP
					),
				});
                // Emitir el resultado de la busqueda de Rale COP
				socket.emit("servidor:filtrarRaleCOP", raleCOPFiltrado);
			} catch (error) {
				// Manejar el error
				console.error(error);
				socket.emit(
					"servidor:error",
					"Error al filtrar los registros de Rale COP por fecha."
				);
			}
		});

		// Obtener fechas de registro en la tabla Rale RCV
		socket.on("cliente:consultarRegistrosRaleRCV", async () => {
			try {
                // Obtener todas las fechas de registro de la tabla Rale RCV
				const fechasRegistro = await RaleRcv.findAll({
					attributes: [
						[
							sequelize.fn(
								"DISTINCT",
								sequelize.col("createdAt")
							),
							"createdAt",
						],
					],
				});
                // Hacer un map para cada registro para obtener solo la fecha
				const fechasDistintas = fechasRegistro.map(
					(registro) => registro.dataValues.createdAt
				);
                // Regresar las fechas distinta
				socket.emit(
					"servidor:consultarRegistrosRaleRCV",
					fechasDistintas
				);
			} catch (error) {
				// Manejar el error
				console.error(error);
				socket.emit(
					"servidor:error",
					"Error al consultar los registros del rale RCV."
				);
			}
		});

		// Filtrar los registros Rale RCV por fecha.
		socket.on("cliente:filtrarRaleRCV", async (fechaRaleRCV) => {
			try {
                // Filtrar los registros Rale RCV por fecha
				const raleRCVFiltrado = await RaleRcv.findAll({
					where: sequelize.where(
						sequelize.fn("DATE", sequelize.col("createdAt")),
						fechaRaleRCV
					),
				});
                // Emitir el resultado de la busqueda de Rale RCV
				socket.emit("servidor:filtrarRaleRCV", raleRCVFiltrado);
			} catch (error) {
				// Manejar el error
				console.error(error);
				socket.emit(
					"servidor:error",
					"Error al filtrar los registros de Rale RCV por fecha."
				);
			}
		});

		//Obtener fechas de las tablas
		socket.on("cliente:consultarRegistros", async (valor) => {
			try {
				let fechasRegistro;

                // Si el valor es afil, coin, cop, rcv, entonces buscar las fechas de registro de esa tabla
				if (valor == "afil") {
					fechasRegistro = await Afil.findAll({
						attributes: [
							[
								sequelize.fn(
									"DISTINCT",
									sequelize.col("createdAt")
								),
								"createdAt",
							],
						],
					});
				}
				if (valor == "coin") {
					fechasRegistro = await Coin.findAll({
						attributes: [
							[
								sequelize.fn(
									"DISTINCT",
									sequelize.col("createdAt")
								),
								"createdAt",
							],
						],
					});
				}
				if (valor == "cop") {
					fechasRegistro = await RaleCop.findAll({
						attributes: [
							[
								sequelize.fn(
									"DISTINCT",
									sequelize.col("createdAt")
								),
								"createdAt",
							],
						],
					});
				}
				if (valor == "rcv") {
					fechasRegistro = await RaleRcv.findAll({
						attributes: [
							[
								sequelize.fn(
									"DISTINCT",
									sequelize.col("createdAt")
								),
								"createdAt",
							],
						],
					});
				}
                // Si existen las fechas registro 
				if (fechasRegistro) {
                    // Hacer un map para cada registro para obtener solo la fecha
					const fechasDistintas = fechasRegistro.map(
						(registro) => registro.dataValues.createdAt
					);
                    // Regresar las fechas distinta
					socket.emit(
						"servidor:consultarRegistros",
						fechasDistintas,
						valor
					);
				}
			} catch (error) {
				// Manejar el error
				console.error(error);
				socket.emit(
					"servidor:error",
					"Error al consultar los registros de Coin."
				);
			}
		});

		// Filtrar los registros Coin por fecha.
		socket.on("cliente:filtrarArchivos", async (fecha, valor) => {
			try {
				let archivoFiltrado;
                // Si el valor es afil, coin, cop, rcv, entonces buscar las fechas de registro de esa tabla
				if (valor == "afil") {
					archivoFiltrado = await Afil.findAll({
						where: sequelize.where(
							sequelize.fn("DATE", sequelize.col("createdAt")),
							fecha
						),
					});
				}
				if (valor == "coin") {
					archivoFiltrado = await Coin.findAll({
						where: sequelize.where(
							sequelize.fn("DATE", sequelize.col("createdAt")),
							fecha
						),
					});
				}
				if (valor == "cop") {
					archivoFiltrado = await RaleCop.findAll({
						where: sequelize.where(
							sequelize.fn("DATE", sequelize.col("createdAt")),
							fecha
						),
					});
				}
				if (valor == "rcv") {
					archivoFiltrado = await RaleRcv.findAll({
						where: sequelize.where(
							sequelize.fn("DATE", sequelize.col("createdAt")),
							fecha
						),
					});
				}
                // Regresar el archivo filtrado y el valor
				socket.emit("servidor:filtrarArchivo", archivoFiltrado, valor);
			} catch (error) {
				// Manejar el error
				console.error(error);
				socket.emit(
					"servidor:error",
					"Error al filtrar los registros de Coin por fecha."
				);
			}
		});

		// Maneja el evento de desconexión del cliente
		socket.on("disconnect", () => {
			// Programar eventos (innecesarios por ahora)
		});
	});
}

function processCoin(file) {
    // Leer el archivo
	const workbook = XLSX.read(file, { type: "array" });
	const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convertir el archivo a un arreglo de objetos
	const data = XLSX.utils.sheet_to_json(worksheet, {
		header: 1,
		raw: false,
		cellDates: true,
	});

	// Obtener los índices de las columnas de interés
	const headerIndex = {
		deleg_control: null,
		subdeleg_control: null,
		deleg_emision: null,
		subdeleg_emision: null,
		rp: null,
		esencial: null,
		clasificacion: null,
		cve_mov_pat: null,
		fecha_mov_pat: null,
		razon_social: null,
		num_credito: null,
		periodo: null,
		importe: null,
		tipo_documento: null,
		seguro: null,
		dias_estancia: null,
		incidencia: null,
		fecha_incidencia: null,
		estado: null,
		"POR IMPORTE": null,
		"POR ANTIGUEDAD": null,
		"INC ACTUAL": null,
		RESULTADO: null,
	};

	// Buscar los índices de las columnas en el encabezado
	const headers = data[0];
	for (let i = 0; i < headers.length; i++) {
		const header = headers[i];
		if (headerIndex.hasOwnProperty(header)) {
			headerIndex[header] = i;
		}
	}

	// Procesar los datos
	const result = [];
	for (let i = 1; i < data.length; i++) {
		const row = data[i];
		const obj = {};

        // Recorrer las columnas de interés y asignar valores a las propiedades del objeto
		for (const header in headerIndex) {
			const columnIndex = headerIndex[header];
            // Validar que exista la columna en el registro
			if (columnIndex !== null && columnIndex < row.length) {
				let value = row[columnIndex];

				// Validar que exista reg_pat
				if (
					header === "rp" &&
					(value === null || value === "" || value === "TOTAL DE")
				)
					continue;

				// Dividir registro patronal
				if (header === "rp") {
					value =
						value.substring(0, 3) +
						"-" +
						value.substring(3, 8) +
						"-" +
						value.substring(8);
				}

				// Poner en nulos los posibles vacíos
				if (header === "INC ACTUAL" || header === "RESULTADO")
					if (value === null || value === "" || value === undefined)
						value = null;

				// Convertir a bool los necesarios
				if (header === "POR ANTIGUEDAD" || header === "POR IMPORTE")
					value = String(value).toUpperCase() == "SI" ? true : false;

				if (header === "esencial")
					value = String(value).toUpperCase() == "S" ? true : false;

				// Convertir a INT
				if (
					header === "deleg_control" ||
					header === "subdeleg_control" ||
					header === "deleg_emision" ||
					header === "subdeleg_emision" ||
					header === "cve_mov_pat" ||
					header === "tipo_documento" ||
					header === "dias_estancia" ||
					header === "incidencia"
				)
					value = value !== null ? parseInt(value) : null;

				// Convertir a DOUBLE
				if (header === "num_credito" || header === "importe")
					value = value !== null ? parseFloat(value) : null;

				// Convertir en fecha
				if (header === "fecha_mov_pat" || header === "fecha_incidencia")
					value = value !== null ? new Date(value) : null;

				if (header === "periodo") {
					let year = value.substring(0, 4);
					let month = value.substring(4, 6);
					value = year + "/" + month + "/" + "01";
					value = new Date(value);
				}

				obj[header] = value;
			}
		}
		result.push(obj);
	}
	return result;
}

function processRale(file) {
    // Leer el archivo
	const workbook = XLSX.read(file, { type: "array" });
	const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convertir el archivo a un arreglo de objetos
	const data = XLSX.utils.sheet_to_json(worksheet, {
		header: 1,
		raw: false,
		cellDates: true,
	});

	// Obtener los índices de las columnas de interés
	const headerIndex = {
		"REG. PATRONAL": null,
		M: null,
		"OV. PATRONAL": null,
		SECT: null,
		"NUM.CRED.": null,
		CE: null,
		PERIODO: null,
		TD: null,
		"FECHA ALTA": null,
		"FEC. NOTIF.": null,
		"INC.": null,
		"FEC. INCID.": null,
		DIAS: null,
		"I M P O R T E": null,
		"DC SC": null,
	};

	// Buscar los índices de las columnas en el encabezado
	const headers = data[0];
	for (let i = 0; i < headers.length; i++) {
		const header = headers[i];
		if (headerIndex.hasOwnProperty(header)) {
			headerIndex[header] = i;
		}
	}

	// Procesar los datos
	const result = [];
	let raleType = "";

    // Recorrer las columnas de interés y asignar valores a las propiedades del objeto
	for (let i = 1; i < data.length; i++) {
		const row = data[i];
		const obj = {};

        // Recorrer las columnas de interés y asignar valores a las propiedades del objeto
		for (const header in headerIndex) {
			const columnIndex = headerIndex[header];
			if (columnIndex !== null && columnIndex < row.length) {
				let value = row[columnIndex];
				obj[header] = value;
			}
		}
		// Validar que exista reg_pat
		if (
			obj["REG. PATRONAL"] === null ||
			obj["REG. PATRONAL"] === undefined ||
			obj["REG. PATRONAL"] === "" ||
			obj["REG. PATRONAL"] === "TOTAL DE" ||
			obj["REG. PATRONAL"].includes(".") ||
			obj["REG. PATRONAL"].includes(" ") ||
			obj["REG. PATRONAL"] === "D" ||
			obj["REG. PATRONAL"] === "COBR2303" ||
			obj["REG. PATRONAL"] === "ACT.ECO" ||
			obj["REG. PATRONAL"] === "IMPORTE:" ||
			obj["REG. PATRONAL"] === "IMPORTE" ||
			obj["REG. PATRONAL"] === "REG. PATRONAL"
		)
			continue;

		// Validar tipo de documento
		if (
			obj["TD"] == 0 ||
			obj["TD"] == 2 ||
			obj["TD"] == 80 ||
			obj["TD"] == 81 ||
			obj["TD"] == 82 ||
			obj["TD"] == 88 ||
			obj["TD"] == 89
		)
			raleType = "COP";
		else if (obj["TD"] == 60) raleType = "RCV";

		// Poner en nulos los posibles vacíos
		if (
			obj["DC SC"] === null ||
			obj["DC SC"] === "" ||
			obj["DC SC"] === "#0/##/####" ||
			obj["DC SC"] === undefined
		)
			obj["DC SC"] = null;
		if (
			obj["CE"] === null ||
			obj["CE"] === "" ||
			obj["CE"] === "#0/##/####" ||
			obj["CE"] === undefined
		)
			obj["CE"] = null;
		if (
			obj["FEC. NOTIF."] === null ||
			obj["FEC. NOTIF."] === "" ||
			obj["FEC. NOTIF."] === "#0/##/####" ||
			obj["FEC. NOTIF."] === "0/ /" ||
			obj["FEC. NOTIF."] === undefined
		)
			obj["FEC. NOTIF."] = null;
		if (
			obj["FEC. INCID."] === null ||
			obj["FEC. INCID."] === "" ||
			obj["FEC. INCID."] === "#0/##/####" ||
			obj["FEC. INCID."] === undefined
		)
			obj["FEC. INCID."] = null;

		// Convertir a numeros los posibles
		obj["M"] = obj["M"] ? parseInt(obj["M"]) : 0;
		obj["SECT"] = obj["SECT"] ? parseInt(obj["SECT"]) : 0;
		obj["TD"] = obj["TD"] ? parseInt(obj["TD"]) : 0;
		obj["INC."] = obj["INC."] ? parseInt(obj["INC."]) : 0;
		obj["DIAS"] = obj["DIAS"] ? parseInt(obj["DIAS"]) : 0;

		// Convertir a número decimal los que son necesarios
		obj["NUM.CRED."] = obj["NUM.CRED."] ? parseFloat(obj["NUM.CRED."]) : 0;
		obj["I M P O R T E"] = obj["I M P O R T E"]
			? parseFloat(
					obj["I M P O R T E"].replace(/,/g, "").replace(".", ".")
			  )
			: 0;

		// Convertir a fecha los que sean necesarios
		obj["OV. PATRONAL"] = obj["OV. PATRONAL"]
			? new Date(obj["OV. PATRONAL"].toString())
			: null;
		obj["FECHA ALTA"] = obj["FECHA ALTA"]
			? new Date(obj["FECHA ALTA"].toString())
			: null;
		obj["FEC. NOTIF."] = obj["FEC. NOTIF."]
			? new Date(obj["FEC. NOTIF."].toString())
			: null;
		obj["FEC. INCID."] = obj["FEC. INCID."]
			? new Date(obj["FEC. INCID."].toString())
			: null;

		// Dar formato al PERIODO
		if (obj["PERIODO"]) {
			let fec = obj["PERIODO"].split("/");
			let fecstr = `${fec[1]}/${fec[0]}/01`;
			obj["PERIODO"] = new Date(Date.parse(fecstr));
		}

		result.push(obj);
	}
    // Juntar el resultado y el tipo de rale
	let ret = { result, raleType };
	return ret;
}

async function processAfil(file) {
    // Leer el archivo excel
	const workbook = XLSX.read(file, { type: "array" });
	const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convertir a json
	const data = XLSX.utils.sheet_to_json(worksheet, {
		header: 1,
		raw: false,
		cellDates: true,
	});

	// Obtener los índices de las columnas de interés
	const headerIndex = {
		"REG PAT": null,
		PATRON: null,
		ACTIVIDAD: null,
		DOMICILIO: null,
		LOCALIDAD: null,
		RFC: null,
		"C.P.": null,
		EJECUTOR: null,
		CLAVE: null,
	};

	// Buscar los índices de las columnas en el encabezado
	const headers = data[0];
	for (let i = 0; i < headers.length; i++) {
		const header = headers[i];
		if (headerIndex.hasOwnProperty(header)) {
			headerIndex[header] = i;
		}
	}

    // Obtener los ejecutores
	let eje = await Ejecutor.findAll();
    // Obtener los valores de los ejecutores
	eje = eje.map((obj) => obj.dataValues);
	let dict = {};
    // Recorrer los ejecutores y guardarlos en un diccionario
	eje.map((item) => {
		if (item.type === "ejecutor" && item.status == 1) {
			dict[item.nombre] = item.clave_eje;
		}
	});
    // Agregar el ejecutor "No asignado"
	dict["No asignado"] = "E-00000000";

	// Procesar los datos
	const result = [];

    // Recorrer los datos y agregarlos al resultado
	for (let i = 1; i < data.length; i++) {
		const row = data[i];
		const obj = {};
        // Validar que existan las columnas de interés
		for (const header in headerIndex) {
			const columnIndex = headerIndex[header];
			if (columnIndex !== null && columnIndex < row.length) {
				let value = row[columnIndex];

				// Validar que exista reg_pat
				if (
					header === "REG PAT" &&
					(value === null || value === "" || value === "TOTAL DE")
				)
					continue;

				// Poner en nulos los posibles vacíos
				if (
					header === "C.P." ||
					header === "RFC" ||
					header === "EJECUTOR" ||
					header === "CLAVE"
				)
					if (value === null || value === "" || value === undefined)
						value = null;

				// Convertir a número entero los que son necesarios
				if (header === "C.P.")
					value = value !== null ? parseInt(value) : 0;

				obj[header] = value;
			}
		}
        // Asignar la clave a cada ejecutor, si no tiene nombre asignar a "No Asignado"
		obj.EJECUTOR =
			obj.EJECUTOR == 0 || obj.EJECUTOR == "" || obj.EJECUTOR === null
				? "No asignado"
				: obj.EJECUTOR;
		obj.CLAVE = dict[obj.EJECUTOR];
		result.push(obj);
	}
	return result;
}
