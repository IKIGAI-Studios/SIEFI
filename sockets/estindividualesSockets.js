import Afil from "../models/afilModel.js";
import RaleCop from "../models/raleCOPModel.js";
import RaleRcv from "../models/raleRCVModel.js";
import Coin from "../models/coinModel.js";
import { Op, Sequelize } from "sequelize";
import { format } from "date-fns";
import { es } from "date-fns/locale/index.js";
import PDF from "pdfkit";
import "pdfkit-table";
import fs from "fs";

export function socket(io) {
	io.on("connection", (socket) => {
		// Consultar Patrones por ejecutor
		socket.on(
			"cliente:ejecutorSeleccionadoEstInd",
			async ({ ejecutor, copDate, rcvDate, coinDate }) => {
				let data = {};

				const afil = await Afil.findAll({
					where: {
						ejecutor: ejecutor,
					},
				});
				let cop = await RaleCop.findAll({
					where: {
						reg_pat: {
							[Op.in]: afil.map((obj) => obj.reg_pat),
						},
						createdAt: {
							[Sequelize.Op.eq]: Sequelize.literal(
								`DATE('${copDate}')`
							),
						},
					},
				});
				let rcv = await RaleRcv.findAll({
					where: {
						reg_pat: {
							[Op.in]: afil.map((obj) => obj.reg_pat),
						},
						createdAt: {
							[Sequelize.Op.eq]: Sequelize.literal(
								`DATE('${rcvDate}')`
							),
						},
					},
				});
				let coin = await Coin.findAll({
					where: {
						reg_pat: {
							[Op.in]: afil.map((obj) => obj.reg_pat),
						},
						createdAt: {
							[Sequelize.Op.eq]: Sequelize.literal(
								`DATE('${coinDate}')`
							),
						},
					},
				});

				cop = cop.map((obj) => obj.dataValues);
				rcv = rcv.map((obj) => obj.dataValues);
				coin = coin.map((obj) => obj.dataValues);

				let copM = cop.map((c) => {
					if (c.td === 6) {
						return Object.assign(c, { type: "rcv" });
					} else if (c.td.toString().startsWith("8")) {
						return Object.assign(c, { type: "multas" });
					} else {
						return Object.assign(c, { type: "cuotas" });
					}
				});
				let rcvM = rcv.map((r) => Object.assign(r, { type: "rcv" }));
				let coinM = coin.map((r) => Object.assign(r, { type: "coin" }));

				data.rales = copM.concat(rcvM);
				data.coin = coinM;

				data.rales.sort((a, b) => {
					if (a.reg_pat !== b.reg_pat)
						return a.reg_pat.localeCompare(b.reg_pat);
					if (a.periodo !== b.periodo)
						return a.periodo.localeCompare(b.periodo);
					return a.td - b.td;
				});

				data.rales.map((rale) => {
					Object.assign(rale, {
						dias_rest: Math.floor(
							(new Date() - new Date(rale.fec_insid)) / 86400000
						),
					});
					Object.assign(rale, {
						oportunidad:
							rale.inc == 2
								? "En tiempo 2"
								: rale.dias_rest > 40
								? "Fuera de tiempo"
								: "En tiempo 31",
					});
				});

				data.coin.sort((a, b) => {
					return a.reg_pat.localeCompare(b.reg_pat);
				});

				socket.emit("servidor:estIndividuales", { data });
			}
		);

		socket.on(
			"cliente:confrontaEstInd",
			async ({ ejecutor, copDate, rcvDate }) => {
				let data = {};

				const afil = await Afil.findAll({
					where: {
						ejecutor: ejecutor,
					},
				});
				let cop = await RaleCop.findAll({
					where: {
						reg_pat: {
							[Op.in]: afil.map((obj) => obj.reg_pat),
						},
						createdAt: {
							[Sequelize.Op.eq]: Sequelize.literal(
								`DATE('${copDate}')`
							),
						},
					},
				});
				let rcv = await RaleRcv.findAll({
					where: {
						reg_pat: {
							[Op.in]: afil.map((obj) => obj.reg_pat),
						},
						createdAt: {
							[Sequelize.Op.eq]: Sequelize.literal(
								`DATE('${rcvDate}')`
							),
						},
					},
				});

				cop = cop.map((obj) => obj.dataValues);
				rcv = rcv.map((obj) => obj.dataValues);

				let copM = cop.map((c) => {
					if (c.td === 6) {
						return Object.assign(c, { type: "rcv" });
					} else if (c.td.toString().startsWith("8")) {
						return Object.assign(c, { type: "multas" });
					} else {
						return Object.assign(c, { type: "cuotas" });
					}
				});
				let rcvM = rcv.map((r) => Object.assign(r, { type: "rcv" }));

				data.rales = copM.concat(rcvM);

				data.rales.sort((a, b) => {
					if (a.reg_pat !== b.reg_pat)
						return a.reg_pat.localeCompare(b.reg_pat);
					if (a.periodo !== b.periodo)
						return a.periodo.localeCompare(b.periodo);
					return a.td - b.td;
				});

				data.rales.map((rale) => {
					Object.assign(rale, {
						dias_rest: Math.floor(
							(new Date() - new Date(rale.fec_insid)) / 86400000
						),
					});
					Object.assign(rale, {
						oportunidad:
							rale.inc == 2
								? "En tiempo 2"
								: rale.dias_rest > 40
								? "Fuera de tiempo"
								: "En tiempo 31",
					});
				});
				socket.emit("servidor:estIndividualesConfronta", { data });
			}
		);

		//Socket para descargar el pdf del listado de los patrones.
		socket.on(
			"cliente:generarListadoPatrones",
			async ({ obj, ordenar, ejecutor }, callback) => {
				var datosTabla = [];
				const registrosAgrupados = agruparArchivos(obj, ordenar);
				const registrosAfil = await obtenerAfil(registrosAgrupados);
				const datosTotales = obtenerTotales(registrosAgrupados);

				// Obtener la fecha actual
				const currentDate = new Date();
				const formattedDate = format(currentDate, "dd-MMMM-yyyy", {
					locale: es,
				});

				// Generar el documento de PDF
				const doc = new PDF();

				// Agregar contenido al archivo PDF
				var margenIzquierdo = 20;
				var margenSuperior = 0;
				var anchoColumna = 0;
				var altoFila = 34;
				var y = 0;

				// Encabezado
				const imageEncabezado = "src/imgs/encabezado-reportes.png";
				const agregarEncabezado = () => {
					doc.image(imageEncabezado, {
						fit: [500, 100],
						align: "center",
						x: 50,
						y: 10,
					});
					doc.moveDown(2);
				};
				agregarEncabezado();
				doc.on("pageAdded", () => {
					agregarEncabezado();
				});

				// Pie de página
				const imagePie = "src/imgs/footer-reportes.png";
				const agregarPie = () => {
					doc.image(imagePie, {
						fit: [500, 100],
						align: "center",
						x: 50,
						y: 725,
					});
				};
				agregarPie();
				doc.on("pageAdded", () => {
					agregarPie();
				});

				//Información del PDF
				doc.font("Helvetica-Bold")
					.fontSize(14)
					.lineGap(14 * 0.5)
					.text("PATRONES NO COBRADOS", { align: "center" })
					.font("Helvetica")
					.fontSize(8)
					.lineGap(8 * 0.5)
					.text(`EJECUTOR: ${ejecutor} `, { align: "center" })
					.text(`FECHA: ${formattedDate}`, { align: "center" })
					.text(`Ordenado por ${ordenar ? "dias" : "importe"}`, {
						align: "center",
					});
				doc.fontSize(6);

				// Crear la tabla.
				datosTabla = [
					[
						"REG_PAT",
						"PATRON",
						"DOMICILIO",
						"LOCALIDAD",
						"OPORTUNIDAD",
						"PROGRAMABLE",
						"CUENTA_CRED",
						"MAX_FECHA REAL",
						"SUMA IMPORTES",
					],
				];
				registrosAfil.map((afil) => {
					var importeTotalFormat = afil.suma_imp.toLocaleString(
						"es-MX",
						{ style: "currency", currency: "MXN" }
					);
					let temp = [
						afil.reg_pat,
						afil.patron,
						afil.domicilio,
						afil.localidad,
						afil.oportunidad,
						afil.programable,
						afil.no_creditos,
						afil.max_dias,
						importeTotalFormat,
					];
					datosTabla.push(temp);
				});
				anchoColumna = [50, 100, 100, 80, 55, 60, 35, 35, 60];
				const registrosPorPagina = 15;
				margenSuperior = 180;

				// Dibujar la tabla
				for (let fila = 0; fila < datosTabla.length; fila++) {
					if (fila > 0 && fila % registrosPorPagina === 0) {
						margenSuperior = 130;
						doc.addPage();
						let x = margenIzquierdo;
						for (
							let columna = 0;
							columna < datosTabla[0].length;
							columna++
						) {
							y =
								margenSuperior +
								(fila % registrosPorPagina) * altoFila -
								altoFila;
							doc.fillColor("#D9C9A8")
								.font("Helvetica-Bold")
								.lineWidth(0.5)
								.rect(x, y, anchoColumna[columna], altoFila)
								.fillAndStroke()
								.fillColor("black")
								.text(datosTabla[0][columna], x + 5, y + 5, {
									width: anchoColumna[columna] - 5,
								});
							x += anchoColumna[columna]; // Actualizar la posición x
						}
					}
					let x = margenIzquierdo;
					for (
						let columna = 0;
						columna < datosTabla[fila].length;
						columna++
					) {
						const y =
							margenSuperior +
							(fila % registrosPorPagina) * altoFila;

						if (fila === 0) {
							doc.fillColor("#D9C9A8");

							doc.font("Helvetica-Bold");
						} else {
							doc.fillColor("white");
						}
						// Dibujar el borde de la celda
						doc.lineWidth(0.5);
						doc.rect(
							x,
							y,
							anchoColumna[columna],
							altoFila
						).fillAndStroke();
						doc.fillColor("black");
						doc.text(datosTabla[fila][columna], x + 5, y + 5, {
							width: anchoColumna[columna] - 5,
						});
						x += anchoColumna[columna]; // Actualizar la posición x
					}
				}
				doc.moveDown(3);

				//Agregar totales al final de la página
				var importeTotalFormat = datosTotales[2].toLocaleString(
					"es-MX",
					{ style: "currency", currency: "MXN" }
				);
				doc.font("Helvetica-Bold")
					.fontSize(9)
					.text(
						`TOTAL MÁXIMO DE IMPORTES: ${datosTotales[0]}\n`,
						margenIzquierdo,
						650 + 20
					)
					.text(
						`MÁXIMO DE DÍAS REALES: ${datosTotales[1]}\n`,
						margenIzquierdo
					)
					.text(
						`TOTAL DE SUMA IMPORTES: ${importeTotalFormat}`,
						margenIzquierdo
					);

				// Generar el nombre del archivo con la fecha
				const fileName = `LISTADO PATRONAL_${formattedDate}.pdf`;
				const filePath = `src/assets/pdf/${fileName}`;
				const writeStream = fs.createWriteStream(filePath);
				doc.pipe(writeStream);
				doc.end();

				// Escuchar el evento 'finish' del stream de escritura
				writeStream.on("finish", () => {
					// Leer el archivo y enviarlo como respuesta en el callback
					const fileStream = fs.createReadStream(filePath);
					const chunks = [];
					fileStream.on("data", (chunk) => {
						chunks.push(chunk);
					});
					fileStream.on("end", () => {
						const fileData = Buffer.concat(chunks);

						// Llamar al callback con los datos del archivo PDF
						callback({ fileName, fileData });
					});
				});

				// Manejar errores de escritura
				writeStream.on("error", (err) => {
					console.error("Error al crear el archivo PDF:", err);
					callback({ error: "Error al crear el archivo PDF" });
				});
			}
		);

		// Maneja el evento de desconexión del cliente
		socket.on("disconnect", () => {
			// Programar eventos (innecesarios por ahora)
		});
	});
}

// Funciones para la estructuración de los archivos
function agruparArchivos(obj, ordenar) {
	const ralesNoCobrados = [];
	var registro_patronal;
	var diasMayores;
	var contadorCreditos;
	var acuImportes;
	var oportunidad;
	let programable;

	// Ordenar los registros de los Rales.
	obj.rales.forEach(function (rale, index) {
		if (index === 0) {
			registro_patronal = rale.reg_pat;
			diasMayores = 0;
			contadorCreditos = 0;
			acuImportes = 0;
			oportunidad = "En tiempo 2";
		}
		programable = obj.coin.find(
			(coin) =>
				coin.reg_pat == rale.reg_pat &&
				coin.num_credito == rale.nom_cred
		);
		if (rale.reg_pat == registro_patronal && rale.cobrado == false) {
			contadorCreditos = contadorCreditos + 1;
			acuImportes = acuImportes + rale.importe;
			if (rale.dias_rest > diasMayores) diasMayores = rale.dias_rest;
			if (oportunidad != "Fuera de tiempo") {
				if (rale.oportunidad == "Fuera de tiempo")
					oportunidad = rale.oportunidad;
				else if (rale.oportunidad == "En tiempo 31")
					oportunidad = rale.oportunidad;
			}
		} else {
			if (
				!ralesNoCobrados.some(function (obj) {
					return obj.reg_pat === registro_patronal;
				})
			) {
				ralesNoCobrados.push({
					reg_pat: registro_patronal,
					no_creditos: contadorCreditos,
					max_dias: diasMayores,
					suma_imp: acuImportes,
					oportunidad: oportunidad,
					programable:
						programable != undefined
							? programable.estado
							: "En tiempo 2",
				});
			}
			registro_patronal = rale.reg_pat;
			contadorCreditos = 1;
			acuImportes = rale.importe;
			diasMayores = 0;
		}
	});
	// Agrega el último objeto al arreglo ralesNoCobrados
	if (
		!ralesNoCobrados.some(function (obj) {
			return obj.reg_pat === registro_patronal;
		})
	) {
		ralesNoCobrados.push({
			reg_pat: registro_patronal,
			no_creditos: contadorCreditos,
			max_dias: diasMayores,
			suma_imp: acuImportes,
			oportunidad: oportunidad,
			programable:
				programable != undefined ? programable.estado : "En tiempo 2",
		});
	}

	//Ordenar dependiendo los días o el importe (true: ordena por días, false: ordena por importe)
	if (ordenar) {
		ralesNoCobrados.sort(function (a, b) {
			return b.max_dias - a.max_dias;
		});
	} else {
		ralesNoCobrados.sort(function (a, b) {
			return b.suma_imp - a.suma_imp;
		});
	}
	return ralesNoCobrados;
}

// Funcion para realizar la consulta a la tabla Afil.
async function obtenerAfil(registrosAgrupados) {
	try {
		const listadoRale = [];
		for (const rale of registrosAgrupados) {
			const afilData = await Afil.findOne({
				where: { reg_pat: rale.reg_pat },
				attributes: [
					"reg_pat",
					"patron",
					"actividad",
					"domicilio",
					"localidad",
					"cp",
				],
			});
			if (afilData) {
				const raleData = {
					reg_pat: afilData.reg_pat,
					patron: afilData.patron,
					domicilio: afilData.domicilio,
					localidad: afilData.localidad,
					oportunidad: rale.oportunidad,
					programable: rale.programable,
					no_creditos: rale.no_creditos,
					max_dias: rale.max_dias,
					suma_imp: rale.suma_imp,
				};
				listadoRale.push(raleData);
			}
		}
		return listadoRale;
	} catch (error) {
		console.error(
			"Ocurrió un error al obtener los registros de Afil:",
			error
		);
		throw error;
	}
}

// Función para obtener los totales
function obtenerTotales(listadoAgrupado) {
	// Variables
	var listadoTotales = [];
	var totalCreditos = 0;
	var totalImporte = 0;
	var maximoDia = listadoAgrupado[0].max_dias;

	// Recorrer el arreglo de rales agrupados y sumar los valores
	listadoAgrupado.forEach(function (rale) {
		totalCreditos = totalCreditos + rale.no_creditos;
		totalImporte = totalImporte + rale.suma_imp;
		if (rale.max_dias >= maximoDia) maximoDia = rale.max_dias;
	});
	listadoTotales.push(totalCreditos, maximoDia, totalImporte);
	return listadoTotales;
}
