import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { format } from "date-fns";
import { Op } from "sequelize";
import RaleCop from "../models/raleCOPModel.js";
import RaleRcv from "../models/raleRCVModel.js";
import PDF from "pdfkit";
import "pdfkit-table";
import ExcelJS from "exceljs";
import fs from "fs";
import Afil63 from "../models/afilModel.js";
import Ejecutor from "../models/ejecutorModel.js";
import { es } from "date-fns/locale/index.js";
import path from "path";
import pc from "picocolors";
import {
	parrafo1M,
	parrafo2M,
	parrafo3M,
	parrafo4M,
	parrafo5M1,
	parrafo5M2,
	parrafo6M,
	parrafo7M,
	parrafo8M,
	parrafo9M,
	parrafo10M,
	parrafo11M,
	parrafo12M,
	parrafo13M,
	parrafo14M,
	parrafo15M,
	parrafo16M,
	parrafo17M,
	parrafo1C,
	parrafo2C,
	parrafo3C,
} from "./texo_por_defecto_reportes.js";

// Variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
export async function generarInforme(req, res) {
	try {
		// Obtener datos de formulario
		const nom_cred = req.body.nom_cred;
		const { type, folioSua, resultadosDiligencia } = req.body;

		// Validar si es uno o varios registros y actualizar en la bd
		//Es sólo un registro
		if (typeof nom_cred == "string") {
			// Actualizar si es un rale cop en la tabla rale cop
			if (type == "cop") {
				const resCop = await RaleCop.update(
					{
						folioSua: folioSua,
						res_dil: resultadosDiligencia,
						cobrado: true,
					},
					{
						where: { nom_cred: nom_cred },
					}
				);

				// Actualizar si es un rale rcv en la tabla rale rcv
			} else if (type == "rcv") {
				const resRcv = await RaleRcv.update(
					{
						folioSua: folioSua,
						res_dil: resultadosDiligencia,
						cobrado: true,
					},
					{
						where: { nom_cred: nom_cred },
					}
				);
			}
		}
		// Se enviaron varios registros
		else {
			// Obtener los datos de cada credito
			for (let index = 0; index < nom_cred.length; index++) {
				const value = type[index];
				const nomCredValue = nom_cred[index];
				const folioSuaValue = folioSua[index];
				const resultadosDValue = resultadosDiligencia[index];

				// Actualizar si es un rale cop en la tabla rale cop
				if (value === "cop") {
					const resCop = await RaleCop.update(
						{
							folioSua: folioSuaValue,
							res_dil: resultadosDValue,
							cobrado: true,
						},
						{
							where: { nom_cred: nomCredValue },
						}
					);

					// Actualizar si es un rale rcv en la tabla rale rcv
				} else if (value === "rcv") {
					const resRcv = await RaleRcv.update(
						{
							folioSua: folioSuaValue,
							res_dil: resultadosDValue,
							cobrado: true,
						},
						{
							where: { nom_cred: nomCredValue },
						}
					);
				}
			}
		}
	} catch (err) {
		console.log("No se pudo actualizar en la bd: ", err);
	}

	// Obtener la sesión del Usuario
	const { nombre, apellidos } = req.session.user;
	const {
		reg_pat,
		nom_cred,
		periodo,
		importe,
		folioSua,
		resultadosDiligencia,
	} = req.body;

	//Variables
	var cellFormat;

	// Obtener la fecha actual
	const currentDate = new Date();

	// Obtener el día, mes y año separdos.
	const day = currentDate.getDate();
	const month = currentDate.getMonth() + 1;
	const year = currentDate.getFullYear();

	// Formatear la fecha en el formato deseado
	const formattedDate = `${year}-${month}-${day}`;

	// Ruta del archivo existente
	const filePath = "src/assets/excel/INFORME_DIARIO_DE_EJECUTOR.xlsx";

	// Cargar el archivo existente
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(filePath);

	// Obtener la hoja de trabajo deseada
	const worksheet = workbook.getWorksheet("INFORME");

	// Modificar la información en las celdas mencionadas
	worksheet.getCell("G8").value = day;
	worksheet.getCell("I8").value = month;
	worksheet.getCell("K8").value = year;
	worksheet.getCell("F10").value = nombre + " " + apellidos;
	worksheet.getCell("E11").value = day;
	worksheet.getCell("G11").value = month;
	worksheet.getCell("I11").value = year;

	// Definir el formato de la celda
	cellFormat = {
		font: {
			size: 12,
		},
		alignment: {
			vertical: "middle",
			horizontal: "center",
		},
		border: {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		},
		height: 60,
	};

	// Verificar la cantidad de registros que selecciono
	//Sólo selecciono un registro
	if (typeof reg_pat == "string") {
		//Variables
		var celda;

		//Combinar y centrar las columnas F17 a K17
		worksheet.mergeCells("F17:K17");
		worksheet.getCell("F17").alignment = {
			vertical: "middle",
			horizontal: "center",
		};

		//Llenar celda A17 (Registro patronal):
		celda = worksheet.getCell("A17");
		celda.value = reg_pat;
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Llenar celda B17 (Crédito):
		celda = worksheet.getCell("B17");
		celda.value = nom_cred;
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Llenar celda C17 (Periodo):
		const [yearP, monthP, dayP] = periodo.split("-");
		celda = worksheet.getCell("C17");
		celda.value = `${monthP}/${yearP}`;
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Llenar celda D17 (Importe):
		celda = worksheet.getCell("D17");
		celda.value = `$${importe}`;
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Llenar celda E17 (Folio Sua):
		celda = worksheet.getCell("E17");
		celda.value = folioSua;
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Llenar celda F17 (Resultado de la diligencia):
		celda = worksheet.getCell("F17");
		celda.value = resultadosDiligencia;
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;
	}
	//Selecciono más de un registro
	else {
		//Variables
		var celda;
		var fila;

		// Insertar los valores en la columna A (Registro Patronal)
		reg_pat.forEach((valor, indice) => {
			fila = 16 + indice + 1;
			worksheet.insertRow(fila);
			celda = worksheet.getCell(`A${fila}`);
			celda.value = valor;
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		// Insertar los valores en la columna B (Crédito)
		nom_cred.forEach((valor, indice) => {
			fila = 16 + indice + 1;
			celda = worksheet.getCell(`B${fila}`);
			celda.value = valor;
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		// Insertar los valores en la columna C (Periodo)
		periodo.forEach((valor, indice) => {
			const [yearP, monthP, dayP] = valor.split("-");
			fila = 16 + indice + 1;
			celda = worksheet.getCell(`C${fila}`);
			celda.value = `${yearP}/${monthP} `;
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		// Insertar los valores en la columna D (Importe)
		importe.forEach((valor, indice) => {
			fila = 16 + indice + 1;
			celda = worksheet.getCell(`D${fila}`);
			celda.value = `$${valor}`;
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		// Insertar los valores en la columna E (Folio SUA)
		folioSua.forEach((valor, indice) => {
			fila = 16 + indice + 1;
			celda = worksheet.getCell(`E${fila}`);
			celda.value = valor;
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		try {
			// Insertar los valores en la columna F (Resultado de la diligencia)
			resultadosDiligencia.forEach((valor, indice) => {
				fila = 17 + indice;
				celda = worksheet.getCell(`F${fila}`);
				worksheet.unMergeCells(`G${fila}`);
				worksheet.unMergeCells(`H${fila}`);
				worksheet.unMergeCells(`I${fila}`);
				worksheet.unMergeCells(`J${fila}`);
				worksheet.unMergeCells(`K${fila}`);
				worksheet.mergeCells(`F${fila}:K${fila}`);

				worksheet.getCell(`F${fila}`).alignment = {
					vertical: "middle",
					horizontal: "center",
				};
				celda.value = valor;
				celda.font = cellFormat.font;
				celda.alignment = cellFormat.alignment;
				celda.border = cellFormat.border;
			});
		} catch (error) {
			res.redirect("/login");
			// Mostrar mensaje especifico para tener que editar la libreria exceljs
			if (error.message.includes("Cannot merge already merged cells")) {
				// Obtener la ruta inicial del proyecto
				const filePath = path.join(
					__dirname,
					"../",
					"node_modules",
					"exceljs",
					"lib",
					"doc",
					"worksheet.js:565:5"
				);
				// Construir el link para abrir el archivo en VSC
				const link = `file:///${filePath}`;
				const formattedLink = link.replace(/ /g, "");
				console.error(
					pc.red("ERROR: No se puede generar el archivo de Excel.")
				);
				console.error(
					pc.green(
						`   Para solucionar el problema, puedes comentar las líneas 565-569 en el archivo:`
					)
				);
				console.error(pc.blue(`   ${formattedLink}`));
			} else console.log(error);
		}
	}

	// Generar el nombre del archivo con el nombre de usuario y fecha
	const fileName = `${nombre}_${formattedDate}_INFORME.xlsx`;
	const outputFilePath = `src/assets/excel/${fileName}`;

	// Guardar el archivo modificado
	await workbook.xlsx.writeFile(outputFilePath);

	// Descargar el archivo modificado
	const fileContent = fs.readFileSync(outputFilePath);

	// Mostrar la descarga del archivo
	res.setHeader(
		"Content-Type",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	);
	res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
	res.send(fileContent);
}

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
export async function generarGastos(req, res) {
	try {
		// Obtener datos enviados del formulario
		const nom_cred = req.body.nom_cred;
		const { type, cobrado, gastos } = req.body;
        console.log(nom_cred)

		// Validar si es uno o varios registros y actualizar en la bd
		// Selecciono sólo un registro
		if (typeof nom_cred == "string") {
			// Actualizar si es un rale cop en la tabla rale cop
			if (type == "cop") {
				const resCop = await RaleCop.update(
					{
						cobrado_patron: cobrado,
						gastos_ejecutor: gastos,
					},
					{
						where: { nom_cred: nom_cred },
					}
				);

				// Actualizar si es un rale rcv en la tabla rale rcv
			} else if (type == "rcv") {
				const resRcv = await RaleRcv.update(
					{
						cobrado_patron: cobrado,
						gastos_ejecutor: gastos,
					},
					{
						where: { nom_cred: nom_cred },
					}
				);
			}
		}
		// Se enviaron varios registros
		else {
			for (let index = 0; index < nom_cred.length; index++) {
				// Variables
				const value = type[index];
				const nomCredValue = nom_cred[index];
				const cobradoValue = cobrado[index];
				const gastosValue = gastos[index];

				// Actualizar si es un rale cop en la tabla rale cop
				if (value === "cop") {
					const resCop = await RaleCop.update(
						{
							folioSua: cobradoValue,
							res_dil: gastosValue,
						},
						{
							where: { nom_cred: nomCredValue },
						}
					);
				}
				// Actualizar si es un rale rcv en la tabla rale rcv
				else if (value === "rcv") {
					const resRcv = await RaleRcv.update(
						{
							folioSua: cobradoValue,
							res_dil: gastosValue,
						},
						{
							where: { nom_cred: nomCredValue },
						}
					);
				}
			}
		}
	} catch (err) {
		console.log("No se pudo actualizar en la bd: ", err);
	}

	// Obtener la sesión del Usuario y las variables del req.body
	const { nombre, apellidos } = req.session.user;
	const {
		reg_pat,
		patron,
		type,
		nom_cred,
		periodo,
		provio,
		cobrado,
		gastos,
		fechaPago,
	} = req.body;

	// Variables
	var cellFormat;
	let total = 0;

	// Obtener la fecha actual
	const currentDate = new Date();

	// Obtener el día, mes y año por separado
	const day = currentDate.getDate();
	const month = currentDate.getMonth() + 1;
	const year = currentDate.getFullYear();

	// Formatear la fecha en el formato deseado
	const formattedDate = `${year}-${month}-${day}`;

	// Ruta del archivo existente
	const filePath = "src/assets/excel/GASTOS_EJECUTOR.xlsx";

	// Cargar el archivo existente
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(filePath);

	// Obtener la hoja de trabajo deseada
	const worksheet = workbook.getWorksheet("GASTOS");

	// Definir el formato de la celda
	cellFormat = {
		font: {
			size: 12,
		},
		alignment: {
			vertical: "middle",
			horizontal: "center",
		},
		border: {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		},
		height: 60,
	};

	// Verificar la cantidad de registros que selecciono
	//Selecciono sólo un registro
	if (typeof reg_pat == "string") {
		//Variables
		var celda;
		var cobradoFormat;
		var gastosFormat;
		var sumaFormat;
		var tabuladorFormat;
		var totalFormat;
		var tabulador = 0;

		//Celda A10 (Número consecutivo):
		celda = worksheet.getCell("A10");
		celda.value = "1";
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Celda B10 (Registro patronal):
		celda = worksheet.getCell("B10");
		celda.value = reg_pat;
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Celda C10 (Patrón);
		celda = worksheet.getCell("C10");
		celda.value = patron;
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Celda D10 (Rubro):
		celda = worksheet.getCell("D10");
		celda.value = type;
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Celda E10 (Rev. Prov / o .I.):
		celda = worksheet.getCell("E10");
		celda.value = provio;
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Celda F10 (Fecha de pago):
		celda = worksheet.getCell("F10");
		celda.value = fechaPago;
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Celda G10 (Crédito):
		celda = worksheet.getCell("G10");
		celda.value = nom_cred;
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Celda H10 (Periodo):
		const [yearP, monthP, dayP] = periodo.split("-");
		celda = worksheet.getCell("H10");
		celda.value = `${monthP}/${yearP}`;
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Celda I10 (Cobrado):
		celda = worksheet.getCell("I10");
		cobradoFormat = parseFloat(cobrado);
		celda.value = cobradoFormat;
		celda.style = { numFmt: '"$"#,##0.00' };
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Celda J10 (Gastos):
		celda = worksheet.getCell("J10");
		gastosFormat = parseFloat(gastos);
		celda.value = gastosFormat;
		celda.style = { numFmt: '"$"#,##0.00' };
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Celda K10 (Total):
		celda = worksheet.getCell("K10");
		const I10 = worksheet.getCell("J10");
		const J10 = worksheet.getCell("I10");
		const suma = Number(I10.value) + Number(J10.value);
		sumaFormat = parseFloat(suma);
		celda.value = sumaFormat;
		celda.style = { numFmt: '"$"#,##0.00' };
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		// Validar el tabulador.
		switch (true) {
			case sumaFormat <= 37000.99:
				tabulador = 350;
				break;
			case sumaFormat >= 37001.0 && sumaFormat <= 45000.99:
				tabulador = 600;
				break;
			case sumaFormat >= 45001.0 && sumaFormat <= 60000:
				tabulador = 850;
				break;
			default:
				tabulador = 1000;
				break;
		}

		//Celda L10 (Tabulador):
		celda = worksheet.getCell("L10");
		tabuladorFormat = parseFloat(tabulador);
		celda.value = tabuladorFormat;
		celda.style = { numFmt: '"$"#,##0.00' };
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
		celda.border = cellFormat.border;

		//Ontener nombre del ejecutor y colocarlo en la celda B15
		celda = reg_pat.length + 15;
		worksheet.getCell("B15").value = nombre + " " + apellidos;

		//Total L11 (Total);
		celda = worksheet.getCell("L11");
		celda.value = tabuladorFormat;
		celda.style = { numFmt: '"$"#,##0.00' };
		celda.font = cellFormat.font;
		celda.alignment = cellFormat.alignment;
	}

	//Selecciono más de un registro
	else {
		//Variables
		const longitudRegPat = reg_pat.length;
		const tabulador = [];

		//Agregar filas debajo de la fila 9, dependiendo de la longitud del reg_pat
		for (let i = 0; i < longitudRegPat; i++) {
			const fila = 9 + i;
			worksheet.duplicateRow(10, 1, fila);
		}

		// Insertar los valores en la columna B (Registro Patronal):
		reg_pat.forEach((valor, indice) => {
			const fila = 9 + indice + 1;
			const celda = worksheet.getCell(`B${fila}`);
			celda.value = valor;
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		// Insertar los valores en la columna C (Patrón):
		patron.forEach((valor, indice) => {
			const fila = 9 + indice + 1;
			const celda = worksheet.getCell(`C${fila}`);
			celda.value = valor;
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		// Insertar los valores en la columna D (Rubro):
		type.forEach((valor, indice) => {
			const fila = 9 + indice + 1;
			const celda = worksheet.getCell(`D${fila}`);
			celda.value = valor;
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		// Insertar los valores en la columna E (Prov. / o .I.):
		provio.forEach((valor, indice) => {
			const fila = 9 + indice + 1;
			const celda = worksheet.getCell(`E${fila}`);
			celda.value = valor;
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		// Insertar los valores en la columna F (Fecha de pago):
		fechaPago.forEach((valor, indice) => {
			const fila = 9 + indice + 1;
			const celda = worksheet.getCell(`F${fila}`);
			celda.value = valor;
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		// Insertar los valores en la columna G (Crédito):
		nom_cred.forEach((valor, indice) => {
			const fila = 9 + indice + 1;
			const celda = worksheet.getCell(`G${fila}`);
			celda.value = valor;
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		// Insertar los valores en la columna H (Périodo):
		periodo.forEach((valor, indice) => {
			const [yearP, monthP, dayP] = valor.split("-");
			const fila = 9 + indice + 1;
			const celda = worksheet.getCell(`H${fila}`);
			celda.value = `${monthP}/${yearP}`;
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		// Insertar los valores en la columna I (Cobrado):
		cobrado.forEach((valor, indice) => {
			const fila = 9 + indice + 1;
			const celda = worksheet.getCell(`I${fila}`);
			cobradoFormat = parseFloat(cobrado);
			celda.value = cobradoFormat;
			celda.style = { numFmt: '"$"#,##0.00' };
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		// Insertar los valores en la columna J (Gastos):
		gastos.forEach((valor, indice) => {
			const fila = 9 + indice + 1;
			const celda = worksheet.getCell(`J${fila}`);
			gastosFormat = parseFloat(gastos);
			celda.value = gastosFormat;
			celda.style = { numFmt: '"$"#,##0.00' };
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		// Llenar la columna A, con números consecutivos:
		for (let i = 0; i < reg_pat.length; i++) {
			const fila = 10 + i;
			const celda = worksheet.getCell(`A${fila}`);
			celda.value = i + 1;
			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		}

		//Llenar la columna K (total) con la suma de I y J y guardar datos numéricos en el arreglo de tabulador.
		for (let i = 0; i < reg_pat.length; i++) {
			//Variables locales que almacenan las celdas y el número de fila
			const fila = 10 + i;
			const celdaI = worksheet.getCell(`I${fila}`);
			const celdaJ = worksheet.getCell(`J${fila}`);
			const celdaK = worksheet.getCell(`K${fila}`);

			// Sumar los datos, convertir el valor de suma en número flotante y agregar formato de moneda.
			const suma = Number(celdaI.value) + Number(celdaJ.value);
			sumaFormat = parseFloat(suma);
			celdaK.value = sumaFormat;
			celdaK.style = { numFmt: '"$"#,##0.00' };
			celdaK.font = cellFormat.font;
			celdaK.alignment = cellFormat.alignment;
			celdaK.border = cellFormat.border;

			//Evaluar la condición y agregar los datos en tabulador.
			switch (true) {
				case sumaFormat <= 37000.99:
					tabulador.push(350);
					break;
				case sumaFormat >= 37001.0 && sumaFormat <= 45000.99:
					tabulador.push(600);
					break;
				case sumaFormat >= 45001.0 && sumaFormat <= 60000:
					tabulador.push(850);
					break;
				default:
					tabulador.push(1000);
					break;
			}
		}

		// Insertar los valores en la columna L (Tabulador) y sumar los valores numéricos
		tabulador.forEach((valor, indice) => {
			const fila = 9 + indice + 1;
			const celda = worksheet.getCell(`L${fila}`);
			tabuladorFormat = parseFloat(tabulador);
			celda.value = tabuladorFormat;
			celda.style = { numFmt: '"$"#,##0.00' };

			// Verificar si el valor es numérico antes de sumarlo
			if (!isNaN(valor)) total += Number(valor);

			celda.font = cellFormat.font;
			celda.alignment = cellFormat.alignment;
			celda.border = cellFormat.border;
		});

		// Asignar el valor total a una celda específica
		const celdaTotal = reg_pat.length + 11;
		totalFormat = parseFloat(total);
		const celdaT = worksheet.getCell(`L${celdaTotal}`);
		celdaT.value = totalFormat;
		celdaT.style = { numFmt: '"$"#,##0.00' };

		// Obtener el nombre del ejecutor y agregarlo a una celda específica
		const celda = reg_pat.length + 15;
		worksheet.getCell(`B${celda}`).value = nombre + " " + apellidos;
	}

	// Generar el nombre del archivo con el nombre de usuario y fecha
	const fileName = `${nombre}_${formattedDate}_GASTOS.xlsx`;
	const outputFilePath = `src/assets/excel/${fileName}`;

	// Guardar el archivo modificado
	await workbook.xlsx.writeFile(outputFilePath);

	// Descargar el archivo modificado
	const fileContent = fs.readFileSync(outputFilePath);

	// Mostrar la descarga al usuario
	res.setHeader(
		"Content-Type",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	);
	res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
	res.send(fileContent);
}

/**
 * Genera un citatorio en formato PDF.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string|string[]} req.body.opcion - Opciones seleccionadas en forma de cadena JSON o un arreglo de cadenas JSON.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {void}
 */
export async function generarCitatorio(req, res) {
	// Obtener datos enviados del formulario y crear el un arreglo.
	const opciones = req.body.opcion;
	const datR = {};

	// Validar si es un arreglo, sino lo es, convertirlo a un arreglo y recorrerlo
	if (Array.isArray(opciones)) {
		opciones.forEach((opcion, index) => {
			const opcionObjeto = JSON.parse(opcion);
			Object.entries(opcionObjeto).forEach(([clave, valor]) => {
				if (!datR[clave]) {
					datR[clave] = [];
				}
				datR[clave][index] = valor;
			});
		});
	} else {
		const opcionObjeto = JSON.parse(opciones);
		Object.entries(opcionObjeto).forEach(([clave, valor]) => {
			datR[clave] = [valor];
		});
	}

	// Consulta en la base de datos para obtener el registro del registro patronal seleccionado.
	const regRecibido = datR.reg_pat[0];
	const nomCredRecibido = datR.nom_cred;
	const tipoRecibido = datR.type;
	const patronRecibido = await Afil63.findOne({
		where: { reg_pat: regRecibido },
	});

	//Realizar la actualización en las tablas de citatorio, cambiando a "true" el campo "citatorio".
	try {
		// Se mando un sólo registro
		if (typeof nomCredRecibido == "string") {
			if (tipoRecibido == "cop") {
				const resCop = await RaleCop.update(
					{ citatorio: true },
					{ where: { nom_cred: nomCredRecibido } }
				);
			} else if (tipoRecibido == "rcv") {
				const resRcv = await RaleRcv.update(
					{ citatorio: true },
					{ where: { nom_cred: nomCredRecibido } }
				);
			}
		}
		// Se enviaron varios registros
		else {
			for (let index = 0; index < nomCredRecibido.length; index++) {
				const value = tipoRecibido[index];
				const nomCredValue = nomCredRecibido[index];

				if (value === "cop") {
					const resCop = await RaleCop.update(
						{ citatorio: true },
						{ where: { nom_cred: nomCredValue } }
					);
				} else if (value === "rcv") {
					const resRcv = await RaleRcv.update(
						{ citatorio: true },
						{ where: { nom_cred: nomCredValue } }
					);
				}
			}
		}
	} catch (err) {
		console.log("No se pudo actualizar la bd con el citatorio", err);
	}

	// Variables.
	const dataLength = datR.reg_pat.length;
	var margenIzquierdo = 60;
	var margenSuperior = 0;
	var anchoColumna = 0;
	var altoFila = 30;

	// Obtener la fecha actual
	const currentDate = new Date();
	const formattedDate = format(currentDate, "dd-MM-yyyy");

	// Crear la sesión del Usuario
	const { nombre, apellidos } = req.session.user;

	// Generar el documento de PDF
	const doc = new PDF();

	// Encabezado
	const imageEncabezado = "src/imgs/encabezado-reportes.png";
	const agregarEncabezado = () => {
		doc.image(imageEncabezado, {
			fit: [500, 100],
			align: "center",
			x: 50,
			y: 10,
		});
		doc.moveDown(3);
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

	// Tabla con la información del patron
	doc.font("Helvetica-Bold")
		.fontSize(10)
		.lineGap(10 * 0.5);
	const datosRow1 = [
		[
			`REGISTRO PATRONAL: ${patronRecibido.reg_pat}`,
			`ACTIVIDAD: ${patronRecibido.actividad}`,
		],
	];
	margenSuperior = 100;
	anchoColumna = 250;

	// Dibujar la tabla
	for (let fila = 0; fila < datosRow1.length; fila++) {
		for (let columna = 0; columna < datosRow1[fila].length; columna++) {
			const x = margenIzquierdo + columna * anchoColumna;
			const y = margenSuperior + fila * altoFila;
			// Dibujar el borde de la celda
			doc.rect(x, y, anchoColumna, altoFila).stroke();
			doc.text(datosRow1[fila][columna], x + 5, y + 5);
		}
	}

	doc.font("Helvetica-Bold")
		.fontSize(10)
		.lineGap(10 * 0.5);
	const datosRow2 = [
		[`PATRÓN: ${patronRecibido.patron}`],
		[`DOMICILIO: ${patronRecibido.domicilio}`],
	];
	margenSuperior = 130;
	anchoColumna = 500;

	// Dibujar la tabla
	for (let fila = 0; fila < datosRow2.length; fila++) {
		const x = margenIzquierdo;
		const y = margenSuperior + fila * altoFila;
		// Dibujar el borde de la celda
		doc.rect(x, y, anchoColumna, altoFila).stroke();
		doc.text(datosRow2[fila], x + 5, y + 5);
	}
	doc.moveDown(4);

	//Título despues de la tabla
	doc.font("Helvetica")
		.fontSize(10)
		.lineGap(10 * 0.5);
	var texto = "Detalle del adeudo C.O.P";
	var anchoTexto = doc.widthOfString(texto);
	var posicionX = (doc.page.width - anchoTexto) / 2;
	doc.text(texto, posicionX);
	doc.moveDown(1);

	// Crear la tabla con los registros seleccionados.
	const datosRegistros = [];

	for (let i = 0; i < dataLength; i++) {
		const nomCred = datR.nom_cred[i];
		const periodo = convertirFormatoFecha(datR.periodo[i]);
		const importe = datR.importe[i];
		const importeFormateado = importe.toLocaleString("es-MX", {
			style: "currency",
			currency: "MXN",
		});
		datosRegistros.push([nomCred, periodo, importeFormateado]);
	}

	// Función para convertir el formato de fecha de "aaaa-mm-dd" a "mm-aaaa"
	function convertirFormatoFecha(fecha) {
		const partes = fecha.split("-");
		const año = partes[0];
		const mes = partes[1];
		return `${mes}-${año}`;
	}

	const datosRegistro = [
		["CRÉDITO", "PERIODO", "IMPORTE"],
		...datosRegistros,
	];
	margenSuperior = 250;
	anchoColumna = 160;

	// Dibujar la tabla
	for (let fila = 0; fila < datosRegistro.length; fila++) {
		for (let columna = 0; columna < datosRegistro[fila].length; columna++) {
			const x = margenIzquierdo + columna * anchoColumna;
			const y = margenSuperior + fila * altoFila;
			if (fila === 0) {
				doc.fillColor("lightgray");
				doc.font("Helvetica-Bold");
			} else {
				doc.fillColor("white");
			}

			// Dibujar la celda con color de relleno
			doc.rect(x, y, anchoColumna, altoFila)
				.fill()
				.stroke()
				.fillColor("black")
				.rect(x, y, anchoColumna, altoFila)
				.stroke()
				.text(datosRegistro[fila][columna], x + 5, y + 5);
		}
	}
	doc.moveDown(3);

	// Crear la tabla de conceptos e importes
	const datosConceptos = [
		["CONCEPTO", "IMPORTE", "CONCEPTO", "IMPORTE"],
		["Actualización", " ", "Gastos de Ejecución", " "],
		["Recargos", " ", "Crédito fiscal", " "],
	];
	margenSuperior += datosRegistro.length * altoFila + 30;
	anchoColumna = 120;

	// Dibujar la tabla
	for (let fila = 0; fila < datosConceptos.length; fila++) {
		for (
			let columna = 0;
			columna < datosConceptos[fila].length;
			columna++
		) {
			const x = margenIzquierdo + columna * anchoColumna;
			const y = margenSuperior + fila * altoFila;
			if (fila === 0) {
				doc.fillColor("lightgray");
				doc.font("Helvetica-Bold");
			} else {
				doc.fillColor("white");
			}

			// Dibujar la celda con color de relleno
			doc.rect(x, y, anchoColumna, altoFila)
				.fill()
				.stroke()
				.fillColor("black")
				.rect(x, y, anchoColumna, altoFila)
				.stroke()
				.text(datosConceptos[fila][columna], x + 5, y + 5);
		}
	}
	doc.moveDown(3);

	//Títulos
	doc.font("Helvetica-Bold")
		.fontSize(11)
		.lineGap(11 * 0.5);
	var texto = "CITATORIO PARA LA APLICACIÓN DE ";
	var anchoTexto = doc.widthOfString(texto);
	var posicionX = (doc.page.width - anchoTexto) / 2;
	doc.text(texto, posicionX);

	var texto = "PROCEDIMIENTO ADMINISTRATIVO DE EJECUCIÓN";
	var anchoTexto = doc.widthOfString(texto);
	var posicionX = (doc.page.width - anchoTexto) / 2;
	doc.text(texto, posicionX);
	doc.moveDown(2);

	// Crear el texto por defecto
	doc.font("Helvetica")
		.fontSize(10)
		.lineGap(10 * 0.5)
		.text(`${parrafo1C}`, 60, null, { align: "justify" })
		.moveDown(3)
		.text(`${parrafo2C}`, 60, null, { align: "justify" })
		.moveDown(1)
		.text(`${parrafo3C}`, 60, null, { align: "justify" })
		.moveDown(2)

		// Realizar las firmas
		.text("El ejecutor", 60, null, { align: "justify" })
		.moveDown(4)
		.text(`${nombre} ${apellidos}`, 60, null, { align: "justify" })
		.text(
			`Se identifica con credencial: ${patronRecibido.reg_pat}`,
			60,
			null,
			{
				align: "justify",
			}
		)
		.text(
			"Con vigencia del ____ de __________ del 20___ al ____ de ____________ del 20___",
			60,
			null,
			{ align: "justify" }
		)
		.text(
			"Expedida en esta ciudad en fecha de ____ de ________ del 20____",
			60,
			null,
			{ align: "justify" }
		)
		.moveDown(3)

		.text("Recibí original")
		.moveDown(4)
		.text("Nombre firma y fecha")
		.moveDown(3);

	// Generar el nombre del archivo con la fecha
	const fileName = `${regRecibido}_${formattedDate}_CITATORIO.pdf`;
	const filePath = `src/assets/pdf/${fileName}`;
	const writeStream = fs.createWriteStream(filePath);
	doc.pipe(writeStream);
	doc.end();

	// Escuchar el evento 'finish' del stream de escritura
	writeStream.on("finish", () => {
		// Configurar la respuesta del servidor para la descarga
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=${fileName}`
		);

		// Leer el archivo y enviarlo como respuesta
		const fileStream = fs.createReadStream(filePath);
		fileStream.pipe(res);
	});

	// Manejar errores de escritura
	writeStream.on("error", (err) => {
		console.error("Error al crear el archivo PDF:", err);
		res.status(500).send("Error al crear el archivo PDF");
	});
}

/**
 * Genera un mandamiento de ejecución en formato PDF.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Cuerpo de la solicitud HTTP que contiene los datos necesarios para generar el mandamiento.
 * @param {string|string[]} req.body.opcion - Opción seleccionada del formulario. Puede ser un string o un arreglo de strings.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export async function generarMandamiento(req, res) {
	// Realizar la destructuración del req.body en arreglos que contengan la información, separada por la categoría.
	const opciones = req.body.opcion;
	const datR = {};

	if (Array.isArray(opciones)) {
		opciones.forEach((opcion, index) => {
			const opcionObjeto = JSON.parse(opcion);

			Object.entries(opcionObjeto).forEach(([clave, valor]) => {
				if (!datR[clave]) {
					datR[clave] = [];
				}
				datR[clave][index] = valor;
			});
		});
	} else {
		const opcionObjeto = JSON.parse(opciones);

		Object.entries(opcionObjeto).forEach(([clave, valor]) => {
			datR[clave] = [valor];
		});
	}
	const dataLength = datR.reg_pat.length;

	// Consulta en la base de datos para obtener el registro del registro patronal seleccionado.
	const regRecibido = datR.reg_pat[0];
	const patronRecibido = await Afil63.findOne({
		where: { reg_pat: regRecibido },
	});

	// Consulta en la base de datos para obtener el nombre de todos los patrones.
	const nomEjecutores = await Ejecutor.findAll({
		attributes: ["nombre"],
		where: {
			nombre: {
				[Op.ne]: "No asignado",
			},
		},
	});

	const nomEje = nomEjecutores.map((registro) => registro.nombre);

	// Obtener la fecha actual
	const currentDate = new Date();
	const formattedDate = format(currentDate, "dd-MMMM-yyyy", { locale: es });

	// Crear la sesión del Usuario
	const { nombre, apellidos } = req.session.user;

	// Generar el documento de PDF
	const doc = new PDF();

	// Agregar contenido al PDF
	const anchoPagina = doc.page.width;
	var margenIzquierdo = 60;
	var margenSuperior = 0;
	var anchoColumna = 0;
	var altoFila = 30;

	// Encabezado
	const imageEncabezado = "src/imgs/encabezado-reportes.png";
	const agregarEncabezado = () => {
		doc.image(imageEncabezado, {
			fit: [500, 100],
			align: "center",
			x: 50,
			y: 10,
		});
		doc.moveDown(3);
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

	//Agregar información que va en más de una página
	const infoInicial = () => {
		doc.font("Helvetica")
			.fontSize(8)
			.lineGap(8 * 0.5)
			.text("Deudor: ", 50, null, { continued: true })
			.font("Helvetica-Bold")
			.text(`${patronRecibido.patron}`)
			.text("Registro patronal :", 50, null, { continued: true })
			.font("Helvetica-Bold")
			.text(`${patronRecibido.reg_pat}`)
			.text("Domicilio: ", 50, null, { continued: true })
			.font("Helvetica-Bold")
			.text(`${patronRecibido.domicilio}`)
			.text("Localidad: ", 50, null, { continued: true })
			.font("Helvetica-Bold")
			.text(`${patronRecibido.localidad}`)
			.text("Actividad: ", 50, null, { continued: true })
			.font("Helvetica-Bold")
			.text(`${patronRecibido.actividad}`)
			.text("CP: ", 50, null, { continued: true })
			.font("Helvetica-Bold")
			.text(`${patronRecibido.cp}`)
			.text("Sector de notificación: ", 50, null, { continued: true })
			.font("Helvetica-Bold")
			.text("00")
			.moveDown(2)
			.font("Helvetica-Bold")
			.fontSize(9)
			.lineGap(9 * 0.5)
			.text("Detalle del adeudor")
			.moveDown(2);

		// Crear la tabla con los registros seleccionados.
		const datosRegistros = [];

		for (let i = 0; i < dataLength; i++) {
			const nomCred = datR.nom_cred[i];
			const periodo = convertirFormatoFecha(datR.periodo[i]);
			const importe = datR.importe[i];
			const importeFormateado = importe.toLocaleString("es-MX", {
				style: "currency",
				currency: "MXN",
			});
			datosRegistros.push([nomCred, periodo, importeFormateado]);
		}

		// Función para convertir el formato de fecha de "aaaa-mm-dd" a "mm-aaaa"
		function convertirFormatoFecha(fecha) {
			const partes = fecha.split("-");
			const año = partes[0];
			const mes = partes[1];
			return `${mes}-${año}`;
		}

		// Crear la tabla.
		const datosTabla = [
			["CRÉDITO", "PÉRIODO", "IMPORTE"],
			...datosRegistros,
		];
		margenSuperior = 280;
		anchoColumna = 154;

		// Dibujar la tabla
		for (let fila = 0; fila < datosTabla.length; fila++) {
			for (
				let columna = 0;
				columna < datosTabla[fila].length;
				columna++
			) {
				const x = margenIzquierdo + columna * anchoColumna;
				const y = margenSuperior + fila * altoFila;
				// Dibujar el borde de la celda
				doc.rect(x, y, anchoColumna, altoFila).stroke();
				doc.text(datosTabla[fila][columna], x + 5, y + 5);
			}
		}
		doc.moveDown(3);
	};

	//Página 1 y página 2.
	infoInicial();

	// Crear el texto por defecto
	doc.font("Helvetica-Bold")
		.fontSize(11)
		.lineGap(11 * 0.5);
	var texto = "MANDAMIENTO DE EJECUCIÓN";
	var anchoTexto = doc.widthOfString(texto);
	var posicionX = (doc.page.width - anchoTexto) / 2;
	doc.text(texto, posicionX);

	doc.font("Helvetica")
		.fontSize(9)
		.lineGap(9 * 0.5)
		.text("En San Juan del Río a ", { continued: true })
		.font("Helvetica-Bold")
		.text(formattedDate)
		.moveDown(2)
		.text(`${parrafo1M}`, 60, null, { align: "justify" })
		.moveDown(1)
		.text(`${parrafo2M}`, 60, null, { align: "justify" })
		.moveDown(1)
		.text(`${parrafo3M}`, 60, null, { align: "justify" })
		.moveDown(1)
		.text(`${parrafo4M}`, 60, null, { align: "justify" })
		.moveDown(1)
		.text(`${parrafo5M1}`, 60, null, { align: "justify", continued: true })
		.fillColor("blue")
		.text(nomEje.join(" y/o "), 60, null, {
			align: "justify",
			continued: true,
		})
		.fillColor("black")
		.text("  ", 60, null, { align: "justify", continued: true })
		.text(`${parrafo5M2} `, 60, null, { align: "justify" })
		.moveDown(1)
		.fontSize(9)
		.lineGap(9 * 0.5)
		.text(`${parrafo6M}`, 60, null, { align: "justify" })
		.moveDown(1);

	doc.font("Helvetica-Bold")
		.fontSize(11)
		.lineGap(11 * 0.5);

	texto = "Lo acuerda y firma";
	anchoTexto = doc.widthOfString(texto);
	posicionX = (doc.page.width - anchoTexto) / 2;
	doc.text(texto, posicionX);
	texto = "El jefe de la Oficina para Cobros";
	anchoTexto = doc.widthOfString(texto);
	posicionX = (doc.page.width - anchoTexto) / 2;
	doc.text(texto, posicionX);
	texto = "de la Subdelegación";

	doc.text(texto, 180, null, { continued: true })
		.fillColor("blue")
		.text(" San Juan del Río", { continued: true })
		.fillColor("black")
		.text(", Delegación", { continued: true })
		.fillColor("blue")
		.text(", Querétaro")
		.moveDown(4);

	doc.font("Helvetica-Bold")
		.fontSize(9)
		.lineGap(9 * 0.5)
		.fillColor("black");

	texto = "Lic. Luis Eduardo Trejo Reséndiz";
	anchoTexto = doc.widthOfString(texto);
	posicionX = (doc.page.width - anchoTexto) / 2;
	doc.text(texto, posicionX);

	// Página de la 3 a la seis.
	doc.addPage();

	doc.font("Helvetica-Bold")
		.fontSize(11)
		.lineGap(11 * 0.5);
	texto = "ACTA DE REQUERIMIENTO DE PAGO Y EMBARGO";
	anchoTexto = doc.widthOfString(texto);
	posicionX = (doc.page.width - anchoTexto) / 2;
	doc.text(texto, posicionX);

	infoInicial();

	doc.font("Helvetica-Bold")
		.fontSize(11)
		.lineGap(11 * 0.5);
	texto = "REQUERIMIENTO";
	anchoTexto = doc.widthOfString(texto);
	posicionX = (doc.page.width - anchoTexto) / 2;
	doc.text(texto, posicionX);

	// Colocar los párrfos por defecto.
	doc.font("Helvetica")
		.fontSize(9)
		.lineGap(9 * 0.5)
		.text(`${parrafo7M}`, 60, null, { align: "justify" })
		.moveDown(1)
		.text(`${parrafo8M}`, 60, null, { align: "justify" })
		.moveDown(1)
		.text(`${parrafo9M}`, 60, null, { align: "justify" })
		.moveDown(1)
		.text(`${parrafo10M}`, 60, null, { align: "justify" })
		.moveDown(2);
	texto = "EMBARGO";
	anchoTexto = doc.widthOfString(texto);
	posicionX = (doc.page.width - anchoTexto) / 2;
	doc.text(texto, posicionX)
		.moveDown(1)
		.text(`${parrafo11M}`, 60, null, { align: "justify" })
		.moveDown(1)
		.text(`${parrafo12M}`, 60, null, { align: "justify" })
		.moveDown(1)
		.text(`${parrafo13M}`, 60, null, { align: "justify" })
		.moveDown(1)
		.text(`${parrafo14M}`, 60, null, { align: "justify" })
		.moveDown(1)
		.text(`${parrafo15M}`, 60, null, { align: "justify" })
		.moveDown(1)
		.text(`${parrafo16M}`, 60, null, { align: "justify" })
		.moveDown(1)
		.text(`${parrafo17M}`, 60, null, { align: "justify" })
		.moveDown(1);

	// Apartado para la tabla 1:
	var datosTabla = [
		[`${nombre} ${apellidos}`, "Nombre y firma", "Nombre y firma"],
		["Ejecutor", "Depositario", "Embargado"],
	];
	margenSuperior = 280;
	anchoColumna = 170;
	altoFila = 40;

	// Dibujar la tabla
	for (let fila = 0; fila < datosTabla.length; fila++) {
		for (let columna = 0; columna < datosTabla[fila].length; columna++) {
			const x = margenIzquierdo + columna * anchoColumna;
			const y = margenSuperior + fila * altoFila;
			// Dibujar el borde de la celda
			doc.rect(x, y, anchoColumna, altoFila).stroke();
			doc.text(datosTabla[fila][columna], x + 20, y + 25);
		}
	}
	doc.moveDown(3);

	// Apartado para la tabla 2:
	datosTabla = [
		["Nombre y firma", "Nombre y firma"],
		["Testigo", "Testigo"],
	];
	margenIzquierdo = 60;
	margenSuperior = 360;
	anchoColumna = 255;
	altoFila = 40;

	// Dibujar la tabla
	for (let fila = 0; fila < datosTabla.length; fila++) {
		for (let columna = 0; columna < datosTabla[fila].length; columna++) {
			const x = margenIzquierdo + columna * anchoColumna;
			const y = margenSuperior + fila * altoFila;
			// Dibujar el borde de la celda
			doc.rect(x, y, anchoColumna, altoFila).stroke();
			doc.text(datosTabla[fila][columna], x + 20, y + 25);
		}
	}
	doc.moveDown(3);

	// Generar el nombre del archivo con la fecha
	const fileName = `${regRecibido}_${formattedDate}_MANDAMIENTO.pdf`;
	const filePath = `src/assets/pdf/${fileName}_Mandamiento`;
	const writeStream = fs.createWriteStream(filePath);
	doc.pipe(writeStream);
	doc.end();

	// Escuchar el evento 'finish' del stream de escritura
	writeStream.on("finish", () => {
		// Configurar la respuesta del servidor para la descarga
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=${fileName}`
		);

		// Leer el archivo y enviarlo como respuesta
		const fileStream = fs.createReadStream(filePath);
		fileStream.pipe(res);
	});

	// Manejar errores de escritura
	writeStream.on("error", (err) => {
		console.error("Error al crear el archivo PDF:", err);
		res.status(500).send("Error al crear el archivo PDF");
	});
}
