// Importar
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { format } from 'date-fns';
import {Op} from 'sequelize';   
import RaleCop from '../models/raleCOPModel.js';
import RaleRcv from '../models/raleRCVModel.js';
import PDF  from 'pdfkit';
import 'pdfkit-table';
import ExcelJS from 'exceljs';
import  fs from 'fs';
import path from 'path';
import Afil63 from '../models/afilModel.js';

import { parrafo1M, parrafo2M, parrafo3M, parrafo4M, parrafo5M1, parrafo5M2, parrafo6M, 
         parrafo7M, parrafo8M, parrafo9M, parrafo10M, parrafo11M, parrafo12M, parrafo13M, 
         parrafo14M, parrafo15M, parrafo16M, parrafo17M,
         parrafo1C, parrafo2C, parrafo3C } from './texo_por_defecto_reportes.js';

import Ejecutor from '../models/ejecutorModel.js';


// Variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Función para generar un informe
export async function generarInforme (req, res){

    // Actualizar en la base de datos 
    try{
      const nom_cred = req.body.nom_cred;
      const { type, folioSua, resultadosDiligencia } = req.body;

      // Se mando un sólo registro
      if(typeof nom_cred == 'string'){

        if (type == 'cop') {
            const resCop = await RaleCop.update(
                {
                    folioSua: folioSua,
                    res_dil: resultadosDiligencia,
                    cobrado: true
                },
                {
                    where: { nom_cred: nom_cred }
                }
                );

            } else if (type == 'rcv') {
                const resRcv = await RaleRcv.update(
                    {
                        folioSua: folioSua,
                        res_dil: resultadosDiligencia,
                        cobrado: true
                    },
                    {
                        where: { nom_cred: nom_cred }
                    }
                );
            }

        } else {
            // Se enviaron varios registros 
            for (let index = 0; index < nom_cred.length; index++) {

                const value = type[index];
                const nomCredValue = nom_cred[index];
                const folioSuaValue = folioSua[index];
                const resultadosDValue = resultadosDiligencia[index];
        
                if (value === 'cop') {
                    const resCop = await RaleCop.update(
                        {
                            folioSua: folioSuaValue,
                            res_dil: resultadosDValue,
                            cobrado: true
                        },
                        {
                            where: { nom_cred: nomCredValue }
                        }
                    );

                } else if (value === 'rcv') {
                    const resRcv = await RaleRcv.update(
                        {
                            folioSua: folioSuaValue,
                            res_dil: resultadosDValue,
                            cobrado: true
                        },
                        {
                            where: { nom_cred: nomCredValue }
                        }
                    );
                }
            }
        } 

    } catch (err){
        console.log("No se pudo cobrar",err);
    }


    // Crear la sesión del Usuario
    const { nombre, apellidos } = req.session.user;
    const { reg_pat, nom_cred, periodo, importe, folioSua, resultadosDiligencia } = req.body;

    //Variables
    var cellFormat;
    var filaFinal;
    var mergedCells = [];
    
    
    // Obtener la fecha actual
    const currentDate = new Date();
    
    // Obtener el día, mes y año
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; 
    const year = currentDate.getFullYear();

    // Formatear la fecha en el formato deseado
    const formattedDate = `${year}-${month}-${day}`;
        
    // Ruta del archivo existente
    const filePath = 'src/assets/excel/INFORME_DIARIO_DE_EJECUTOR.xlsx';
    
    // Cargar el archivo existente
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    // Obtener la hoja de trabajo deseada
    const worksheet = workbook.getWorksheet('INFORME');
    
    // Modificar la información en las celdas mencionadas
    worksheet.getCell('G8').value = day;
    worksheet.getCell('I8').value = month;
    worksheet.getCell('K8').value = year;
    worksheet.getCell('F10').value = nombre + ' ' + apellidos;
    worksheet.getCell('E11').value = day;
    worksheet.getCell('G11').value = month;
    worksheet.getCell('I11').value = year;



    // Definir el formato de la celda
    cellFormat = {
        font: {
        size: 12
        },
        alignment: {
        vertical: 'middle',
        horizontal: 'center'
        },
        border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
        }, 
        height: 60
    };

    // Verificar la cantidad de registros que selecciono     
    if (typeof reg_pat == 'string'){

        //Sólo selecciono un registro
        var celda;

        //Celda A17:
        celda = worksheet.getCell('A17');
        celda.value = reg_pat;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda B17
        celda = worksheet.getCell('B17');
        celda.value = nom_cred;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda C17
        celda = worksheet.getCell('C17');
        celda.value = periodo;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda D17
        celda = worksheet.getCell('D17');
        celda.value = importe;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda E17
        celda = worksheet.getCell('E17');
        celda.value = folioSua;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda F17
        celda = worksheet.getCell('F17');
        celda.value = resultadosDiligencia;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

    } else {
        
        //Selecciono más de un registro 

        // Insertar los valores en la columna A (Registro Patronal)
        reg_pat.forEach((valor, indice) => {
            const fila = 16 + indice + 1;
            worksheet.insertRow(fila);
            const celda = worksheet.getCell(`A${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });
        
        // Insertar los valores en la columna B (Crédito)
        nom_cred.forEach((valor, indice) => {
            const fila = 16 + indice + 1;
            const celda = worksheet.getCell(`B${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });
        
        // Insertar los valores en la columna C (Periodo)
        periodo.forEach((valor, indice) => {
            const fila = 16 + indice + 1;
            const celda = worksheet.getCell(`C${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });
        
        // Insertar los valores en la columna D (Importe)
        importe.forEach((valor, indice) => {
            const fila = 16 + indice + 1;
            const celda = worksheet.getCell(`D${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });
        
        // Insertar los valores en la columna E (Folio SUA)
        folioSua.forEach((valor, indice) => {
            const fila = 16 + indice + 1;
            const celda = worksheet.getCell(`E${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });
        
        // Insertar los valores en la columna F (Resultado de la diligencia)
        resultadosDiligencia.forEach((valor, indice) => {
            const fila = 16 + indice + 1;
            const celda = worksheet.getCell(`F${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        
        //     // Combinar y centrar si la celda no está en las celdas fusionadas previamente
        //     const mergeRange = `F${fila}:K${fila}`;
        //     const isAlreadyMerged = mergedCells.includes(mergeRange);
        //     if (!isAlreadyMerged) {
        //         worksheet.mergeCells(mergeRange);
        //         worksheet.getCell(`F${fila}`).alignment = {
        //             vertical: 'middle',
        //             horizontal: 'center',
        //         };
        //         // Registrar las celdas fusionadas en el array
        //         mergedCells.push(mergeRange);
        //     }
        });
    
    }
    
    // Generar el nombre del archivo con el nombre de usuario y fecha
    const fileName = `${nombre}_${formattedDate}_INFORME.xlsx`;
    const outputFilePath = `src/assets/excel/${fileName}`;
    
    // Guardar el archivo modificado
    await workbook.xlsx.writeFile(outputFilePath);
    
    console.log('Archivo modificado guardado:', outputFilePath);s
    
    // Descargar el archivo modificado
    const fileContent = fs.readFileSync(outputFilePath);
    
    // Establecer las cabeceras de la respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Enviar el archivo al cliente
    res.send(fileContent);
}


// Función para generar un archivo con los gastos de ejecutor. 
export async function generarGastos(req, res){
    
    // Crear la sesión del Usuario
    const { nombre, apellidos } = req.session.user;
    const { reg_pat, patron, type, nom_cred, periodo, provio, cobrado, gastos, fechaPago, } = req.body;
    var cellFormat;
    let total = 0;

    // Obtener la fecha actual
    const currentDate = new Date();
    
    // Obtener el día, mes y año
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; 
    const year = currentDate.getFullYear();

    // Formatear la fecha en el formato deseado
    const formattedDate = `${year}-${month}-${day}`;
        
    // Ruta del archivo existente
    const filePath = 'src/assets/excel/GASTOS_EJECUTOR.xlsx';
    
    // Cargar el archivo existente
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    // Obtener la hoja de trabajo deseada
    const worksheet = workbook.getWorksheet('GASTOS');


    //Modificar el contenido del documento
    // Definir el formato de la celda
    cellFormat = {
        font: {
        size: 12
        },
        alignment: {
        vertical: 'middle',
        horizontal: 'center'
        },
        border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
        }, 
        height: 60
    };
    
    // Verificar la cantidad de registros que selecciono
    if (typeof reg_pat == 'string'){

        //Selecciono sólo un registro
        var celda;

        //Celda A10:
        celda = worksheet.getCell('A10');
        celda.value = '1';
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda B10
        celda = worksheet.getCell('B10');
        celda.value = reg_pat;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda C10
        celda = worksheet.getCell('C10');
        celda.value = patron;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda D10
        celda = worksheet.getCell('D10');
        celda.value = type;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda E10
        celda = worksheet.getCell('E10');
        celda.value = provio;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda F10
        celda = worksheet.getCell('F10');
        celda.value = fechaPago;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda G10
        celda = worksheet.getCell('G10');
        celda.value = nom_cred;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda H10
        celda = worksheet.getCell('H10');
        celda.value = periodo;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda I10
        celda = worksheet.getCell('I10');
        celda.value = cobrado;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda J10
        celda = worksheet.getCell('J10');
        celda.value = gastos;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda K10
        celda = worksheet.getCell('K10');
        const I10 = worksheet.getCell('J10');
        const J10 = worksheet.getCell('J10');
        const suma = Number(I10.value) + Number(J10.value);
        celda.value = suma;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda L10
        //celda = worksheet.getCell('L10');
        //celda.value = tabulador;
        //celda.font = cellFormat.font;
        //celda.alignment = cellFormat.alignment;
        //celda.border = cellFormat.border;

        //Nombre del ejecutor
        celda = reg_pat.length + 15;
        worksheet.getCell('B15').value = nombre + ' ' + apellidos;

        //Total
        //celda = worksheet.getCell('L11');
        //celda.value = tabulador;
        //celda.font = cellFormat.font;
        //celda.alignment = cellFormat.alignment;
        //celda.border = cellFormat.border;

    } else {

        //Selecciono más de un registro
        
        // Insertar los valores en la columna B (Registro Patronal)
        reg_pat.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            worksheet.insertRow(fila);
            const celda = worksheet.getCell(`B${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });
        
        // Insertar los valores en la columna C (Patron)
        patron.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`C${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Insertar los valores en la columna D (Rubro)
        type.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`D${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Insertar los valores en la columna E (Provio)
        provio.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`E${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Insertar los valores en la columna F (Fecha de pago)
        fechaPago.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`F${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Insertar los valores en la columna G (Crédito)
        nom_cred.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`G${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Insertar los valores en la columna H (Périodo)
        periodo.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`H${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Insertar los valores en la columna I (Cobrado)
        cobrado.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`I${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Insertar los valores en la columna J (Gastos)
        gastos.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`J${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Llenar la columna A, con números consecutivos
        for (let i = 0; i < reg_pat.length; i++) {
            const fila = 10 + i;
            const celda = worksheet.getCell(`A${fila}`);
            celda.value = i + 1;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        }

        const tabulador = [];

        //Llenar la columna K (total) con la suma de I y J y guardar datos numéricos en el arreglo de tabulador. 
        for (let i = 0; i < reg_pat.length; i++) {
            const fila = 10 + i;
            const celdaI = worksheet.getCell(`I${fila}`);
            const celdaJ = worksheet.getCell(`J${fila}`);
            const celdaK = worksheet.getCell(`K${fila}`);

            const suma = Number(celdaI.value) + Number(celdaJ.value);
            celdaK.value = suma;

            celdaK.font = cellFormat.font;
            celdaK.alignment = cellFormat.alignment;
            celdaK.border = cellFormat.border;

            //Evaluar la condición y agregar los datos en tabulador.

            switch (true) {
                case (suma <= 37000.99):
                  tabulador.push(350);
                  break;
                case (suma >= 37001.00 && suma <= 45000.99):
                  tabulador.push(600);
                  break;
                case (suma >= 45001.00 && suma <= 60000):
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
            celda.value = valor;

            // Verificar si el valor es numérico antes de sumarlo
            if (!isNaN(valor)) {
                total += Number(valor);
            }

            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Asignar el valor total a una celda específica
        const celdaTotal = reg_pat.length + 11;
        worksheet.getCell(`L${celdaTotal}`).value = total;


        // Colocar el nombre del ejecutor 
        const celda = reg_pat.length + 15;
        worksheet.getCell(`B${celda}`).value = nombre + ' ' + apellidos;
    
}
    // Generar el nombre del archivo con el nombre de usuario y fecha
    const fileName = `${nombre}_${formattedDate}_GASTOS.xlsx`;
    const outputFilePath = `src/assets/excel/${fileName}`;
    
    // Guardar el archivo modificado
    await workbook.xlsx.writeFile(outputFilePath);
    
    console.log('Archivo modificado guardado:', outputFilePath);
    
    // Descargar el archivo modificado
    const fileContent = fs.readFileSync(outputFilePath);
    
    // Establecer las cabeceras de la respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Enviar el archivo al cliente
    res.send(fileContent);
}


// Función para generar Citatorio 
export async function generarCitatorio(req, res) {
    
    // Realizar la destructuración del req.body en arreglos que contengan la información, separada por la categoría. 
    const opciones = req.body.opcion;
    const datR = {};
  
    // Verificar si opciones es un arreglo o un solo objeto
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
      // Tratar opciones como un solo objeto en un arreglo
      const opcionObjeto = JSON.parse(opciones);
      Object.entries(opcionObjeto).forEach(([clave, valor]) => {
        datR[clave] = [valor];
      });
    }

    const dataLength = datR.reg_pat.length;

    // Consulta en la base de datos para obtener el registro del registro patronal seleccionado. 
    const regRecibido = datR.reg_pat[0];
    const patronRecibido = await Afil63.findOne({
        where: {reg_pat : regRecibido}
    });


    // Consulta en la base de datos para obtener el nombre de todos los ejecutores que no sea el foraneo. 
    const nomEjecutores = await Ejecutor.findAll({
        attributes: ['nombre'],
        where: {
          nombre: {
            [Op.ne]: 'foraneo'
          }
        }
      });

    const nomEje = nomEjecutores.map(registro => registro.nombre);


    // Obtener la fecha actual
    const currentDate = new Date();

    // Formatear la fecha en el formato deseado
    const formattedDate = format(currentDate, 'yyyy-MM-dd');

    // Crear la sesión del Usuario
    const  {nombre, apellidos}  = req.session.user;

    // Generar el documento de PDF
    const doc = new PDF();

    // Agregar contenido al PDF
    const anchoPagina = doc.page.width;
    

    // Cargar la imagen del encabezado
    const imageEncabezado = 'src/imgs/encabezado-reportes.png';
  
    // Función para agregar el encabezado en cada página
    const agregarEncabezado = () => {
        doc.image(imageEncabezado, {
        fit: [500, 100],
        align: 'center',
        x: 50,
        y: 10,
        });
        doc.moveDown(3);
    };
    agregarEncabezado();
    
    // Escuchar el evento 'pageAdded' para agregar el encabezado en las páginas adicionales
    doc.on('pageAdded', () => {
        agregarEncabezado();
    });


    // Cargar la imagen del pie de página
    const imagePie = 'src/imgs/footer-reportes.png';
  
    // Función para agregar el pie de página
    const agregarPie = () => {
        doc.image(imagePie, {
        fit: [500, 100],
        align: 'center',
        x: 50,
        y: 725,
        });
    };
    agregarPie();
    
    // Escuchar el evento 'pageAdded' para agregar el encabezado en las páginas adicionales
    doc.on('pageAdded', () => {
        agregarPie();
    });

    //Página 1. Tabla con la información del patron
    var margenIzquierdo = 0;
    var margenSuperior = 0;
    var anchoColumna = 0;
    var altoFila = 0;


    // Crear la tabla. 
    const datosRow1 = [
        [`REGISTRO PATRONAL: ${patronRecibido.reg_pat}` , `ACTIVIDAD: ${patronRecibido.actividad}` ]
    ];
    
    margenIzquierdo = 60;
    margenSuperior = 90;
    anchoColumna = 200;
    altoFila = 30;
    
    // Dibujar la tabla
    for (let fila = 0; fila < datosRow1.length; fila++) {
        for (let columna = 0; columna < datosRow1[fila].length; columna++) {
            const x = margenIzquierdo + columna * anchoColumna;
            const y = margenSuperior + fila * altoFila;
            // Dibujar el borde de la celda
            doc.rect(x, y, anchoColumna, altoFila)
            .stroke();
            doc.text(datosRow1[fila][columna], x + 5, y + 5);
        }
    }
   

    const datosRow2 = [
        [`PATRÓN: ${patronRecibido.nombre}`],
        [`DOMICILIO: ${patronRecibido.domicilio}`]
    ];
    
    margenIzquierdo = 60;
    margenSuperior = 120;
    anchoColumna = 400;
    altoFila = 30;
    
    // Dibujar la tabla
    for (let fila = 0; fila < datosRow2.length; fila++) {
            const x = margenIzquierdo;
            const y = margenSuperior + fila * altoFila;
            // Dibujar el borde de la celda
            doc.rect(x, y, anchoColumna, altoFila).stroke();
            doc.text(datosRow2[fila], x + 5, y + 5);
    }
    doc.moveDown(4);

    //Contenido textual 
    //Texto centrado 
    doc.font('Helvetica')
        .fontSize(10).lineGap(10 * 0.5);
        var texto = 'Detalle del adeudo C.O.P';
        var anchoTexto = doc.widthOfString(texto);
        var posicionX = (doc.page.width - anchoTexto) / 2;
        doc.text(texto, posicionX);
        doc.moveDown(2);

    //Crear la tabla con los registros seleccionados. 
    const datosRegistros = [];

    for (let i = 0; i < dataLength; i++) {
        const nomCred = datR.nom_cred[i];
        const periodo = datR.periodo[i];
        const importe = datR.importe[i];
        datosRegistros.push([nomCred, periodo, importe]);
      }

    const datosRegistro = [["CRÉDITO", "PÉRIODO", "IMPORTE"], ...datosRegistros];
    margenIzquierdo = 60;
    margenSuperior = 280;
    anchoColumna = 154;
    altoFila = 30;
    
    // Dibujar la tabla
    for (let fila = 0; fila < datosRegistro.length; fila++) {
        for (let columna = 0; columna < datosRegistro[fila].length; columna++) {
            const x = margenIzquierdo + columna * anchoColumna;
            const y = margenSuperior + fila * altoFila;
            doc.rect(x, y, anchoColumna, altoFila).stroke();
            doc.text(datosRegistro[fila][columna], x + 5, y + 5);
            }
        }
        doc.moveDown(3);

    //Crear la tabla de concptos e importes
    
    const datosConceptos = [["CONCEPTO", "IMPORTE", "CONCEPTO", "IMPORTE"], ["Actualización", " ", "Gastos de Ejecusión", " ",], ["Recargos", " ", "Importe total del crédito fiscal", " ",]];
    margenIzquierdo = 60;
    margenSuperior = 400;
    anchoColumna = 154;
    altoFila = 30;
    
    // Dibujar la tabla
    for (let fila = 0; fila < datosConceptos.length; fila++) {
        for (let columna = 0; columna < datosConceptos[fila].length; columna++) {
            const x = margenIzquierdo + columna * anchoColumna;
            const y = margenSuperior + fila * altoFila;
            doc.rect(x, y, anchoColumna, altoFila).stroke();
            doc.text(datosConceptos[fila][columna], x + 5, y + 5);
            }
        }
        doc.moveDown(3);

   
    //Títulos 
    doc.font('Helvetica-Bold')
        .fontSize(11).lineGap(11 * 0.5);
        var texto = 'CITATORIO PARA LA APLICACIÓN DE ';
        var anchoTexto = doc.widthOfString(texto);
        var posicionX = (doc.page.width - anchoTexto) / 2;
        doc.text(texto, posicionX);

    doc.font('Helvetica-Bold')
        .fontSize(11).lineGap(11 * 0.5);
        var texto = 'PROCEDIMIENTO ADMINISTRATIVO DE EJECUSIÓN';
        var anchoTexto = doc.widthOfString(texto);
        var posicionX = (doc.page.width - anchoTexto) / 2;
        doc.text(texto, posicionX);
        doc.moveDown(2);

    // Crear el texto por defecto
    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo1C}`, 60, null, { align: 'justify' })
        .moveDown(3);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo2C}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo3C}`, 60, null, { align: 'justify' })
        .moveDown(1);
    
    // Generar el nombre del archivo con la fecha
    const fileName = `${nombre}_${formattedDate}.pdf`;
    const filePath = `src/assets/pdf/${fileName}`;
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    doc.end();

    // Escuchar el evento 'finish' del stream de escritura
    writeStream.on('finish', () => {
        // Configurar la respuesta del servidor para la descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Leer el archivo y enviarlo como respuesta
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    });

    // Manejar errores de escritura
    writeStream.on('error', (err) => {
        console.error('Error al crear el archivo PDF:', err);
        res.status(500).send('Error al crear el archivo PDF');
    });


  }


// Función para generar Mandamiento 
export async function generarMandamiento(req, res) {

    // Realizar la destructuración del req.body en arreglos que contengan la información, separada por la categoría. 
    const opciones = req.body.opcion;
    const datR = {};
  
    // Verificar si opciones es un arreglo o un solo objeto
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
      // Tratar opciones como un solo objeto en un arreglo
      const opcionObjeto = JSON.parse(opciones);
  
      Object.entries(opcionObjeto).forEach(([clave, valor]) => {
        datR[clave] = [valor];
      });
    }

    const dataLength = datR.reg_pat.length;

    // Consulta en la base de datos para obtener el registro del registro patronal seleccionado. 
    const regRecibido = datR.reg_pat[0];
    const patronRecibido = await Afil63.findOne({
        where: {reg_pat : regRecibido}
    });


    // Consulta en la base de datos para obtener el nombre de todos los patrones. 
    const nomEjecutores = await Ejecutor.findAll({
        attributes: ['nombre'],
        where: {
          nombre: {
            [Op.ne]: 'foraneo'
          }
        }
      });

    const nomEje = nomEjecutores.map(registro => registro.nombre);


    // Obtener la fecha actual
    const currentDate = new Date();

    // Formatear la fecha en el formato deseado
    const formattedDate = format(currentDate, 'yyyy-MM-dd');


    // Crear la sesión del Usuario
    const  {nombre, apellidos}  = req.session.user;

    // Generar el documento de PDF
    const doc = new PDF();

    // Agregar contenido al PDF
    const anchoPagina = doc.page.width;
    

    // Cargar la imagen del encabezado
    const imageEncabezado = 'src/imgs/encabezado-reportes.png';
  
    // Función para agregar el encabezado en cada página
    const agregarEncabezado = () => {
        doc.image(imageEncabezado, {
        fit: [500, 100],
        align: 'center',
        x: 50,
        y: 10,
        });
        doc.moveDown(3);
    };
    agregarEncabezado();
    
    // Escuchar el evento 'pageAdded' para agregar el encabezado en las páginas adicionales
    doc.on('pageAdded', () => {
        // Agregar el encabezado en la nueva página
        agregarEncabezado();
    });


    // Cargar la imagen del pie de página
    const imagePie = 'src/imgs/footer-reportes.png';
  
    // Función para agregar el pie de página
    const agregarPie = () => {
        doc.image(imagePie, {
        fit: [500, 100],
        align: 'center',
        x: 50,
        y: 725,
        });
    };
    agregarPie();
    
    // Escuchar el evento 'pageAdded' para agregar el encabezado en las páginas adicionales
    doc.on('pageAdded', () => {
        // Agregar el encabezado en la nueva página
        agregarPie();
    });


    //Agregar información que va en más de una página 
    const infoInicial = () => {

        doc.font('Helvetica')
            .fontSize(8)
            .lineGap(8 * 0.5)
            .text('Deudor: ', 50, null, { continued: true })
            .font('Helvetica-Bold')
            .text(`${patronRecibido.patron}`);
    
        doc.font('Helvetica')
            .fontSize(8)
            .lineGap(8 * 0.5)
            .text('Registro patronal :', 50, null, { continued: true })
            .font('Helvetica-Bold')
            .text(`${patronRecibido.reg_pat}`);
    
        doc.font('Helvetica')
            .fontSize(8)
            .lineGap(8 * 0.5)
            .text('Domicilio: ', 50, null, { continued: true })
            .font('Helvetica-Bold')
            .text(`${patronRecibido.domicilio}`);
    
        doc.font('Helvetica')
            .fontSize(9).lineGap(9 * 0.5)
            .text('Localidad: ', 50, null, { continued: true })
            .font('Helvetica-Bold')
            .text(`${patronRecibido.localidad}`);
    
        doc.font('Helvetica')
            .fontSize(9).lineGap(9 * 0.5)
            .text('Actividad: ', 50, null, { continued: true })
            .font('Helvetica-Bold')
            .text(`${patronRecibido.actividad}`);
    
        doc.font('Helvetica')
            .fontSize(9).lineGap(9 * 0.5)
            .text('CP: ', 50, null, { continued: true })
            .font('Helvetica-Bold')
            .text(`${patronRecibido.cp}`);
    
        doc.font('Helvetica')
            .fontSize(9).lineGap(9 * 0.5)
            .text('Sector de notificación: ', 50, null, { continued: true })
            .font('Helvetica-Bold')
            .text('00');
    
        doc.moveDown(2);
    
        doc.font('Helvetica-Bold')
            .fontSize(9).lineGap(9 * 0.5)
            .text('Detalle del adeudor');
            doc.moveDown(2);

        const datosRegistros = [];

        for (let i = 0; i < dataLength; i++) {
            const nomCred = datR.nom_cred[i];
            const periodo = datR.periodo[i];
            const importe = datR.importe[i];

            datosRegistros.push([nomCred, periodo, importe]);
          }

       // Crear la tabla. 
       const datosTabla = [
        ["CRÉDITO", "PÉRIODO", "IMPORTE"],
        ...datosRegistros
      ];
    
        const margenIzquierdo = 60;
        const margenSuperior = 280;
        const anchoColumna = 154;
        const altoFila = 30;
    
        // Dibujar la tabla
        for (let fila = 0; fila < datosTabla.length; fila++) {
            for (let columna = 0; columna < datosTabla[fila].length; columna++) {
            const x = margenIzquierdo + columna * anchoColumna;
            const y = margenSuperior + fila * altoFila;

        // Dibujar el borde de la celda
        doc.rect(x, y, anchoColumna, altoFila)
        .stroke();
        
            doc.text(datosTabla[fila][columna], x + 5, y + 5);
            }
        }
        doc.moveDown(3);
    }



    //Página 1 y página 2.
    infoInicial();
    
    // Crear el texto por defecto 
    //Texto centrado. 
    doc.font('Helvetica-Bold')
        .fontSize(11).lineGap(11 * 0.5);
        var texto = 'MANDAMIENTO DE EJECUCIÓN';
        var anchoTexto = doc.widthOfString(texto);
        var posicionX = (doc.page.width - anchoTexto) / 2;
        doc.text(texto, posicionX);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text('En San Juan del Río a ', { continued: true })
        .font('Helvetica-Bold')
        .text(formattedDate);
    
    doc.moveDown(2);

    // Texto justificado
    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo1M}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo2M}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo3M}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo4M}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo5M1}`, 60, null, { align: 'justify', continued: true })
        .fillColor('blue')
        .text(nomEje.join(' y/o '), 60, null, { align: 'justify', continued: true })
        .fillColor('black')
        .text(`${parrafo5M2}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo6M}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica-Bold')
        .fontSize(9).lineGap(11 * 0.5);
        texto = 'Lo acuerda y firma';
        anchoTexto = doc.widthOfString(texto);
        posicionX = (doc.page.width - anchoTexto) / 2;
        doc.text(texto, posicionX);
        texto = 'El jefe de la Oficina para Cobros';
        anchoTexto = doc.widthOfString(texto);
        posicionX = (doc.page.width - anchoTexto) / 2;
        doc.text(texto, posicionX);
        texto = 'de la Subdelegación';
        doc.text(texto, 180, null, { continued: true })
        .fillColor('blue')
        .text(' San Juan del Río', { continued: true })
        .fillColor('black')
        .text(', Delegación', { continued: true })
        .fillColor('blue')
        .text(', Querétaro')
        .moveDown(4);

    doc.font('Helvetica-Bold')
        .fontSize(9).lineGap(9 * 0.5)
        .fillColor('black');
        texto = 'Lic. Luis Eduardo Trejo Reséndiz';
        anchoTexto = doc.widthOfString(texto);
        posicionX = (doc.page.width - anchoTexto) / 2;
        doc.text(texto, posicionX);

    
    // Página de la 3 a la seis. 
    doc.addPage();

    doc.font('Helvetica-Bold')
        .fontSize(11).lineGap(11 * 0.5);
        texto = 'ACTA DE REQUERIMIENTO DE PAGO Y EMBARGO';
        anchoTexto = doc.widthOfString(texto);
        posicionX = (doc.page.width - anchoTexto) / 2;
        doc.text(texto, posicionX);

    infoInicial();

    doc.font('Helvetica-Bold')
        .fontSize(11).lineGap(11 * 0.5);
        texto = 'REQUERIMIENTO';
        anchoTexto = doc.widthOfString(texto);
        posicionX = (doc.page.width - anchoTexto) / 2;
        doc.text(texto, posicionX);

    // Colocar los párrfos por defecto. 
    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo7M}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo8M}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo9M}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo10M}`, 60, null, { align: 'justify' })
        .moveDown(2);

    doc.font('Helvetica-Bold')
        .fontSize(11).lineGap(11 * 0.5);
        texto = 'EMBARGO';
        anchoTexto = doc.widthOfString(texto);
        posicionX = (doc.page.width - anchoTexto) / 2;
        doc.text(texto, posicionX)
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo11M}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo12M}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo13M}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo14M}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo15M}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo16M}`, 60, null, { align: 'justify' })
        .moveDown(1);

    doc.font('Helvetica')
        .fontSize(9).lineGap(9 * 0.5)
        .text(`${parrafo17M}`, 60, null, { align: 'justify' })
        .moveDown(1);


    // Apartado para la tabla 1:      
    var datosTabla = [
        [`${nombre} ${apellidos}`, "Nombre y firma", "Nombre y firma"],
        ["Ejecutor", "Depositario", "Embargado"]
    ];
        var margenIzquierdo = 60;
        var margenSuperior = 280;
        var anchoColumna = 170;
        var altoFila = 40;
    
        // Dibujar la tabla
        for (let fila = 0; fila < datosTabla.length; fila++) {
            for (let columna = 0; columna < datosTabla[fila].length; columna++) {
            const x = margenIzquierdo + columna * anchoColumna;
            const y = margenSuperior + fila * altoFila;

        // Dibujar el borde de la celda
        doc.rect(x, y, anchoColumna, altoFila)
        .stroke();
        
            doc.text(datosTabla[fila][columna], x + 20, y + 25);
            }
        }
        doc.moveDown(3);


    // Apartado para la tabla 2:     
         datosTabla = [
            ["Nombre y firma", "Nombre y firma"],
            ["Testigo", "Testigo"]
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
            doc.rect(x, y, anchoColumna, altoFila)
            .stroke();
            
                doc.text(datosTabla[fila][columna], x + 20, y + 25);
                }
            }
            doc.moveDown(3);
    
    

    // Generar el nombre del archivo con la fecha
    const fileName = `${nombre}_${formattedDate}.pdf`;
    const filePath = `src/assets/pdf/${fileName}_Mandamiento`;
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    doc.end();

    // Escuchar el evento 'finish' del stream de escritura
    writeStream.on('finish', () => {
        // Configurar la respuesta del servidor para la descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Leer el archivo y enviarlo como respuesta
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    });

    // Manejar errores de escritura
    writeStream.on('error', (err) => {
        console.error('Error al crear el archivo PDF:', err);
        res.status(500).send('Error al crear el archivo PDF');
    });


  }
  
  